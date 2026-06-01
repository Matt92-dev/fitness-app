import { createServer } from "node:http";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { getState, setState } from "./db.js";

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "127.0.0.1";
const DIST_DIR = resolve("dist");
const WORKOUT_LOGS_STATE_KEY = "workout_logs";
const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD = process.env.APP_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET ?? APP_PASSWORD;
const SESSION_COOKIE_NAME = "fitness_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const MAX_REQUEST_BODY_BYTES = 1024 * 1024;

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(body));
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function getCookies(request) {
  return Object.fromEntries(
    String(request.headers.cookie ?? "")
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([name, value]) => name && value)
  );
}

function sign(value) {
  return createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

function createSessionToken() {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SECONDS * 1000;

  return `${expiresAt}.${sign(String(expiresAt))}`;
}

function hasValidSession(request) {
  if (!APP_USERNAME || !APP_PASSWORD) {
    return true;
  }

  const token = getCookies(request)[SESSION_COOKIE_NAME];
  const [expiresAt = "", signature = ""] = String(token ?? "").split(".");

  if (!expiresAt || Number(expiresAt) <= Date.now()) {
    return false;
  }

  return safeCompare(signature, sign(expiresAt));
}

function setSessionCookie(response, token) {
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${SESSION_MAX_AGE_SECONDS}`
  );
}

function clearSessionCookie(response) {
  response.setHeader(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`
  );
}

async function readJsonBody(request) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;

    if (size > MAX_REQUEST_BODY_BYTES) {
      throw new Error("Request body is too large");
    }

    chunks.push(chunk);
  }

  if (chunks.length === 0) {
    return null;
  }

  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

async function serveStaticAsset(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
  const safePath = requestedPath.replaceAll("\\", "/").replace(/^(\.\.\/)+/, "");
  const filePath = resolve(DIST_DIR, safePath);
  const relativePath = relative(DIST_DIR, filePath);

  if (relativePath.startsWith("..") || relativePath.includes(":")) {
    sendJson(response, 404, { error: "Not found" });
    return;
  }

  try {
    const contents = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream"
    });
    response.end(contents);
  } catch {
    try {
      const indexHtml = await readFile(join(DIST_DIR, "index.html"));
      response.writeHead(200, { "Content-Type": contentTypes[".html"] });
      response.end(indexHtml);
    } catch {
      sendJson(response, 404, { error: "Not found" });
    }
  }
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { ok: true });
    return;
  }

  try {
    if (url.pathname === "/api/session" && request.method === "GET") {
      sendJson(response, 200, { authenticated: hasValidSession(request) });
      return;
    }

    if (url.pathname === "/api/login" && request.method === "POST") {
      const body = await readJsonBody(request);
      const username = String(body?.username ?? "");
      const password = String(body?.password ?? "");

      if (!APP_USERNAME || !APP_PASSWORD) {
        sendJson(response, 200, { authenticated: true });
        return;
      }

      if (!safeCompare(username, APP_USERNAME) || !safeCompare(password, APP_PASSWORD)) {
        sendJson(response, 401, { error: "Incorrect username or password" });
        return;
      }

      setSessionCookie(response, createSessionToken());
      sendJson(response, 200, { authenticated: true });
      return;
    }

    if (url.pathname === "/api/logout" && request.method === "POST") {
      clearSessionCookie(response);
      sendJson(response, 200, { authenticated: false });
      return;
    }

    if (url.pathname.startsWith("/api/") && !hasValidSession(request)) {
      sendJson(response, 401, { error: "Authentication required" });
      return;
    }

    if (url.pathname === "/api/workout-logs" && request.method === "GET") {
      sendJson(response, 200, { workoutLogs: getState(WORKOUT_LOGS_STATE_KEY, {}) });
      return;
    }

    if (url.pathname === "/api/workout-logs" && request.method === "PUT") {
      const body = await readJsonBody(request);
      const workoutLogs = body?.workoutLogs;

      if (!workoutLogs || typeof workoutLogs !== "object" || Array.isArray(workoutLogs)) {
        sendJson(response, 400, { error: "Expected workoutLogs object" });
        return;
      }

      setState(WORKOUT_LOGS_STATE_KEY, workoutLogs);
      sendJson(response, 200, { workoutLogs });
      return;
    }

    if (url.pathname.startsWith("/api/")) {
      sendJson(response, 404, { error: "API route not found" });
      return;
    }

    await serveStaticAsset(request, response);
  } catch (error) {
    sendJson(response, 500, { error: error.message });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Fitness API listening on http://${HOST}:${PORT}`);
});
