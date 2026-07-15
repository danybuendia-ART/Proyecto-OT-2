import { apiRequest, decryptData } from "../apiClient.js";

export interface User {
  id: number;
  correo: string;
  nombre: string;
  permiso: number;
}

export interface LoginPayload {
  action: string,
  correo: string,
  pass: string
}

export interface RegisterPayload {
  action: string,
  correo: string,
  pass: string,
  nombre: string
}

export const login = async (email: string, password: string) => {
  return await sendServer(email, password);
};

export const register = async (correo: string, pass: string, nombre: string) => {
  const info: RegisterPayload = {
    action: "create",
    correo: correo,
    pass: pass,
    nombre: nombre
  };

  const response = await apiRequest("usuarios", info, "POST");
  const responseDecrypt = decryptData(response);
  console.log(responseDecrypt);

  if (responseDecrypt.warn) {
    return false;
  }
  return responseDecrypt;
}
async function sendServer(email: string, pass: string) {
  const info: LoginPayload = {
    action: "login",
    correo: email,
    pass: pass,
  };

  // 🚀 apiRequest ya se encarga de cifrar
  const response = await apiRequest("usuarios", info, "POST");
  console.log(response);
  if (response.warn) {
    return false;

  } else if (response) {
    //const responseDecrypt = decryptData(response.encryptedResponse);
    console.log(response);
    localStorage.setItem("user", JSON.stringify(response));
    return true;
  }
}

export const logout = () => {
  localStorage.clear();
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;

  try {
    const parsedUser = JSON.parse(userStr);

    if (Array.isArray(parsedUser)) {
      return parsedUser[0] ?? null;
    }

    return parsedUser as User;
  } catch {
    return null;
  }
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const updateCurrentUser = async (updates: Partial<User>): Promise<User | null> => {
  const currentUser = getCurrentUser();
  if (!currentUser) return null;

  const payload = {
    action: 'update',
    id: currentUser.id,
    ...updates,
  };

  try {
    const response = await apiRequest('usuarios', payload, 'POST');
    const decryptedResponse = decryptData(response);
    if (decryptedResponse && typeof decryptedResponse === 'object') {
      const updatedUser = { ...currentUser, ...decryptedResponse };
      setCurrentUser(updatedUser);
      return updatedUser;
    }
  } catch (error) {
    console.error('Error updating current user:', error);
  }

  return null;
};

export const isAuthenticated = (): boolean => {
  return getCurrentUser() !== null;
};
