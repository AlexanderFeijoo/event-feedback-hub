"use client";
import { createContext, useContext, useMemo, useState } from "react";
import type { Event } from "@/app/lib/__generated__/graphql";

type eventContext = {
  selectedEventId: Event["id"] | null;
  setSelectedEventId: (id: Event["id"] | null) => void;
};

const EventFilterContext = createContext<eventContext | null>(null);

export function EventFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedEventId, setSelectedEventId] = useState<Event["id"] | null>(
    null
  );
  const value = useMemo(
    () => ({ selectedEventId, setSelectedEventId }),
    [selectedEventId]
  );
  return (
    <EventFilterContext.Provider value={value}>
      {children}
    </EventFilterContext.Provider>
  );
}

export function useEventFilter() {
  const eventContext = useContext(EventFilterContext);
  if (!eventContext) throw new Error("Calling outside provider");
  return eventContext;
}
