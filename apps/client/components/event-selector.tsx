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
  placeholder?: string;
};

export default function EventSelector({
  value,
  onChange,
  placeholder,
}: EventSelectorProps) {
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState<Event[] | null>(null);
  const { data: eventData } = useQuery(EVENTS);

  useEffect(() => {
    if (eventData?.events) setEvents(eventData.events);
  }, [eventData]);

  const selected = value && events ? events.find((e) => e.id === value) : null;

  return (
    <div>
      <Button type="button" variant="outline" onClick={() => setOpen(true)}>
        {selected?.name ?? placeholder ?? "Filter by Event..."} <ChevronDown />
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            {events?.map((event: Event) => (
              <CommandItem
                key={event.id}
                value={`${event.name} ${event.description ?? ""}`}
                onSelect={() => {
                  onChange(event.id);
                  setOpen(false);
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
