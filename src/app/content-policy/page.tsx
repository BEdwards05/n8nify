export const metadata = { title: "Content Policy" };

export default function ContentPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 prose prose-neutral">
      <h1>Content Policy</h1>
      <p>All workflow listings must:</p>
      <ul>
        <li>Be functional n8n workflow JSON with valid nodes and connections</li>
        <li>Contain no embedded credentials, API keys, or secrets</li>
        <li>Not facilitate illegal activity, spam, or malware distribution</li>
        <li>Not infringe on third-party intellectual property</li>
      </ul>
      <p>
        Violations may result in listing removal and account suspension. Report
        issues to support@n8nify.io.
      </p>
    </div>
  );
}
