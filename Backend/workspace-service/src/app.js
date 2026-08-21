import express from "express";
// import cors from "cors";

import workspaceRoutes from "./routes/workspace.routes.js";
import roomRoutes from "./routes/room.routes.js";

const app = express();

// app.use(cors());
app.use(express.json());

console.log("reached")

app.use(
  "/workspace",
  workspaceRoutes
);

app.use(
  "/workspace",
  roomRoutes
);

export default app;