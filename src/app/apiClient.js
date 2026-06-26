import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_API_KEY_ENCRYPT;

const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, dataArray = null, method = "POST") {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && dataArray) {
      // 🔒 Cifrado aquí
      const plainText = JSON.stringify(dataArray);
      const encrypted = CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();

      options.body = JSON.stringify({ payload: encrypted });
    }

    const response = await fetch(`${API_URL}/${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error en apiRequest:", error);
    throw error;
  }
}

// 🔓 Función para descifrar datos
export function decryptData(encryptedText) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}