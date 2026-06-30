const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, "..", "..", "demo_data");
const targetDir = path.join(__dirname, "..", "public", "demo_data");

if (fs.existsSync(sourceDir)) {
  fs.mkdirSync(targetDir, { recursive: true });

  const metadataSrc = path.join(sourceDir, "sample_metadata.json");
  if (fs.existsSync(metadataSrc)) {
    fs.copyFileSync(metadataSrc, path.join(targetDir, "sample_metadata.json"));
  }

  for (const entry of fs.readdirSync(sourceDir)) {
    if (
      entry.endsWith("_plots.json") ||
      entry.endsWith(".csv") ||
      entry === "sample_metadata.json" ||
      entry === "sample_results.json"
    ) {
      fs.copyFileSync(path.join(sourceDir, entry), path.join(targetDir, entry));
    }
  }

  console.log("Copied demo_data to web/public/demo_data");
} else {
  console.warn("demo_data source not found — skipping copy");
}
