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
import { useCallback, useEffect, useRef, useState } from "react";
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

const AUTO_STOP_MS = 30_000;

export default function SimulatedFeedbackControlPanel() {
  const { isStreamingFeedback, setIsStreamingFeedback } = useStreamStatus();
  const [start, startState] = useMutation(START_STREAM);
  const [stop, stopState] = useMutation(STOP_STREAM);
  const { selectedEventId } = useEventFilter();
  const [interval, setInterval] = useState([3000]);

  const autoStopRef = useRef<number | null>(null);

  const clearAutoStop = () => {
    if (autoStopRef.current != null) {
      clearTimeout(autoStopRef.current);
      autoStopRef.current = null;
    }
  };

  const scheduleAutoStop = () => {
    clearAutoStop();
    autoStopRef.current = window.setTimeout(async () => {
      try {
        const { data } = await stop();
        if (data?.stopFeedbackStream) {
          setIsStreamingFeedback(false);
          console.log("Auto-stopped feedback stream after ~30s.");
        }
      } catch (err) {
        console.error("Auto-stop failed:", err);
      }
    }, AUTO_STOP_MS);
  };

  useEffect(() => {
    return () => clearAutoStop();
  }, []);

  const loading = startState.loading || stopState.loading;

  const toggleStream = useCallback(async () => {
    try {
      if (isStreamingFeedback) {
        clearAutoStop();
        const { data } = await stop();
        if (data?.stopFeedbackStream) {
          setIsStreamingFeedback(false);
          console.log("Stopping feedback stream.");
        }
      } else {
        const { data } = await start({
          variables: {
            interval: interval[0],
            eventId: selectedEventId ?? null,
          },
        });
        if (data?.startFeedbackStream) {
          setIsStreamingFeedback(true);
          console.log("Starting the feedback stream.");
          scheduleAutoStop();
        }
      }
    } catch (error) {
      console.error("Error starting/stopping feedback stream.", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <CardTitle>Simulate Feedback Stream</CardTitle>
        <CardDescription>
          Start the stream to simulate adding random{" "}
          <strong>Feedback, Users, and Events.</strong>
          <br />
          The stream reuses existing events/users ~70% of the time. Use the{" "}
          <strong>interval</strong> to control speed.
          <br />
          <em>Note: the stream auto-stops after ~30 seconds.</em>
        </CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex flex-col justify-center h-full">
        <p>Interval: {interval[0]}ms</p>
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
