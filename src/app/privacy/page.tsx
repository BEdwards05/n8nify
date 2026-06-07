export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="page-shell max-w-2xl py-16">
      <p className="section-label mb-3">Legal</p>
      <h1 className="font-display text-3xl font-bold">Privacy Policy</h1>
      <div className="mt-8 space-y-4 text-muted leading-relaxed">
        <p>
          We collect account information, purchase history, and workflow metadata
          necessary to operate the marketplace.
        </p>
        <p>
          Payment data is processed by Stripe. Workflow files are stored securely
          and only accessible to verified purchasers.
        </p>
        <p>Contact: privacy@n8nify.io</p>
      </div>
    </div>
  );
}
