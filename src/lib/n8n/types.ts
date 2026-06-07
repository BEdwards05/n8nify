export type N8nNode = {
  name?: string;
  type?: string;
  typeVersion?: number;
  parameters?: Record<string, unknown>;
  credentials?: Record<string, string | { id?: string; name?: string }>;
  position?: [number, number];
};

export type N8nWorkflow = {
  name?: string;
  nodes?: N8nNode[];
  connections?: Record<string, unknown>;
  active?: boolean;
  settings?: Record<string, unknown>;
};

export type WorkflowPreviewMetadata = {
  workflowName: string;
  nodeCount: number;
  complexity: "simple" | "moderate" | "complex";
  triggers: string[];
  integrations: string[];
  credentialTypes: string[];
  setupChecklist: string[];
};
