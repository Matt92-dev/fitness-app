import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";
import { getState, setState } from "./db.js";

const PORT = Number(process.env.PORT ?? 3001);
const HOST = process.env.HOST ?? "127.0.0.1";
const DIST_DIR = resolve("dist");
const WORKOUT_LOGS_STATE_KEY = "workout_logs";
const APP_USERNAME = process.env.APP_USERNAME;
const APP_PASSWORD = process.env.APP_PASSWORD;
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

function isAuthorized(request) {
  if (!APP_USERNAME || !APP_PASSWORD) {
    return true;
  }

  const authorization = request.headers.authorization;

  if (!authorization?.startsWith("Basic ")) {
    return false;
  }

  const [username = "", password = ""] = Buffer.from(
    authorization.slice("Basic ".length),
    "base64"
  )
    .toString("utf8")
    .split(":");

  return safeCompare(username, APP_USERNAME) && safeCompare(password, APP_PASSWORD);
}

function sendUnauthorized(response) {
  response.writeHead(401, {
    "Content-Type": "text/plain; charset=utf-8",
    "WWW-Authenticate": 'Basic realm="Fitness App"'
  });
  response.end("Authentication required");
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

  if (!isAuthorized(request)) {
    sendUnauthorized(response);
    return;
  }

  try {
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
