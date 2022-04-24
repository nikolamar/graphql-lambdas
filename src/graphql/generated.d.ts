import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
  ObjectId: any;
};

export type BooleanMatchOperators = {
  _eq?: InputMaybe<Scalars['Boolean']>;
  _regex?: InputMaybe<Scalars['Boolean']>;
};

export type Challenge = {
  __typename?: 'Challenge';
  accessToken?: Maybe<Scalars['String']>;
  challengeName?: Maybe<Scalars['String']>;
  idToken?: Maybe<Scalars['String']>;
  refreshToken?: Maybe<Scalars['String']>;
  session?: Maybe<Scalars['String']>;
};

export type Cognito = {
  __typename?: 'Cognito';
  clientId: Scalars['String'];
  poolId: Scalars['String'];
};

export type CreateTenantInput = {
  accentColor: Scalars['String'];
  address?: InputMaybe<Scalars['String']>;
  color: Scalars['String'];
  email?: InputMaybe<Scalars['String']>;
  logoUrl?: InputMaybe<Scalars['String']>;
  name: Scalars['String'];
  phone?: InputMaybe<Scalars['String']>;
  status: Scalars['String'];
  website?: InputMaybe<Scalars['String']>;
};

export type CreateUserInput = {
  email: Scalars['String'];
  password?: InputMaybe<Scalars['String']>;
  role: Scalars['String'];
  tenantId: Scalars['ObjectId'];
  termsAndConditionsMetaData?: InputMaybe<TermsAndConditionsMetaDataInput>;
};

export type Db = {
  __typename?: 'DB';
  password: Scalars['String'];
  user: Scalars['String'];
};

export type DateMatchOperators = {
  _eq?: InputMaybe<Scalars['String']>;
  _gte?: InputMaybe<Scalars['String']>;
  _lte?: InputMaybe<Scalars['String']>;
};

export type IntMatchOperators = {
  _eq?: InputMaybe<Scalars['Int']>;
  _regex?: InputMaybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  challengeNewPassword: Tokens;
  createTenant: Tenant;
  createUser: User;
  deleteManyTenants: Scalars['Int'];
  deleteManyUsers: Scalars['Int'];
  deleteTenant: Scalars['Int'];
  deleteUser: Scalars['Int'];
  sendMessage: Scalars['String'];
  setUserMfaPreference: Scalars['Boolean'];
  updateMfaAuthPreference?: Maybe<User>;
  updateTenant: Tenant;
  updateUser: User;
  userPasswordAuth: Challenge;
  validateMfaCode: Scalars['Boolean'];
};


export type MutationChallengeNewPasswordArgs = {
  clientId: Scalars['String'];
  newPassword: Scalars['String'];
  session: Scalars['String'];
  username: Scalars['String'];
};


export type MutationCreateTenantArgs = {
  input: CreateTenantInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationDeleteManyTenantsArgs = {
  where: TenantFilter;
};


export type MutationDeleteManyUsersArgs = {
  where: UserFilter;
};


export type MutationDeleteTenantArgs = {
  where: TenantFilter;
};


export type MutationDeleteUserArgs = {
  where: UserFilter;
};


export type MutationSendMessageArgs = {
  connectionId: Scalars['String'];
  message: Scalars['String'];
};


export type MutationSetUserMfaPreferenceArgs = {
  isMFAEnabled: Scalars['Boolean'];
};


export type MutationUpdateMfaAuthPreferenceArgs = {
  email: Scalars['String'];
  isMFAEnabled: Scalars['Boolean'];
};


export type MutationUpdateTenantArgs = {
  input: UpdateTenantInput;
  where: TenantFilter;
};


export type MutationUpdateUserArgs = {
  input: UpdateUserInput;
  where: UserFilter;
};


export type MutationUserPasswordAuthArgs = {
  clientId: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationValidateMfaCodeArgs = {
  verificationCode: Scalars['String'];
};

export type Node = {
  _id: Scalars['ObjectId'];
  createdAt: Scalars['DateTime'];
  updatedAt: Scalars['DateTime'];
};

export type ObjectIdMatchOperators = {
  _eq?: InputMaybe<Scalars['ObjectId']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['ObjectId']>>>;
};

export enum Order {
  Asc = 'asc',
  Desc = 'desc'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  count?: Maybe<Scalars['Int']>;
  endCursor?: Maybe<Scalars['String']>;
  hasNextPage?: Maybe<Scalars['Boolean']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']>;
  startCursor?: Maybe<Scalars['String']>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  cognito: Cognito;
  db: Db;
  env?: Maybe<Scalars['String']>;
  me?: Maybe<User>;
  mfaAuthUrl: Scalars['String'];
  mfaStatus: Scalars['Boolean'];
  ping: Scalars['String'];
  stage?: Maybe<Scalars['String']>;
  tenant?: Maybe<Tenant>;
  tenants: Tenants;
  user?: Maybe<User>;
  users: Users;
  version?: Maybe<Scalars['String']>;
};


export type QueryTenantArgs = {
  where: TenantFilter;
};


export type QueryTenantsArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Order>;
  sortBy?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<TenantFilter>;
};


export type QueryUserArgs = {
  where: UserFilter;
};


export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']>;
  first?: InputMaybe<Scalars['Int']>;
  offset?: InputMaybe<Scalars['Int']>;
  order?: InputMaybe<Order>;
  sortBy?: InputMaybe<Scalars['String']>;
  where?: InputMaybe<UserFilter>;
};

