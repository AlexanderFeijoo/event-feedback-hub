import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { gql, useApolloClient, useMutation } from "@apollo/client";
import { useModalControls } from "./modal";
import FeedbackRating from "./feedback-rating-select";
import EventSelector from "./event-selector";
import UserSelector from "./user-selector";
import { useUserFilter } from "@/components/user-filter-context";
import { useEventFilter } from "@/components/event-filter-context";

const CREATE_FEEDBACK = gql`
  mutation CreateFeedback(
    $eventId: ID!
    $userId: ID!
    $text: String!
    $rating: Int!
  ) {
    createFeedback(
      eventId: $eventId
      userId: $userId
      text: $text
      rating: $rating
    ) {
      text
      rating
      id
    }
  }
`;

const formSchema = z.object({
  text: z.string().nonempty({
    message: "Feedback is a required field.",
  }),
  rating: z
    .number({ message: "Please select a rating." })
    .int()
    .min(1, "Please select a rating.")
    .max(5, "Max rating is 5."),
  event: z.string({
    message: "You must select an event",
  }),
  user: z.string({ message: "You must select a user to leave feedback." }),
});

export default function CreateFeedbackForm() {
  const { selectedUserId, setSelectedUserId } = useUserFilter();
  const { selectedEventId, setSelectedEventId } = useEventFilter();
  const client = useApolloClient();
  const [createFeedback] = useMutation(CREATE_FEEDBACK, {
    refetchQueries: ["Feedbacks"],
    awaitRefetchQueries: true,
  });
  const { close } = useModalControls();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await createFeedback({
        variables: {
          text: values.text,
          rating: values.rating,
          eventId: values.event,
          userId: values.user,
        },
      });
      if (selectedEventId != values.event) setSelectedEventId(values.event);
      if (selectedUserId != values.user) setSelectedUserId(values.user);
      await client.refetchQueries({ include: ["FEEDBACKS"] });
      close();
    } catch (error) {
      console.error("error creating feedback", error);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      event: selectedEventId ?? "",
      user: selectedUserId ?? "",
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          key="feedback-form-event"
          control={form.control}
          name="event"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event</FormLabel>
              <FormControl>
                <EventSelector
                  placeholder="Select Event to Add Feedback."
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              </FormControl>
              {/* <FormDescription>Select an event to add feedback</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          key="feedback-form-user"
          control={form.control}
          name="user"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User</FormLabel>
              <FormControl>
                <UserSelector
                  value={field.value || null}
                  onChange={(value) => field.onChange(value ?? "")}
                />
              </FormControl>
              {/* <FormDescription>
                Select a User to attach feedback.
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          key="feedback-form-feedback"
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
                  placeholder="Describe your thoughts and feelings about this event."
                  {...field}
                />
              </FormControl>
              {/* <FormDescription>
                
              </FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          key="feedback-form-rating"
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              {/* <FormLabel>Your Feedback</FormLabel> */}
              <FormControl>
                <FeedbackRating
                  value={field.value ?? 0}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                How would you rate this event on a scale of 1-5 stars?
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Add Feedback</Button>
      </form>
    </Form>
  );
}
