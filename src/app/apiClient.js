// apiClient.js
const API_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(endpoint, dataArray = null, method = "POST") {
  try {
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // Solo incluir body si NO es GET
    if (method !== "GET" && dataArray) {
      options.body = JSON.stringify(dataArray);
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
