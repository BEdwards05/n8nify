import { eq } from "drizzle-orm";
import { db } from "./db";
import { listings, workflowAssets } from "../../drizzle/schema";
import { parseWorkflow } from "./n8n/parse-workflow";
import { sanitizeWorkflow, validateWorkflow } from "./n8n/sanitize-workflow";
import {
  downloadWorkflow,
  hashContent,
  uploadWorkflow,
  workflowStorageKey,
} from "./storage";

export async function processWorkflowUpload(
  listingId: string,
  rawJson: string,
): Promise<{ warnings: string[] }> {
  const parsed = validateWorkflow(JSON.parse(rawJson));
  const { workflow, hadSecrets, warnings } = sanitizeWorkflow(parsed);

  if (hadSecrets) {
    throw new Error(
      "Workflow contains potential secrets. Please remove credentials before uploading.",
    );
  }

  const sanitizedJson = JSON.stringify(workflow, null, 2);
  const summary = parseWorkflow(workflow);
  const key = workflowStorageKey(listingId);
  const hash = hashContent(sanitizedJson);

  await uploadWorkflow(key, sanitizedJson);

  const existing = await db.query.workflowAssets.findFirst({
    where: eq(workflowAssets.listingId, listingId),
  });

  if (existing) {
    await db
      .update(workflowAssets)
      .set({
        storageKey: key,
        sanitizedHash: hash,
        parsedSummary: summary,
      })
      .where(eq(workflowAssets.listingId, listingId));
  } else {
    await db.insert(workflowAssets).values({
      listingId,
      storageKey: key,
      sanitizedHash: hash,
      parsedSummary: summary,
    });
  }

  await db
    .update(listings)
    .set({
      previewMetadata: summary,
      updatedAt: new Date(),
    })
    .where(eq(listings.id, listingId));

  return { warnings };
}

export async function getWorkflowJsonForListing(
  listingId: string,
): Promise<string> {
  const asset = await db.query.workflowAssets.findFirst({
    where: eq(workflowAssets.listingId, listingId),
  });
  if (!asset) throw new Error("Workflow not found");
  return downloadWorkflow(asset.storageKey);
}
