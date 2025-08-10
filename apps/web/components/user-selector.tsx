import { Event, User } from "@/app/lib/__generated__/graphql";
import { cn } from "@/app/lib/utils";

import { Check, ChevronDown } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { gql, useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";

const USERS = gql`
  query Users {
    users {
      id
      email
      name
    }
  }
`;
type UserSelectorProps = {
  value: Event["id"] | null;
  onChange: (id: Event["id"] | null) => void;
};

export default function UserSelector({ value, onChange }: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [users, setUsers] = useState<User[] | null>(null);
  const { data: userData } = useQuery(USERS);

  useEffect(() => {
    if (userData?.users) setUsers(userData.users);
  }, [userData]);

  const selected = value && users ? users.find((e) => e.id === value) : null;

  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {selected?.name ?? "Select which User is adding Feedback"}{" "}
        <ChevronDown />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {users?.map((user: User) => (
              <CommandItem
                key={user.id}
                value={`${user.name} ${user.email ?? ""}`}
                onSelect={() => {
                  onChange(user.id);
                  setOpen(false);
                }}
              >
                {`${user.name} (${user.email})`}
                <Check
                  className={cn(
                    "ml-auto",
                    value === user.id ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
}
