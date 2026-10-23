
import { useState } from "react";
import axios from "axios";

function Register({ onRegister }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/register",
        {
          username,
          email,
          password,
        }
      );

      if (response.data.success) {
        onRegister();
      } else {
        setError(
          response.data.message || "Registration failed"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to register. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111a30] p-7 shadow-2xl shadow-black/30 sm:p-10">

        {/* Logo */}
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
            C
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              CollabSpace
            </h2>
            <p className="text-xs text-slate-400">
              Work better, together.
            </p>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-7">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Create your account
            <span className="text-indigo-400">.</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Join your team and start collaborating.
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label
              htmlFor="register-username"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Username
            </label>
            <input
              id="register-username"
              type="text"
              placeholder="Choose a username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Email address
            </label>
            <input
              id="register-email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="register-password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="register-password"
              type="password"
              placeholder="Create a strong password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
            <p className="mt-2 text-xs text-slate-500">
              Use at least 8 characters.
            </p>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && (
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        {/* Login navigation */}
        <p className="mt-7 text-center text-sm text-slate-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onRegister}
            className="font-semibold text-indigo-400 transition hover:text-indigo-300"
          >
            Sign in
          </button>
        </p>

        <p className="mt-7 text-center text-xs text-slate-600">
          Your workspace. Your team. One place.
        </p>
      </div>
    </div>
  );
}

export default Register;
