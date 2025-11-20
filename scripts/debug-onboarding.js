const { spawn } = require("child_process");
const { chromium } = require("playwright");
const path = require("path");

async function main() {
  const repoRoot = path.resolve(__dirname, "..");
  const server = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "dev", "-p", "3020", "--turbopack"],
    {
      cwd: repoRoot,
      env: { ...process.env, PORT: "3020" },
      stdio: ["ignore", "pipe", "pipe"],
      shell: process.platform === "win32",
    },
  );

  const waitForReady = new Promise((resolve, reject) => {
    let resolved = false;
    const onData = (data) => {
      const text = data.toString();
      process.stdout.write(text);
      if (text.includes("Ready")) {
        server.stdout.off("data", onData);
        resolved = true;
        resolve(null);
      }
    };

    const onError = (err) => {
      reject(err);
    };

    server.on("error", onError);
    server.stdout.on("data", onData);
    server.stderr.on("data", (data) => process.stderr.write(data.toString()));
    server.on("exit", (code) => {
      if (!resolved && code !== 0) {
        reject(new Error(`Dev server exited with code ${code}`));
      }
    });
  });

  await waitForReady;

  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on("console", (msg) => {
    console.log("[console]", msg.type(), msg.text());
  });

  page.on("pageerror", (error) => {
    console.error("[pageerror]", error.message);
  });

  await page.goto("http://localhost:3020/onboarding?triptoken=rodn9", {
    waitUntil: "networkidle",
  });

  await page.waitForTimeout(5000);
  await browser.close();

  server.kill("SIGINT");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
