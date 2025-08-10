import "dotenv/config";
import type { CodegenConfig } from "@graphql-codegen/cli";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

const config: CodegenConfig = {
  schema: API_URL,
  documents: ["**/*.{ts,tsx}", "!app/lib/__generated__/**", "!node_modules/**"],
  generates: {
    "./app/lib/__generated__/": {
      preset: "client",
      presetConfig: { gqlTagName: "gql" },
      plugins: [],
    },
  },
  ignoreNoDocuments: true,
};

export default config;
