"use client";
import { useSubscription, gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Feedback } from "../lib/__generated__/graphql";
import { FeedbackEdge } from "../lib/__generated__/graphql";

const FEEDBACK_ADDED = gql`
  subscription Subscription($eventId: ID) {
    feedbackAdded(eventId: $eventId) {
      createdAt
      rating
      text
      user {
        name
        email
      }
      event {
        name
      }
      id
    }
  }
`;

const FEEDBACKS = gql`
  query Feedbacks($first: Int!, $after: String) {
    feedbacks(first: $first, after: $after) {
      edges {
        cursor
        node {
          rating
          text
          createdAt
          id
          event {
            name
          }
          user {
            email
            name
          }
        }
      }
    }
  }
`;

export default function DisplayFeedback() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const {
    data: feedbackQueryData,
    loading: queryLoading,
    error: queryError,
    fetchMore,
  } = useQuery(FEEDBACKS, {
    variables: { first: 5, after: null },
    fetchPolicy: "cache-and-network",
  });

  // TODO - add loading state for subscriptions here once we are using them
  const { data: feedbackSubscriptionData, error: subscriptionError } =
    useSubscription(FEEDBACK_ADDED);

  useEffect(() => {
    if (feedbackQueryData?.feedbacks?.edges) {
      setFeedbacks(
        feedbackQueryData.feedbacks.edges.map((edge: FeedbackEdge) => edge.node)
      );
    }
  }, [feedbackQueryData]);

  useEffect(() => {
    if (feedbackSubscriptionData?.feedbackAdded) {
      setFeedbacks((prev) => {
        const updated = [feedbackSubscriptionData.feedbackAdded, ...prev];
        return updated.slice(0, 5);
      });
    }
  }, [feedbackSubscriptionData]);

  const loadMore = () => {
    const endCursor =
      feedbackQueryData?.feedbacks.edges[
        feedbackQueryData.feedbacks.edges.length - 1
      ]?.cursor;

    if (!endCursor) return;

    fetchMore({
      variables: { first: 5, after: endCursor },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          feedbacks: {
            ...fetchMoreResult.feedbacks,
            edges: [
              ...prev.feedbacks.edges,
              ...fetchMoreResult.feedbacks.edges,
            ],
          },
        };
      },
    });
  };

  // Early returns if errors or loading
  if (queryLoading && feedbacks.length === 0) return <p>Loading...</p>;
  if (queryError) return <p>Error: {queryError.message}</p>;
  if (subscriptionError)
    return <p>Subscription Error: {subscriptionError.message}</p>;

  return (
    <div>
      {feedbacks.map((feedback) => (
        <div key={feedback.id}>
          <h3>{feedback.event.name}</h3>
          <p>
            <strong>Feedback:</strong> {feedback.text}
          </p>
          <p>
            <strong>Rating:</strong> {feedback.rating}
          </p>
          <p>
            <strong>User:</strong> {feedback.user?.name} ({feedback.user?.email}
            )
          </p>
          <p>
            <em>{feedback.createdAt}</em>
          </p>
        </div>
      ))}
      <button onClick={loadMore}>Load More</button>
    </div>
  );
}
