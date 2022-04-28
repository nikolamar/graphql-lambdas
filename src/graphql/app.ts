import { ApolloServer } from "apollo-server-lambda";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "apollo-server-core";
import { applyMiddleware } from "graphql-middleware";
import { DatabaseDataSource } from "./sources/database";
import { schemaWithResolvers } from "./schema";
import { CognitoDataSource } from "./sources/cognito";
import { isDevelopment } from "./configs/environment";

const schemaWithMiddleware = applyMiddleware(
  schemaWithResolvers,
);

let plugins = [];

if (isDevelopment) {
  plugins = [
    ApolloServerPluginLandingPageGraphQLPlayground(),
  ];
}

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  introspection: true,
  plugins,

  dataSources: () => ({
    db: new DatabaseDataSource(),
    cognito: new CognitoDataSource(),
  }),

  context: ctx => {
    return {
      headers: ctx.event.headers,
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