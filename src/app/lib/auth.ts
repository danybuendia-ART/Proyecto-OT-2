// Sistema de autenticación simulado
export interface User {
  id: string;
  email: string;
  name: string;
}

// Usuarios de demostración
const DEMO_USERS = [
  { id: '1', email: 'admin@example.com', password: 'admin123', name: 'Admin Usuario' },
  { id: '2', email: 'user@example.com', password: 'user123', name: 'Usuario Demo' },
];

export const login = (email: string, password: string): User | null => {
  const user = DEMO_USERS.find(u => u.email === email && u.password === password);
  if (user) {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return userWithoutPassword;
  }
  return null;
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
