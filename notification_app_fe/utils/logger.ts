// thin wrapper around logging middleware for frontend use

const AUTH_TOKEN = process.env.NEXT_PUBLIC_ACCESS_TOKEN || "";
const LOG_API = "http://20.207.122.201/evaluation-service/logs";

type Stack = "frontend";
type Level = "debug" | "info" | "warn" | "error" | "fatal";
type Package = "api" | "component" | "hook" | "page" | "state" | "style" | "auth" | "config" | "middleware" | "utils";

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
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch (err) {
    // never let logging crash the app
  }
}