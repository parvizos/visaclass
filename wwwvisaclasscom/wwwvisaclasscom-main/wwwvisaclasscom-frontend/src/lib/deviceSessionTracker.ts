type DeviceEventType = "login" | "logout";

interface DeviceEvent {
  user_id: string;
  device_id: string;
  event_type: DeviceEventType;
  created_at: string;
}

const DEVICE_ID_KEY = "visaclass_device_id";
const EVENTS_KEY = "visaclass_device_events";

function readEvents(): DeviceEvent[] {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as DeviceEvent[];
  } catch {
    return [];
  }
}

function writeEvents(events: DeviceEvent[]) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;
  const created = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `device-${Date.now()}`;
  localStorage.setItem(DEVICE_ID_KEY, created);
  return created;
}

export async function trackDeviceAuthEvent(userId: string, eventType: DeviceEventType): Promise<void> {
  const events = readEvents();
  events.push({
    user_id: userId,
    device_id: getOrCreateDeviceId(),
    event_type: eventType,
    created_at: new Date().toISOString(),
  });
  writeEvents(events);
}

export async function getDeviceSessionStats(userId: string): Promise<{
  loginEvents: number;
  logoutEvents: number;
  uniqueDevices: number;
}> {
  const rows = readEvents().filter((row) => row.user_id === userId);
  const loginEvents = rows.filter((row) => row.event_type === "login").length;
  const logoutEvents = rows.filter((row) => row.event_type === "logout").length;
  const uniqueDevices = new Set(rows.map((row) => row.device_id)).size;
  return { loginEvents, logoutEvents, uniqueDevices };
}
