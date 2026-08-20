import { KycQueueList } from "@/components/admin/KycQueueList";

export default function AdminKycPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">KYC review</h1>
      <KycQueueList />
    </div>
  );
}
