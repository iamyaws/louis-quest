import { defineConfig } from "@pandacss/dev";

export default defineConfig({
  preflight: true,
  include: ["./src/**/*.{js,jsx,ts,tsx}"],
  exclude: ["./src/**/*.{test,spec}.{js,jsx,ts,tsx}"],
  outdir: "styled-system",
  jsxFramework: "react",
});
