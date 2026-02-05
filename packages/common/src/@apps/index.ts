import { gmail } from './gmail';
import { system } from './system';

const apps = [gmail, system];

export default apps;

export function isIntervalPassed(
  lastExecutedAt: Date | null,
  intervalMs: number,
) {
  if (!lastExecutedAt) {
    return true;
  }

  const lastExecutedAtMs = new Date(lastExecutedAt).getTime();
  const nextRunAt = lastExecutedAtMs + Number(intervalMs);
  const now = Date.now();

  if (now < nextRunAt) {
    return false;
  }

  return true;
}
