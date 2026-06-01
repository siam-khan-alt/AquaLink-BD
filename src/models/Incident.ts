/**
 * Incident Model
 * Tracks system issues, outages, and operational events
 */

import mongoose, { Schema, Document } from 'mongoose';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'investigating' | 'resolved' | 'closed';

export interface IIncident extends Document {
  title: string;
  description: string;
  severity: IncidentSeverity;
  status: IncidentStatus;
  category: 'system' | 'database' | 'api' | 'security' | 'performance' | 'user-reported';
  affectedServices: string[];
  rootCause?: string;
  resolution?: string;
  reportedBy: string;
  assignedTo?: string;
  startedAt: Date;
  resolvedAt?: Date;
  estimatedResolution?: Date;
  updates: Array<{
    message: string;
    author: string;
    timestamp: Date;
  }>;
  metadata?: Record<string, unknown>;
}

const IncidentSchema = new Schema<IIncident>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    severity: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    status: {
      type: String,
      required: true,
      enum: ['open', 'investigating', 'resolved', 'closed'],
      default: 'open',
    },
    category: {
      type: String,
      required: true,
      enum: ['system', 'database', 'api', 'security', 'performance', 'user-reported'],
    },
    affectedServices: [{
      type: String,
      trim: true,
    }],
    rootCause: {
      type: String,
    },
    resolution: {
      type: String,
    },
    reportedBy: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: String,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
    },
    estimatedResolution: {
      type: Date,
    },
    updates: [{
      message: {
        type: String,
        required: true,
      },
      author: {
        type: String,
        required: true,
      },
      timestamp: {
        type: Date,
        required: true,
        default: Date.now,
      },
    }],
    metadata: {
      type: Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for efficient querying
IncidentSchema.index({ status: 1, startedAt: -1 });
IncidentSchema.index({ severity: 1, status: 1 });
IncidentSchema.index({ category: 1, startedAt: -1 });
IncidentSchema.index({ reportedBy: 1 });

const Incident = mongoose.models.Incident || mongoose.model<IIncident>('Incident', IncidentSchema);

export default Incident;
