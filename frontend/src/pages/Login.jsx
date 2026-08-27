import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/Input";
import Button from "../components/Button";

function Login() {
  const [customerId, setCustomerId] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // Dummy login for today's frontend work
    navigate("/dashboard");
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
            label="Customer ID"
            placeholder="Enter your Customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Enter your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="mt-6">
            <Button type="submit">
              Login
            </Button>
          </div>

        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          Demo login • Secure locker operation system
        </p>

      </div>

    </div>
  );
}

export default Login;