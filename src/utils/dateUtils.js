export const formatDate = date => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatDateTime = date => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = date => {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const isDeadlineNear = (deadline, hoursThreshold = 48) => {
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diffHours = (deadlineDate - now) / (1000 * 60 * 60);
  return diffHours > 0 && diffHours <= hoursThreshold;
};

export const isOverdue = deadline => {
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  return deadlineDate < new Date();
};

export const getTimeRemaining = deadline => {
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diff = deadlineDate - now;

  if (diff < 0) return 'Overdue';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
};

export const getDaysUntilDeadline = deadline => {
  const deadlineDate = deadline.toDate ? deadline.toDate() : new Date(deadline);
  const now = new Date();
  const diff = deadlineDate - now;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// NEW: Get deadline urgency level for color coding
export const getDeadlineUrgency = deadline => {
  const days = getDaysUntilDeadline(deadline);
  
  if (days < 0) {
    return 'overdue'; // Red
  } else if (days <= 1) {
    return 'critical'; // Dark Red
  } else if (days <= 3) {
    return 'urgent'; // Orange/Red
  } else if (days <= 7) {
    return 'warning'; // Yellow/Orange
  } else {
    return 'normal'; // Green/Normal
  }
};
