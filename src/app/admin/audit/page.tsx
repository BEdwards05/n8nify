import { AuditLogTable } from "@/components/audit-log-table";
import { AUDIT_ACTION_LABELS } from "@/lib/audit";
import {
  getAuditActions,
  getAuditActors,
  getAuditLogs,
} from "@/lib/queries/audit";

type Props = {
  searchParams: Promise<{
    q?: string;
    actorId?: string;
    action?: string;
    page?: string;
  }>;
};

export const metadata = { title: "Audit log" };

export default async function AdminAuditPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { items, total, limit } = await getAuditLogs({
    q: params.q,
    actorId: params.actorId,
    action: params.action,
    page,
  });
  const [actors, actions] = await Promise.all([
    getAuditActors(),
    getAuditActions(),
  ]);
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <header className="mb-10">
        <p className="section-label mb-2">Admin</p>
        <h1 className="font-display text-3xl font-bold">Audit log</h1>
        <p className="mt-1 text-muted">
          {total} event{total === 1 ? "" : "s"} · account and moderation
          activity
        </p>
      </header>

      <form className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search summary, user, target…"
          className="input sm:col-span-2"
        />
        <select
          name="actorId"
          defaultValue={params.actorId ?? ""}
          className="input"
        >
          <option value="">All users</option>
          {actors.map((actor) => (
            <option key={actor.id} value={actor.id}>
              {actor.name}
            </option>
          ))}
        </select>
        <select
          name="action"
          defaultValue={params.action ?? "all"}
          className="input"
        >
          <option value="all">All actions</option>
          {actions.map((action) => (
            <option key={action} value={action}>
              {AUDIT_ACTION_LABELS[action] ?? action}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary sm:col-span-2 lg:col-span-1">
          Filter
        </button>
      </form>

      <AuditLogTable
        items={items.map(({ entry, actor }) => ({
          id: entry.id,
          action: entry.action,
          targetType: entry.targetType,
          targetId: entry.targetId,
          summary: entry.summary,
          createdAt: entry.createdAt.toISOString(),
          actor,
        }))}
      />

      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/audit?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm ${
                p === page
                  ? "bg-accent text-white"
                  : "text-muted hover:bg-surface-hover"
              }`}
            >
              {p}
            </a>
          ))}
        </nav>
      )}
    </>
  );
}
