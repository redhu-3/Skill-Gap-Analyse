import { Routes, Route, Navigate } from "react-router-dom";
import Landing from "../pages/Landing";
import Login from "../pages/Login";
import OAuthSuccess from "../pages/OAuthSuccess";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<Landing />} />

      {/* Login page */}
      <Route path="/login" element={<Login />} />

      {/* OAuth redirect page */}
      <Route path="/oauth-success" element={<OAuthSuccess />} />

      {/* Dashboards */}
      <Route path="/admin/dashboard" element={<h1>Admin Dashboard</h1>} />
      <Route path="/user/dashboard" element={<h1>User Dashboard</h1>} />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;
