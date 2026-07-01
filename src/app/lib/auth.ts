import { apiRequest, decryptData } from "../apiClient.js";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginPayload {
  action: string,
  email: string,
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
  return responseDecrypt.message;
}
async function sendServer(email: string, pass: string) {
  const info: LoginPayload = {
    action: "login",
    correo: email,
    pass: pass,
  };

  // 🚀 apiRequest ya se encarga de cifrar
  const response = await apiRequest("usuarios", info, "POST");

  if (response) {
    const responseDecrypt = decryptData(response.encryptedResponse);

    localStorage.setItem("user", JSON.stringify(responseDecrypt));
    return true;
  } else {
    return false;
  }
}

export const logout = () => {
  localStorage.removeItem("user");
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("user");
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
