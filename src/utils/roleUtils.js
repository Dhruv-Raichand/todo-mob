import { ROLES } from '../constants/roles';

export const getRoleDisplay = role => {
  switch (role) {
    case ROLES.CHAIRMAN:
      return 'Chairman';
    case ROLES.FACULTY:
      return 'Faculty Member';
    default:
      return 'Unknown';
  }
};

export const isChairman = role => role === ROLES.CHAIRMAN;
export const isFaculty = role => role === ROLES.FACULTY;
