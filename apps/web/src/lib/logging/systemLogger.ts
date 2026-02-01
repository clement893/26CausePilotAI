/**
 * System Logger
 * Étape 7.1.1 - Modèle de données Super Admin
 * 
 * Middleware pour logger automatiquement les événements système
 */

import { prisma } from '@/lib/db';

export interface LogSystemEventParams {
  type: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  details?: any;
  organizationId?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
}

export async function logSystemEvent(params: LogSystemEventParams): Promise<void> {
  try {
    await prisma.systemLog.create({
      data: {
        type: params.type,
        level: params.level,
        message: params.message,
        details: params.details ? JSON.parse(JSON.stringify(params.details)) : null,
        organizationId: params.organizationId || null,
        userId: params.userId || null,
        ipAddress: params.ipAddress || null,
        userAgent: params.userAgent || null,
        endpoint: params.endpoint || null,
        method: params.method || null,
        statusCode: params.statusCode || null,
      },
    });
  } catch (error) {
    // Don't throw error if logging fails - just log to console
    console.error('Failed to log system event:', error);
  }
}
