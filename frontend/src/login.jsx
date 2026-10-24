
import { useState } from "react";
import axios from "axios";

function Login({ onLogin, onShowRegister }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/login",
        { username, password }
      );

      if (response.data.success) {
        onLogin();
      } else {
        setError(
          response.data.message || "Invalid username or password"
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to connect. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1020] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111a30] p-7 shadow-2xl shadow-black/30 sm:p-10">

        {/* Logo */}
        <div className="mb-9 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500 text-white shadow-lg shadow-indigo-500/20">
            <span className="text-xl font-bold">C</span>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Welcome back
            <span className="text-indigo-400">.</span>
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Sign in to continue to your collaborative workspace.
          </p>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="w-full rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-700 bg-[#0b1020] px-4 py-3.5 text-white outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10"
            />
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
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-500 px-4 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {loading ? "Signing in..." : "Sign in to your account"}
            {!loading && (
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            )}
          </button>
        </form>

        {/* Register navigation only */}
        <p className="mt-8 text-center text-sm text-slate-400">
          New to CollabSpace?{" "}
          <button
            type="button"
            onClick={onShowRegister}
            className="font-semibold text-indigo-400 transition hover:text-indigo-300 cursor-pointer"
          >
            Create an account
          </button>
        </p>

        <p className="mt-8 text-center text-xs text-slate-600">
          Your workspace. Your team. One place.
        </p>
      </div>
    </div>
  );
}

export default Login;
