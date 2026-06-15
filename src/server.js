import { env } from "./config/env.js";
import { connectDB } from "./config/db.js";
import app from "./app.js";
import { startLateOrderCron } from "./jobs/lateOrder.cron.js";

await connectDB();

// Toggle via ENABLE_CRON=true di .env. Off by default agar tidak jalan saat test/dev tanpa sengaja.
if (process.env.ENABLE_CRON === "true") {
  startLateOrderCron();
}

app.listen(env.port, () => {
  console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
});
