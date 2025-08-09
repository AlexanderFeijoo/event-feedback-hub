import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { gql, useMutation } from "@apollo/client";
import { useState } from "react";

const START_STREAM = gql`
  mutation StartFeedbackStream($interval: Int!) {
    startFeedbackStream(interval: $interval)
  }
`;

const STOP_STREAM = gql`
  mutation StopFeedbackStream {
    stopFeedbackStream
  }
`;

export default function ControlPanel() {
  const [streaming, setStreaming] = useState(false);
  const [start, startState] = useMutation(START_STREAM);
  const [stop, stopState] = useMutation(STOP_STREAM);

  const loading = startState.loading || stopState.loading;
  const error = startState.error ?? stopState.error;
  const toggleStream = async () => {
    if (streaming) {
      try {
        await stop();
        console.log("starting feedback stream");
      } catch (error) {
        console.error("Error starting feedback stream.", error);
      }
    }
    try {
      await start({
        variables: { interval: 2000 },
      });
      console.log("starting feedback stream");
    } catch (error) {
      console.error("Error starting feedback stream.", error);
    }
  };
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Feedback Stream Control</CardTitle>
        <CardDescription>
          Controls for the feedback stream to test the real-time graphql
          subscription.
        </CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex justify-center">
        {error && <p className="text-red-500">{error.message}</p>}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button onClick={toggleStream} disabled={loading} className="w-full">
          {loading ? "Starting..." : "Start Stream"}
        </Button>
      </CardFooter>
    </Card>
  );
}
