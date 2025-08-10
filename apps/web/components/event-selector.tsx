import { Event } from "@/app/lib/__generated__/graphql";
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

const EVENTS = gql`
  query Events {
    events {
      id
      name
      description
    }
  }
`;
type EventSelectorProps = {
  value: Event["id"] | null;
  onChange: (id: Event["id"] | null) => void;
};

export default function EventSelector({ value, onChange }: EventSelectorProps) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<Event[] | null>(null);
  const { data: eventData } = useQuery(EVENTS);

  useEffect(() => {
    if (eventData?.events) setEvents(eventData.events);
  }, [eventData]);

  const selected = value && events ? events.find((e) => e.id === value) : null;

  // useEffect(() => {
  //   const down = (e: KeyboardEvent) => {
  //     if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
  //       e.preventDefault();
  //       setOpen((open) => !open);
  //     }
  //   };
  //   document.addEventListener("keydown", down);
  //   return () => document.removeEventListener("keydown", down);
  // }, []);

  return (
    <div>
      <Button variant="outline" onClick={() => setOpen(true)}>
        {selected?.name ?? "Select an Event to Filter..."} <ChevronDown />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {events?.map((event: Event) => (
              <CommandItem
                key={event.id}
                value={event.id}
                onSelect={(currentValue) => {
                  if (currentValue) {
                    onChange(currentValue);
                    setOpen(false);
                  }
                }}
              >
                {event.name}
                <Check
                  className={cn(
                    "ml-auto",
                    value === event.id ? "opacity-100" : "opacity-0"
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
