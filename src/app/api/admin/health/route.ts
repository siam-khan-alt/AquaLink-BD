/**
 * Admin Health Check Endpoint
 * Provides system metrics for monitoring and observability
 */

import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/shared/lib/db';
import mongoose from 'mongoose';
import os from 'os';
import { requirePermission, forbiddenResponse } from '@/shared/lib/require-permission';

export interface HealthMetrics {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  system: {
    cpu: {
      usage: number;
      cores: number;
    };
    memory: {
      total: number;
      free: number;
      used: number;
      usagePercent: number;
    };
  };
  database: {
    status: 'connected' | 'disconnected';
    connectionCount: number;
    latency: number;
  };
  api: {
    averageLatency: number;
    requestCount: number;
  };
  backgroundJobs: {
    queueDepth: number;
    failedCount: number;
    processingCount: number;
  };
}

export async function GET(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Permission check
    const permissionCheck = await requirePermission(req, 'system:health');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    // Database health check
    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    let dbLatency = 0;
    let connectionCount = 0;

    try {
      const dbStart = Date.now();
      await connectDB();
      dbLatency = Date.now() - dbStart;

      if (mongoose.connection.readyState === 1) {
        dbStatus = 'connected';
        connectionCount = 1; // Single connection pool for this application
      }
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // System metrics
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsagePercent = (usedMemory / totalMemory) * 100;

    const cpuCores = os.cpus().length;
    const cpuLoad = os.loadavg()[0] / cpuCores; // Normalize by number of cores

    // API latency
    const apiLatency = Date.now() - startTime;

    // Determine overall health status
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

    if (dbStatus === 'disconnected' || memoryUsagePercent > 90 || cpuLoad > 0.9) {
      overallStatus = 'unhealthy';
    } else if (memoryUsagePercent > 75 || cpuLoad > 0.7 || dbLatency > 1000) {
      overallStatus = 'degraded';
    }

    const metrics: HealthMetrics = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      system: {
        cpu: {
          usage: Math.min(cpuLoad * 100, 100),
          cores: cpuCores,
        },
        memory: {
          total: totalMemory,
          free: freeMemory,
          used: usedMemory,
          usagePercent: Number(memoryUsagePercent.toFixed(2)),
        },
      },
      database: {
        status: dbStatus,
        connectionCount,
        latency: dbLatency,
      },
      api: {
        averageLatency: apiLatency,
        requestCount: 0, // This would be tracked in production
      },
      backgroundJobs: {
        queueDepth: 0, // Mocked - integrate with job queue in production
        failedCount: 0, // Mocked - integrate with job queue in production
        processingCount: 0, // Mocked - integrate with job queue in production
      },
    };

    // Return appropriate status code based on health
    const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

    return NextResponse.json(metrics, { status: statusCode });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
}
