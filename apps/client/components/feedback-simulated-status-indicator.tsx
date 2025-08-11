"use client";
import {
  Status,
  StatusIndicator,
  StatusLabel,
} from "@/components/ui/shadcn-io/status";
import { useStreamStatus } from "./simulated-feedback-filter-context";

export default function SimulatedStatusIndicator() {
  const { isStreamingFeedback } = useStreamStatus();
  return (
    <Status
      status={isStreamingFeedback ? "online" : "offline"}
      className="gap-4 rounded-full px-6 py-2 text-sm "
      // status="online"
      variant="outline"
    >
      <StatusIndicator />
      <StatusLabel className="font-mono">
        {`Simulated Feedback Stream ${isStreamingFeedback ? "Online" : "Offline"}`}
      </StatusLabel>
    </Status>
  );
}
