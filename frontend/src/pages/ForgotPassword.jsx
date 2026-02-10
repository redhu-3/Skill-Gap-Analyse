import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosAuth";
import axiosAuth from "../api/axiosAuth";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      await axiosAuth.post("/forgot-password", { email });

      setMessage(
        "If this email exists, a password reset link has been sent."
      );

      // Optional redirect after success
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl w-full max-w-md shadow">
        <h2 className="text-2xl font-bold text-center mb-2">
          Forgot Password
        </h2>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
          Enter your email and we’ll send you a reset link
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border dark:bg-gray-700"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {message && <p className="text-green-600 text-sm">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 text-sm text-indigo-600 hover:underline block text-center"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword;
