import autoprefixer from 'autoprefixer';
import { defineConfig } from 'vite';
import fs from 'fs-extra';
import { resolve } from 'path';

const prependUseClient = () => {
  return {
    name: 'prepend-use-client',
    renderChunk(code) {
      return {
        code: `'use client'; \n${code}`,
        map: null
      };
    }
  };
};

const copyFiles = () => {
  return {
    name: 'copy-files',
    buildEnd() {
      fs.copySync('./src/less/index.less', './dist/css/bright-table.css');
      // fs.copySync('./src/@types/', './dist/types');
    }
  };
};

/** @type {import('vite').UserConfig} */
export default defineConfig({
  // css and less compilation
  css: {
    preprocessorOptions: {
      less: {
        math: 'always',
        relativeUrls: true,
        javascriptEnabled: true
      }
    },
    postcss: {
      plugins: [autoprefixer()]
    }
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'bright-table',
      formats: ['es']
    },

    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
        dir: 'dist',
        exports: 'named'
      }
    }
  },

  plugins: [prependUseClient(), copyFiles()]
});
