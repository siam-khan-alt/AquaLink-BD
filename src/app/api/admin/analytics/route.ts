/**
 * Analytics Hub API Endpoint
 * Provides Revenue, Conversions, and User Engagement (DAU/MAU) metrics
 * Uses MongoDB aggregation pipelines for efficient data processing
 */

import { NextResponse, NextRequest } from 'next/server';
import { connectDB } from '@/shared/lib/db';
import { getToken } from 'next-auth/jwt';
import { User } from '@/models/User';
import { Transaction } from '@/models/Transaction';
import { Enrollment } from '@/models/Enrollment';
import { requirePermission, forbiddenResponse } from '@/shared/lib/require-permission';
import { logAuditEvent } from '@/shared/lib/audit-logger';

export interface AnalyticsMetrics {
  revenue: {
    total: number;
    monthly: number;
    growth: number;
    bySource: Record<string, number>;
  };
  conversions: {
    total: number;
    rate: number;
    byFunnel: Record<string, number>;
  };
  userEngagement: {
    dau: number;
    mau: number;
    ratio: number;
    totalUsers: number;
  };
  timestamp: string;
}

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token || !token.id || token.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Permission check
    const permissionCheck = await requirePermission(req, 'analytics:read');
    if (!permissionCheck.success) {
      return forbiddenResponse(permissionCheck.error || 'Forbidden');
    }

    await connectDB();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Revenue metrics using aggregation
    const revenuePipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$source',
          total: { $sum: '$amount' },
        },
      },
    ];

    const revenueData = await Transaction.aggregate(revenuePipeline);
    const totalRevenue = revenueData.reduce((sum, item) => sum + item.total, 0);

    const monthlyRevenuePipeline = [
      {
        $match: {
          createdAt: { $gte: monthStart },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ];

    const monthlyRevenueData = await Transaction.aggregate(monthlyRevenuePipeline);
    const monthlyRevenue = monthlyRevenueData[0]?.total || 0;

    const revenueBySource: Record<string, number> = {};
    revenueData.forEach((item: { _id: string | null; total: number }) => {
      revenueBySource[item._id || 'unknown'] = item.total;
    });

    // Previous month for growth calculation
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const prevMonthRevenuePipeline = [
      {
        $match: {
          createdAt: { $gte: prevMonthStart, $lt: prevMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ];

    const prevMonthRevenueData = await Transaction.aggregate(prevMonthRevenuePipeline);
    const prevMonthRevenue = prevMonthRevenueData[0]?.total || 0;
    const revenueGrowth = prevMonthRevenue > 0 
      ? ((monthlyRevenue - prevMonthRevenue) / prevMonthRevenue) * 100 
      : 0;

    // Conversion metrics
    const totalUsers = await User.countDocuments();
    const enrolledUsers = await Enrollment.distinct('userId');
    const conversionRate = totalUsers > 0 ? (enrolledUsers.length / totalUsers) * 100 : 0;

    const conversionPipeline = [
      {
        $match: {
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: '$courseId',
          count: { $sum: 1 },
        },
      },
    ];

    const conversionData = await Enrollment.aggregate(conversionPipeline);
    const conversionsByFunnel: Record<string, number> = {};
    conversionData.forEach((item: { _id: string | null; count: number }) => {
      conversionsByFunnel[item._id?.toString() || 'unknown'] = item.count;
    });

    // User Engagement (DAU/MAU)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dayAgo = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // DAU - Users who logged in or performed an action in the last 24 hours
    const dauPipeline = [
      {
        $match: {
          $or: [
            { lastLogin: { $gte: dayAgo } },
            { updatedAt: { $gte: dayAgo } },
          ],
        },
      },
      {
        $count: 'count',
      },
    ];

    const dauData = await User.aggregate(dauPipeline);
    const dau = dauData[0]?.count || 0;

    // MAU - Users who logged in or performed an action in the last 30 days
    const mauPipeline = [
      {
        $match: {
          $or: [
            { lastLogin: { $gte: monthAgo } },
            { updatedAt: { $gte: monthAgo } },
          ],
        },
      },
      {
        $count: 'count',
      },
    ];

    const mauData = await User.aggregate(mauPipeline);
    const mau = mauData[0]?.count || 0;

    const dauMauRatio = mau > 0 ? (dau / mau) * 100 : 0;

    const metrics: AnalyticsMetrics = {
      revenue: {
        total: Number(totalRevenue.toFixed(2)),
        monthly: Number(monthlyRevenue.toFixed(2)),
        growth: Number(revenueGrowth.toFixed(2)),
        bySource: revenueBySource,
      },
      conversions: {
        total: enrolledUsers.length,
        rate: Number(conversionRate.toFixed(2)),
        byFunnel: conversionsByFunnel,
      },
      userEngagement: {
        dau,
        mau,
        ratio: Number(dauMauRatio.toFixed(2)),
        totalUsers,
      },
      timestamp: now.toISOString(),
    };

    // Log audit event
    await logAuditEvent({
      userId: token.id as string,
      userRole: token.role as string,
      action: 'view_analytics',
      resource: 'analytics',
      method: 'GET',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      status: 'success',
    });

    return NextResponse.json(metrics, { status: 200 });
  } catch (error) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Log failed audit event
    if (token?.id) {
      await logAuditEvent({
        userId: token.id as string,
        userRole: token.role as string,
        action: 'view_analytics',
        resource: 'analytics',
        method: 'GET',
        ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        status: 'failure',
        errorMessage,
      });
    }
    
    console.error('Error fetching analytics:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
