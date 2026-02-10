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
//import ResultModal from "./components/user/ResultModal";
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
        <Route path="/user/dashboard" element={<UserDashboard/>} />
         <Route path="/user/job-roles" element={<JobRoles />} />  {/* <-- new route */}
           <Route path="/skills/:skillId" element={<SkillsPage />} />
        <Route path="/assessment/:assessmentId" element={<AssessmentPage />} />

         
        {/* ✅ ROADMAP PAGE */}
        <Route path="/user/roadmap/:jobRoleId" element={<Roadmap />} />


        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
