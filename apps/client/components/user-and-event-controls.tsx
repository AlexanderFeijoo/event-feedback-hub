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

import CreateModal from "@/components/modal";
import CreateEventForm from "./create-event-form";
import CreateOrSwitchUserForm from "./create-user-form";
import CreateFeedbackForm from "./create-feedback-form";

export default function EventHubControlPanel() {
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Create Users, Events, and Add Feedback</CardTitle>
        <CardDescription>
          Create an event, or simulate switching and creating users, or add
          feedback manually.
        </CardDescription>
        <CardContent className="flex justify-center">
          <p></p>
        </CardContent>
      </CardHeader>
      <CardFooter className="flex-col gap-2 mt-auto">
        <CreateModal
          title="Create New Event"
          description="Your new Event will be selectable for filtering and adding feedback."
          triggerText="Create New Event"
        >
          <CreateEventForm />
        </CreateModal>
        <CreateModal
          title="Create a new User."
          description="Your new User will be selectable for adding feedback."
          triggerText="Create New User"
        >
          <CreateOrSwitchUserForm />
        </CreateModal>
        <CreateModal
          title="Add New Feedback"
          description="Your feedback will be published to the live feedback stream"
          triggerText="Add Feedback"
        >
          <CreateFeedbackForm />
        </CreateModal>
      </CardFooter>
    </Card>
  );
}
