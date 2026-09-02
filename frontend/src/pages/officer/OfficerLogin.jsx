import { useState } from "react";
import {
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  Building2,
  CheckCircle2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import api from "../../services/api";


function OfficerLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post(
        "/auth/login",
        {
          email: email,
          password: password,
        }
      );

      const token =
        response.data.access_token;


      // Save JWT token
      localStorage.setItem(
        "officerToken",
        token
      );


      // Decode JWT payload
      const payload = JSON.parse(
        atob(
          token
            .split(".")[1]
            .replace(/-/g, "+")
            .replace(/_/g, "/")
        )
      );


      // Check Officer role
      if (
        payload.role !== "OFFICER"
      ) {

        localStorage.removeItem(
          "officerToken"
        );

        setError(
          "Access denied. This account is not an Officer account."
        );

        return;
      }


      // Save officer information
      localStorage.setItem(
        "officerRole",
        payload.role
      );

      localStorage.setItem(
        "officerId",
        payload.sub
      );


      // Redirect to Officer Dashboard
      navigate(
        "/officer/dashboard"
      );

    } catch (err) {

      console.error(
        "Officer login error:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to login. Please check your credentials."
      );

    } finally {

      setLoading(false);

    }
  };


  return (
    <div className="min-h-screen bg-[#F5F7FA]">

      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">

        {/* LEFT BRANDING PANEL */}
        <div className="hidden bg-[#0B1220] p-12 text-white lg:flex lg:flex-col lg:justify-between">

          <div>

            {/* LOGO */}
            <div className="flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#2563EB]">
                <ShieldCheck size={23} />
              </div>

              <div>

                <p className="text-lg font-bold">
                  LockSure
                </p>

                <p className="text-[10px] tracking-[0.2em] text-slate-400">
                  SECURE BANKING
                </p>

              </div>

            </div>


            {/* HERO */}
            <div className="mt-24 max-w-md">

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#06B6D4]">
                Officer Operations Center
              </p>

              <h1 className="mt-4 text-4xl font-bold leading-tight">
                Secure locker operations,

                <span className="text-[#60A5FA]">
                  {" "}simplified.
                </span>

              </h1>

              <p className="mt-5 leading-7 text-slate-400">
                Verify customers, assess risk and authorize
                locker operations from one secure workspace.
              </p>

            </div>

          </div>


          {/* SECURITY FEATURES */}
          <div className="space-y-3">

            <SecurityPoint
              text="Identity verification"
            />

            <SecurityPoint
              text="Document authenticity"
            />

            <SecurityPoint
              text="Locker authorization"
            />

          </div>

        </div>


        {/* LOGIN PANEL */}
        <div className="flex items-center justify-center p-6 sm:p-10">

          <div className="w-full max-w-md">


            {/* MOBILE LOGO */}
            <div className="mb-8 lg:hidden">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2563EB] text-white">
                  <ShieldCheck size={21} />
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


            {/* LOGIN CARD */}
            <div className="rounded-2xl border border-[#E2E8F0] bg-white p-7 shadow-sm sm:p-9">


              {/* HEADING */}
              <div className="mb-7">

                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">

                  <Building2
                    size={24}
                    className="text-[#2563EB]"
                  />

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


              {/* FORM */}
              <form
                onSubmit={handleLogin}
                className="space-y-5"
              >


                {/* EMAIL */}
                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#334155]">
                    Officer Email
                  </label>


                  <input
                    type="email"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                    placeholder="Enter officer email"
                    required
                    className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                  />

                </div>


                {/* PASSWORD */}
                <div>

                  <label className="mb-2 block text-xs font-semibold text-[#334155]">
                    Password
                  </label>


                  <div className="relative">

                    <input
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="Enter password"
                      required
                      className="w-full rounded-xl border border-[#CBD5E1] px-4 py-3 pr-11 text-sm outline-none transition focus:border-[#2563EB] focus:ring-4 focus:ring-blue-50"
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          !showPassword
                        )
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]"
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>

                </div>


                {/* ERROR */}
                {error && (

                  <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-medium text-red-700">
                    {error}
                  </div>

                )}


                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#2563EB] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Signing In..."
                    : "Sign In to Officer Portal"
                  }

                </button>

              </form>


              {/* FOOTER */}
              <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#E2E8F0] pt-5 text-xs text-[#64748B]">

                <LockKeyhole size={14} />

                Secure officer authentication

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}


function SecurityPoint({ text }) {
  return (
    <div className="flex items-center gap-3 text-sm text-slate-300">

      <CheckCircle2
        size={17}
        className="text-[#10B981]"
      />

      {text}

    </div>
  );
}


export default OfficerLogin;