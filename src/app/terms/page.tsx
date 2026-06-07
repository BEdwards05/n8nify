export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <h1>Terms of Service</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        n8nify.io is a marketplace for downloadable n8n workflow templates.
        Creators retain ownership of their workflows. Buyers receive a license
        to use purchased templates in their own n8n instances.
      </p>
      <h2>Creator responsibilities</h2>
      <ul>
        <li>Only upload workflows you have the right to sell</li>
        <li>Remove all credentials and secrets before upload</li>
        <li>Provide accurate descriptions of workflow behavior</li>
      </ul>
      <h2>Buyer responsibilities</h2>
      <ul>
        <li>Configure your own credentials after import</li>
        <li>Comply with n8n&apos;s license terms for your use case</li>
      </ul>
      <h2>Payments</h2>
      <p>
        Paid transactions are processed by Stripe. n8nify collects a platform
        fee on each sale. Refunds are handled case-by-case via support.
      </p>
    </div>
  );
}
