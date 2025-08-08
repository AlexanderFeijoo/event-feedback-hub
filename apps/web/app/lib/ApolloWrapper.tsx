"use client";

import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  split,
  HttpLink,
} from "@apollo/client";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import { createClient } from "graphql-ws";

const http = new HttpLink({
  uri: "http://localhost:4000/graphql",
});

const ws = new GraphQLWsLink(
  createClient({
    url: "ws://localhost:4000/graphql",
  })
);

// TODO more strongly type
const splitter = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    return (
      def.kind === "OperationDefinition" && def.operation === "subscription"
    );
  },
  ws,
  http
);

export const client = new ApolloClient({
  link: splitter,
  cache: new InMemoryCache(),
});

export function ApolloWrapper({ children }: { children: React.ReactNode }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
