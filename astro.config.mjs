import { defineConfig } from "astro/config";

export default defineConfig({
  // site: "https://<USERNAME>.github.io/icv", // Uncomment and set your production URL if needed
  base: process.env.BASE_PATH || '/',
  integrations: [],
}); 