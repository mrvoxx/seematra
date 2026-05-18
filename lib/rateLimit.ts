// lib/rateLimit.ts
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  // If no record or window expired, create new record
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true; // Allowed
  }

  // If within window and below limit, increment count
  if (record.count < limit) {
    record.count++;
    return true; // Allowed
  }

  // Rate limit exceeded
  return false;
}

// Cleanup function to prevent memory leaks in long-running processes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of Array.from(rateLimitMap.entries())) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60000); // Cleanup every minute
