import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "CUSTOMER",
    phone: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email is required.");
      return;
    }

    if (!formData.password) {
      setError("Password is required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (!formData.phone.trim()) {
      setError("Phone number is required.");
      return;
    }

    setLoading(true);
    setError("");

    // EXACT payload expected by backend
    const payload = {
      full_name: formData.full_name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: "CUSTOMER",
      phone: formData.phone.trim(),
    };

    console.log("REGISTER PAYLOAD:", payload);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/auth/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const messages = data.detail
            .map((item) => item.msg)
            .join(", ");

          throw new Error(messages);
        }

        throw new Error(data.detail || "Registration failed.");
      }

      // Registration successful
      navigate("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Unable to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto flex min-h-screen max-w-5xl items-center justify-center px-4 py-10">

        <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 shadow-lg sm:p-10">

          {/* Header */}
          <div className="mb-8 text-center">

            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">
              🔐
            </div>

            <h1 className="text-3xl font-bold text-slate-900">
              Create your account
            </h1>

            <p className="mt-2 text-slate-500">
              Register to access your LockSure customer portal.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full Name */}
            <div>
              <label
                htmlFor="full_name"
                className="mb-2 block font-semibold text-slate-800"
              >
                Full Name
              </label>

              <input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-semibold text-slate-800"
              >
                Email Address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Phone */}
            <div>
              <label
                htmlFor="phone"
                className="mb-2 block font-semibold text-slate-800"
              >
                Phone Number
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="w-full rounded-xl border border-slate-300 px-5 py-4 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-semibold text-slate-800"
              >
                Password
              </label>

              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-300 px-5 py-4 pr-20 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-semibold text-blue-600"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>

              </div>

              <p className="mt-2 text-sm text-slate-400">
                Password must contain at least 6 characters.
              </p>
            </div>

            {/* Role - fixed CUSTOMER */}
            <input
              type="hidden"
              name="role"
              value="CUSTOMER"
            />

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-700 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>

          </form>

          {/* Login */}
          <div className="mt-7 text-center text-slate-500">

            Already have an account?{" "}

            <Link
              to="/login"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Sign in
            </Link>

          </div>

          {/* Security Notice */}
          <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">

            <p className="text-sm font-bold text-blue-800">
              SECURE CUSTOMER PORTAL
            </p>

            <p className="mt-2 text-sm leading-relaxed text-blue-700">
              Your account information is securely processed through
              the LockSure authentication system.
            </p>

          </div>

          {/* Footer */}
          <p className="mt-7 text-center text-sm text-slate-400">
            © 2026 LockSure · Secure Locker Management
          </p>

        </div>

      </main>

    </div>
  );
}

export default Register;