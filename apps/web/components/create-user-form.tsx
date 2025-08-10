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
import { useModalControls } from "./modal";
import { useUserFilter } from "@/components/user-filter-context";
import { Checkbox } from "./ui/checkbox";

const CREATE_USER = gql`
  mutation CreateUser($email: String!, $name: String!) {
    createUser(email: $email, name: $name) {
      id
      name
      email
    }
  }
`;

const formSchema = z.object({
  userName: z.string().nonempty({
    message: "User's Name is required",
  }),
  autoSelectUser: z.boolean(),
  email: z.email().nonempty({
    message: "Please provide a valid email.",
  }),
});

export default function CreateOrSwitchUserForm() {
  const { setSelectedUserId } = useUserFilter();
  const [createUser] = useMutation(CREATE_USER, {
    refetchQueries: ["Users"],
    awaitRefetchQueries: true,
    onCompleted: ({ createUser }) => {
      if (createUser?.id && form.getValues("autoSelectUser")) {
        setSelectedUserId(createUser.id);
      }
      close();
    },
  });
  const { close } = useModalControls();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const { data } = await createUser({
        variables: { name: values.userName, email: values.email },
      });

      const id = data?.createdUser?.id;
      if (id && values.autoSelectUser) {
        setSelectedUserId(id);
      }
    } catch (error) {
      console.error("error creating event", error);
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userName: "",
      email: "",
      autoSelectUser: true,
    },
  });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="userName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User's Name</FormLabel>
              <FormControl>
                <Input placeholder="User's Name..." {...field} />
              </FormControl>
              {/* <FormDescription>The display name for the Event.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Email" {...field} />
              </FormControl>
              {/* <FormDescription>The display name for the Event.</FormDescription> */}
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="autoSelectUser"
          render={({ field }) => (
            <FormItem className="flex">
              {/* <FormLabel>Auto-Filter Feedback stream by new Event?</FormLabel> */}
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                  ref={field.ref}
                />
              </FormControl>
              <FormDescription>
                Automatically Select New User for Adding Feedback?
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
