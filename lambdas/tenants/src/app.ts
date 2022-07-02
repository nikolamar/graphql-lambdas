import { ApolloServer } from "apollo-server-lambda";
import {
  ApolloServerPluginLandingPageGraphQLPlayground,
  ApolloServerPluginLandingPageDisabled,
} from "apollo-server-core";
import { applyMiddleware } from "graphql-middleware";
import { DatabaseDataSource } from "/opt/datasources/database";
import { schemaWithResolvers } from "./schema";
import { isNodeEnvOneOf } from "/opt/configs/environment";
import { logger } from "/opt/plugins/logger";

const schemaWithMiddleware = applyMiddleware(schemaWithResolvers);

let plugins = [logger, ApolloServerPluginLandingPageDisabled()];

if (isNodeEnvOneOf("local", "dev")) {
  plugins = [logger, ApolloServerPluginLandingPageGraphQLPlayground()];
}

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  introspection: isNodeEnvOneOf("local", "dev"),
  debug: isNodeEnvOneOf("local", "dev"),
  plugins,

  dataSources: () => ({
    db: new DatabaseDataSource(),
  }),

  context: (ctx) => {
    return {
      headers: ctx.express.req.headers,
      expressRequest: ctx.express.req,
      functionName: ctx.context.functionName,
      stage: ctx.event.requestContext.stage,
    };
  },
});

export const handler = server.createHandler({
  expressGetMiddlewareOptions: {
    disableHealthCheck: true,
    cors: {
      origin: "*",
      methods: "*",
      allowedHeaders: "*",
      credentials: false,
    },
  },
});
