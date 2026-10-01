import fs from "node:fs";
import path from "node:path";
const root = process.cwd();
const forbidden = ["619" + "97", "studio" + "-dev"];
const skip = new Set(["node_modules", ".next", ".git", ".venv", ".python", ".pytest_cache", "artifacts", ".vercel"]);
let bad = [];
function walk(p){for(const e of fs.readdirSync(p,{withFileTypes:true})){if(skip.has(e.name)) continue; const f=path.join(p,e.name); if(e.isDirectory()) walk(f); else if(!/\.(png|jpg|jpeg|gif|ico|zip|lock)$/.test(e.name)){const s=fs.readFileSync(f,"utf8"); for(const x of forbidden) if(s.toLowerCase().includes(x.toLowerCase())) bad.push(`${path.relative(root,f)} contains forbidden network marker`);}}}
walk(root);
if(bad.length){console.error(bad.join("\n"));process.exit(1)}
console.log("Network contamination check passed: Studionet-only source tree.");
