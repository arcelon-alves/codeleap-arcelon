export function formatRelativeTime(isoDatetime: string): string {
  const then = new Date(isoDatetime);
  const now = new Date();
  const deltaMs = now.getTime() - then.getTime();

  if (Number.isNaN(then.getTime()) || deltaMs < 0) {
    return "just now";
  }

  const seconds = Math.floor(deltaMs / 1000);
  if (seconds < 60) {
    return "just now";
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
