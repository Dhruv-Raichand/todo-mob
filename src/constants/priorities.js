import { COLORS } from './colors';

export const PRIORITIES = {
  LOW: { 
    value: 'low', 
    label: 'Low', 
    color: COLORS.priorityLow,
    icon: '🟢'
  },
  MEDIUM: { 
    value: 'medium', 
    label: 'Medium', 
    color: COLORS.priorityMedium,
    icon: '🔵'
  },
  HIGH: { 
    value: 'high', 
    label: 'High', 
    color: COLORS.priorityHigh,
    icon: '🟠'
  },
  URGENT: { 
    value: 'urgent', 
    label: 'Urgent', 
    color: COLORS.priorityUrgent,
    icon: '🔴'
  },
};

export const PRIORITY_LIST = [
  PRIORITIES.LOW,
  PRIORITIES.MEDIUM,
  PRIORITIES.HIGH,
  PRIORITIES.URGENT,
];
