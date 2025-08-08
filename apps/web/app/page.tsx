"use client";
import DisplayFeedback from "@/components/display-feedbacks";

export default function MainLayout() {
  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col gap-4 p-4 pt-0 min-h-0">
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 rounded-xl flex-1 flex min-h-0 overflow-hidden">
        <DisplayFeedback />
      </div>
    </div>
  );
}
