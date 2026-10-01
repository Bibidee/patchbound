import {defineConfig} from "vitest/config";import path from "node:path";
export default defineConfig({test:{environment:"jsdom",include:["tests/ui/**/*.test.{ts,tsx}"]},resolve:{alias:{"@":path.resolve(__dirname,".")}}});
