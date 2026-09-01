import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const registerCustomer = async (email, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/register`,
    {
      email,
      password,
      role: "CUSTOMER",
    }
  );

  return response.data;
};

export const loginCustomer = async (email, password) => {
  const response = await axios.post(
    `${API_BASE_URL}/auth/login`,
    {
      email,
      password,
    }
  );

  return response.data;
};