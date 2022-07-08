import type { CognitoDataSource } from "/opt/datasources/cognito";
import type { Express } from "express";
import type { KeyValueCache } from "apollo-server-core";

export type StringOrAst = string | DocumentNode;

export type Options<T extends object> = { variables?: T };

export type TestQuery = <T extends object = Record<string, unknown>, V extends object = Record<string, unknown>>(
  operation: StringOrAst,
  options?: Options<V>,
) => Promise<ExecutionResult<T>>;

export interface DataSourceConfig<TContext = any> {
  context: TContext;
  cache: KeyValueCache;
}

export type DataSources = {
  cognito: CognitoDataSource;
};

export type Context = {
  dataSources: DataSources;
  stage: string;
  functionName: string;
  expressRequest: Express.Request;
  headers: {
    host: string;
    accesstoken: string;
  };
};
