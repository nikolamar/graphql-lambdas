import fs from "fs";
import path from "path";
import { CLIENT_ID } from "/opt/configs/cognito";
import { getMongodbConnectionWithClient } from "/opt/utils/db";
import { ApolloTestServer, mockRequestOptions } from "../../utils/server-test";
import type { Challenge, Tenant, User } from "../../generated";

const usersQuery = fs.readFileSync(path.resolve(__dirname, "../../queries/users.graphql"), "utf8");
const mfaStatusQuery = fs.readFileSync(path.resolve(__dirname, "../../queries/mfa-status.graphql"), "utf8");
const createTenantMutation = fs.readFileSync(path.resolve(__dirname, "../../mutations/create-tenant.graphql"), "utf8");
const createUserMutation = fs.readFileSync(path.resolve(__dirname, "../../mutations/create-user.graphql"), "utf8");
const userPasswordAuthMutation = fs.readFileSync(path.resolve(__dirname, "../../mutations/user-password-auth.graphql"), "utf8");
const challengeNewPasswordMutation = fs.readFileSync(path.resolve(__dirname, "../../mutations/challenge-new-password.graphql"), "utf8");
const deleteUserMutation = fs.readFileSync(path.resolve(__dirname, "../../mutations/delete-user.graphql"), "utf8");
const deleteTenantMutation = fs.readFileSync(path.resolve(__dirname, "../../mutations/delete-tenant.graphql"), "utf8");

describe("user resolver", () => {
  let user: User;
  let tenant: Tenant;
  let challenge: Challenge;
  let idToken: string;
  let accessToken: string;
  const usersList: User[] = [];

  let server: ApolloTestServer;

  const adminEmail = "admin.test+1@test.com";

  beforeAll(async () => {
    const [connection, client] = await getMongodbConnectionWithClient();
    server = new ApolloTestServer(connection, client);
  });
  
  afterAll(() => {
    return server.dbConnection.then((mongo) => mongo.close());
  });

  test("create tenant", async () => {
    const response = await server.test(createTenantMutation, {
      variables: { 
        input: {
          name: "Admin Tenant 1",
          status: "active",
          color: "#ffffff",
          accentColor: "#cccccc"
        }
      }
    });
    expect(response.errors).toBeUndefined();
    expect(response.data.createTenant.name).toEqual("Admin Tenant 1");
    expect(response.data.createTenant.status).toEqual("active");
    expect(response.data.createTenant.color).toEqual("#ffffff");
    expect(response.data.createTenant.accentColor).toEqual("#cccccc");
    tenant = response.data.createTenant;
  });
  
  test("create admin user", async () => {
    const response = await server.test(createUserMutation, {
      variables: {
        input: {
          email: adminEmail,
          password: "Password01!",
          role: "admin",
          tenantId: tenant._id,
        }
      }
    });
    expect(response.errors).toBeUndefined();
    user = response.data.createUser;
    expect(user).not.toBeUndefined();
  });

  test("admin user password auth challenge response", async () => {
    const response = await server.test(userPasswordAuthMutation, {
      variables: {
        clientId: CLIENT_ID,
        username: adminEmail,
        password: "Password01!",
      }
    });
    challenge = response.data.userPasswordAuth;
    expect(response.data.userPasswordAuth.challengeName).toEqual("NEW_PASSWORD_REQUIRED");
  });

  test("admin user challenge new password", async () => {
    const response = await server.test(challengeNewPasswordMutation, {
      variables: {
        clientId: CLIENT_ID,
        session: challenge.session,
        username: adminEmail,
        newPassword: "NewPassword01!",
      }
    });
    idToken = response.data.challengeNewPassword.idToken;
    accessToken = response.data.challengeNewPassword.accessToken;
    expect(idToken).not.toBeUndefined();
    expect(accessToken).not.toBeUndefined();
  });

  test("admin user password auth tokens response", async () => {
    const response = await server.test(userPasswordAuthMutation, {
      variables: {
        clientId: CLIENT_ID,
        username: adminEmail,
        password: "NewPassword01!",
      }
    });
    idToken = response.data.userPasswordAuth.idToken;
    accessToken = response.data.userPasswordAuth.accessToken;
    expect(idToken).not.toBeUndefined();
    expect(accessToken).not.toBeUndefined();
  });

  test("admin user mfa status false", async () => {
    mockRequestOptions.headers = {
      IdToken: idToken,
      AccessToken: accessToken
    };
    const response = await server.test(mfaStatusQuery, { variables: {} });
    expect(response.data.mfaStatus).toEqual(false);
  });

  test("create many users", async () => {
    // count and admin user that is already created
    for (let index = 1; index < 14; index++) {
      const userEmail = `user+${index}@test.com`;
      const userResponse = await server.test(createUserMutation, {
        variables: {
          input: {
            email: userEmail,
            password: "Password01!",
            role: "user",
            tenantId: tenant._id,
          },
          skipCognito: true
        }
      });

      expect(userResponse.errors).toBeUndefined();
      expect(userResponse.data.createUser.email).toEqual(userEmail);
      expect(userResponse.data.createUser.role).toEqual("user");
      expect(userResponse.data.createUser.tenantId).toEqual(tenant._id);
      expect(userResponse.data.createUser.tenant.name).toEqual("Admin Tenant 1");
      usersList.push(userResponse.data.createUser);
    }
  });

  test("users descending pagination, cursors check", async () => {
    const users1 = await server.test(usersQuery, { variables: { first: 5, order: "desc", sortBy: "email" } });
    const users2 = await server.test(usersQuery, { variables: { first: 5, order: "desc", sortBy: "email", after: users1.data.users.pageInfo.endCursor } });
    const users3 = await server.test(usersQuery, { variables: { first: 5, order: "desc", sortBy: "email", after: users2.data.users.pageInfo.endCursor } });
    const allUsers = await server.test(usersQuery, { variables: { first: 50, order: "desc", sortBy: "email" } });
    expect(users2.data.users.edges[0].node).toEqual(allUsers.data.users.edges[5].node);
    expect(users3.data.users.edges[0].node).toEqual(allUsers.data.users.edges[10].node);
    expect(users1.data.users.pageInfo.hasNextPage).toEqual(true);
    expect(users1.data.users.pageInfo.hasPreviousPage).toEqual(false);
    expect(users2.data.users.pageInfo.hasNextPage).toEqual(true);
    expect(users2.data.users.pageInfo.hasPreviousPage).toEqual(true);
    expect(users3.data.users.pageInfo.hasNextPage).toEqual(false);
    expect(users3.data.users.pageInfo.hasPreviousPage).toEqual(true);
  });

  test("delete many users", async () => {
    usersList.forEach(async user => {
      const response = await server.test(deleteUserMutation, {
        variables: {
          where: {
            _id: { _eq: user._id }
          },
          skipCognito: true
        }
      });
      expect(response.errors).toBeUndefined();
    });
  });
  
  test("admin user delete", async () => {
    const response = await server.test(deleteUserMutation, {
      variables: {
        where: {
          _id: { _eq: user._id }
        }
      }
    });
    expect(response.errors).toBeUndefined();
  });

  test("admin user delete tenant", async () => {
    const response = await server.test(deleteTenantMutation, {
      variables: {
        where: {
          _id: { _eq: tenant._id }
        }
      }
    });
    expect(response.errors).toBeUndefined();
  });
});