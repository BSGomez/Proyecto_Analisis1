import axios from "axios";

const API_URL = "http://localhost:8800/routes";

export const obtenerUsuarios = async () => {
  try {
    const response = await axios.get(`${API_URL}/CON_USUARIO`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener los usuarios:", error);
    return [];
  }
};
