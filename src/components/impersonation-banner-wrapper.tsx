import { ImpersonationBanner } from "@/components/impersonation-banner";
import { getImpersonationState } from "@/lib/impersonation";

export async function ImpersonationBannerWrapper() {
  const state = await getImpersonationState();
  if (!state) return null;

  return (
    <ImpersonationBanner
      viewingAsId={state.viewingAs.id}
      viewingAsName={state.viewingAs.name}
      viewingAsEmail={state.viewingAs.email}
      adminName={state.admin?.name}
    />
  );
}
