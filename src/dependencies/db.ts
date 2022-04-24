import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@quick.075mz.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const options = {
  // @ts-ignore
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1
};

export const client = new MongoClient(uri, options);

export async function getMongodbClient () {
  const connection = MongoClient.connect(uri, options);
  return connection.then(client => client.db());
}

export const DB_NAME = process.env.DB_NAME;

export const toId = (key: string | ObjectId | unknown) => {
  if (typeof key === "string" && key.length === 24 && ObjectId.isValid(key)) {
    return new ObjectId(key);
  } else {
    return key;
  }
};
