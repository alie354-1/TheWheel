import { supabase } from '../supabase';
import { loggingService } from './logging.service'; // For logging errors within this service

interface AuditLogDetails {
  [key: string]: any; // Flexible structure for additional context
}

/**
 * Logs a significant action to the audit trail.
 * Should be called from backend functions or secure frontend contexts where appropriate.
 *
 * @param action - A code or description identifying the action (e.g., 'user_login', 'updated_setting').
 * @param options - Optional parameters including userId, companyId, target details, and status.
 */
export const logAuditAction = async (
  action: string,
  options?: {
    userId?: string | null;
    companyId?: string | null;
    targetType?: string | null;
    targetId?: string | null;
    details?: AuditLogDetails | null;
    status?: 'success' | 'failure' | null;
  }
): Promise<void> => {
  const {
    userId = null,
    companyId = null,
    targetType = null,
    targetId = null,
    details = null,
    status = 'success', // Default to success if not specified
  } = options || {};

  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        company_id: companyId,
        action: action,
        target_type: targetType,
        target_id: targetId,
        details: details,
        status: status,
        // timestamp is handled by the database default
      });

    if (error) {
      // Log the error using the general logging service, but avoid infinite loops if logging itself fails
      loggingService.logError(new Error(`Failed to insert audit log: ${error.message}`), {
        context: 'logAuditAction',
        originalAction: action,
        dbError: error,
      });
      console.error('Failed to insert audit log:', error.message);
    }
  } catch (exception: any) {
    // Catch unexpected errors during the insert process
    loggingService.logError(exception instanceof Error ? exception : new Error(String(exception)), {
      context: 'logAuditAction',
      originalAction: action,
      exception,
    });
    console.error('Exception during audit log insertion:', exception);
  }
};

// Example Usage (to be implemented in relevant backend/frontend locations):
/*
// Example 1: User login
logAuditAction('user_login', { userId: loggedInUserId });

// Example 2: Failed setting update
logAuditAction('updated_company_setting', {
  userId: adminUserId,
  companyId: companyId,
  targetType: 'company_settings',
  targetId: companyId,
  details: { setting: 'branding_color', oldValue: '#FFFFFF', newValue: '#12345G', error: 'Invalid hex code' },
  status: 'failure'
});

// Example 3: System action
logAuditAction('cron_job_completed', { action: 'data_cleanup', details: { recordsDeleted: 150 } });
*/
