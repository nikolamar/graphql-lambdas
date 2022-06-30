import { DataSource } from "apollo-datasource";
import { TENANTS_COLLECTION, USERS_COLLECTION } from "/opt/configs/collections";
import { getMongodbClient } from "/opt/utils/db";
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
} from "../generated";
import { CollectionPlugin } from "../plugins/collection";
import { DataLoaderPlugin } from "../plugins/data-loader";
import type { Db } from "mongodb";

export class DatabaseDataSource extends DataSource {
  private _dbClient: Db;
  private _streamsEnabled: boolean;

  public dataLoader: DataLoaderPlugin;

  constructor(dbClient = null) {
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

    // try {
    //   // enable change streams for all collections
    //   await this._dbClient.admin().command({
    //     modifyChangeStreams: 1,
    //     database: "",
    //     collection: "",
    //     enable: true,
    //   });
    //   this._streamsEnabled = true;
    // } catch (e) {
    //   this._streamsEnabled = false;
    //   console.log(`Could not enable change stream. Err: ${e}`);
    // }
  }

  user(args: QueryUserArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.read(args);
  }

  users(args: QueryUsersArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.readMany(args);
  }

  usersByMany(args: { list: string[]; key?: string }) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.readByMany(args);
  }

  createUser(args: MutationCreateUserArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.create(args);
  }

  updateUser(args: MutationUpdateUserArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.update(args);
  }

  deleteUser(args: MutationDeleteUserArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.delete(args);
  }

  deleteManyUsers(args: MutationDeleteManyUsersArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      USERS_COLLECTION
    );
    return collection.deleteMany(args);
  }

  tenant(args: QueryTenantArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.read(args);
  }

  tenants(args: QueryTenantsArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.readMany(args);
  }

  tenantsByMany(args: { list: string[]; key?: string }) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.readByMany(args);
  }

  createTenant(args: MutationCreateTenantArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.create(args);
  }

  updateTenant(args: MutationUpdateTenantArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.update(args);
  }

  deleteTenant(args: MutationDeleteTenantArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.delete(args);
  }

  deleteManyTenants(args: MutationDeleteManyTenantsArgs) {
    const collection = new CollectionPlugin(
      this._dbClient,
      this._streamsEnabled,
      TENANTS_COLLECTION
    );
    return collection.deleteMany(args);
  }
}
