import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] w-full flex items-center justify-center">
      <Card className="w-full max-w-md glass-panel border-destructive/20 mx-4">
        <CardContent className="pt-10 pb-8 px-6 text-center">
          <div className="flex justify-center mb-6 text-destructive/80">
            <AlertCircle className="h-16 w-16" />
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-3">404 NODE NOT FOUND</h1>
          <p className="text-sm text-muted-foreground mb-8">
            The agentic sector or architectural endpoint you are looking for does not exist in the current mesh configuration.
          </p>
          <Link href="/">
            <span className="px-6 py-3 rounded-xl font-bold bg-white text-black hover:bg-white/90 transition-colors inline-block cursor-pointer tracking-wider text-sm">
              RETURN TO COMMAND CENTER
            </span>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
