"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AdminKycSummaryResponse } from "@rent-anything/types";
import { kycApi, ApiClientError, messageFor } from "@rent-anything/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/sonner";

export function KycQueueList() {
  const queryKey = ["admin", "kyc", "PENDING"];
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => kycApi.adminListKycSubmissions({ status: "PENDING" }),
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-48 w-full" />
        ))}
      </div>
    );
  }

  if (!data || data.submissions.length === 0) {
    return <p className="py-8 text-center text-muted-foreground">No pending KYC submissions.</p>;
  }

  return (
    <div className="space-y-4">
      {data.submissions.map((submission) => (
        <KycQueueItem key={submission.id} submission={submission} listQueryKey={queryKey} />
      ))}
    </div>
  );
}

function KycQueueItem({
  submission,
  listQueryKey,
}: {
  submission: AdminKycSummaryResponse;
  listQueryKey: unknown[];
}) {
  const queryClient = useQueryClient();
  const [showReject, setShowReject] = React.useState(false);
  const [reason, setReason] = React.useState("");

  const { data: detail, isLoading } = useQuery({
    queryKey: ["admin", "kyc", "detail", submission.id],
    queryFn: () => kycApi.adminGetKycSubmission(submission.id),
  });

  const approveMutation = useMutation({
    mutationFn: () => kycApi.adminApproveKyc(submission.id),
    onSuccess: () => {
      toast.success(`Approved ${submission.userEmail}.`);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't approve this submission."),
  });

  const rejectMutation = useMutation({
    mutationFn: () => kycApi.adminRejectKyc(submission.id, reason),
    onSuccess: () => {
      toast.success(`Rejected ${submission.userEmail}.`);
      queryClient.invalidateQueries({ queryKey: listQueryKey });
    },
    onError: (err) => toast.error(err instanceof ApiClientError ? messageFor(err) : "Couldn't reject this submission."),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{detail?.legalName ?? submission.legalName}</CardTitle>
        <CardDescription>
          {submission.userEmail} · submitted {new Date(submission.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading || !detail ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="aspect-video w-full" />
            <Skeleton className="aspect-video w-full" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Date of birth: </span>
                {detail.dateOfBirth}
              </div>
              <div>
                <span className="text-muted-foreground">Document: </span>
                {detail.idDocumentType}
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Address: </span>
                {detail.addressLine1}
                {detail.addressLine2 ? `, ${detail.addressLine2}` : ""}, {detail.city}, {detail.state}{" "}
                {detail.postalCode}, {detail.country}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.idDocumentImageUrl}
                alt="ID document"
                className="aspect-video w-full rounded-md border object-cover"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={detail.selfieImageUrl}
                alt="Selfie"
                className="aspect-video w-full rounded-md border object-cover"
              />
            </div>
          </>
        )}

        {showReject && (
          <div className="space-y-2">
            <Textarea
              placeholder="Reason for rejection (shown to the user)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        {showReject ? (
          <>
            <Button
              variant="destructive"
              size="sm"
              disabled={rejectMutation.isPending || !reason.trim()}
              onClick={() => rejectMutation.mutate()}
            >
              Confirm reject
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setShowReject(false)}>
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button size="sm" disabled={approveMutation.isPending} onClick={() => approveMutation.mutate()}>
              Approve
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowReject(true)}>
              Reject
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
