export const validateEmail = email => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = password => {
  return password && password.length >= 6;
};

export const validateRequired = value => {
  return value && value.toString().trim().length > 0;
};

export const getErrorMessage = error => {
  if (!error) return 'An error occurred';
  
  const errorCode = error.code || '';
  
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered';
    case 'auth/invalid-email':
      return 'Invalid email address';
    case 'auth/user-not-found':
      return 'No user found with this email';
    case 'auth/wrong-password':
      return 'Incorrect password';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please try again later';
    case 'auth/user-disabled':
      return 'This account has been disabled';
    default:
      return error.message || 'An error occurred';
  }
};
