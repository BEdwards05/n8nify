import { Subnav } from "@/components/subnav";

const items = [
  { href: "/dashboard/seller", label: "Listings", exact: true },
  { href: "/dashboard/seller/new", label: "New listing" },
];

export function SellerSubnav() {
  return <Subnav items={items} />;
}