export type StringMatchOperators = {
  _eq?: InputMaybe<Scalars['String']>;
  _in?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  _regex?: InputMaybe<Scalars['String']>;
};

export type Tenant = Node & {
  __typename?: 'Tenant';
  _id: Scalars['ObjectId'];
  accentColor?: Maybe<Scalars['String']>;
  address?: Maybe<Scalars['String']>;
  color?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email?: Maybe<Scalars['String']>;
  logoUrl?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
  updatedAt: Scalars['DateTime'];
  website?: Maybe<Scalars['String']>;
};

export type TenantEdge = {
  __typename?: 'TenantEdge';
  cursor: Scalars['String'];
  node: Tenant;
};

export type TenantFilter = {
  _id?: InputMaybe<StringMatchOperators>;
  _or?: InputMaybe<Array<TenantFilter>>;
  accentColor?: InputMaybe<StringMatchOperators>;
  address?: InputMaybe<StringMatchOperators>;
  color?: InputMaybe<StringMatchOperators>;
  createdAt?: InputMaybe<DateMatchOperators>;
  email?: InputMaybe<StringMatchOperators>;
  logoUrl?: InputMaybe<StringMatchOperators>;
  name?: InputMaybe<StringMatchOperators>;
  phone?: InputMaybe<StringMatchOperators>;
  status?: InputMaybe<StringMatchOperators>;
  updatedAt?: InputMaybe<DateMatchOperators>;
  website?: InputMaybe<StringMatchOperators>;
};

export type Tenants = {
  __typename?: 'Tenants';
  edges: Array<Maybe<TenantEdge>>;
  pageInfo?: Maybe<PageInfo>;
};

export type TermsAndConditionsMetaData = {
  __typename?: 'TermsAndConditionsMetaData';
  accepted: Scalars['Boolean'];
  version: Scalars['Int'];
};

export type TermsAndConditionsMetaDataInput = {
  accepted?: InputMaybe<Scalars['Boolean']>;
  version?: InputMaybe<Scalars['Int']>;
};

export type Tokens = {
  __typename?: 'Tokens';
  accessToken: Scalars['String'];
  idToken: Scalars['String'];
  refreshToken: Scalars['String'];
};

export type UpdateTenantInput = {
  accentColor?: InputMaybe<Scalars['String']>;
  address?: InputMaybe<Scalars['String']>;
  color?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  logoUrl?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
  phone?: InputMaybe<Scalars['String']>;
  status?: InputMaybe<Scalars['String']>;
  website?: InputMaybe<Scalars['String']>;
};

export type UpdateUserInput = {
  active?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  emailVerified?: InputMaybe<Scalars['Boolean']>;
  isMFAEnabled?: InputMaybe<Scalars['Boolean']>;
  lastLogin?: InputMaybe<Scalars['String']>;
  role?: InputMaybe<Scalars['String']>;
  sub?: InputMaybe<Scalars['String']>;
  tenantId?: InputMaybe<Scalars['ObjectId']>;
  tenantName?: InputMaybe<Scalars['String']>;
  termsAndConditionsMetaData?: InputMaybe<TermsAndConditionsMetaDataInput>;
};

export type User = Node & {
  __typename?: 'User';
  _id: Scalars['ObjectId'];
  active?: Maybe<Scalars['String']>;
  createdAt: Scalars['DateTime'];
  email?: Maybe<Scalars['String']>;
  emailVerified?: Maybe<Scalars['Boolean']>;
  isMFAEnabled?: Maybe<Scalars['Boolean']>;
  lastLogin?: Maybe<Scalars['String']>;
  role?: Maybe<Scalars['String']>;
  sub?: Maybe<Scalars['String']>;
  tenant?: Maybe<Tenant>;
  tenantId?: Maybe<Scalars['String']>;
  termsAndConditionsMetaData?: Maybe<TermsAndConditionsMetaData>;
  updatedAt: Scalars['DateTime'];
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String'];
  node: User;
};

