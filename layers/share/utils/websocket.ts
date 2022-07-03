import AWS from "aws-sdk";

const endpoint = `${process.env.WEBSOCKETE_API_ID}.execute-api.${process.env.REGION}.amazonaws.com/${process.env.STAGE}`;

export const sendMessage = async function (connectionId: string, route: string, data: any) {
  const params = {
    ConnectionId: connectionId,
    Data: Buffer.from(JSON.stringify({ route, ...data })),
  };

  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint,
  });

  return apigwManagementApi.postToConnection(params).promise();
};

export const ROUTES = {
  PING: "ping",
  CONNECTION: "connection",
  MESSAGE: "message",
};
