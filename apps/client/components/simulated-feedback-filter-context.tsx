"use client";
import { createContext, useContext, useMemo, useState } from "react";

type StreamStatusContext = {
  isStreamingFeedback: boolean;
  setIsStreamingFeedback: (v: boolean) => void;
};

const StreamStatusContext = createContext<StreamStatusContext | undefined>(
  undefined
);

export function StreamStatusProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isStreamingFeedback, setIsStreamingFeedback] = useState(false);

  const value = useMemo(
    () => ({ isStreamingFeedback, setIsStreamingFeedback }),
    [isStreamingFeedback]
  );

  return (
    <StreamStatusContext.Provider value={value}>
      {children}
    </StreamStatusContext.Provider>
  );
}

export function useStreamStatus() {
  const streamContext = useContext(StreamStatusContext);
  if (!streamContext)
    throw new Error(
      "useStreamStatus must be used within <StreamStatusProvider>"
    );
  return streamContext;
}
