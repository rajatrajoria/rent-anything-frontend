import type { UserProfileResponse } from "@rent-anything/types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ProfileSummary({ user }: { user: UserProfileResponse }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Your account details.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span>{user.email}</span>
        </div>
        {user.name && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Name</span>
            <span>{user.name}</span>
          </div>
        )}
        {user.mobileNumber && (
          <div className="flex justify-between">
            <span className="text-muted-foreground">Mobile</span>
            <span>{user.mobileNumber}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email verified</span>
          <Badge variant={user.isVerified ? "confirmed" : "secondary"}>{user.isVerified ? "Yes" : "No"}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Trust status</span>
          <Badge variant={user.trustStatus === "TRUSTED" ? "confirmed" : "secondary"}>{user.trustStatus}</Badge>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Member since</span>
          <span>{new Date(user.createdAt).toLocaleDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
}
