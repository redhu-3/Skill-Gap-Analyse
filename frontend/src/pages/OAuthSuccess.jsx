import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  useEffect(() => {
    const token = params.get("token");
    const role = params.get("role");

    if (!token || !role) {
      navigate("/login");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);

    if (role === "admin") {
      navigate("/admin/dashboard");
    } else {
      navigate("/user/dashboard");
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-lg font-semibold">Signing you in with Google…</p>
    </div>
  );
};

export default OAuthSuccess;
