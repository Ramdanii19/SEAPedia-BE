import cron from "node-cron";
import { processLateOrders } from "../services/lateHandling.service.js";

// Default: setiap 5 menit. Override via LATE_ORDER_CRON_SCHEDULE di env.
// Format cron: "*/5 * * * *" = tiap 5 menit
// Untuk testing simulasi SLA cepat, set "*/1 * * * *" (tiap 1 menit).
const DEFAULT_SCHEDULE = "*/5 * * * *";

export function startLateOrderCron() {
  const schedule = process.env.LATE_ORDER_CRON_SCHEDULE || DEFAULT_SCHEDULE;

  cron.schedule(schedule, async () => {
    console.log(`[CRON] processLateOrders triggered at ${new Date().toISOString()}`);
    try {
      const results = await processLateOrders();
      if (results.processed > 0 || results.errors.length > 0) {
        console.log(`[CRON] processLateOrders: processed=${results.processed}, skipped=${results.skipped}, errors=${results.errors.length}`);
      }
    } catch (err) {
      console.error("[CRON] processLateOrders failed:", err.message);
    }
  });

  console.log(`[CRON] lateOrder scheduler started (schedule: "${schedule}")`);
}
