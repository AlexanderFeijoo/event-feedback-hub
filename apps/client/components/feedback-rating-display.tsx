"use client";
import { Rating, RatingButton } from "@/components/ui/shadcn-io/rating";

type ratingDisplayProps = {
  rating: number;
};
export default function RatingDisplay({ rating }: ratingDisplayProps) {
  //   const [value, setValue] = useState(3);
  return (
    <Rating readOnly value={rating}>
      {Array.from({ length: 5 }).map((_, index) => (
        <RatingButton className="text-yellow-500" key={index} />
      ))}
    </Rating>
  );
}
