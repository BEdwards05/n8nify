import type { ReactNode } from "react";

type Props = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export function SettingsField({ label, hint, children }: Props) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm text-muted">{label}</label>
      {children}
      {hint && <p className="text-xs text-muted-dim">{hint}</p>}
    </div>
  );
}
