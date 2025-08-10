import { CodegenConfig } from "@graphql-codegen/cli";

// TODO - pull schema URL from env files for dev and prod
const config: CodegenConfig = {
  schema: "http://localhost:4000/graphql",
  documents: ["app/**/*.{ts,tsx}"],
  generates: {
    "./app/lib/__generated__/": {
      preset: "client",
      plugins: [],
      presetConfig: {
        gqlTagName: "gql",
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
