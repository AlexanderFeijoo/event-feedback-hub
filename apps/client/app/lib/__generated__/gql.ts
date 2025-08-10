/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateEvent($name: String!, $description: String!) {\n    createEvent(name: $name, description: $description) {\n      name\n      description\n      id\n    }\n  }\n": typeof types.CreateEventDocument,
    "\n  mutation CreateFeedback(\n    $eventId: ID!\n    $userId: ID!\n    $text: String!\n    $rating: Int!\n  ) {\n    createFeedback(\n      eventId: $eventId\n      userId: $userId\n      text: $text\n      rating: $rating\n    ) {\n      text\n      rating\n      id\n    }\n  }\n": typeof types.CreateFeedbackDocument,
    "\n  mutation CreateUser($email: String!, $name: String!) {\n    createUser(email: $email, name: $name) {\n      id\n      name\n      email\n    }\n  }\n": typeof types.CreateUserDocument,
    "\n  query Events {\n    events {\n      id\n      name\n      description\n    }\n  }\n": typeof types.EventsDocument,
    "\n  mutation StartFeedbackStream($interval: Int!, $eventId: ID, $minRating: Int) {\n    startFeedbackStream(\n      interval: $interval\n      eventId: $eventId\n      minRating: $minRating\n    )\n  }\n": typeof types.StartFeedbackStreamDocument,
    "\n  mutation StopFeedbackStream {\n    stopFeedbackStream\n  }\n": typeof types.StopFeedbackStreamDocument,
    "\n  query Feedbacks($first: Int!, $after: String, $eventId: ID, $ratingGte: Int) {\n    feedbacks(\n      first: $first\n      after: $after\n      eventId: $eventId\n      ratingGte: $ratingGte\n    ) {\n      count\n      edges {\n        cursor\n        node {\n          id\n          rating\n          text\n          createdAt\n          event {\n            id\n            name\n            description\n          }\n          user {\n            email\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.FeedbacksDocument,
    "\n  subscription FeedbackAdded($eventId: ID, $ratingGte: Int) {\n    feedbackAdded(eventId: $eventId, ratingGte: $ratingGte) {\n      id\n      createdAt\n      rating\n      text\n      user {\n        name\n        email\n      }\n      event {\n        id\n        name\n        description\n      }\n    }\n  }\n": typeof types.FeedbackAddedDocument,
    "\n  query Users {\n    users {\n      id\n      email\n      name\n    }\n  }\n": typeof types.UsersDocument,
};
const documents: Documents = {
    "\n  mutation CreateEvent($name: String!, $description: String!) {\n    createEvent(name: $name, description: $description) {\n      name\n      description\n      id\n    }\n  }\n": types.CreateEventDocument,
    "\n  mutation CreateFeedback(\n    $eventId: ID!\n    $userId: ID!\n    $text: String!\n    $rating: Int!\n  ) {\n    createFeedback(\n      eventId: $eventId\n      userId: $userId\n      text: $text\n      rating: $rating\n    ) {\n      text\n      rating\n      id\n    }\n  }\n": types.CreateFeedbackDocument,
    "\n  mutation CreateUser($email: String!, $name: String!) {\n    createUser(email: $email, name: $name) {\n      id\n      name\n      email\n    }\n  }\n": types.CreateUserDocument,
    "\n  query Events {\n    events {\n      id\n      name\n      description\n    }\n  }\n": types.EventsDocument,
    "\n  mutation StartFeedbackStream($interval: Int!, $eventId: ID, $minRating: Int) {\n    startFeedbackStream(\n      interval: $interval\n      eventId: $eventId\n      minRating: $minRating\n    )\n  }\n": types.StartFeedbackStreamDocument,
    "\n  mutation StopFeedbackStream {\n    stopFeedbackStream\n  }\n": types.StopFeedbackStreamDocument,
    "\n  query Feedbacks($first: Int!, $after: String, $eventId: ID, $ratingGte: Int) {\n    feedbacks(\n      first: $first\n      after: $after\n      eventId: $eventId\n      ratingGte: $ratingGte\n    ) {\n      count\n      edges {\n        cursor\n        node {\n          id\n          rating\n          text\n          createdAt\n          event {\n            id\n            name\n            description\n          }\n          user {\n            email\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.FeedbacksDocument,
    "\n  subscription FeedbackAdded($eventId: ID, $ratingGte: Int) {\n    feedbackAdded(eventId: $eventId, ratingGte: $ratingGte) {\n      id\n      createdAt\n      rating\n      text\n      user {\n        name\n        email\n      }\n      event {\n        id\n        name\n        description\n      }\n    }\n  }\n": types.FeedbackAddedDocument,
    "\n  query Users {\n    users {\n      id\n      email\n      name\n    }\n  }\n": types.UsersDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateEvent($name: String!, $description: String!) {\n    createEvent(name: $name, description: $description) {\n      name\n      description\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateEvent($name: String!, $description: String!) {\n    createEvent(name: $name, description: $description) {\n      name\n      description\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateFeedback(\n    $eventId: ID!\n    $userId: ID!\n    $text: String!\n    $rating: Int!\n  ) {\n    createFeedback(\n      eventId: $eventId\n      userId: $userId\n      text: $text\n      rating: $rating\n    ) {\n      text\n      rating\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFeedback(\n    $eventId: ID!\n    $userId: ID!\n    $text: String!\n    $rating: Int!\n  ) {\n    createFeedback(\n      eventId: $eventId\n      userId: $userId\n      text: $text\n      rating: $rating\n    ) {\n      text\n      rating\n      id\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateUser($email: String!, $name: String!) {\n    createUser(email: $email, name: $name) {\n      id\n      name\n      email\n    }\n  }\n"): (typeof documents)["\n  mutation CreateUser($email: String!, $name: String!) {\n    createUser(email: $email, name: $name) {\n      id\n      name\n      email\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Events {\n    events {\n      id\n      name\n      description\n    }\n  }\n"): (typeof documents)["\n  query Events {\n    events {\n      id\n      name\n      description\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation StartFeedbackStream($interval: Int!, $eventId: ID, $minRating: Int) {\n    startFeedbackStream(\n      interval: $interval\n      eventId: $eventId\n      minRating: $minRating\n    )\n  }\n"): (typeof documents)["\n  mutation StartFeedbackStream($interval: Int!, $eventId: ID, $minRating: Int) {\n    startFeedbackStream(\n      interval: $interval\n      eventId: $eventId\n      minRating: $minRating\n    )\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation StopFeedbackStream {\n    stopFeedbackStream\n  }\n"): (typeof documents)["\n  mutation StopFeedbackStream {\n    stopFeedbackStream\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Feedbacks($first: Int!, $after: String, $eventId: ID, $ratingGte: Int) {\n    feedbacks(\n      first: $first\n      after: $after\n      eventId: $eventId\n      ratingGte: $ratingGte\n    ) {\n      count\n      edges {\n        cursor\n        node {\n          id\n          rating\n          text\n          createdAt\n          event {\n            id\n            name\n            description\n          }\n          user {\n            email\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query Feedbacks($first: Int!, $after: String, $eventId: ID, $ratingGte: Int) {\n    feedbacks(\n      first: $first\n      after: $after\n      eventId: $eventId\n      ratingGte: $ratingGte\n    ) {\n      count\n      edges {\n        cursor\n        node {\n          id\n          rating\n          text\n          createdAt\n          event {\n            id\n            name\n            description\n          }\n          user {\n            email\n            name\n          }\n        }\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  subscription FeedbackAdded($eventId: ID, $ratingGte: Int) {\n    feedbackAdded(eventId: $eventId, ratingGte: $ratingGte) {\n      id\n      createdAt\n      rating\n      text\n      user {\n        name\n        email\n      }\n      event {\n        id\n        name\n        description\n      }\n    }\n  }\n"): (typeof documents)["\n  subscription FeedbackAdded($eventId: ID, $ratingGte: Int) {\n    feedbackAdded(eventId: $eventId, ratingGte: $ratingGte) {\n      id\n      createdAt\n      rating\n      text\n      user {\n        name\n        email\n      }\n      event {\n        id\n        name\n        description\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query Users {\n    users {\n      id\n      email\n      name\n    }\n  }\n"): (typeof documents)["\n  query Users {\n    users {\n      id\n      email\n      name\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;