import type { N8nNode, N8nWorkflow } from "./types";

const SENSITIVE_PARAM_KEYS = [
  "apiKey",
  "apikey",
  "password",
  "secret",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "auth",
];

const SECRET_PATTERNS = [
  /sk-[a-zA-Z0-9]{20,}/,
  /Bearer\s+[a-zA-Z0-9._-]+/i,
  /xox[baprs]-[a-zA-Z0-9-]+/,
];

function stripSensitiveFromParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_PARAM_KEYS.some((k) => lowerKey.includes(k.toLowerCase()))) {
      cleaned[key] = "";
      continue;
    }
    if (typeof value === "string" && SECRET_PATTERNS.some((p) => p.test(value))) {
      cleaned[key] = "";
      continue;
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      cleaned[key] = stripSensitiveFromParams(value as Record<string, unknown>);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

function sanitizeNode(node: N8nNode): N8nNode {
  const sanitized: N8nNode = { ...node };
  if (sanitized.credentials) {
    const creds: Record<string, { id: string; name: string }> = {};
    for (const [type, ref] of Object.entries(sanitized.credentials)) {
      if (typeof ref === "string") {
        creds[type] = { id: "", name: "REDACTED" };
      } else {
        creds[type] = { id: "", name: "REDACTED" };
      }
    }
    sanitized.credentials = creds;
  }
  if (sanitized.parameters) {
    sanitized.parameters = stripSensitiveFromParams(sanitized.parameters);
  }
  return sanitized;
}

export type SanitizeResult = {
  workflow: N8nWorkflow;
  hadSecrets: boolean;
  warnings: string[];
};

export function sanitizeWorkflow(raw: N8nWorkflow): SanitizeResult {
  const warnings: string[] = [];
  let hadSecrets = false;

  const rawStr = JSON.stringify(raw);
  if (SECRET_PATTERNS.some((p) => p.test(rawStr))) {
    hadSecrets = true;
    warnings.push("Potential API keys or tokens were detected and removed.");
  }

  const workflow: N8nWorkflow = {
    ...raw,
    nodes: (raw.nodes ?? []).map(sanitizeNode),
  };

  return { workflow, hadSecrets, warnings };
}

export function validateWorkflow(raw: unknown): N8nWorkflow {
  if (!raw || typeof raw !== "object") {
    throw new Error("Invalid workflow: must be a JSON object");
  }
  const wf = raw as N8nWorkflow;
  if (!Array.isArray(wf.nodes) || wf.nodes.length === 0) {
    throw new Error("Invalid workflow: nodes array is required");
  }
  if (!wf.connections || typeof wf.connections !== "object") {
    throw new Error("Invalid workflow: connections object is required");
  }
  return wf;
}
