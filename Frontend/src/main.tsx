import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "sonner";
import AppRoutes from "./components/routes/AppRoutes";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Toaster theme="dark" richColors position="top-right" closeButton />
    <AppRoutes />
  </React.StrictMode>
);