export type UserFilter = {
  _id?: InputMaybe<StringMatchOperators>;
  _or?: InputMaybe<Array<UserFilter>>;
  active?: InputMaybe<StringMatchOperators>;
  createdAt?: InputMaybe<DateMatchOperators>;
  email?: InputMaybe<StringMatchOperators>;
  emailVerified?: InputMaybe<BooleanMatchOperators>;
  isMFAEnabled?: InputMaybe<BooleanMatchOperators>;
  lastLogin?: InputMaybe<StringMatchOperators>;
  role?: InputMaybe<StringMatchOperators>;
  sub?: InputMaybe<StringMatchOperators>;
  tenantId?: InputMaybe<StringMatchOperators>;
  tenantName?: InputMaybe<StringMatchOperators>;
  updatedAt?: InputMaybe<DateMatchOperators>;
};

export type Users = {
  __typename?: 'Users';
  edges: Array<Maybe<UserEdge>>;
  pageInfo?: Maybe<PageInfo>;
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BooleanMatchOperators: BooleanMatchOperators;
  Challenge: ResolverTypeWrapper<Challenge>;
  Cognito: ResolverTypeWrapper<Cognito>;
  CreateTenantInput: CreateTenantInput;
  CreateUserInput: CreateUserInput;
  DB: ResolverTypeWrapper<Db>;
  DateMatchOperators: DateMatchOperators;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  IntMatchOperators: IntMatchOperators;
  Mutation: ResolverTypeWrapper<{}>;
  Node: ResolversTypes['Tenant'] | ResolversTypes['User'];
  ObjectId: ResolverTypeWrapper<Scalars['ObjectId']>;
  ObjectIdMatchOperators: ObjectIdMatchOperators;
  Order: Order;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  StringMatchOperators: StringMatchOperators;
  Tenant: ResolverTypeWrapper<Tenant>;
  TenantEdge: ResolverTypeWrapper<TenantEdge>;
  TenantFilter: TenantFilter;
  Tenants: ResolverTypeWrapper<Tenants>;
  TermsAndConditionsMetaData: ResolverTypeWrapper<TermsAndConditionsMetaData>;
  TermsAndConditionsMetaDataInput: TermsAndConditionsMetaDataInput;
  Tokens: ResolverTypeWrapper<Tokens>;
  UpdateTenantInput: UpdateTenantInput;
  UpdateUserInput: UpdateUserInput;
  User: ResolverTypeWrapper<User>;
  UserEdge: ResolverTypeWrapper<UserEdge>;
  UserFilter: UserFilter;
  Users: ResolverTypeWrapper<Users>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  BooleanMatchOperators: BooleanMatchOperators;
  Challenge: Challenge;
  Cognito: Cognito;
  CreateTenantInput: CreateTenantInput;
  CreateUserInput: CreateUserInput;
  DB: Db;
  DateMatchOperators: DateMatchOperators;
  DateTime: Scalars['DateTime'];
  Int: Scalars['Int'];
  IntMatchOperators: IntMatchOperators;
  Mutation: {};
  Node: ResolversParentTypes['Tenant'] | ResolversParentTypes['User'];
  ObjectId: Scalars['ObjectId'];
  ObjectIdMatchOperators: ObjectIdMatchOperators;
  PageInfo: PageInfo;
  Query: {};
  String: Scalars['String'];
  StringMatchOperators: StringMatchOperators;
  Tenant: Tenant;
  TenantEdge: TenantEdge;
  TenantFilter: TenantFilter;
  Tenants: Tenants;
  TermsAndConditionsMetaData: TermsAndConditionsMetaData;
  TermsAndConditionsMetaDataInput: TermsAndConditionsMetaDataInput;
  Tokens: Tokens;
  UpdateTenantInput: UpdateTenantInput;
  UpdateUserInput: UpdateUserInput;
  User: User;
  UserEdge: UserEdge;
  UserFilter: UserFilter;
  Users: Users;
};

