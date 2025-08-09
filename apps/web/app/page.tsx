"use client";
import DisplayFeedback from "@/components/display-feedbacks";
import ControlPanel from "@/components/stream-control-panel";

export default function MainLayout() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 pt-0 min-h-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-2 mt-5">
        <div className="bg-muted/50 min-w-50 rounded-xl"></div>
        <div className="bg-muted/50 min-w-50 rounded-xl">
          <ControlPanel />
        </div>
      </div>
      <div className="bg-muted/50 rounded-xl flex-1 flex min-h-0 overflow-hidden">
        <DisplayFeedback />
      </div>
    </div>
  );
}
