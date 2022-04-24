import { client, DB_NAME } from "/opt/db";
import { response } from "/opt/response";
import { CHANNELS_COLLECTION } from "/opt/configs/collections";

export async function remove (event) {
  const myConnectionId = event?.requestContext?.connectionId;

  try {
    await client.connect();
    const collection = client.db(DB_NAME).collection(CHANNELS_COLLECTION);
    const channel = await collection.findOne({
      name: "public"
    });

    if (channel) {
      await collection.updateOne({ name: "public" }, { $pull: { connections: myConnectionId }});
    }
  } catch (e) {
    console.log(e);
  }

  client.close();
  return response(200, "disconnected");
}