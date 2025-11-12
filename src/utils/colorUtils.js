import { COLORS } from '../constants/colors';
import { getDaysUntilDeadline, isOverdue } from './dateUtils';

export const getDeadlineColor = deadline => {
  if (!deadline) return COLORS.textSecondary;

  if (isOverdue(deadline)) {
    return COLORS.deadlineOverdue; // Very Dark Red
  }

  const days = getDaysUntilDeadline(deadline);

  if (days <= 1) {
    return COLORS.deadlineCritical; // Dark Red (1 day left)
  } else if (days <= 3) {
    return COLORS.deadlineUrgent; // Orange (2-3 days left)
  } else if (days <= 7) {
    return COLORS.deadlineWarning; // Amber (4-7 days)
  } else {
    return COLORS.deadlineNormal; // Green (7+ days)
  }
};

// NEW: Get card background color based on deadline
export const getCardBackgroundColor = deadline => {
  if (!deadline) return COLORS.card;

  if (isOverdue(deadline)) {
    return '#FEE2E2'; // Light red background for overdue
  }

  const days = getDaysUntilDeadline(deadline);

  if (days <= 1) {
    return '#FECACA'; // Light red for critical
  } else if (days <= 3) {
    return '#FED7AA'; // Light orange for urgent
  } else {
    return COLORS.card; // Normal white
  }
};

export const getProgressColor = progress => {
  if (progress === 0) return COLORS.textLight;
  if (progress < 25) return COLORS.error;
  if (progress < 50) return COLORS.warning;
  if (progress < 75) return COLORS.info;
  if (progress < 100) return COLORS.secondary;
  return COLORS.success;
};

export const getPriorityColor = priority => {
  switch (priority) {
    case 'low':
      return COLORS.priorityLow;
    case 'medium':
      return COLORS.priorityMedium;
    case 'high':
      return COLORS.priorityHigh;
    case 'urgent':
      return COLORS.priorityUrgent;
    default:
      return COLORS.textSecondary;
  }
};
