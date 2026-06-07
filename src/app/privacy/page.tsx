export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <h1>Privacy Policy</h1>
      <p>Last updated: {new Date().toLocaleDateString()}</p>
      <p>
        We collect account information (email, name), purchase history, and
        workflow metadata necessary to operate the marketplace.
      </p>
      <p>
        Payment data is processed by Stripe and not stored on our servers.
        Workflow files are stored securely and only accessible to verified
        purchasers.
      </p>
      <p>
        Contact: privacy@n8nify.io for data requests or deletion.
      </p>
    </div>
  );
}
