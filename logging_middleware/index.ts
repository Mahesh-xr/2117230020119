import 'dotenv/config';


// logging_middleware/index.ts

const AUTH_TOKEN = process.env.ACCESS_TOKEN || "";
const LOG_API = "http://20.207.122.201/evaluation-service/logs";

type Stack = "backend" | "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package =
  | "cache" | "controller" | "cron_job" | "db" | "domain"
  | "handler" | "repository" | "route" | "service"      // backend only
  | "api" | "component" | "hook" | "page" | "state" | "style" // frontend only
  | "auth" | "config" | "middleware" | "utils";           // both

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  try {
    await fetch(LOG_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });
  } catch (err) {
    // silent fail — never let logging crash app
  }
}