"use client";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";

type feedbackRatingProps = {
  value: number;
  onChange: (value: number) => void;
};

export default function FeedbackRating({
  value,
  onChange,
}: feedbackRatingProps) {
  return (
    <Rating onValueChange={onChange} value={value}>
      {Array.from({ length: 5 }).map((_, index) => (
        <RatingButton key={index} />
      ))}
    </Rating>
  );
}
