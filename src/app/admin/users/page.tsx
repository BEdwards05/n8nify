import { AdminCreateUserForm } from "@/components/admin-create-user-form";
import { AdminUsersTable } from "@/components/admin-users-table";
import { getSession } from "@/lib/auth-server";
import { getAdminUsers, getAdminUserStats } from "@/lib/queries/users";

type Props = {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
};

export const metadata = { title: "User management" };

export default async function AdminUsersPage({ searchParams }: Props) {
  const session = await getSession();
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const { items, total, limit } = await getAdminUsers({
    q: params.q,
    role: params.role,
    page,
  });
  const stats = await getAdminUserStats();
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="section-label mb-2">Admin</p>
          <h1 className="font-display text-3xl font-bold">Users</h1>
          <p className="mt-1 text-muted">
            {stats.total} users · {stats.creators} creators · {stats.moderators}{" "}
            moderators · {stats.banned} banned
          </p>
        </div>
        <AdminCreateUserForm />
      </header>

      <form className="mb-8 flex flex-col gap-3 sm:flex-row">
        <input
          name="q"
          defaultValue={params.q}
          placeholder="Search name or email…"
          className="input flex-1"
        />
        <select
          name="role"
          defaultValue={params.role ?? "all"}
          className="input w-full sm:w-40"
        >
          <option value="all">All roles</option>
          <option value="buyer">Buyers</option>
          <option value="creator">Creators</option>
          <option value="moderator">Moderators</option>
          <option value="admin">Admins</option>
        </select>
        <button type="submit" className="btn btn-primary shrink-0">
          Filter
        </button>
      </form>

      <AdminUsersTable
        currentUserId={session?.user.id}
        items={items.map((row) => ({
          ...row,
          user: {
            ...row.user,
            createdAt: row.user.createdAt.toISOString(),
          },
        }))}
      />

      {totalPages > 1 && (
        <nav className="mt-8 flex justify-center gap-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <a
              key={p}
              href={`/admin/users?${new URLSearchParams({ ...params, page: String(p) }).toString()}`}
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
