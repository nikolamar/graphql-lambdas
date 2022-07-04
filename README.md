![alt text](https://github.com/nikolatec/app-designer-backend/blob/master/repo_head.png?raw=true)

Apollo client + micro-services architecture 
==============

Someone came up with a similar idea like me there is an article for this so I don't want to repeat it, the difference here is that I'm using lambdas: https://www.habx.com/tech/micro-graphql-schema

### Stages:

1. `dev`
2. `prod`

### Prepare you local environment:

1. Make sure you install `AWS SAM CLI`:

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

1. Set up AWS Credentials and Region for Development:

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

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

### Running in `sync`:

1. This will sync your local code changes with deployed lamda while you editing the `ts` source files it take max 5 seconds to updae lambda it is really fast:

```sam sync —beta-features ```

`NOTE: it will ask for app name (stack name on AWS) to sync your code.`

### Running in `local`:

1. Build `lambdas from template` with AWS SAM CLI running beta features that introduce esbuild:
```
sam build --beta-features
```

2. Start local APIs using docker containers:

```
sam local start-api --warm-containers LAZY --skip-pull-image --host 0.0.0.0 --env-vars env.json --port 3000
```

3. `TODO:` For hot reload we need a simple esbuild script here to watch changes and copy files to `.aws-sam/build` where all `javascript` transformed lambdas sits or run the esbuild CLI command with watch option.