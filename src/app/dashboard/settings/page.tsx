import Link from "next/link";
import { redirect } from "next/navigation";
import { AccountSettingsForm } from "@/components/account-settings-form";
import { CreatorProfileSettingsForm } from "@/components/creator-profile-settings-form";
import { SettingsPanel } from "@/components/settings-panel";
import { getSession } from "@/lib/auth-server";
import { getUserById } from "@/lib/queries/users";

export const metadata = { title: "Profile settings" };

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getUserById(session.user.id);
  if (!data) redirect("/login");

  return (
    <div className="space-y-6">
      <AccountSettingsForm
        initialName={data.user.name}
        email={data.user.email}
      />

      {data.creatorProfile ? (
        <CreatorProfileSettingsForm
          displayName={data.creatorProfile.displayName}
          username={data.creatorProfile.username}
          bio={data.creatorProfile.bio ?? ""}
        />
      ) : (
        <SettingsPanel
          title="Sell on n8nify"
          description="Create a creator profile to list and sell workflow templates."
        >
          <Link href="/dashboard/seller/onboard" className="btn btn-ghost">
            Set up creator profile
          </Link>
        </SettingsPanel>
      )}
    </div>
  );
}
