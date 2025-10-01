import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

const shouldMinify = process.env.BUILD_MINIFY === 'true' || process.env.NODE_ENV === 'production';

export default {
  input: 'public/main.js',
  output: {
    file: 'public/dist/bundle.js',
    format: 'iife',
    name: 'ReadMind',
    sourcemap: true
  },
  plugins: [
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    shouldMinify && terser({
      ecma: 2020,
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
      mangle: {
        reserved: ['ReadMind'],
      },
    }),
  ].filter(Boolean),
  external: [
    'https://cdnjs.cloudflare.com/ajax/libs/simplemde/1.11.2/simplemde.min.js',
    'https://cdn.jsdelivr.net/npm/kuromoji/build/kuromoji.js',
    'https://esm.run/@material/web/'
  ]
};
