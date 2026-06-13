import { redirect } from "next/navigation";
import { SellerSubnav } from "@/components/seller-subnav";
import { getSession } from "@/lib/auth-server";
import { getUserById } from "@/lib/queries/users";

export default async function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getUserById(session.user.id);
  if (!data) redirect("/login");
  if (data.user.banned) redirect("/banned");

  const showSubnav = data.creatorProfile != null;

  return (
    <div>
      {showSubnav && <SellerSubnav />}
      <div className={showSubnav ? "mt-8" : undefined}>{children}</div>
    </div>
  );
}
