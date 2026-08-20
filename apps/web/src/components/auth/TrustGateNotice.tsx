import { ShieldCheck } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface TrustGateNoticeProps {
  action?: string;
}

/**
 * Shown when a mutating call fails with 403 USR_005 (trust gate). The
 * backend doesn't expose trustStatus on GET /users/me, so this is reactive
 * — surfaced only once the server actually rejects an action — rather than
 * a persistent dashboard banner.
 */
export function TrustGateNotice({ action = "do this" }: TrustGateNoticeProps) {
  return (
    <Alert variant="review">
      <ShieldCheck />
      <AlertTitle>Your account is pending review</AlertTitle>
      <AlertDescription>
        New accounts are reviewed before they can {action}. This is usually quick — check back soon,
        or reach out if it&apos;s been a while.
      </AlertDescription>
    </Alert>
  );
}
