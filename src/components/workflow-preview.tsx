import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

export function WorkflowPreview({ meta }: { meta: WorkflowPreviewMetadata }) {
  return (
    <div className="space-y-5 rounded-lg border border-border bg-surface p-6">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
          {meta.triggers[0] ?? "Manual"} trigger
        </span>
        <span className="rounded-full bg-background px-3 py-1 text-xs text-muted">
          {meta.nodeCount} nodes
        </span>
        <span className="rounded-full bg-background px-3 py-1 text-xs capitalize text-muted">
          {meta.complexity}
        </span>
      </div>

      {meta.integrations.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Integrations</h3>
          <div className="flex flex-wrap gap-2">
            {meta.integrations.map((integration) => (
              <span
                key={integration}
                className="rounded-md border border-border px-2.5 py-1 text-xs"
              >
                {integration}
              </span>
            ))}
          </div>
        </div>
      )}

      {meta.credentialTypes.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Required credentials</h3>
          <ul className="space-y-1 text-sm text-muted">
            {meta.credentialTypes.map((cred) => (
              <li key={cred}>• {cred}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
