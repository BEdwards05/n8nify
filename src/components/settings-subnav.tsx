import { Subnav } from "@/components/subnav";

const items = [
  { href: "/dashboard/settings", label: "Profile", exact: true },
  { href: "/dashboard/settings/security", label: "Security" },
];

export function SettingsSubnav() {
  return <Subnav items={items} />;
}
