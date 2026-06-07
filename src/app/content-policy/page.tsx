export const metadata = { title: "Content Policy" };

export default function ContentPolicyPage() {
  return (
    <div className="page-shell max-w-2xl py-16">
      <p className="section-label mb-3">Legal</p>
      <h1 className="font-display text-3xl font-bold">Content Policy</h1>
      <ul className="mt-8 list-inside list-disc space-y-2 text-muted leading-relaxed">
        <li>Valid n8n workflow JSON with nodes and connections</li>
        <li>No embedded credentials or API keys</li>
        <li>No illegal activity, spam, or malware</li>
        <li>No third-party IP infringement</li>
      </ul>
      <p className="mt-6 text-muted">Report issues to support@n8nify.io</p>
    </div>
  );
}
