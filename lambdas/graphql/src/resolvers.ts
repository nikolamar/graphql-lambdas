import { mergeResolvers } from "@graphql-tools/merge";
import { cognito } from "./resolvers/cognito";
import { env } from "./resolvers/env";
import { message } from "./resolvers/message";
import { ping } from "./resolvers/ping";
import { tenant } from "./resolvers/tenant";
import { user } from "./resolvers/user";

export const resolvers = mergeResolvers([
  cognito,
  env,
  message,
  ping,
  tenant,
  user,
]);
