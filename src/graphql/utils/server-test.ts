import AWS from "aws-sdk";
import { join } from "path";
import { print } from "graphql";
import { convertNodeHttpToRequest, runHttpQuery } from "apollo-server-core";
import httpMocks, { RequestOptions, ResponseOptions } from "node-mocks-http";
import { ApolloServer as ApolloServerLambda } from "apollo-server-lambda";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { applyMiddleware } from "graphql-middleware";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import { REGION } from "/opt/configs/cognito";
import { resolvers } from "../resolvers";
import { DatabaseDataSource } from "../sources/database";
import type { Options, StringOrAst, TestQuery } from "../types";
import { CognitoDataSource } from "../sources/cognito";

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
  private readonly _dbConnection;
  private readonly _dbClient;
  private readonly _apolloServer;
  private readonly _cognitoIdentityProvider;
  private readonly _cognitoIdentityServiceProvider;

  constructor (connection, client) {
    // Initialize apollo server and test client
    this._apolloServer = this._createServer();

    // Initialize memory mongo db
    this._dbConnection = connection;
    this._dbClient = client;

    // Initialize cognito
    this._cognitoIdentityProvider = new CognitoIdentityProvider({ region: REGION });
    this._cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({ apiVersion: "2016-04-18", region: REGION });
  }

  get dbConnection () {
    return this._dbConnection;
  }

  private _createServer () {
    const apolloServer = new ApolloServerLambda({
      schema: schemaWithMiddleware,
      dataSources: () => ({
        db: new DatabaseDataSource(this._dbClient),
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
