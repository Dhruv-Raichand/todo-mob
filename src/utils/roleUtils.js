// utils/roleUtils.js
export function getRoleDisplay(role) {
  if (role === 'teacher') return 'Chairman';
  if (role === 'student') return 'Faculty';
  return role;
}
