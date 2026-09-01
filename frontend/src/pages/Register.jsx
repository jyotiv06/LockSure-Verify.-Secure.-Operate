
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setError("");
    setSuccess("");
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const { email, password, confirmPassword } = formData;

    if (!email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://127.0.0.1:8000/auth/register", {
        email,
        password,
        role: "CUSTOMER",
      });

      setSuccess("Registration successful! Redirecting to login...");

      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(
          typeof err.response.data.detail === "string"
            ? err.response.data.detail
            : "Registration failed. Please check your details."
        );
      } else {
        setError(
          "Unable to connect to the server. Please make sure the backend is running."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-blue-700 flex items-center justify-center px-4 py-8">

      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden md:flex">

        {/* Left Branding Section */}
        <div className="hidden md:flex md:w-1/2 bg-blue-800 text-white p-12 flex-col justify-center">

          <div className="mb-10">

            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-6">
              <span className="text-3xl">🔐</span>
            </div>

            <h1 className="text-4xl font-bold mb-4">
              LockSure
            </h1>

            <p className="text-blue-100 text-lg leading-relaxed">
              Secure, simple and trusted digital locker operations.
            </p>

          </div>

          <div className="space-y-5">

            <div className="flex items-start gap-4">
              <div className="bg-blue-700 rounded-full p-2">
                ✓
              </div>

              <div>
                <h3 className="font-semibold">
                  Secure Registration
                </h3>

                <p className="text-sm text-blue-200">
                  Create your secure customer account.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-700 rounded-full p-2">
                ✓
              </div>

              <div>
                <h3 className="font-semibold">
                  Digital Locker Access
                </h3>

                <p className="text-sm text-blue-200">
                  Access and manage your locker digitally.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-blue-700 rounded-full p-2">
                ✓
              </div>

              <div>
                <h3 className="font-semibold">
                  Trusted & Protected
                </h3>

                <p className="text-sm text-blue-200">
                  Your account is protected with secure authentication.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Registration Section */}
        <div className="w-full md:w-1/2 p-8 sm:p-12">

          {/* Mobile Logo */}
          <div className="md:hidden text-center mb-8">

            <div className="inline-flex w-14 h-14 bg-blue-100 rounded-2xl items-center justify-center mb-3">
              <span className="text-3xl">🔐</span>
            </div>

            <h1 className="text-3xl font-bold text-blue-800">
              LockSure
            </h1>

          </div>

          <div className="max-w-md mx-auto">

            <h2 className="text-3xl font-bold text-gray-900">
              Create account
            </h2>

            <p className="text-gray-500 mt-2 mb-8">
              Register to access your digital locker portal.
            </p>

            <form onSubmit={handleRegister}>

              {/* Email */}
              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3.5 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />

              </div>

              {/* Password */}
              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>

                <div className="relative">

                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Create a password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 pr-20 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Confirm Password */}
              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>

                <div className="relative">

                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 pr-20 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    {showConfirmPassword ? "Hide" : "Show"}
                  </button>

                </div>

              </div>

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <span className="font-bold">!</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Success */}
              {success && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
                  <span className="font-bold">✓</span>
                  <span>{success}</span>
                </div>
              )}

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Creating Account...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>

            </form>

            {/* Login Link */}
            <div className="text-center mt-8">

              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="font-semibold text-blue-600 hover:text-blue-800"
                >
                  Sign In
                </button>
              </p>

            </div>

            <p className="text-center text-xs text-gray-400 mt-8">
              © 2026 LockSure · Secure Locker Management
            </p>

          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;

