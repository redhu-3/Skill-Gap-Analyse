
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import { FcGoogle } from "react-icons/fc";
import { useTheme } from "../context/ThemeContext"; // Import hook
 import { useLocation } from "react-router-dom";
const Login = () => {
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useTheme();

  // ---------------- FORM STATE ----------------
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
 

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;
    // On first render, set the default tab based on state
    const location = useLocation(); // ❌ you imported it but didn't call it
useEffect(() => {
  if (location.state?.defaultTab === "signup") {
    setIsLogin(false);
  } else {
    setIsLogin(true);
  }
}, [location.state]);

  // ---------------- FORM SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!emailRegex.test(email)) return setError("Invalid email format");
    if (!isLogin && !name.trim()) return setError("Name is required");
    if (!isLogin && !passwordRegex.test(password))
      return setError(
        "Password must contain uppercase, lowercase, number, special character, and be at least 8 characters"
      );
    if (!isLogin && password !== confirmPassword)
      return setError("Passwords do not match");

    try {
      setLoading(true);
      const endpoint = isLogin
        ? role === "admin"
          ? "/admin/login"
          : "/user/login"
        : role === "admin"
        ? "/admin/register"
        : "/user/register";

      const payload = isLogin
        ? { email, password }
        : { name, email, password };

      const res = await axiosInstance.post(endpoint, payload);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", role);

      navigate(role === "admin" ? "/admin/dashboard" : "/user/dashboard");
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg) {
        setError(msg);
      } else {
        setError("Authentication failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `http://localhost:5000/auth/google?role=${role}`;
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-100 text-gray-800"
      }`}
    >
      <div
        className={`w-full max-w-md rounded-2xl shadow-lg overflow-hidden transition-colors duration-500 ${
          darkMode ? "bg-gray-800 shadow-gray-700" : "bg-white shadow-gray-300"
        }`}
      >
        {/* Header */}
        <div
          className={`p-6 text-center ${
            darkMode
              ? "bg-gradient-to-r from-indigo-700 to-indigo-500 text-white"
              : "bg-gradient-to-r from-blue-500 to-blue-500 text-white"
          }`}
        >
          <h2 className="text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-sm mt-1">
            {isLogin
              ? "Sign in to continue"
              : "Sign up to start your journey"}
          </p>

          <div className="mt-4 flex justify-center border-b border-white/30">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`px-4 py-2 font-semibold ${
                isLogin ? "border-b-2 border-white" : "opacity-60"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`px-4 py-2 font-semibold ${
                !isLogin ? "border-b-2 border-white" : "opacity-60"
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form className="p-6 space-y-4" onSubmit={handleSubmit}>
          {/* Role Selection */}
          <div>
            <p className="text-sm font-medium mb-2">Select Role</p>
            <div className="flex gap-3">
              {["user", "admin"].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className={`flex-1 py-2 rounded-lg border font-medium transition ${
                    role === r
                      ? "bg-blue-500 text-white border-blue-500"
                      : darkMode
                      ? "bg-gray-700 text-gray-300 border-gray-600"
                      : "bg-white text-gray-700 border-gray-300"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {!isLogin && (
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors duration-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              }`}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-colors duration-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg border transition-colors duration-500 ${
              darkMode
                ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
            }`}
          />

          {/* Forgot Password link */}
          {isLogin && (
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
          )}

          {!isLogin && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border transition-colors duration-500 ${
                darkMode
                  ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-300"
                  : "bg-white border-gray-300 text-gray-800 placeholder-gray-500"
              }`}
            />
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg font-semibold transition-colors duration-500 ${
              darkMode
                ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                : "bg-blue-500 hover:bg-blue-600 text-white"
            }`}
          >
            {loading ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
          </button>

          {/* OR Divider */}
          <div className="flex items-center gap-3 text-gray-400 text-sm">
            <div className="flex-1 h-px bg-gray-300" />
            OR
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Google Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 border transition-colors duration-500 ${
              darkMode
                ? "border-gray-600 text-gray-100 hover:bg-gray-700"
                : "border-gray-300 text-gray-800 hover:bg-gray-100"
            }`}
          >
            <FcGoogle className="w-6 h-6" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
