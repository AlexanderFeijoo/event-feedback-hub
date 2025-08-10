import "dotenv/config";
import type { CodegenConfig } from "@graphql-codegen/cli";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/graphql";

const config: CodegenConfig = {
  schema: API_URL,
  documents: ["app/**/*.{ts,tsx}"],
  generates: {
    "./app/lib/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: { gqlTagName: "gql" },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
