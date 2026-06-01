/**
 * Consultation State Machine
 * Defines the valid state transitions for consultations
 */

export type ConsultationStatus =
  | 'pending'
  | 'in-progress'
  | 'awaiting-response'
  | 'follow-up-needed'
  | 'completed'
  | 'cancelled';

export interface StateTransition {
  from: ConsultationStatus;
  to: ConsultationStatus;
  action: string;
  allowedRoles: string[];
}

/**
 * Valid state transitions for consultations
 */
export const CONSULTATION_STATE_TRANSITIONS: StateTransition[] = [
  // Initial state transitions
  { from: 'pending', to: 'in-progress', action: 'start_consultation', allowedRoles: ['doctor'] },
  { from: 'pending', to: 'cancelled', action: 'cancel_request', allowedRoles: ['doctor', 'farmer'] },
  
  // Active consultation transitions
  { from: 'in-progress', to: 'awaiting-response', action: 'request_info', allowedRoles: ['doctor'] },
  { from: 'in-progress', to: 'follow-up-needed', action: 'schedule_followup', allowedRoles: ['doctor'] },
  { from: 'in-progress', to: 'completed', action: 'complete_consultation', allowedRoles: ['doctor'] },
  { from: 'in-progress', to: 'cancelled', action: 'cancel_consultation', allowedRoles: ['doctor', 'farmer'] },
  
  // Awaiting response transitions
  { from: 'awaiting-response', to: 'in-progress', action: 'resume_consultation', allowedRoles: ['doctor'] },
  { from: 'awaiting-response', to: 'cancelled', action: 'timeout_cancel', allowedRoles: ['system'] },
  
  // Follow-up transitions
  { from: 'follow-up-needed', to: 'in-progress', action: 'start_followup', allowedRoles: ['doctor'] },
  { from: 'follow-up-needed', to: 'completed', action: 'complete_followup', allowedRoles: ['doctor'] },
  { from: 'follow-up-needed', to: 'cancelled', action: 'cancel_followup', allowedRoles: ['doctor', 'farmer'] },
  
  // Final states (no outgoing transitions)
  // 'completed' and 'cancelled' are terminal states
];

/**
 * Check if a state transition is valid
 */
export const isValidTransition = (
  from: ConsultationStatus,
  to: ConsultationStatus,
  role: string
): boolean => {
  const transition = CONSULTATION_STATE_TRANSITIONS.find(
    t => t.from === from && t.to === to
  );
  
  if (!transition) return false;
  
  return transition.allowedRoles.includes(role);
};

/**
 * Get allowed next states for a given current state and role
 */
export const getAllowedNextStates = (
  currentStatus: ConsultationStatus,
  role: string
): ConsultationStatus[] => {
  return CONSULTATION_STATE_TRANSITIONS
    .filter(t => t.from === currentStatus && t.allowedRoles.includes(role))
    .map(t => t.to);
};

/**
 * Get the action required for a state transition
 */
export const getTransitionAction = (
  from: ConsultationStatus,
  to: ConsultationStatus
): string | null => {
  const transition = CONSULTATION_STATE_TRANSITIONS.find(
    t => t.from === from && t.to === to
  );
  
  return transition ? transition.action : null;
};

/**
 * State machine for managing consultation lifecycle
 */
export class ConsultationStateMachine {
  private currentStatus: ConsultationStatus;
  private role: string;

  constructor(initialStatus: ConsultationStatus, role: string) {
    this.currentStatus = initialStatus;
    this.role = role;
  }

  /**
   * Attempt to transition to a new state
   */
  public transition(to: ConsultationStatus): { success: boolean; action?: string; error?: string } {
    if (this.currentStatus === to) {
      return { success: false, error: 'Already in this state' };
    }

    const action = getTransitionAction(this.currentStatus, to);
    
    if (!action) {
      return { success: false, error: 'Invalid state transition' };
    }

    if (!isValidTransition(this.currentStatus, to, this.role)) {
      return { success: false, error: 'Role not authorized for this transition' };
    }

    this.currentStatus = to;
    return { success: true, action };
  }

  /**
   * Get current state
   */
  public getCurrentState(): ConsultationStatus {
    return this.currentStatus;
  }

  /**
   * Get all possible next states
   */
  public getNextStates(): ConsultationStatus[] {
    return getAllowedNextStates(this.currentStatus, this.role);
  }

  /**
   * Check if current state is terminal
   */
  public isTerminal(): boolean {
    return this.currentStatus === 'completed' || this.currentStatus === 'cancelled';
  }
}

/**
 * Status configuration for UI display
 */
export const STATUS_CONFIG: Record<ConsultationStatus, { label: string; color: string; icon: string }> = {
  pending: { label: 'পেন্ডিং', color: 'bg-orange-500/10 text-orange-500', icon: 'Clock' },
  'in-progress': { label: 'চলমান', color: 'bg-blue-500/10 text-blue-500', icon: 'Activity' },
  'awaiting-response': { label: 'অপেক্ষারত', color: 'bg-yellow-500/10 text-yellow-500', icon: 'MessageSquare' },
  'follow-up-needed': { label: 'ফলো-আপ প্রয়োজন', color: 'bg-purple-500/10 text-purple-500', icon: 'Calendar' },
  completed: { label: 'সম্পন্ন', color: 'bg-green-500/10 text-green-500', icon: 'CheckCircle' },
  cancelled: { label: 'বাতিল', color: 'bg-red-500/10 text-red-500', icon: 'XCircle' },
};
