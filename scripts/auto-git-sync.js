#!/usr/bin/env node
/**
 * Stages safe changes, commits, and pushes the current branch.
 * Set AUTO_GIT_SYNC=0 to disable.
 */
const { execFileSync, execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const pushOnly = process.argv.includes("--push-only");

function log(message) {
  console.log(`[auto-git-sync] ${message}`);
}

function runGit(args, options = {}) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    ...options,
  }).trim();
}

function runGitSafe(args) {
  try {
    return { ok: true, output: runGit(args) };
  } catch (error) {
    const stderr =
      error && typeof error === "object" && "stderr" in error
        ? String(error.stderr || "")
        : "";
    const stdout =
      error && typeof error === "object" && "stdout" in error
        ? String(error.stdout || "")
        : "";
    return {
      ok: false,
      error: stderr || stdout || String(error),
    };
  }
}

function isBlockedPath(filePath) {
  const normalized = filePath.replace(/\\/g, "/").toLowerCase();
  return (
    normalized.startsWith(".env") ||
    normalized.includes("/.env") ||
    normalized.endsWith(".pem") ||
    normalized.includes("credentials") ||
    normalized.includes("secret")
  );
}

function getChangedFiles() {
  const status = runGit(["status", "--porcelain"]);
  if (!status) return [];

  return status
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.slice(3).trim().replace(/^"(.*)"$/, "$1"));
}

function buildCommitMessage(files) {
  const timestamp = new Date().toISOString().replace("T", " ").slice(0, 19);
  const preview = files.slice(0, 10).map((file) => `- ${file}`);
  const remaining =
    files.length > preview.length
      ? `\n- ...and ${files.length - preview.length} more`
      : "";

  return `Auto sync: ${timestamp}\n\n${preview.join("\n")}${remaining}`;
}

function pushCurrentBranch(branch) {
  const upstream = runGitSafe([
    "rev-parse",
    "--abbrev-ref",
    "--symbolic-full-name",
    "@{u}",
  ]);

  if (upstream.ok) {
    const result = runGitSafe(["push"]);
    if (!result.ok) throw new Error(result.error || "git push failed");
    return;
  }

  const result = runGitSafe(["push", "-u", "origin", branch]);
  if (!result.ok) throw new Error(result.error || "git push failed");
}

function main() {
  if (process.env.AUTO_GIT_SYNC === "0" || process.env.AUTO_GIT_PUSH === "0") {
    log("Disabled via AUTO_GIT_SYNC=0");
    return;
  }

  const branch = runGit(["rev-parse", "--abbrev-ref", "HEAD"]);
  if (branch === "HEAD") {
    log("Detached HEAD, skipping");
    return;
  }

  if (!pushOnly) {
    const changedFiles = getChangedFiles();
    if (changedFiles.length === 0) {
      log("No changes to sync");
      return;
    }

    runGit(["add", "-A"]);

    const staged = runGit(["diff", "--cached", "--name-only"])
      .split(/\r?\n/)
      .filter(Boolean);
    const blocked = staged.filter(isBlockedPath);

    if (blocked.length > 0) {
      runGit(["reset", "HEAD", "--", ...blocked]);
      log(`Skipped sensitive files: ${blocked.join(", ")}`);
    }

    const safeStaged = runGit(["diff", "--cached", "--name-only"])
      .split(/\r?\n/)
      .filter(Boolean);

    if (safeStaged.length === 0) {
      log("Nothing safe to commit");
      return;
    }

    const message = buildCommitMessage(safeStaged);
    const messageFile = path.join(ROOT, ".git", "AUTO_SYNC_COMMIT_MSG");
    fs.writeFileSync(messageFile, message, "utf8");

    const commit = runGitSafe(["commit", "-F", messageFile]);
    fs.unlinkSync(messageFile);

    if (!commit.ok) {
      if (/nothing to commit/i.test(commit.error || "")) {
        log("Nothing to commit");
        return;
      }
      throw new Error(commit.error || "git commit failed");
    }

    log(`Committed ${safeStaged.length} file(s)`);
  } else {
    const ahead = runGitSafe(["rev-parse", "@{u}"]);
    if (!ahead.ok) {
      log("No upstream branch to push");
      return;
    }

    const unpushed = runGitSafe(["rev-list", "--count", "@{u}..HEAD"]);
    if (unpushed.ok && Number(unpushed.output) === 0) {
      log("Already up to date with remote");
      return;
    }
  }

  pushCurrentBranch(branch);
  log(`Pushed branch ${branch}`);
}

try {
  main();
} catch (error) {
  console.error(
    `[auto-git-sync] ${error instanceof Error ? error.message : String(error)}`
  );
  process.exit(1);
}
