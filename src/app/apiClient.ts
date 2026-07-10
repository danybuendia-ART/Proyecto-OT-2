import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_API_KEY_ENCRYPT;
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest<T extends object, R = any>(
  endpoint: string,
  dataArray: T | null = null,
  method: "POST" | "GET" = "POST"
): Promise<R> {
  try {
    const options: RequestInit = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (method !== "GET" && dataArray) {
      // 🔒 Cifrado antes de enviar
      const plainText = JSON.stringify(dataArray);
      const encrypted = CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();
      options.body = JSON.stringify({ payload: encrypted });
    }

    const response = await fetch(`${API_URL}/${endpoint}`, options);

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const json = await response.json();

    // 🔓 Si la respuesta viene cifrada, la desencriptamos
    if (json.encryptedResponse) {
      return decryptData(json.encryptedResponse) as R;
    }

    return json as R;
  } catch (error) {
    console.error("Error en apiRequest:", error);
    throw error;
  }
}


export async function apiUploadFile<R = any>(
  endpoint: string,
  file: File,
  extraData: Record<string, any> = {}
): Promise<R> {
  try {
    const formData = new FormData();

    // 🔒 Cifrar los metadatos antes de enviarlos
    const plainText = JSON.stringify(extraData);
    const encrypted = CryptoJS.AES.encrypt(plainText, SECRET_KEY).toString();

    formData.append("archivo", file); // archivo real
    formData.append("payload", encrypted); // metadatos cifrados
    formData.append("action", "evidencias")
    console.log(formData)
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }

    const json = await response.json();

    // 🔓 Si la respuesta viene cifrada, la desencriptamos
    if (json.encryptedResponse) {
      return decryptData(json.encryptedResponse) as R;
    }

    return json as R;
  } catch (error) {
    console.error("Error en apiUploadFile:", error);
    throw error;
  }
}

export function decryptData(encryptedText: string) {
  const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  return JSON.parse(decrypted);
}
