/**
 * Data Retention Policy Framework
 * Automated cleanup of old records based on retention policies
 */

import mongoose from 'mongoose';

export interface RetentionPolicy {
  documentType: string;
  retentionDays: number;
  action: 'archive' | 'delete' | 'anonymize';
  fieldsToAnonymize?: string[];
}

/**
 * Retention policies for different document types
 */
export const RETENTION_POLICIES: RetentionPolicy[] = [
  {
    documentType: 'consultation',
    retentionDays: 365 * 7, // 7 years for medical records
    action: 'archive',
  },
  {
    documentType: 'patient_data',
    retentionDays: 365 * 10, // 10 years for patient data
    action: 'anonymize',
    fieldsToAnonymize: ['phone', 'email', 'address', 'nid'],
  },
  {
    documentType: 'chat_message',
    retentionDays: 365 * 2, // 2 years for chat messages
    action: 'delete',
  },
  {
    documentType: 'audit_log',
    retentionDays: 365 * 5, // 5 years for audit logs
    action: 'archive',
  },
  {
    documentType: 'transaction',
    retentionDays: 365 * 7, // 7 years for financial records
    action: 'archive',
  },
];

/**
 * Get retention policy for a document type
 */
export const getRetentionPolicy = (documentType: string): RetentionPolicy | null => {
  return RETENTION_POLICIES.find(policy => policy.documentType === documentType) || null;
};

/**
 * Check if a document is eligible for retention action
 */
export const isEligibleForRetentionAction = (
  documentType: string,
  documentDate: Date
): boolean => {
  const policy = getRetentionPolicy(documentType);
  if (!policy) return false;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

  return documentDate < cutoffDate;
};

/**
 * Execute retention action on a document
 */
export const executeRetentionAction = async (
  Model: mongoose.Model<any>,
  documentId: string,
  policy: RetentionPolicy
): Promise<void> => {
  const document = await Model.findById(documentId);
  if (!document) return;

  switch (policy.action) {
    case 'delete':
      await Model.findByIdAndDelete(documentId);
      break;
    
    case 'archive':
      document.archived = true;
      document.archivedAt = new Date();
      await document.save();
      break;
    
    case 'anonymize':
      if (policy.fieldsToAnonymize) {
        policy.fieldsToAnonymize.forEach(field => {
          if (document[field]) {
            document[field] = anonymizeField(document[field]);
          }
        });
      }
      document.anonymized = true;
      document.anonymizedAt = new Date();
      await document.save();
      break;
  }
};

/**
 * Anonymize a field value
 */
const anonymizeField = (value: string): string => {
  if (typeof value !== 'string') return value;
  
  // Replace all characters with asterisks except first and last
  if (value.length <= 2) {
    return '*'.repeat(value.length);
  }
  
  return value[0] + '*'.repeat(value.length - 2) + value[value.length - 1];
};

/**
 * Cleanup old documents based on retention policies
 */
export const cleanupOldDocuments = async (
  Model: mongoose.Model<any>,
  documentType: string,
  dateField: string = 'createdAt'
): Promise<number> => {
  const policy = getRetentionPolicy(documentType);
  if (!policy) return 0;

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - policy.retentionDays);

  const oldDocuments = await Model.find({
    [dateField]: { $lt: cutoffDate },
    archived: { $ne: true },
    anonymized: { $ne: true },
  }).lean();

  let processedCount = 0;

  for (const doc of oldDocuments) {
    try {
      await executeRetentionAction(Model, doc._id.toString(), policy);
      processedCount++;
    } catch (error) {
      console.error(`Failed to process document ${doc._id}:`, error);
    }
  }

  return processedCount;
};

/**
 * Schedule automated cleanup (to be called by cron job)
 */
export const scheduleAutomatedCleanup = async (): Promise<void> => {
  // This would be called by a cron job
  // Implementation depends on which models need cleanup
  console.log('Automated data retention cleanup scheduled');
};
