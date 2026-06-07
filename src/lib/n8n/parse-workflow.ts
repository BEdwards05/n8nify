import type { N8nNode, N8nWorkflow, WorkflowPreviewMetadata } from "./types";

const TRIGGER_PREFIXES = [
  "n8n-nodes-base.webhook",
  "n8n-nodes-base.scheduleTrigger",
  "n8n-nodes-base.manualTrigger",
  "n8n-nodes-base.cron",
  "n8n-nodes-base.emailReadImap",
  "n8n-nodes-base.formTrigger",
];

const INTEGRATION_LABELS: Record<string, string> = {
  "n8n-nodes-base.slack": "Slack",
  "n8n-nodes-base.gmail": "Gmail",
  "n8n-nodes-base.googleSheets": "Google Sheets",
  "n8n-nodes-base.httpRequest": "HTTP Request",
  "n8n-nodes-base.openAi": "OpenAI",
  "@n8n/n8n-nodes-langchain.openAi": "OpenAI",
  "n8n-nodes-base.notion": "Notion",
  "n8n-nodes-base.airtable": "Airtable",
  "n8n-nodes-base.hubspot": "HubSpot",
  "n8n-nodes-base.discord": "Discord",
  "n8n-nodes-base.telegram": "Telegram",
  "n8n-nodes-base.postgres": "PostgreSQL",
  "n8n-nodes-base.mysql": "MySQL",
  "n8n-nodes-base.shopify": "Shopify",
  "n8n-nodes-base.stripe": "Stripe",
  "n8n-nodes-base.github": "GitHub",
  "n8n-nodes-base.jira": "Jira",
  "n8n-nodes-base.trello": "Trello",
  "n8n-nodes-base.salesforce": "Salesforce",
  "n8n-nodes-base.webhook": "Webhook",
  "n8n-nodes-base.scheduleTrigger": "Schedule",
  "n8n-nodes-base.manualTrigger": "Manual",
};

function labelForNodeType(type: string): string {
  if (INTEGRATION_LABELS[type]) return INTEGRATION_LABELS[type];
  const base = type.split(".").pop() ?? type;
  return base
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

function isTrigger(node: N8nNode): boolean {
  const type = node.type ?? "";
  return TRIGGER_PREFIXES.some((p) => type.startsWith(p) || type.includes("Trigger"));
}

function triggerLabel(node: N8nNode): string {
  const type = node.type ?? "";
  if (type.includes("webhook")) return "Webhook";
  if (type.includes("schedule") || type.includes("cron")) return "Schedule";
  if (type.includes("manual")) return "Manual";
  if (type.includes("form")) return "Form";
  if (type.includes("email")) return "Email";
  return labelForNodeType(type);
}

function complexityFromNodeCount(count: number): WorkflowPreviewMetadata["complexity"] {
  if (count <= 5) return "simple";
  if (count <= 15) return "moderate";
  return "complex";
}

function credentialLabel(type: string): string {
  return type
    .replace(/OAuth2Api$/i, " OAuth")
    .replace(/Api$/i, " API")
    .replace(/([A-Z])/g, " $1")
    .trim();
}

export function parseWorkflow(workflow: N8nWorkflow): WorkflowPreviewMetadata {
  const nodes = workflow.nodes ?? [];
  const triggers = [...new Set(nodes.filter(isTrigger).map(triggerLabel))];
  const integrations = [
    ...new Set(
      nodes
        .map((n) => n.type ?? "")
        .filter((t) => t && !t.includes("stickyNote"))
        .map(labelForNodeType),
    ),
  ];
  const credentialTypes = [
    ...new Set(
      nodes.flatMap((n) =>
        n.credentials ? Object.keys(n.credentials) : [],
      ),
    ),
  ].map(credentialLabel);

  const setupChecklist = [
    ...credentialTypes.map((c) => `Configure ${c} credentials in n8n`),
    ...integrations
      .filter((i) => !triggers.includes(i))
      .slice(0, 5)
      .map((i) => `Verify ${i} node settings after import`),
    "Import workflow JSON via File or URL in n8n Editor",
    "Activate workflow after testing in n8n",
  ];

  return {
    workflowName: workflow.name ?? "Untitled Workflow",
    nodeCount: nodes.length,
    complexity: complexityFromNodeCount(nodes.length),
    triggers: triggers.length ? triggers : ["Manual"],
    integrations,
    credentialTypes,
    setupChecklist,
  };
}
