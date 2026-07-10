import { serve } from "bun";
import index from "./index.html";

const server = serve({
  routes: {
    // Static SPA — serve index.html for all routes.
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
