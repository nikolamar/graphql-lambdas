![alt text](https://raw.githubusercontent.com/nikolamar/graphql-lambdas/master/.assets/repo_head.png)

Apollo client + micro-services architecture
==============

##### Microservices architecture

Someone came up with a similar idea like mine before me and I don't want to repeat it, there is everything in the article. There are some differences because here we are using lambdas and they don't. Check this link for more info it will be more clear after reading this article: https://www.habx.com/tech/micro-graphql-schema

This repo shows this architecture that uses microservices and domains structure and it uses lambda layers to share a common schema, logic, and nodejs dependencies. If your projects demands you can bundle some lambdas or all of them and you don't need to share `node_modules` at all if you don't want to. Whatever works for you. There is a `sam sync` which updates you lambda code on the fly even if you are writing `typescript` it takes max 5 seconds. Bundling is faster now each lambda is package and sam beta uses now esbuild. It is more convenient now as we don't have to use our esbuild scripts.

##### Key things

- no single point of failure
- each lambda can be tweaked independent as they are intended to
- split your backend into domains e.g. users, tenants, etc.
- sync your local code with sam cli watch and it will deploy code to lambda under 5 sec.
- local works even better now (if it is one graphql lambda all requests are processed over one adapter this is not an issue anymore)
- you can write graphql lambdas in nodejs and other in go and they can share same schema


##### Github actions can trigger auto release

```
git push origin
git tag v0.3.2
git push origin v0.3.2
```

![alt text](https://github.com/nikolamar/graphql-lambdas/blob/master/.assets/release.png?raw=true)

## Stages

- dev
- prod

## Scripts

- build
- delete
- deploy
- test

##### Deploy script requires secrets

```bash
#!/bin/bash

MY_DIR=$(realpath $0)
CICD_DIR=$(dirname $MY_DIR)
PROJECT_ROOT=$(dirname $CICD_DIR)

export PROJECT_NAME=${PROJECT_NAME:-name}
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY

# These vars are needed to inject into the SAM template
export STAGE=$STAGE
export REGION=$REGION
export DB_USER=$DB_USER
export DB_PASSWORD=$DB_PASSWORD
export HOSTED_ZONE_ID=$HOSTED_ZONE_ID
export DOMAIN_NAME=${DOMAIN_NAME:-fakedomain.com}
export SUB_DOMAIN_NAME=$SUB_DOMAIN_NAME
export VERSION=$VERSION
export GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
export GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
export FACEBOOK_CLIENT_ID=$FACEBOOK_CLIENT_ID
export FACEBOOK_CLIENT_SECRET=$FACEBOOK_CLIENT_SECRET

...
```

## Local environment

##### Install AWS SAM CLI

https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html

#####  Set up AWS Credentials and Region

https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html

##### Update env.json with secrets

```bash
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

##### Local in sync

This will sync your local code changes with deployed lambda

```
sam sync —-beta-features
```

> **_NOTE:_** it will ask for app name (stack name on AWS) to sync your code.

## How to start local development

##### Build lambdas with AWS SAM CLI

```
sam build --beta-features
```

##### Start local APIs with AWS SAM CLI
```
sam local start-api --warm-containers LAZY --skip-pull-image --host 0.0.0.0 --env-vars env.json --port 3000
```

> **_NOTE:_** For hot reload we need a simple esbuild script here to watch changes and copy files to `.aws-sam/build` where all `javascript` transformed lambdas sit or run the esbuild CLI command with watch option.

## Configure client

##### Update queries and mutations with graphql directives

> **_NOTE:_** Schema has to be updated by adding `@api(name: users)`
```graphql
query users ($where: UserFilter, $order: Order, $first: Int, $offset: Int, $after: String, $sortBy: String) @api(name: users) {
  users (where: $where, order: $order, first: $first, offset: $offset, after: $after, sortBy: $sortBy) {
    edges {
      cursor
      node {
        ...UserFragment
      }
    }
    pageInfo {
      hasPreviousPage
      hasNextPage
      startCursor
      endCursor
      count
      totalCount
    }
  }
}
```

##### Install apollo multi link library

```
npm i @habx/apollo-multi-endpoint-link
```

##### Configure http link

```javascript
import { createHttpLink } from "apollo-link-http";

new ApolloClient({
 link: ApolloLink.from([
   new MultiAPILink({
      httpSuffix: "",
      endpoints: {
        users: 'https://fakedomain.com/users',
        tenants: 'https://fakedomain.com/tenants',
        ...
      },
      createHttpLink: () => createHttpLink(),
    }),
  ]),
});
```

## TODO

- [ ] Husky
- [ ] Pnpm manager
- [ ] Commit conventions
- [ ] Trigger release script with git tag version
- [ ] Hot reload in local
- [ ] Forgot password
