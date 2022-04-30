import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { isTest } from "./configs/environment";

const uri = isTest ? process.env.MONGO_URL : `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@quick.075mz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: isTest ? null : ServerApiVersion.v1
};

const connection = MongoClient.connect(uri, options);

export async function getMongodbClient () {
  return connection.then(client => client.db());
}

export function getMongodbConnectionWithClient () {
  const client = connection.then(client => client.db());
  return [connection, client];
}

export const toId = (key: string | ObjectId | unknown) => {
  if (typeof key === "string" && key.length === 24 && ObjectId.isValid(key)) {
    return new ObjectId(key);
  } else {
    return key;
  }
};
