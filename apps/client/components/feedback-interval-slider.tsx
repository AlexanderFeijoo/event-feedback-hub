import { cn } from "@/app/lib/utils";
import { Slider } from "@/components/ui/slider";
type SliderProps = React.ComponentProps<typeof Slider>;

export function FeedbackInterval({ className, ...props }: SliderProps) {
  return (
    <Slider
      defaultValue={[3000]}
      max={10000}
      step={1}
      min={500}
      onValueChange={props.onValueChange}
      className={cn("w-[100%]", className)}
      {...props}
    />
  );
}
