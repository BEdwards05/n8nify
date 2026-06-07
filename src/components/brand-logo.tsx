import Link from "next/link";

type Props = {
  light?: boolean;
  className?: string;
};

export function BrandLogo({ light = false, className = "" }: Props) {
  return (
    <Link
      href="/"
      className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-foreground"} ${className}`}
    >
      n8n<span className="text-accent">ify</span>
    </Link>
  );
}
