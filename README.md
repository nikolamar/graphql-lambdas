![alt text](https://github.com/nikolatec/app-designer-backend/blob/refactor/repo_heaad.jpg?raw=true)


Apollo client + micro-services architecture 
==============



### Stages:

1. `dev`
2. `prod`



### Running in `local`:


1. Make sure you install `AWS SAM CLI`:

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html


2. Updated your `env.json` with secrets like this:

```
{
  "Parameters": {
    "STAGE": "dev",
    "REGION": "us-east-1",
    "DB_USER": "admin",
    "DB_NAME": "users",
    "DB_PASSWORD": "password",
    "POOL_ID": "us-east-1_keycYdErq",
    "WEBSOCKETE_API_ID": "wss://1kdtq8enmy.execute-api.us-east-1.amazonaws.com/dev",
    "CLIENT_ID": "9gherqopxfbwta63gtsheuwrsq",
    "NODE_ENV": "local",
    "VERSION": "v0.0.0",
    "AWS_ACCESS_KEY_ID": "HYAQPLMDNCGTERAYQTEY",
    "AWS_SECRET_ACCESS_KEY": "u0o/50HJHgjhJKhGHGGGu+JhjHJhJgjkGHJGKjHUH/ZI",
    "GoogleClientId": "08759380566757-346606lnfbhd8986sd8fi23gr8h9l.apps.googleusercontent.com",
    "GoogleClientSecret": "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"
  }
}

```


3. Build `lambdas from template` with AWS SAM CLI running beta features that introduce esbuild:
```
sam build --beta-features
```


4. Start local APIs

```
sam local start-api --warm-containers LAZY --skip-pull-image --host 0.0.0.0 --env-vars env.json --port 3000
```

5. `TODO:` For hot reload we need a simple esbuild script here to watch changes and copy files to `.aws-sam/build` where all `javascript` transformed lambdas sits or run the esbuild CLI command with watch option

For example:
```
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
  outdir: ".aws-sam/build",
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
```