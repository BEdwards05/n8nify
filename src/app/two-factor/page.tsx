import { BrandLogo } from "@/components/brand-logo";
import { TwoFactorVerifyForm } from "@/components/two-factor-verify-form";

export const metadata = { title: "Two-factor verification" };

export default function TwoFactorPage() {
  return (
    <div className="page-shell flex min-h-[calc(100svh-12rem)] flex-col items-center justify-center py-16">
      <div className="mb-10 text-center">
        <BrandLogo className="inline-block" />
        <h1 className="mt-6 font-display text-2xl font-semibold">
          Verify it&apos;s you
        </h1>
        <p className="mt-2 text-sm text-muted">
          Enter a code from your authenticator app or a backup code.
        </p>
      </div>
      <TwoFactorVerifyForm />
    </div>
  );
}
