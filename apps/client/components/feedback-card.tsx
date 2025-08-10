import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Feedback } from "@/app/lib/__generated__/graphql";
import { Badge } from "./ui/badge";

interface feedbackCardProps {
  feedback: Feedback;
}

export default function FeedbackCard({ feedback }: feedbackCardProps) {
  return (
    <Card className="w-full object-center justify-self-center max-w-6xl gap-4">
      <CardHeader>
        <CardTitle>
          <span>{feedback?.event?.name}</span>
          <Badge className="ml-2" variant="outline">
            5
          </Badge>
        </CardTitle>
        <CardDescription>{feedback?.event.description}</CardDescription>
        <CardAction>
          <Button variant="link">Sign Up</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 pl-6 italic mb-4">
          {feedback.text}
        </blockquote>
        <div className="flex flex-col flex-1">
          <div className="flex items-center ml-4">
            <Avatar>
              <AvatarImage />
              <AvatarFallback>{feedback.user.id}</AvatarFallback>
            </Avatar>
            <span className="font-medium">{feedback?.user?.name}</span>
            <span className="text-sm ml-1">({feedback?.user?.email})</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {feedback?.createdAt}
            </span>
          </div>
        </div>
      </CardContent>
      {/* <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Login
        </Button>
        <Button variant="outline" className="w-full">
          Login with Google
        </Button>
      </CardFooter> */}
    </Card>
  );
}
