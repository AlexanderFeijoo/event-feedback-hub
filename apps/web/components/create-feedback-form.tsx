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
import { gql, useMutation } from "@apollo/client";
import { useModalControls } from "./modal";
import FeedbackRating from "./feedback-rating-select";
import EventSelector from "./event-selector";

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
    .number({
      message: "Feedback rating is required",
    })
    .nullable(),
  event: z.string({
    message: "You must select an event",
  }),
});

export default function CreateFeedbackForm() {
  const [createFeedback, createFeedbackState] = useMutation(CREATE_FEEDBACK);
  const { close } = useModalControls();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log(values);
      const feedback = await createFeedback({
        variables: {
          text: values.text,
          rating: values.rating,
          eventId: values.event,
          userId: "abc123",
        },
      });

      close();
      console.log(feedback);
    } catch (error) {
      console.error("error creating feedback", error);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      text: "",
      rating: 5,
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
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <EventSelector
                  value={field.value ?? null}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Describe your thoughts and feelings about this event.
              </FormDescription>
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
                  placeholder="Type your message here."
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe your thoughts and feelings about this event.
              </FormDescription>
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
              <FormLabel>Your Feedback</FormLabel>
              <FormControl>
                <FeedbackRating
                  value={field.value ?? 0}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormDescription>
                Describe your thoughts and feelings about this event.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
