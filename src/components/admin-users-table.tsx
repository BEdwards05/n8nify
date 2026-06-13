"use client";

type UserRow = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
  };
  creator: { username: string } | null;
  purchaseCount: number;
  listingCount: number;
};

export function AdminUsersTable({ items }: { items: UserRow[] }) {
  async function updateUser(
    userId: string,
    patch: { role?: string; banned?: boolean },
  ) {
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    window.location.reload();
  }

  if (items.length === 0) {
    return <p className="text-muted">No users found.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-muted">
            <th className="pb-3 pr-4 font-medium">User</th>
            <th className="pb-3 pr-4 font-medium">Role</th>
            <th className="pb-3 pr-4 font-medium">Activity</th>
            <th className="pb-3 pr-4 font-medium">Status</th>
            <th className="pb-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {items.map(({ user, creator, purchaseCount, listingCount }) => (
            <tr key={user.id}>
              <td className="py-4 pr-4">
                <p className="font-medium">{user.name}</p>
                <p className="text-muted-dim">{user.email}</p>
                {creator && (
                  <p className="text-xs text-muted">@{creator.username}</p>
                )}
              </td>
              <td className="py-4 pr-4 capitalize">{user.role}</td>
              <td className="py-4 pr-4 text-muted">
                {purchaseCount} purchases · {listingCount} listings
                {user.twoFactorEnabled && (
                  <span className="mt-1 block text-xs text-accent">2FA on</span>
                )}
              </td>
              <td className="py-4 pr-4">
                {user.banned ? (
                  <span className="text-accent">Banned</span>
                ) : (
                  <span className="text-muted">Active</span>
                )}
              </td>
              <td className="py-4">
                <div className="flex flex-wrap gap-2">
                  <select
                    defaultValue={user.role}
                    onChange={(e) =>
                      updateUser(user.id, { role: e.target.value })
                    }
                    className="input w-auto py-1.5 text-xs"
                  >
                    <option value="buyer">Buyer</option>
                    <option value="creator">Creator</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      updateUser(user.id, { banned: !user.banned })
                    }
                    className="btn btn-ghost px-2 py-1 text-xs"
                  >
                    {user.banned ? "Unban" : "Ban"}
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
