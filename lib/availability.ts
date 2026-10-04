type WorkingWindow = { staff_id: string | null; day_of_week: number; start_time: string; end_time: string; active: boolean };
type BreakWindow = { staff_id: string | null; day_of_week: number; start_time: string; end_time: string };
type BusyPeriod = { staff_id: string; start_at: string; end_at: string };

function clockMinutes(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}
function zonedMinutes(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(value));
  return Number(parts.find((part) => part.type === "hour")?.value ?? 0) * 60 + Number(parts.find((part) => part.type === "minute")?.value ?? 0);
}
function zonedDate(value: string, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: timezone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}
export function displayTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

export function findOpenWindows(input: { date: string; timezone: string; schedules: WorkingWindow[]; breaks: BreakWindow[]; appointments: BusyPeriod[]; timeOff: BusyPeriod[] }) {
  const weekday = new Date(`${input.date}T12:00:00Z`).getUTCDay();
  const schedules = input.schedules.filter((schedule) => schedule.active && schedule.day_of_week === weekday && schedule.staff_id);
  const windows: { staff_id: string; start: number; end: number }[] = [];
  for (const schedule of schedules) {
    const staffId = schedule.staff_id;
    if (!staffId) continue;
    const start = clockMinutes(schedule.start_time);
    const end = clockMinutes(schedule.end_time);
    const busy = [
      ...input.breaks.filter((pause) => pause.day_of_week === weekday && (pause.staff_id === null || pause.staff_id === staffId)).map((pause) => ({ start: clockMinutes(pause.start_time), end: clockMinutes(pause.end_time) })),
      ...input.appointments.filter((appointment) => appointment.staff_id === staffId).map((appointment) => ({ start: zonedMinutes(appointment.start_at, input.timezone), end: zonedMinutes(appointment.end_at, input.timezone) })),
      ...input.timeOff.filter((leave) => leave.staff_id === staffId).map((leave) => ({
        start: zonedDate(leave.start_at, input.timezone) < input.date ? 0 : zonedMinutes(leave.start_at, input.timezone),
        end: zonedDate(leave.end_at, input.timezone) > input.date ? 1440 : zonedMinutes(leave.end_at, input.timezone),
      })),
    ].map((period) => ({ start: Math.max(start, period.start), end: Math.min(end, period.end) })).filter((period) => period.start < period.end).sort((a, b) => a.start - b.start);
    let cursor = start;
    for (const period of busy) {
      if (period.start - cursor >= 15) windows.push({ staff_id: staffId, start: cursor, end: period.start });
      cursor = Math.max(cursor, period.end);
    }
    if (end - cursor >= 15) windows.push({ staff_id: staffId, start: cursor, end });
  }
  return windows.sort((a, b) => a.start - b.start);
}
