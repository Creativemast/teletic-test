import { Role } from './role';

export class User {
  id: number;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  avatar: string;
  role: Role;
  token?: string;
}
