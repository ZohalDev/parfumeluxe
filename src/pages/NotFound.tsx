import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center animate-fade-in">
      <p className="text-8xl font-serif font-bold text-gold-500/20">404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        Page Not Found
      </h1>
      <p className="mt-3 text-muted-foreground max-w-sm">
        The fragrance you're looking for seems to have evaporated.
        Let us guide you back.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild className="rounded-full px-6">
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full px-6">
          <Link to="/products">Browse Shop</Link>
        </Button>
      </div>
    </div>
  );
}
