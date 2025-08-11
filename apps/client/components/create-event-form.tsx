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
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { gql, useMutation } from "@apollo/client";
import { useModalControls } from "./modal";
import { useEventFilter } from "@/components/event-filter-context";
import { Checkbox } from "./ui/checkbox";

const CREATE_EVENT = gql`
  mutation CreateEvent($name: String!, $description: String!) {
    createEvent(name: $name, description: $description) {
      name
      description
      id
    }
  }
`;

const formSchema = z.object({
  eventName: z.string().nonempty({
    message: "Event Name is required",
  }),
  autoSelectEvent: z.boolean(),
  description: z.string().nonempty({
    message: "Event Description is required.",
  }),
});

export default function CreateEventForm() {
  const { setSelectedEventId } = useEventFilter();
  const [createEvent] = useMutation(CREATE_EVENT, {
    refetchQueries: ["Events"],
    awaitRefetchQueries: true,
  });
  const { close } = useModalControls();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await createEvent({
        variables: { name: values.eventName, description: values.description },
      });

      const id = data?.createEvent?.id;
      if (id && values.autoSelectEvent) {
        setSelectedEventId(id);
      }
      close();
    } catch (error) {
      console.error("error creating event", error);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      description: "",
      autoSelectEvent: true,
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="eventName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="Event Name..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="resize-none"
                  placeholder="A description of your event..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="autoSelectEvent"
          render={({ field }) => (
            <FormItem className="flex">
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Filter Feedback Stream with new Event?
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
