import express from "express";
import { registerRoutes } from "./routes";
import { log } from "./vite";
import "../keepmealive"; // Make sure the path is correct

const app = express();

app.get("/", (req, res) => {
  res.send("Running Discord Application...");
});

(async () => {
  const server = await registerRoutes(app);

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`Discord bot server running on port ${port}`);
  });
})();
