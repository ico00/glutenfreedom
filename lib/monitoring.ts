import { Logger } from "./logger";

/**
 * Monitoring i alerting za sigurnosne događaje
 */

export interface SecurityEvent {
  type: "failed_login" | "rate_limit" | "csrf_failure" | "unauthorized_access" | "suspicious_activity";
  severity: "low" | "medium" | "high" | "critical";
  userId?: string;
  ip: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

/**
 * Provjeri da li je događaj kritičan i zahtijeva alert
 */
function shouldAlert(event: SecurityEvent): boolean {
  // Kritični događaji koji zahtijevaju alert
  const criticalTypes: SecurityEvent["type"][] = [
    "suspicious_activity",
    "unauthorized_access",
  ];

  return (
    event.severity === "critical" ||
    (event.severity === "high" && criticalTypes.includes(event.type))
  );
}

/**
 * Logiraj sigurnosni događaj i pošalji alert ako je potrebno
 */
export async function logSecurityEvent(event: SecurityEvent): Promise<void> {
  // Logiraj događaj
  await Logger.security(
    `Security event: ${event.type}`,
    event.userId,
    event.ip,
    {
      severity: event.severity,
      userAgent: event.userAgent,
      ...event.details,
    }
  );

  // Ako je kritičan, pošalji alert
  if (shouldAlert(event)) {
    await sendAlert(event);
  }
}

/**
 * Pošalji alert za kritične sigurnosne događaje
 */
async function sendAlert(event: SecurityEvent): Promise<void> {
  // TODO: Integracija s email servisom ili Slack webhook
  // Za sada samo logiramo
  await Logger.warn("SECURITY ALERT", {
    event: event.type,
    severity: event.severity,
    userId: event.userId,
    ip: event.ip,
    timestamp: new Date().toISOString(),
  });

  // Primjer integracije s email servisom:
  // if (process.env.ALERT_EMAIL) {
  //   await sendEmail({
  //     to: process.env.ALERT_EMAIL,
  //     subject: `Security Alert: ${event.type}`,
  //     body: `Severity: ${event.severity}\nIP: ${event.ip}\nDetails: ${JSON.stringify(event.details)}`,
  //   });
  // }
}

/**
 * Provjeri pattern za sumnjive aktivnosti
 */
export function detectSuspiciousActivity(
  ip: string,
  events: SecurityEvent[]
): boolean {
  // Provjeri da li ima previše neuspješnih pokušaja u kratkom vremenu
  const recentFailedLogins = events.filter(
    (e) =>
      e.type === "failed_login" &&
      e.ip === ip &&
      new Date().getTime() - (e.details?.timestamp as number || 0) < 5 * 60 * 1000 // zadnjih 5 minuta
  );

  if (recentFailedLogins.length >= 5) {
    return true;
  }

  // Provjeri da li ima previše CSRF failures
  const recentCsrfFailures = events.filter(
    (e) =>
      e.type === "csrf_failure" &&
      e.ip === ip &&
      new Date().getTime() - (e.details?.timestamp as number || 0) < 10 * 60 * 1000 // zadnjih 10 minuta
  );

  if (recentCsrfFailures.length >= 10) {
    return true;
  }

  return false;
}

/**
 * Rate limit monitoring - provjeri da li IP prelazi normale limite
 */
export async function monitorRateLimit(
  ip: string,
  endpoint: string,
  currentCount: number,
  limit: number
): Promise<void> {
  const threshold = limit * 0.8; // 80% limita

  if (currentCount >= threshold) {
    await Logger.warn("Rate limit approaching", {
      ip,
      endpoint,
      currentCount,
      limit,
    });
  }

  if (currentCount >= limit) {
    await logSecurityEvent({
      type: "rate_limit",
      severity: "medium",
      ip,
      details: {
        endpoint,
        count: currentCount,
        limit,
      },
    });
  }
}

