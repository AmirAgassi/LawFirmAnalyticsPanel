import * as fs from 'fs/promises';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { getUsers, User } from '../src/utils/users';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

async function ensureDataDir() {
  const dir = path.join(process.cwd(), 'data');
  try {
    await fs.mkdir(dir);
  } catch (error: any) {
    if (error.code !== 'EEXIST') throw error;
  }
}

async function addUser(username: string, password: string) {
  await ensureDataDir();
  const users = await getUsers();
  
  if (users.find(u => u.username === username)) {
    console.error('User already exists');
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, hashedPassword });
  
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  console.log('User added successfully');
}

// Handle command line arguments
const [,, username, password] = process.argv;
if (!username || !password) {
  console.log('Usage: npm run add-user <username> <password>');
  process.exit(1);
}

addUser(username, password).catch(console.error); 