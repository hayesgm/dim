import esbuild from 'esbuild';
import wasmPlugin from './wasm-plugin';

esbuild.serve(
  {
    port: 8000,
    servedir: 'dist'
  },
  {
    entryPoints: ['src/main.ts'],
    bundle: true,
    sourcemap: true,
    plugins: [wasmPlugin],
    outfile: 'dist/dim.js',
  }
);
