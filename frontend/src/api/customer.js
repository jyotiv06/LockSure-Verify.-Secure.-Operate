const API_BASE_URL = "http://127.0.0.1:8000";

export async function getCurrentCustomer(token) {
  const response = await fetch(
    `${API_BASE_URL}/customers/me`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  console.log("CUSTOMER API STATUS:", response.status);
  console.log("CUSTOMER API RESPONSE:", data);

  if (!response.ok) {
    throw new Error(
      Array.isArray(data.detail)
        ? data.detail.map((item) => item.msg).join(", ")
        : data.detail || "Unable to fetch customer profile."
    );
  }

  return data;
}