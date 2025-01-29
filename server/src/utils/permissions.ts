import { Role } from '../types';

export const Permissions = {
  // Account permissions
  CREATE_ACCOUNT: [Role.ADMINISTRATOR],
  EDIT_ACCOUNT: [Role.ADMINISTRATOR, Role.GROWTH_MANAGER],
  VIEW_ACCOUNT: [Role.ADMINISTRATOR, Role.GROWTH_MANAGER, Role.GROWTH_ADVISOR],
  DELETE_ACCOUNT: [Role.ADMINISTRATOR],
  
  // Note permissions
  CREATE_NOTE: [Role.ADMINISTRATOR, Role.GROWTH_MANAGER, Role.GROWTH_ADVISOR],
  EDIT_NOTE: [Role.ADMINISTRATOR, Role.GROWTH_MANAGER],
  DELETE_NOTE: [Role.ADMINISTRATOR],
  
  // User permissions
  MANAGE_USERS: [Role.ADMINISTRATOR],
};

export const hasPermission = (userRole: Role, permission: Role[]) => {
  return permission.includes(userRole);
}; 