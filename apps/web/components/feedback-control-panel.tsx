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
import Modal from "./modal";
import CreateFeedbackForm from "./create-feedback-form";
import { useEventFilter } from "./event-filter-context";

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
// TODO: Improvement: make the stream create one feedback right away, then use the interval
export default function SimulatedFeedbackControlPanel() {
  const [streaming, setStreaming] = useState(false);
  const [start, startState] = useMutation(START_STREAM);
  const [stop, stopState] = useMutation(STOP_STREAM);
  const { selectedEventId } = useEventFilter();

  const loading = startState.loading || stopState.loading;
  const error = startState.error ?? stopState.error;
  const toggleStream = useCallback(async () => {
    try {
      if (streaming) {
        const { data } = await stop();
        if (data?.stopFeedbackStream) {
          setStreaming(false);
          console.log("stopping feedback stream.");
        }
      } else {
        // TODO: Make it possible to set interval in the control Panel.
        const { data } = await start({
          variables: {
            interval: 3000,
            eventId: selectedEventId ?? null,
            // minRating: minRating ?? null,
          },
        });
        if (data?.startFeedbackStream) {
          setStreaming(true);
          console.log("Starting the feedback stream");
        }
      }
    } catch (error) {
      console.error("Error starting feedback stream.", error);
    }
  }, [streaming, selectedEventId, start, stop]);
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Add Feedback or Simulate Stream</CardTitle>
        <CardDescription>
          Start the stream to simulate adding random Feedback, Users, and
          Events, or manually add Feedback.
        </CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex justify-center">
        {error && <p className="text-red-500">{error.message}</p>}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          onClick={toggleStream}
          disabled={loading}
          className="streaming:opacity-50 w-full"
          variant={streaming ? "destructive" : "default"}
        >
          {loading
            ? streaming
              ? "Stopping..."
              : "Starting..."
            : streaming
              ? "Stop Stream"
              : "Start Stream"}
        </Button>
        <Modal
          title="Add New Feedback"
          description="Your feedback will be published to the live feedback stream"
          triggerText="Add Feedback"
        >
          <CreateFeedbackForm />
        </Modal>
      </CardFooter>
    </Card>
  );
}
