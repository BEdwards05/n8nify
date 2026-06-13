import { BannedSignOut } from "@/components/banned-sign-out";

export const metadata = { title: "Account suspended" };

export default function BannedPage() {
  return (
    <div className="page-shell flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <p className="section-label mb-3">Account</p>
      <h1 className="font-display text-3xl font-bold">Account suspended</h1>
      <p className="mt-4 max-w-md text-muted">
        Your account has been suspended. Contact support@n8nify.io if you believe
        this is a mistake.
      </p>
      <BannedSignOut />
    </div>
  );
}
