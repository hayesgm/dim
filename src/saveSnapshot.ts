import * as fs from 'fs';

let bytes = process.argv[2];

if (!bytes) {
  throw new Error("Usage: npx ts-node src/saveSnapshot.ts \"$(pbpaste)\"");
}

let file = "state.bin";
let decoded = atob(bytes);
fs.writeFileSync(file, decoded);
console.log(`Wrote ${file}...`)
