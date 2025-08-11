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
import { useCallback, useState } from "react";
import { useEventFilter } from "./event-filter-context";
import { useStreamStatus } from "./simulated-feedback-filter-context";
import SimulatedStatusIndicator from "./feedback-simulated-status-indicator";
import { FeedbackInterval } from "./feedback-interval-slider";

const START_STREAM = gql`
  mutation StartFeedbackStream($interval: Int!, $eventId: ID, $minRating: Int) {
    startFeedbackStream(
      interval: $interval
      eventId: $eventId
      minRating: $minRating
    )
  }
`;

const STOP_STREAM = gql`
  mutation StopFeedbackStream {
    stopFeedbackStream
  }
`;

export default function SimulatedFeedbackControlPanel() {
  const { isStreamingFeedback, setIsStreamingFeedback } = useStreamStatus();
  const [start, startState] = useMutation(START_STREAM);
  const [stop, stopState] = useMutation(STOP_STREAM);
  const { selectedEventId } = useEventFilter();
  const [interval, setInterval] = useState([3000]);

  const loading = startState.loading || stopState.loading;
  const toggleStream = useCallback(async () => {
    try {
      if (isStreamingFeedback) {
        const { data } = await stop();
        if (data?.stopFeedbackStream) {
          setIsStreamingFeedback(false);
          console.log("stopping feedback stream.");
        }
      } else {
        const { data } = await start({
          variables: {
            interval: interval[0],
            eventId: selectedEventId ?? null,
            // minRating: minRating ?? null,
          },
        });
        if (data?.startFeedbackStream) {
          setIsStreamingFeedback(true);
          console.log("Starting the feedback stream");
        }
      }
    } catch (error) {
      console.error("Error starting feedback stream.", error);
    }
  }, [
    isStreamingFeedback,
    setIsStreamingFeedback,
    selectedEventId,
    start,
    stop,
    interval,
  ]);
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Add Feedback or Simulate Stream</CardTitle>
        <CardDescription>
          Start the stream to simulate adding random{" "}
          <strong>Feedback Users, and Events.</strong>
          <br />
          The simulated stream will re-use existing events and users
          approximately 70% of the time. Change the <strong>interval</strong> to
          control how fast simulated feedback appears.
        </CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full">
        <p>Interval: {interval}ms</p>
        <FeedbackInterval
          disabled={isStreamingFeedback}
          onValueChange={setInterval}
        />
        <Button
          onClick={toggleStream}
          disabled={loading}
          className="streaming:opacity-50 w-full mt-5"
          variant={isStreamingFeedback ? "destructive" : "outline"}
        >
          {loading
            ? isStreamingFeedback
              ? "Stopping..."
              : "Starting..."
            : isStreamingFeedback
              ? "Stop Stream"
              : "Start Stream"}
        </Button>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <SimulatedStatusIndicator />
      </CardFooter>
    </Card>
  );
}
