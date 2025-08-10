"use client";
import { createContext, useContext, useMemo, useState } from "react";

type RatingContext = {
  minRating: number | null;
  setMinRating: (n: number | null) => void;
};

const context = createContext<RatingContext | null>(null);

export function RatingFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [minRating, setMinRating] = useState<number | null>(null);
  const value = useMemo(() => ({ minRating, setMinRating }), [minRating]);
  return <context.Provider value={value}>{children}</context.Provider>;
}

export function useRatingFilter() {
  const ratingContext = useContext(context);
  if (!ratingContext) throw new Error("Trying to use outside provider");
  return ratingContext;
}
