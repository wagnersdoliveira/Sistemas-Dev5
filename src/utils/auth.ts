import { UserAccount } from '../types';

const AUTH_STORAGE_KEYS = {
  CURRENT_USER: 'orcamento_familiar_current_user_v2',
  ALL_USERS: 'orcamento_familiar_all_users_v2',
};

// Initial admin user pre-configured for Wagner
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-wagner-admin',
    name: 'Wagner',
    email: 'wagnervocal41@gmail.com',
    cpf: '123.456.789-00',
    authProvider: 'google',
    role: 'admin',
    createdAt: '2026-10-01T08:00:00Z',
    lastLoginAt: new Date().toISOString(),
    isActive: true
  }
];

export function formatCPF(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function getAllUsers(): UserAccount[] {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.ALL_USERS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading users from storage', e);
  }
  return INITIAL_USERS;
}

export function saveAllUsers(users: UserAccount[]): void {
  try {
    localStorage.setItem(AUTH_STORAGE_KEYS.ALL_USERS, JSON.stringify(users));
  } catch (e) {
    console.error('Failed saving users to storage', e);
  }
}

export function getCurrentUser(): UserAccount | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading current user', e);
  }
  // Default to logged-in admin user so app is immediately usable
  return INITIAL_USERS[0];
}

export function setCurrentUser(user: UserAccount | null): void {
  try {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEYS.CURRENT_USER);
    }
  } catch (e) {
    console.error('Failed setting current user', e);
  }
}

export function registerUser(params: {
  name: string;
  email: string;
  cpf: string;
  password?: string;
  authProvider?: 'email' | 'google' | 'apple';
}): { success: boolean; message: string; user?: UserAccount } {
  const users = getAllUsers();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanCPF = params.cpf.trim();

  // Check if email already exists
  const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existing) {
    return { success: false, message: 'Este e-mail já está cadastrado no sistema.' };
  }

  const newUser: UserAccount = {
    id: `user-${Date.now()}`,
    name: params.name.trim(),
    email: cleanEmail,
    cpf: cleanCPF,
    authProvider: params.authProvider || 'email',
    role: users.length === 0 ? 'admin' : 'usuario',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    isActive: true
  };

  const updatedUsers = [...users, newUser];
  saveAllUsers(updatedUsers);
  setCurrentUser(newUser);

  return { success: true, message: 'Cadastro realizado com sucesso!', user: newUser };
}

export function loginUser(email: string, _password?: string): { success: boolean; message: string; user?: UserAccount } {
  const users = getAllUsers();
  const cleanEmail = email.trim().toLowerCase();

  const user = users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return { success: false, message: 'Usuário não encontrado. Por favor, realize o cadastro prévio.' };
  }

  if (!user.isActive) {
    return { success: false, message: 'Este acesso foi desativado pelo administrador.' };
  }

  // Update last login
  const updatedUser: UserAccount = {
    ...user,
    lastLoginAt: new Date().toISOString()
  };

  const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
  saveAllUsers(updatedUsers);
  setCurrentUser(updatedUser);

  return { success: true, message: 'Login efetuado com sucesso!', user: updatedUser };
}

export function toggleUserStatus(userId: string): UserAccount[] {
  const users = getAllUsers();
  const updated = users.map(u => {
    if (u.id === userId && u.role !== 'admin') {
      return { ...u, isActive: !u.isActive };
    }
    return u;
  });
  saveAllUsers(updated);
  return updated;
}

export function removeUser(userId: string): UserAccount[] {
  const users = getAllUsers();
  const updated = users.filter(u => u.id !== userId);
  saveAllUsers(updated);
  return updated;
}
