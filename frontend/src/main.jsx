import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// ✅ Import ThemeProvider
import { ThemeProvider } from "./context/ThemeContext";

// ✅ Import PermissionProvider
import { PermissionProvider } from "./context/PermissionContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <PermissionProvider>
        <App />
      </PermissionProvider>
    </ThemeProvider>
  </StrictMode>
);
