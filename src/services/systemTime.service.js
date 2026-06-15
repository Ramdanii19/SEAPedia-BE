import SystemSetting from "../models/systemSetting.model.js";

// Waktu sistem untuk simulasi SLA di testing/staging.
// Production: getCurrentTime() selalu fallback ke Date.now() karena currentDatetime = null.
// Testing: advanceTime() geser jam sistem tanpa mengubah server clock.

export async function getCurrentTime() {
  const setting = await SystemSetting.findById("singleton");
  return setting?.currentDatetime ?? new Date();
}

export async function advanceTime(by) {
  const current = await getCurrentTime();
  const next = new Date(current.getTime() + by);

  await SystemSetting.findByIdAndUpdate(
    "singleton",
    { $set: { currentDatetime: next } },
    { upsert: true, new: true }
  );

  return next;
}

export async function resetTime() {
  await SystemSetting.findByIdAndUpdate(
    "singleton",
    { $set: { currentDatetime: null } },
    { upsert: true }
  );
}
