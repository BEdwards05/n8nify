import { APIError } from "better-auth/api";
import { auth } from "./auth";

type MfaCodeType = "totp" | "backup";

export async function verifyMfaStepUp(
  headers: Headers,
  code: string,
  codeType: MfaCodeType,
) {
  try {
    if (codeType === "totp") {
      await auth.api.verifyTOTP({
        body: { code },
        headers,
      });
      return;
    }

    await auth.api.verifyBackupCode({
      body: { code, disableSession: true },
      headers,
    });
  } catch (error) {
    if (error instanceof APIError) {
      throw new Error(error.message || "Invalid verification code");
    }
    throw error;
  }
}
