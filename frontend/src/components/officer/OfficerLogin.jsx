import { useState } from "react";
import { useNavigate } from "react-router-dom";

function OfficerLogin() {
  const navigate = useNavigate();

  const [officerId, setOfficerId] = useState("OF-2041");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    if (!officerId.trim() || !password.trim()) {
      setError("Please enter Officer ID and password.");
      return;
    }

    // Dummy login for today's hackathon UI.
    navigate("/officer/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      <div className="grid min-h-screen lg:grid-cols-2">

        {/* LEFT BRANDING */}
        <div className="hidden bg-[#0B1220] p-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div>

            {/* Logo */}
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]">
                <span className="text-xl">🛡</span>
              </div>

              <div>
                <p className="text-lg font-bold">
                  LockSure
                </p>

                <p className="text-[9px] tracking-[0.2em] text-slate-400">
                  SECURE BANKING
                </p>
              </div>

            </div>


            {/* Main text */}
            <div className="mt-28 max-w-lg">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#60A5FA]">
                Officer Operations Center
              </p>

              <h1 className="mt-5 text-4xl font-bold leading-tight">
                Secure locker operations,
                <span className="text-[#60A5FA]">
                  {" "}simplified.
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-7 text-slate-400">
                Verify customers, assess risk and authorize
                locker operations from one secure workspace.
              </p>

            </div>

          </div>


          {/* Security features */}
          <div className="space-y-4">

            <SecurityPoint text="Identity verification" />
            <SecurityPoint text="Document authenticity" />
            <SecurityPoint text="Locker authorization" />

          </div>

        </div>


        {/* LOGIN SIDE */}
        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-8 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB]">
                  🛡
                </div>

                <div>
                  <p className="font-bold text-[#111827]">
                    LockSure
                  </p>

                  <p className="text-[9px] tracking-[0.18em] text-[#64748B]">
                    SECURE BANKING
                  </p>
                </div>

              </div>

            </div>


            {/* Login card */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm sm:p-9">

              {/* Heading */}
              <div className="mb-7">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  🔐
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                  Authorized Access
                </p>

                <h2 className="mt-2 text-2xl font-bold text-[#111827]">
                  Officer Login
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#64748B]">
                  Sign in to access the secure locker operations portal.
                </p>

              </div>


              {/* Form */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >

                {/* Officer ID */}
                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#334155]">
                    Officer ID
                  </label>

                  <input
                    type="text"
                    value={officerId}
                    onChange={(e) => {
                      setOfficerId(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter Officer ID"
                    className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                {/* Password */}
                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#334155]">
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
                      placeholder="Enter password"
                      className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 pr-12 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword((current) => !current)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#64748B]"
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>

                  </div>

                </div>


                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
                    {error}
                  </div>
                )}


                {/* Login button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-[#2563EB] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] hover:shadow-md"
                >
                  Sign In to Officer Portal
                </button>

              </form>


              {/* Footer */}
              <div className="mt-6 border-t border-[#E2E8F0] pt-5 text-center">

                <p className="text-xs text-[#64748B]">
                  🛡 Secure officer authentication
                </p>

                <p className="mt-2 text-[10px] text-[#94A3B8]">
                  Authorized bank personnel only
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


/* ========================= */
/* SECURITY POINT             */
/* ========================= */

function SecurityPoint({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">

      <span className="text-[#10B981]">
        ✓
      </span>

      {text}

    </div>
  );
}


export default OfficerLogin;