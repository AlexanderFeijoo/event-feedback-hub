/* eslint-disable */
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export type Event = {
  __typename?: 'Event';
  description: Scalars['String']['output'];
  feedbacks: Array<Feedback>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};

export type Feedback = {
  __typename?: 'Feedback';
  createdAt: Scalars['String']['output'];
  event: Event;
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  text: Scalars['String']['output'];
  user: User;
};

export type FeedbackConnection = {
  __typename?: 'FeedbackConnection';
  count: Scalars['Int']['output'];
  edges: Array<FeedbackEdge>;
  pageInfo: PageInfo;
};

export type FeedbackEdge = {
  __typename?: 'FeedbackEdge';
  cursor: Scalars['String']['output'];
  node: Feedback;
};

export type Mutation = {
  __typename?: 'Mutation';
  createEvent?: Maybe<Event>;
  createFeedback?: Maybe<Feedback>;
  createUser?: Maybe<User>;
  startFeedbackStream: Scalars['Boolean']['output'];
  stopFeedbackStream: Scalars['Boolean']['output'];
  updateEvent?: Maybe<Event>;
  updateFeedback?: Maybe<Feedback>;
  updateUser?: Maybe<User>;
};


export type MutationCreateEventArgs = {
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationCreateFeedbackArgs = {
  eventId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  text: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationCreateUserArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
};


export type MutationStartFeedbackStreamArgs = {
  interval: Scalars['Int']['input'];
};


export type MutationUpdateEventArgs = {
  description: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};


export type MutationUpdateFeedbackArgs = {
  eventId: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
  text: Scalars['String']['input'];
  userId: Scalars['String']['input'];
};


export type MutationUpdateUserArgs = {
  email: Scalars['String']['input'];
  id: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
};

export type Query = {
  __typename?: 'Query';
  events?: Maybe<Array<Maybe<Event>>>;
  feedbacks: FeedbackConnection;
  users?: Maybe<Array<Maybe<User>>>;
};


export type QueryFeedbacksArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  eventId?: InputMaybe<Scalars['ID']['input']>;
  first: Scalars['Int']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  feedbackAdded: Feedback;
};


export type SubscriptionFeedbackAddedArgs = {
  eventId?: InputMaybe<Scalars['ID']['input']>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String']['output'];
  feedbacks?: Maybe<Array<Feedback>>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
};
