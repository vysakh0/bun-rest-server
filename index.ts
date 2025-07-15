import { routes } from "./routes";

export const server = Bun.serve({
  port: 3001,
  routes,
});

console.log("Server running on http://localhost:3001");