export type ChallengeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Challenge'] = ResolversParentTypes['Challenge']> = {
  accessToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  challengeName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  idToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  refreshToken?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  session?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CognitoResolvers<ContextType = any, ParentType extends ResolversParentTypes['Cognito'] = ResolversParentTypes['Cognito']> = {
  clientId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  poolId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type DbResolvers<ContextType = any, ParentType extends ResolversParentTypes['DB'] = ResolversParentTypes['DB']> = {
  password?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type MutationResolvers<ContextType = any, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  challengeNewPassword?: Resolver<ResolversTypes['Tokens'], ParentType, ContextType, RequireFields<MutationChallengeNewPasswordArgs, 'clientId' | 'newPassword' | 'session' | 'username'>>;
  createTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType, RequireFields<MutationCreateTenantArgs, 'input'>>;
  createUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationCreateUserArgs, 'input'>>;
  deleteManyTenants?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteManyTenantsArgs, 'where'>>;
  deleteManyUsers?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteManyUsersArgs, 'where'>>;
  deleteTenant?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteTenantArgs, 'where'>>;
  deleteUser?: Resolver<ResolversTypes['Int'], ParentType, ContextType, RequireFields<MutationDeleteUserArgs, 'where'>>;
  sendMessage?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationSendMessageArgs, 'connectionId' | 'message'>>;
  setUserMfaPreference?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationSetUserMfaPreferenceArgs, 'isMFAEnabled'>>;
  updateMfaAuthPreference?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<MutationUpdateMfaAuthPreferenceArgs, 'email' | 'isMFAEnabled'>>;
  updateTenant?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType, RequireFields<MutationUpdateTenantArgs, 'input' | 'where'>>;
  updateUser?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<MutationUpdateUserArgs, 'input' | 'where'>>;
  userPasswordAuth?: Resolver<ResolversTypes['Challenge'], ParentType, ContextType, RequireFields<MutationUserPasswordAuthArgs, 'clientId' | 'password' | 'username'>>;
  validateMfaCode?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationValidateMfaCodeArgs, 'verificationCode'>>;
};

export type NodeResolvers<ContextType = any, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  __resolveType: TypeResolveFn<'Tenant' | 'User', ParentType, ContextType>;
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
};

export interface ObjectIdScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['ObjectId'], any> {
  name: 'ObjectId';
}

export type PageInfoResolvers<ContextType = any, ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo']> = {
  count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = any, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  cognito?: Resolver<ResolversTypes['Cognito'], ParentType, ContextType>;
  db?: Resolver<ResolversTypes['DB'], ParentType, ContextType>;
  env?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  me?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  mfaAuthUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mfaStatus?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  ping?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  stage?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType, RequireFields<QueryTenantArgs, 'where'>>;
  tenants?: Resolver<ResolversTypes['Tenants'], ParentType, ContextType, Partial<QueryTenantsArgs>>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryUserArgs, 'where'>>;
  users?: Resolver<ResolversTypes['Users'], ParentType, ContextType, Partial<QueryUsersArgs>>;
  version?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type TenantResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tenant'] = ResolversParentTypes['Tenant']> = {
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  accentColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  color?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  logoUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TenantEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['TenantEdge'] = ResolversParentTypes['TenantEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Tenant'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TenantsResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tenants'] = ResolversParentTypes['Tenants']> = {
  edges?: Resolver<Array<Maybe<ResolversTypes['TenantEdge']>>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TermsAndConditionsMetaDataResolvers<ContextType = any, ParentType extends ResolversParentTypes['TermsAndConditionsMetaData'] = ResolversParentTypes['TermsAndConditionsMetaData']> = {
  accepted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  version?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TokensResolvers<ContextType = any, ParentType extends ResolversParentTypes['Tokens'] = ResolversParentTypes['Tokens']> = {
  accessToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  idToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  refreshToken?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = any, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  _id?: Resolver<ResolversTypes['ObjectId'], ParentType, ContextType>;
  active?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  email?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailVerified?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isMFAEnabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  lastLogin?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  sub?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tenant?: Resolver<Maybe<ResolversTypes['Tenant']>, ParentType, ContextType>;
  tenantId?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  termsAndConditionsMetaData?: Resolver<Maybe<ResolversTypes['TermsAndConditionsMetaData']>, ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserEdgeResolvers<ContextType = any, ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge']> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UsersResolvers<ContextType = any, ParentType extends ResolversParentTypes['Users'] = ResolversParentTypes['Users']> = {
  edges?: Resolver<Array<Maybe<ResolversTypes['UserEdge']>>, ParentType, ContextType>;
  pageInfo?: Resolver<Maybe<ResolversTypes['PageInfo']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = any> = {
  Challenge?: ChallengeResolvers<ContextType>;
  Cognito?: CognitoResolvers<ContextType>;
  DB?: DbResolvers<ContextType>;
  DateTime?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  ObjectId?: GraphQLScalarType;
  PageInfo?: PageInfoResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Tenant?: TenantResolvers<ContextType>;
  TenantEdge?: TenantEdgeResolvers<ContextType>;
  Tenants?: TenantsResolvers<ContextType>;
  TermsAndConditionsMetaData?: TermsAndConditionsMetaDataResolvers<ContextType>;
  Tokens?: TokensResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  Users?: UsersResolvers<ContextType>;
};

