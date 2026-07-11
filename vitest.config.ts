import { defineConfig } from "vitest/config";
import { config } from "dotenv";

// Isolasjonstestene leser TEST_SUPABASE_* fra .env.test (lokalt) eller CI-secrets
config({ path: ".env.test" });

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    testTimeout: 30_000,
  },
});
