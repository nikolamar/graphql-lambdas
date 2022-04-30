import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";
import { isTest } from "./configs/environment";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@quick.075mz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
};

let connection;

if (!isTest) {
  connection = MongoClient.connect(uri, options);
}

export async function getMongodbClient () {
  if (isTest) {
    connection = MongoClient.connect(uri, options);
  }
  return connection.then(client => client.db());
}

export const toId = (key: string | ObjectId | unknown) => {
  if (typeof key === "string" && key.length === 24 && ObjectId.isValid(key)) {
    return new ObjectId(key);
  } else {
    return key;
  }
};
