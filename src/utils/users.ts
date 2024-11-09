import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcrypt';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

export type User = {
  username: string;
  hashedPassword: string;
};

export async function getUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export async function validateUser(username: string, password: string): Promise<boolean> {
  try {
    const users = await getUsers();
    console.log('found users:', users.length);
    
    const user = users.find(u => u.username === username);
    if (!user) {
      console.log('user not found:', username);
      return false;
    }
    
    const result = await bcrypt.compare(password, user.hashedPassword);
    console.log('password validation result:', result);
    return result;
  } catch (error) {
    console.error('validation error:', error);
    return false;
  }
} 