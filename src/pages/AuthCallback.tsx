import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  
  const code = searchParams.get("code");
  
  const callbackMutation = trpc.auth.googleCallback.useMutation({
    onSuccess: () => {
      utils.auth.me.invalidate();
      toast.success("Signed in with Google successfully!");
      navigate("/");
    },
    onError: (err) => {
      console.error("Auth error:", err);
      toast.error(err.message || "Authentication failed");
      navigate("/login");
    },
  });

  useEffect(() => {
    if (code) {
      callbackMutation.mutate({ code, origin: window.location.origin });
    } else {
      navigate("/login");
    }
  }, [code]);

  return (
    <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
      <Loader2 className="h-10 w-10 animate-spin text-gold-600" />
      <div className="text-center">
        <h2 className="text-xl font-semibold">Authenticating...</h2>
        <p className="text-muted-foreground text-sm">Please wait while we sign you in.</p>
      </div>
    </div>
  );
}
