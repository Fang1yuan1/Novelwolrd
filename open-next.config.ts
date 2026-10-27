import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// تخزين صفحات ISR المؤقتة في R2 (نفس المخزن، بمجلد isr-cache/)
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
