import { DataSource } from "apollo-datasource";
import { TENANTS_COLLECTION, USERS_COLLECTION } from "../configs/collections";
import { getMongodbClient } from "../utils/db";
import {
  MutationCreateTenantArgs,
  MutationCreateUserArgs,
  MutationDeleteManyTenantsArgs,
  MutationDeleteManyUsersArgs,
  MutationDeleteTenantArgs,
  MutationDeleteUserArgs,
  MutationUpdateTenantArgs,
  MutationUpdateUserArgs,
  QueryTenantArgs,
  QueryTenantsArgs,
  QueryUserArgs,
  QueryUsersArgs,
} from "/opt/schemas/generated";
import { CollectionPlugin } from "../plugins/collection";
import { DataLoaderPlugin } from "../plugins/data-loader";
import type { Db } from "mongodb";

export class DatabaseDataSource extends DataSource {
  private _dbClient: Db;

  public dataLoader: DataLoaderPlugin;

  constructor(dbClient = null as any) {
    super();
    this._dbClient = dbClient;
    this.dataLoader = new DataLoaderPlugin(this);
  }

  async initialize(): Promise<void> {
    if (this._dbClient) {
      return;
    }

    try {
      this._dbClient = await getMongodbClient();
    } catch (e) {
      console.log(`Could not get db client. Err: ${e}`);
    }
  }

  user(args: QueryUserArgs) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.read(args);
  }

  users(args: QueryUsersArgs) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.readMany(args as any);
  }

  usersByMany(args: { list: string[]; key?: string }) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.readByMany(args as any);
  }

  createUser(args: MutationCreateUserArgs) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.create(args);
  }

  updateUser(args: MutationUpdateUserArgs) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.update(args);
  }

  deleteUser(args: MutationDeleteUserArgs) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.delete(args);
  }

  deleteManyUsers(args: MutationDeleteManyUsersArgs) {
    const collection = new CollectionPlugin(this._dbClient, USERS_COLLECTION);
    return collection.deleteMany(args);
  }

  tenant(args: QueryTenantArgs) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.read(args);
  }

  tenants(args: QueryTenantsArgs) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.readMany(args as any);
  }

  tenantsByMany(args: { list: string[]; key?: string }) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.readByMany(args as any);
  }

  createTenant(args: MutationCreateTenantArgs) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.create(args);
  }

  updateTenant(args: MutationUpdateTenantArgs) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.update(args);
  }

  deleteTenant(args: MutationDeleteTenantArgs) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.delete(args);
  }

  deleteManyTenants(args: MutationDeleteManyTenantsArgs) {
    const collection = new CollectionPlugin(this._dbClient, TENANTS_COLLECTION);
    return collection.deleteMany(args);
  }
}
