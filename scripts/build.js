#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const getFilePaths = (folderPath) => {
  const entryPaths = fs.readdirSync(folderPath).map(entry => path.join(folderPath, entry));
  const filePaths = entryPaths.filter(entryPath => fs.statSync(entryPath).isFile());
  const dirPaths = entryPaths.filter(entryPath => !filePaths.includes(entryPath));
  const dirFiles = dirPaths.reduce((prev, curr) => prev.concat(getFilePaths(curr)), []);
  return [...filePaths, ...dirFiles];
};

const srcPath = path.join(__dirname, "../src");

const entryPoints = getFilePaths(srcPath).filter(filePath =>
  !["node_modules"].some(path => filePath.includes(path)) &&
  !filePath.endsWith(".d.ts") &&
  !filePath.endsWith(".test.ts") &&
  !filePath.endsWith(".test.js") &&
  (filePath.endsWith(".ts") || filePath.endsWith(".js"))
);

const options = {
  logLevel: "info",
  entryPoints,
  outdir: "dist",
  platform: "node",
  minify: false,
  bundle: false,
  tsconfig: "./tsconfig.json",
  format: "cjs",
  minifyIdentifiers:false,
  minifySyntax:false,
  minifyWhitespace:false,
  target: [ "es2020" ],
};

require("esbuild")
  .build(options)
  .catch(() => process.exit(1));