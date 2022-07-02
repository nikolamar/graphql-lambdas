import { Auth } from "aws-amplify";
import fs from "fs";
import path from "path";
import { REGION, POOL_ID, CLIENT_ID } from "/opt/configs/cognito";
import { getMongodbConnectionWithClient } from "/opt/utils/db";
import { ApolloTestServer } from "../utils/server-test";
import type { User } from "../generated";

const deleteUserMutation = fs.readFileSync(path.resolve(__dirname, "../../test/mutations/delete-user.graphql"), "utf8");
const signUp = fs.readFileSync(path.resolve(__dirname, "../../test/mutations/sign-up.graphql"), "utf8");

describe("sign-up", () => {
  let user: User;
  let server: ApolloTestServer;

  const adminEmail = "admin.test+0@test.com";

  beforeAll(async () => {
    const [connection, client] = await getMongodbConnectionWithClient();
    server = new ApolloTestServer(connection, client);
    Auth.configure({
      region: REGION,
      userPoolId: POOL_ID,
      userPoolWebClientId: CLIENT_ID,
    });
  });

  afterAll(() => {
    return server.dbConnection.then((mongo) => mongo.close());
  });

  test("sign up", async () => {
    await Auth.signUp({
      username: adminEmail,
      password: "Password01!",
    });

    const response = await server.test(signUp, {
      variables: {
        input: {
          role: "admin",
          email: adminEmail,
        },
      },
    });
    expect(response.errors).toBeUndefined();
    user = response.data.signUp;
    expect(user).not.toBeUndefined();
  });

  test("delete user", async () => {
    const response = await server.test(deleteUserMutation, {
      variables: {
        where: {
          _id: { _eq: user._id },
        },
      },
    });
    expect(response.errors).toBeUndefined();
  });
});
