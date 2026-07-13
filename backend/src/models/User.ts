export interface User {
  id: number;
  email: string;
  password: string; // hashed password
}

export const users: User[] = [];
