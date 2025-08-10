"use client";
import DisplayFeedback from "@/components/display-feedbacks";
import SimulatedFeedbackControlPanel from "@/components/feedback-control-panel";
import EventHubControlPanel from "@/components/event-hub-control-panel";
import { FeedbackTable } from "@/components/feedback-table";
import { EventFilterProvider } from "@/components/event-filter-context";

export default function MainLayout() {
  return (
    <EventFilterProvider>
      <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 pt-0 min-h-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-2 mt-5">
          <div className="bg-muted/50 min-w-50 rounded-xl">
            <EventHubControlPanel />
          </div>
          <div className="bg-muted/50 min-w-50 rounded-xl">
            <SimulatedFeedbackControlPanel />
          </div>
        </div>
        <div className="bg-muted/50 rounded-xl flex-1 flex min-h-0 overflow-hidden">
          {/* <DisplayFeedback /> */}
          <FeedbackTable />
        </div>
      </div>
    </EventFilterProvider>
  );
}
