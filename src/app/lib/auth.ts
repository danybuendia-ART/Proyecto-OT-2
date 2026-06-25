import { apiRequest } from "../apiClient.js";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface LoginPayload  {
  action: string,
  email: string,
  pass: string
}

export const login = (email: string, password: string): User | null => {
  console.log("datos obtenidos: ", email, password);
  sendServer(email, password);
  return null;
};

async function sendServer(email: string, pass: string) {
  const info: LoginPayload = {
    action: "login",
    correo: email,
    pass: pass,
  };

  // 🚀 apiRequest ya se encarga de cifrar
  const response = await apiRequest("usuarios", info, "POST");

  if (response?.warn) {
    return response.warn;
  } else {
    const { ...userwithoutPassword } = response;
    localStorage.setItem("user", JSON.stringify(userwithoutPassword));
    return userwithoutPassword;
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
