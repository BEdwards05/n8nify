import { AUDIT_ACTION_LABELS } from "@/lib/audit";

type Entry = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: string;
  actor: {
    id: string;
    name: string;
    email: string;
  };
};

export function AuditLogTable({ items }: { items: Entry[] }) {
  if (items.length === 0) {
    return <p className="text-muted">No audit events found.</p>;
  }

  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((item) => (
        <article key={item.id} className="py-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-medium leading-snug">{item.summary}</p>
              <p className="mt-1 text-sm text-muted">
                {item.actor.name}{" "}
                <span className="text-muted-dim">({item.actor.email})</span>
              </p>
            </div>
            <div className="shrink-0 text-right text-sm">
              <p className="text-muted-dim">
                {new Date(item.createdAt).toLocaleString()}
              </p>
              <p className="mt-1 text-xs text-muted">
                {AUDIT_ACTION_LABELS[item.action] ?? item.action}
              </p>
            </div>
          </div>
          <p className="mt-2 text-xs text-muted-dim">
            {item.targetType} · {item.targetId}
          </p>
        </article>
      ))}
    </div>
  );
}
