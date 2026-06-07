import type { WorkflowPreviewMetadata } from "@/lib/n8n/types";

export function WorkflowPreview({ meta }: { meta: WorkflowPreviewMetadata }) {
  return (
    <div className="space-y-8 border-t border-line pt-8">
      <div className="flex flex-wrap gap-2">
        <span className="chip text-accent border-accent/30 bg-accent/10">
          {meta.triggers[0] ?? "Manual"} trigger
        </span>
        <span className="chip">{meta.nodeCount} nodes</span>
        <span className="chip capitalize">{meta.complexity}</span>
      </div>

      {meta.integrations.length > 0 && (
        <div>
          <p className="section-label mb-3">Integrations</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            {meta.integrations.map((integration) => (
              <span key={integration} className="text-sm text-foreground">
                {integration}
              </span>
            ))}
          </div>
        </div>
      )}

      {meta.credentialTypes.length > 0 && (
        <div>
          <p className="section-label mb-3">Required credentials</p>
          <ul className="space-y-2">
            {meta.credentialTypes.map((cred) => (
              <li key={cred} className="flex items-center gap-2 text-sm text-muted">
                <span className="h-1 w-1 rounded-full bg-accent" />
                {cred}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
