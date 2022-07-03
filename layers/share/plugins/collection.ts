import { ObjectId } from "mongodb";
import { toId } from "../utils/db";
import { DatabasePluginInterface } from "./interfaces";
import { ASC } from "../configs/orders";
import { createMatchFromOperators } from "../utils/operators";
import type { Db } from "mongodb";

export interface ItemChangeParams {
  where?: any;
  field?: string;
  operation?: string;
  timeout?: number;
}

export class CollectionPlugin implements DatabasePluginInterface {
  private readonly _dbClient: Db;
  private readonly _collection: string;
  private readonly _streamsEnabled: boolean;

  constructor(dbClient: any, streamsEnabled: boolean, collection: string) {
    this._dbClient = dbClient;
    this._collection = collection;
    this._streamsEnabled = streamsEnabled;
  }

  async create({ input }: any) {
    // get db client
    const db = await this._dbClient;

    // create new record
    const newRecord = {
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db
      .collection(this._collection)
      .insertOne(newRecord)
      .then((r) => r.insertedId);

    // get new record
    // return newRecord;
    return (await db.collection(this._collection).findOne(newRecord)) as any;
  }

  async read({ where = {} as any }) {
    // get db client
    const db = await this._dbClient;

    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);

    // get records
    return (await db.collection(this._collection).findOne(match)) as any;
  }

  async readByMany({ list = [], key = "_id" }) {
    // get db client
    const db = await this._dbClient;

    // prepare query params
    if (key === "_id") {
      list = list.map((id) => toId(id)) as any;
    }

    return await db
      .collection(this._collection)
      .find({ [key]: { $in: list } })
      .toArray();
  }

  async readMany({ where = {} as any, order = ASC, first = 0, offset = 0, after = "", sortBy = "_id" }) {
    // aggregation pipeline
    const pipeline = [];

    // get db client
    const db = await this._dbClient;

    // sort stage
    const sortOrder = order === ASC ? 1 : -1;
    const sortStage = { $sort: { [sortBy]: sortOrder } };
    pipeline.push(sortStage);

    // match stage
    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);
    if (Object.keys(match).length !== 0) {
      const matchStage = { $match: match };
      pipeline.push(matchStage);
    }

    // group stage
    const groupStage = {
      $group: {
        _id: null,
        count: { $sum: 1 },
        data: { $push: "$$ROOT" },
        first: { $first: "$_id" },
      },
    };
    pipeline.push(groupStage);

    // after stage
    if (after) {
      // convert after from base64 string to original id
      const afterBase64 = Buffer.from(after, "base64").toString();

      // less and greater than depends on order
      const sortCond = order === ASC ? "$gt" : "$lt";

      // const value = objectIdFields[sortBy] ? new ObjectId(afterBase64) : afterBase64;
      const value = ObjectId.isValid(afterBase64) ? new ObjectId(afterBase64) : afterBase64;

      const cond = {
        [sortCond]: [`$$item.${sortBy}`, value],
      };

      const afterStage = {
        $project: {
          first: "$first",
          count: "$count",
          data: {
            $filter: {
              input: "$data",
              as: "item",
              cond,
            },
          },
        },
      };

      pipeline.push(afterStage);
    }

    // pagination stage
    const skip = offset || 0;
    const limit = first ? first + 1 : "$count";

    const paginationStage = {
      $project: {
        first: "$first",
        count: "$count",
        data: { $slice: ["$data", skip, limit] },
      },
    };

    pipeline.push(paginationStage);

    // execute query
    const dbResponse = await db.collection(this._collection).aggregate(pipeline).next();

    return {
      data: dbResponse?.data || [],
      totalCount: dbResponse?.count || 0,
      firstRecordId: dbResponse?.first || {},
    };
  }

  async update({ where = {} as any, input = {} }) {
    // get db client
    const db = await this._dbClient;

    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);

    // get records
    const dbResponse = await db.collection(this._collection).findOneAndUpdate(
      match,
      {
        $set: {
          ...input,
          updatedAt: new Date().toISOString(),
        },
      },
      {
        returnDocument: "after",
      },
    );

    return dbResponse?.value as any;
  }

  async delete({ where = {} as any }) {
    // get db client
    const db = await this._dbClient;

    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);

    // find record with filter
    const dbResponse: any = await db.collection(this._collection).findOne(match);

    // prepare delete id
    const id = new ObjectId(dbResponse?._id);

    // delete record from db
    const count = await db
      .collection(this._collection)
      .deleteOne({ _id: id })
      .then((r) => r.deletedCount);

    return count;
  }

  async deleteMany({ where = {} as any }) {
    try {
      // get db client
      const db = await this._dbClient;

      // create match based on operators _eq and _regex
      const match = createMatchFromOperators(where);

      // delete records from db
      const count = await db
        .collection(this._collection)
        .deleteMany(match)
        .then((r) => r.deletedCount);

      return count;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }
}
