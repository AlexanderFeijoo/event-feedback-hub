"use client";
import { useSubscription, gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Feedback } from "./lib/__generated__/graphql";

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
  const [feedbacks, setFeedbacks] = useState([]);

  const {
    loading,
    error,
    data: feedbackSubscriptionData,
  } = useSubscription(FEEDBACK_ADDED);

  const { data: feedbackQueryData, fetchMore } = useQuery(FEEDBACKS, {
    variables: { first: 5, after: null },
  });

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

  useEffect(() => {}, [feedbackQueryData]);

  useEffect(() => {
    if (feedbackSubscriptionData?.feedbackAdded) {
      setFeedbacks((prev): any => {
        const feedbacklist: Feedback[] = [
          feedbackSubscriptionData.feedbackAdded,
          ...prev,
        ];
        return feedbacklist.slice(0, 5);
      });
    }
  }, [feedbackSubscriptionData]);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error : {error.message}</p>;

  return feedbacks.map((feedback: Feedback) => (
    <div key={feedback.id}>
      <h3>{feedback.event.name}</h3>
      <h2>Feedback</h2>
      <p>{feedback.text}</p>
      <p>{feedback.rating}</p>
      <h2>USER</h2>
      <p>{feedback.user?.name}</p>
      <p>{feedback.user?.email}</p>
    </div>
  ));
}
