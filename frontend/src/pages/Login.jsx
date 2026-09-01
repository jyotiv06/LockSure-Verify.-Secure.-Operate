import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

const API_URL = "http://127.0.0.1:8000";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Login failed");
      }

      // Store JWT
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("username", email);

      // Go to customer dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">

      <div className="bg-white w-full max-w-md rounded-2xl shadow-lg p-8">

        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🏦</div>

          <h1 className="text-3xl font-bold text-blue-700">
            Bank Locker Portal
          </h1>

          <p className="text-gray-500 mt-2">
            Secure Customer Login
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin}>

          <Input
            label="Email"
            placeholder="Enter your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="mt-6">
            <Button type="submit">
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Secure locker operation system
        </p>

      </div>
    </div>
  );
}

export default Login;