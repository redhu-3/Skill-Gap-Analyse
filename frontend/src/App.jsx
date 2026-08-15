import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import OAuthSuccess from "./pages/OAuthSuccess";
import ResetPassword from "./pages/ResetPassword";
import ForgotPassword from "./pages/ForgotPassword";
import AdminRoutes from "./routes/AdminRoutes";
import UserDashboard from "./pages/user/UserDashboard";
import JobRoles from "./pages/user/JobRoles";
import Roadmap from "./pages/user/Roadmap";
import SkillsPage from "./pages/user/SkillsPage";
import AssessmentPage from "./pages/user/AssessmentPage";
import GapAnalysis from "./pages/user/GapAnalysis";
import DiagnosticLanding from "./pages/user/DiagnosticLanding";
import DiagnosticTest from "./pages/user/DiagnosticTest";
import DiagnosticResults from "./pages/user/DiagnosticResults";

// ✅ Auth Guard — blocks non-users from accessing any user routes
const ProtectedUserRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Landing />} />

        {/* Login page */}
        <Route path="/login" element={<Login />} />

        {/* OAuth redirect page */}
        <Route path="/oauth-success" element={<OAuthSuccess />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Dashboards */}
        <Route path="/admin/*" element={<AdminRoutes/>} />
        
        {/* ✅ User Routes Protected */}
        <Route path="/user/dashboard" element={<ProtectedUserRoute><UserDashboard/></ProtectedUserRoute>} />
        <Route path="/user/diagnostic" element={<ProtectedUserRoute><DiagnosticLanding /></ProtectedUserRoute>} />
        <Route path="/user/diagnostic/test" element={<ProtectedUserRoute><DiagnosticTest /></ProtectedUserRoute>} />
        <Route path="/user/diagnostic/results" element={<ProtectedUserRoute><DiagnosticResults /></ProtectedUserRoute>} />
        <Route path="/user/job-roles" element={<ProtectedUserRoute><JobRoles /></ProtectedUserRoute>} />
        <Route path="/skills/:skillId" element={<ProtectedUserRoute><SkillsPage /></ProtectedUserRoute>} />
        <Route path="/assessment/:assessmentId" element={<ProtectedUserRoute><AssessmentPage /></ProtectedUserRoute>} />
        <Route path="/user/gap-analysis" element={<ProtectedUserRoute><GapAnalysis /></ProtectedUserRoute>} />
        <Route path="/user/roadmap/:jobRoleId" element={<ProtectedUserRoute><Roadmap /></ProtectedUserRoute>} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
