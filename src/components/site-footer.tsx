import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-line">
      <div className="page-shell flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div>
          <BrandLogo />
          <p className="mt-3 max-w-xs text-sm text-muted">
            The marketplace for production-ready n8n workflow templates.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted">
          <Link href="/workflows" className="hover:text-foreground">
            Browse
          </Link>
          <Link href="/register" className="hover:text-foreground">
            Sell
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <Link href="/content-policy" className="hover:text-foreground">
            Content
          </Link>
        </div>
      </div>
      <div className="border-t border-line py-5">
        <p className="page-shell text-xs text-muted-dim">
          © {new Date().getFullYear()} n8nify.io
        </p>
      </div>
    </footer>
  );
}
