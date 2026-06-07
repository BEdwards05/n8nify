export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="page-shell max-w-2xl py-16">
      <p className="section-label mb-3">Legal</p>
      <h1 className="font-display text-3xl font-bold">Terms of Service</h1>
      <div className="mt-8 space-y-6 text-muted leading-relaxed">
        <p>
          n8nify.io is a marketplace for downloadable n8n workflow templates.
          Creators retain ownership. Buyers receive a license to use purchased
          templates in their own n8n instances.
        </p>
        <div>
          <h2 className="mb-2 font-medium text-foreground">Creators</h2>
          <ul className="list-inside list-disc space-y-1">
            <li>Only upload workflows you have the right to sell</li>
            <li>Remove all credentials before upload</li>
            <li>Provide accurate descriptions</li>
          </ul>
        </div>
        <div>
          <h2 className="mb-2 font-medium text-foreground">Payments</h2>
          <p>
            Transactions are processed by Stripe. n8nify collects a platform fee
            on each sale.
          </p>
        </div>
      </div>
    </div>
  );
}
