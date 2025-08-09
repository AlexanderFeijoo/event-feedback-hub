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
import CreateModal from "@/components/modal";
import CreateEventForm from "./create-event-form";

const STOP_STREAM = gql`
  mutation StopFeedbackStream {
    stopFeedbackStream
  }
`;
// TODO: Improvement: make the stream create one feedback right away, then use the interval
export default function EventHubControlPanel() {
  const [streaming, setStreaming] = useState(false);
  const [stop, stopState] = useMutation(STOP_STREAM);

  const loading = stopState.loading;
  const error = stopState.error;
  const toggleModal = () => {};
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create User or Event</CardTitle>
        <CardDescription>
          Create an event, or simulate switching and creating users.
        </CardDescription>
        <CardAction></CardAction>
      </CardHeader>
      <CardContent className="flex justify-center">
        {error && <p className="text-red-500">{error.message}</p>}
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <CreateModal
          title="Create New Event"
          description="Your new Event will be selectable for filtering and adding feedback."
          triggerText="Create New Event"
        >
          <CreateEventForm />
        </CreateModal>
        <Button onClick={toggleModal} disabled={loading} className="w-full">
          Create User
        </Button>
        <Button
          variant="outline"
          onClick={toggleModal}
          disabled={loading}
          className="w-full"
        >
          Create Event
        </Button>
      </CardFooter>
    </Card>
  );
}
