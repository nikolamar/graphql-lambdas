![alt text](https://github.com/nikolatec/app-designer-backend/blob/master/repo_head.png?raw=true)

Apollo client + micro-services architecture 
==============

### Microservices architecture:

Someone came up with a similar idea like me there is an article for this so I don't want to repeat it, there are some differences and I'm using lambdas but please check this link for more infos: https://www.habx.com/tech/micro-graphql-schema

This is research that works great on my side project :) and I'm not done here. I really do hope that you will take some things learn along the way. This repo shows this architecture that use microservices + domains structure and it uses lambda layers to share common schema, logic, nodejs dependenceis or if projects demands you can bundle some lambdas whatever you think is better for your project. Sam beta features work fast! One things that i like the most is `sam sync` which updates you lambda code on the fly even if you are writing `typescript` it takes max 5 seconds. The next cool thing is how each lambda is packaged and sam beta uses now esbuild and it way faster to build then before, no more some custom esbuild scripts.

Key things to take here:

- no single point of failure
- each lambda can be tweaked as they are intended to
- split your backend into domains e.g. users, tenants, etc.
- sync your local code with sam cli watch and it will deploy code to lambda under 5 sec.
- of course you can run local still works but better now (before we had huge lambda over one adapter this is not an issue anymore)
- you can write graphql lambda in nodejs and other in go and they can share same schema, logic
- github actions are here too, when you trigger release like this:
```
git push origin
git tag v0.3.2
git push origin v0.3.2
```
You'll get releases automatically looking like this:

![alt text](https://github.com/nikolatec/app-designer-backend/blob/master/release.png?raw=true)



### Stages:

1. `dev`
2. `prod`

### Prepare you local environment:

1. Make sure you install `AWS SAM CLI`:

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

1. Set up AWS Credentials and Region for Development:

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

2. Update your `env.json` with secrets like this:

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
