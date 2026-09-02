import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const getCurrentCustomer = async (token) => {
  const response = await axios.get(
    `${API_BASE_URL}/customers/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};