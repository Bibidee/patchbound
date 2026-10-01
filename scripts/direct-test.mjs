import {existsSync} from "node:fs";
import path from "node:path";
import {spawnSync} from "node:child_process";

const root = process.cwd();
const candidates = [
  process.env.PATCHBOUND_PYTHON,
  path.join(root, ".venv", "Scripts", "python.exe"),
  path.join(root, ".venv", "bin", "python"),
  "python",
  "python3",
].filter(Boolean);
const python = candidates.find(candidate => candidate.includes(path.sep) ? existsSync(candidate) : true);

if (!python) {
  console.error("Python 3.12+ is required for Direct Mode. Install requirements-dev.txt and rerun this command.");
  process.exit(1);
}

const result = spawnSync(python, ["-m", "pytest", "-q"], {cwd: root, stdio: "inherit", shell: false});
if (result.error) {
  console.error(`Could not run Direct Mode with ${python}: ${result.error.message}`);
  process.exit(1);
}
process.exit(result.status ?? 1);
