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

const httpUri = process.env.NEXT_PUBLIC_API_URL!;
const wsUri = process.env.NEXT_PUBLIC_WS_URL!;

const http = new HttpLink({
  uri: httpUri,
});

const ws = new GraphQLWsLink(
  createClient({
    url: wsUri,
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
