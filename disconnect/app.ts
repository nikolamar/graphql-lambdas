import { getMongodbClient } from "/opt/utils/db";
import { response } from "/opt/utils/response";
import { CHANNELS_COLLECTION } from "/opt/configs/collections";

export async function handler(event) {
  const myConnectionId = event?.requestContext?.connectionId;

  try {
    const client = await getMongodbClient();
    const collection = client.collection(CHANNELS_COLLECTION);
    const channel = await collection.findOne({
      name: "public",
    });

    if (channel) {
      await collection.updateOne(
        { name: "public" },
        { $pull: { connections: myConnectionId } }
      );
    }
  } catch (e) {
    console.log(e);
  }

  return response(200, "disconnected");
}
