import esbuild from 'esbuild';
import wasmPlugin from './wasm-plugin';

esbuild.build(
  {
    entryPoints: ['src/main.ts'],
    bundle: true,
    sourcemap: true,
    plugins: [wasmPlugin],
    outfile: 'dist/dim.js'
  }
);
