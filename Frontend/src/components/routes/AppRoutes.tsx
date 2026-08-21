import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import Login from "../../pages/Auth/Login"; // was "login" — fix casing so the import doesn't break on case-sensitive filesystems (Linux CI/prod)
import Register from "../../pages/Auth/Register";
import Room from "../../pages/Room/Room";
import Dashboard from "../../pages/Dashboard/Dashboard";
import Workspace from "../../pages/Workspace/Workspace";

import ProtectedRoute from "./ProtectedRoutes";
// import PublicRoute from "./PublicRoutes"; // was "publicRoutes" — matched casing with ProtectedRoutes

import AuthLayout from "../layout/AuthLayout";
import DashboardLayout from "../layout/DashboardLayout";
import WorkspaceLayout from "../layout/WorkspaceLayout";
import PublicRoute from "./publicRoutes";
import Login from "../../pages/Auth/login";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Route>
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
           <Route element={<WorkspaceLayout />}>
            <Route path="/workspace/:workspaceId" element={<Workspace />} />
          </Route>
          <Route path="/room/:roomId" element={<Room />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
