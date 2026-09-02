import { useState } from "react";
import { loginCustomer } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      const data = await loginCustomer(email, password);

      // Store JWT received from backend
      localStorage.setItem("token", data.access_token);

      // Login successful
      navigate("/dashboard");
    } catch (error) {
      if (error.response?.status === 401) {
        setError("Invalid email or password.");
      } else {
        setError(
          "Unable to connect to the server. Please try again later."
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
                  Secure Verification
                </h3>

                <p className="text-sm text-blue-200">
                  Your identity is verified securely.
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
                  Manage your locker operations digitally.
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
                  Built with security at every step.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* Login Section */}
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
              Welcome back
            </h2>

            <p className="text-gray-500 mt-2 mb-8">
              Sign in to access your customer portal.
            </p>

            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-5">

                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
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
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter your password"
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

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

                  <span className="font-bold">
                    !
                  </span>

                  <span>
                    {error}
                  </span>

                </div>
              )}

              {/* Login Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-700 py-3.5 font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-400"
              >

                {loading ? (
                  <span className="flex items-center justify-center gap-3">

                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>

                    Signing in...

                  </span>
                ) : (
                  "Sign In"
                )}

              </button>

            </form>

            <div className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{" "}

              <Link
                to="/register"
                className="font-semibold text-blue-700 hover:text-blue-800"
              >
                Create an account
              </Link>
            </div>

            {/* Information */}
            <div className="mt-8 rounded-xl bg-blue-50 border border-blue-100 p-4">

              <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide mb-2">
                Secure Customer Portal
              </p>

              <p className="text-sm text-gray-600">
                Sign in using the email address registered with your
                LockSure account.
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

export default Login;