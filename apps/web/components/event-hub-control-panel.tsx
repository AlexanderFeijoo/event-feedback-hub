import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import CreateModal from "@/components/modal";
import CreateEventForm from "./create-event-form";

export default function EventHubControlPanel() {
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
      <CardFooter className="flex-col gap-2">
        <CreateModal
          title="Create New Event"
          description="Your new Event will be selectable for filtering and adding feedback."
          triggerText="Create New Event"
        >
          <CreateEventForm />
        </CreateModal>
        <Button onClick={toggleModal} className="w-full">
          Create User
        </Button>
      </CardFooter>
    </Card>
  );
}
