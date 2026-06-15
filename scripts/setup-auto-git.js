#!/usr/bin/env node
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const hooksDir = path.join(ROOT, ".githooks");
const postCommitPath = path.join(hooksDir, "post-commit");

const postCommitScript = `#!/bin/sh
node scripts/auto-git-sync.js --push-only
`;

function runGit(args) {
  execFileSync("git", args, { cwd: ROOT, stdio: "inherit" });
}

fs.mkdirSync(hooksDir, { recursive: true });
fs.writeFileSync(postCommitPath, postCommitScript, "utf8");

try {
  fs.chmodSync(postCommitPath, 0o755);
} catch {
  // Windows may ignore chmod; Git Bash still runs the hook.
}

runGit(["config", "core.hooksPath", ".githooks"]);

console.log("[git:setup] Installed .githooks/post-commit");
console.log("[git:setup] Set git config core.hooksPath=.githooks");
console.log("[git:setup] Manual commits will now auto-push to origin.");
