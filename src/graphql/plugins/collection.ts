import { ObjectId } from "mongodb";
import { DatabasePluginInterface } from "../interfaces";
import { ASC } from "../configs/orders";
import { createMatchFromOperators } from "../utils/operators";
import { toId } from "/opt/db";
import type { Db } from "mongodb";

// TODO: FIXME
const objectIdFields = {
  _id: 1,
  tenantId: 1,
  flowId: 1,
  credentialTemplateId: 1,
  proofRequestTemplateId: 1,
};

export interface ItemChangeParams {
  where?: any
  field?: string
  operation?: string
  timeout?: number,
}

export class CollectionPlugin implements DatabasePluginInterface {
  private readonly _dbClient: Db;
  private readonly _collection: string;
  private readonly _streamsEnabled: boolean;

  constructor (dbClient, streamsEnabled, collection) {
    this._dbClient = dbClient;
    this._collection = collection;
    this._streamsEnabled = streamsEnabled;
  }

  async create ({ input }) {
    // get db client
    const db = await this._dbClient;

    // create new record
    await db.collection(this._collection)
      .insertOne({
        ...input,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .then(r => r.insertedId);

    // get new record
    return await db.collection(this._collection).findOne(input) as any;
  }

  async read ({ where = {} as any }) {
    // get db client
    const db = await this._dbClient;

    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);

    // get records
    return await db.collection(this._collection).findOne(match) as any;
  }

  async readByMany ({ list = [], key = "_id" }) {
    // get db client
    const db = await this._dbClient;

    // prepare query params
    if (key === "_id") {
      list = list.map(id => toId(id));
    }

    return await db.collection(this._collection)
      .find({ [key]: { $in: list } })
      .toArray();
  }

  async readMany ({ where = {} as any, order = ASC, first = 0, offset = 0, after = "", sortBy = "_id" }) {
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

      // const value = ObjectId.isValid(afterBase64) ? new ObjectId(afterBase64) : afterBase64
      const value = objectIdFields[sortBy] ? new ObjectId(afterBase64) : afterBase64;

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
      firstRecord: dbResponse?.first || {},
    };
  }

  async update ({ where = {} as any, input = {} }) {
    // get db client
    const db = await this._dbClient;

    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);

    // get records
    const dbResponse = await db.collection(this._collection)
      .findOneAndUpdate(
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

  async delete ({ where = {} as any }) {
    // get db client
    const db = await this._dbClient;

    // create match based on operators _eq and _regex
    const match = createMatchFromOperators(where);

    // find record with filter
    const dbResponse = await db.collection(this._collection).findOne(match);

    // prepare delete id
    const id = new ObjectId(dbResponse?._id);

    // delete record from db
    const count = await db.collection(this._collection)
      .deleteOne({ _id: id })
      .then(r => r.deletedCount);

    return count;
  }

  async deleteMany ({ where = {} as any }) {
    try {
      // get db client
      const db = await this._dbClient;

      // create match based on operators _eq and _regex
      const match = createMatchFromOperators(where);

      // delete records from db
      const count = await db.collection(this._collection)
        .deleteMany(match)
        .then(r => r.deletedCount);

      return count;
    } catch (err) {
      console.log(err);
      return 0;
    }
  }

  async waitChange ({ where, field, operation = "update", timeout = 100000 }: ItemChangeParams) {
    const db = await this._dbClient;

    const conditions: any[] = [{ operationType: operation }];

    let result;

    if (this._streamsEnabled) {
      // use change streams
      if (where) {
        const whereCondition = {};
        Object.keys(where).forEach((key, index) => {
          whereCondition[`fullDocument.${key}`] = where[key];
        });
        conditions.push(whereCondition);
      }
      if (field) {
        conditions.push({ [`updateDescription.updatedFields.${field}`]: { $exists: true } });
      }

      const filter = [{
        $match: {
          $and: conditions,
        },
      }];

      const changeStream = db.collection(this._collection)
        .watch(
          filter,
          {
            fullDocument: "updateLookup",
          },
        );

      result = await Promise.race([
        changeStream.next().then(result => result?.fullDocument),
        new Promise((resolve, reject) => {
          setTimeout(resolve, timeout, null);
        }),
      ]);

      await changeStream.close();
    } else {
      // change streams cannot be used -> for instance local development -> use db polling
      const getDocument = () =>
        new Promise((resolve) => {
          const interval = setInterval(async () => {
            const doc = await db.collection(this._collection).findOne(where);

            if (doc?.[field.toString()]) {
              result = doc;
            }

            if (result) {
              clearInterval(interval);
              resolve(true);
            }
          }, 1000);
        });

      await getDocument();
    }
    return result;
  }
}
