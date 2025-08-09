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
import { useState } from "react";
import { useModalControls } from "./create-modal";

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
  description: z.string().nonempty({
    message: "Event Description is required.",
  }),
});

export default function CreateEventForm() {
  const [createEvent, createEventState] = useMutation(CREATE_EVENT);
  const [messageColorClass, setMessageColorClass] = useState(
    "text-muted-foreground"
  );
  const { close } = useModalControls();

  // 2. Define a submit handler.
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const event = await createEvent({
        variables: { name: values.eventName, description: values.description },
      });
      console.log(values);
      close();
      console.log(event);
    } catch (error) {
      console.error("error creating event", error);
    }
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventName: "",
      description: "",
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
                <Input placeholder="shadcn" {...field} />
              </FormControl>
              <FormDescription>The display name for the Event.</FormDescription>
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
                  placeholder="Type your message here."
                  {...field}
                />
              </FormControl>
              <FormDescription>The display name for the Event.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
