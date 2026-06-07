import { Worker } from "bullmq";
import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const worker = new Worker(
  "n8nify",
  async (job) => {
    console.info(`[worker] processing job ${job.name}`, job.data);
    if (job.name === "send-email") {
      console.info("[worker] email:", job.data);
    }
  },
  {
    connection: {
      url: process.env.REDIS_URL ?? "redis://localhost:6379",
      maxRetriesPerRequest: null,
    },
  },
);

worker.on("completed", (job) => {
  console.info(`[worker] completed ${job.id}`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] failed ${job?.id}`, err);
});

console.info("[worker] n8nify worker started");
