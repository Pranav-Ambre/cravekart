import prisma from '../config/db';

export interface AuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: any;
  ipAddress?: string | null;
}

export async function logAudit(params: AuditLogParams): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId || null,
        action: params.action,
        entityType: params.entityType,
        entityId: params.entityId || null,
        detailsJson: params.details ? JSON.stringify(params.details) : null,
        ipAddress: params.ipAddress || null,
      },
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}
