import { PRIORITIES } from '../constants/priorities';
import { COLORS } from '../constants/colors';

export const getPriorityColor = priority => {
  return PRIORITIES[priority?.toUpperCase()]?.color || COLORS.textSecondary;
};

export const getDeadlineColor = deadline => {
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diffHours = (deadlineDate - now) / (1000 * 60 * 60);

  if (diffHours < 0) return COLORS.error; // Red - Overdue
  if (diffHours <= 24) return '#FF9800'; // Orange - Very soon
  if (diffHours <= 48) return COLORS.warning; // Yellow - Soon
  return COLORS.success; // Green - Plenty of time
};

export const getProgressColor = progress => {
  if (progress === 0) return COLORS.textSecondary;
  if (progress < 50) return COLORS.warning;
  if (progress < 100) return COLORS.info;
  return COLORS.success;
};
