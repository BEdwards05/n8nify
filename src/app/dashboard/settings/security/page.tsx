import { redirect } from "next/navigation";
import { TwoFactorSettings } from "@/components/two-factor-settings";
import { getSession, getUserRole } from "@/lib/auth-server";
import { ROLE_LABELS, roleRequiresMfa } from "@/lib/permissions";

type Props = {
  searchParams: Promise<{ required?: string }>;
};

export const metadata = { title: "Security settings" };

export default async function SecuritySettingsPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session) redirect("/login");

  const params = await searchParams;
  const role = getUserRole(session.user);
  const mfaRequired = roleRequiresMfa(role);
  const twoFactorEnabled = Boolean(
    (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled,
  );

  return (
    <div className="space-y-6">
      {params.required === "1" && mfaRequired && !twoFactorEnabled && (
        <div className="rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4">
          <p className="font-medium text-accent">Two-factor required</p>
          <p className="mt-1 text-sm text-muted">
            {ROLE_LABELS[role]} accounts must enable two-factor authentication
            before accessing the admin area.
          </p>
        </div>
      )}

      <TwoFactorSettings enabled={twoFactorEnabled} mfaRequired={mfaRequired} />
    </div>
  );
}
