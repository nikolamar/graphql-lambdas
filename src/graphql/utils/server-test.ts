import AWS from "aws-sdk";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { join } from "path";
import { convertNodeHttpToRequest, runHttpQuery } from "apollo-server-core";
import { print } from "graphql";
import httpMocks, { RequestOptions, ResponseOptions } from "node-mocks-http";
import { ApolloServer as ApolloServerLambda } from "apollo-server-lambda";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { MongoClient } from "mongodb";
import { createTestClient } from "apollo-server-testing";
import { resolvers } from "../resolvers";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import { DatabaseDataSource } from "../sources/database";
import type { Options, StringOrAst, TestQuery } from "../types";
import { CognitoDataSource } from "../sources/cognito";
import { REGION } from "../configs/cognito";

const mockRequest = (options: RequestOptions = {}): any => httpMocks.createRequest({
  method: "POST",
  ...options,
});

const mockResponse = (options: ResponseOptions = {}) => httpMocks.createResponse(options);

export const mockRequestOptions: any = {};

export const mockResponseOptions: any = {};

const typesArray = loadFilesSync(join(__dirname, "../schemas"));

const typeDefs = mergeTypeDefs(typesArray);

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export const schemaWithMiddleware = applyMiddleware(
  schema,
);

export class ApolloTestServer {
  private readonly _mongodbConnection;
  private readonly _mongodbClient;
  private readonly _apolloServer;
  private readonly _apolloClient;
  private readonly _cognitoIdentityProvider;
  private readonly _cognitoIdentityServiceProvider;

  constructor () {
    // Initialize apollo server and test client
    this._apolloServer = this._createServer();
    this._apolloClient = createTestClient(this._apolloServer);

    // Initialize memory mongo db
    const [mongodbConnection, mongodbClient] = this._initializeMongoDB();
    this._mongodbConnection = mongodbConnection;
    this._mongodbClient = mongodbClient;

    // Initialize cognito
    this._cognitoIdentityProvider = new CognitoIdentityProvider({ region: REGION });
    this._cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ apiVersion: "2016-04-18", region: REGION });
  }

  get mongoodbConnection () {
    return this._mongodbConnection;
  }

  get mongodbClient () {
    return this._mongodbClient;
  }

  get apolloServer () {
    return this._apolloServer;
  }

  get apolloClient () {
    return this._apolloClient;
  }

  private _initializeMongoDB () {
    const mongodbConnection = MongoClient.connect(process.env.MONGO_URL);
    const mongodbClient = mongodbConnection.then(client => client.db());
    return [mongodbConnection, mongodbClient];
  }

  private _createServer () {
    const apolloServer = new ApolloServerLambda({
      schema: schemaWithMiddleware,
      dataSources: () => ({
        db: new DatabaseDataSource(this._mongodbClient),
        cognito: new CognitoDataSource(this._cognitoIdentityProvider, this._cognitoIdentityServiceProvider),
      }),
      context: ctx => ({ ...mockRequestOptions })
    });
    return apolloServer;
  }

  test: TestQuery = async <T extends object = Record<string, unknown>, V extends object = Record<string, unknown>>(
    operation: StringOrAst,
    { variables }: Options<V> = {},
  ) => {
    const req = mockRequest(mockRequestOptions);
    const res = mockResponse(mockResponseOptions);

    const graphQLOptions = await this._apolloServer.createGraphQLServerOptions(req, res);

    const { graphqlResponse } = await runHttpQuery([req, res], {
      method: "POST",
      options: graphQLOptions,
      query: {
        // operation can be a string or an AST, but `runHttpQuery` only accepts a string
        query: typeof operation === "string" ? operation : print(operation),
        variables,
      },
      request: convertNodeHttpToRequest(req),
    });

    return JSON.parse(graphqlResponse) as T;
  };
}
