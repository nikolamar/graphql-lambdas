import fs from "fs";
import path from "path";
import { authenticator } from "otplib";
import { CLIENT_ID } from "/opt/configs/cognito";
import { randomIntFromInterval } from "/opt/utils/numbers";
import { getMongodbConnectionWithClient } from "/opt/utils/db";
import { ApolloTestServer, mockRequestOptions } from "../utils/server-test";

describe("sign-up", () => {
  let user;
  let tenant;
  let challenge;
  let idToken;
  let accessToken;
  let verificationCode;

  let server;

  const testEmail = `admin+${randomIntFromInterval(1, 1000)}@test.com`;

  beforeAll(async () => {
    const [connection, client] = await getMongodbConnectionWithClient();
    server = new ApolloTestServer(connection, client);
  });
  
  afterAll(() => {
    return server.dbConnection.then((mongo) => mongo.close());
  });

  test("create tenant", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/create-tenant.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: { 
        input: {
          name: "test",
          status: "active",
          color: "#ffffff",
          accentColor: "#ffffff"
        }
      }
    });
    expect(response.errors).toBeUndefined();
    tenant = response.data.createTenant;
  });
  
  test("create user", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/create-user.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        input: {
          email: testEmail,
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

  test("user password auth challenge response", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/user-password-auth.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        clientId: CLIENT_ID,
        username: testEmail,
        password: "Password01!",
      }
    });
    challenge = response.data.userPasswordAuth;
    expect(response.data.userPasswordAuth.challengeName).toEqual("NEW_PASSWORD_REQUIRED");
  });

  test("challenge new password", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/challenge-new-password.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        clientId: CLIENT_ID,
        session: challenge.session,
        username: testEmail,
        newPassword: "NewPassword01!",
      }
    });
    idToken = response.data.challengeNewPassword.idToken;
    accessToken = response.data.challengeNewPassword.accessToken;
    expect(idToken).not.toBeUndefined();
    expect(accessToken).not.toBeUndefined();
  });

  test("user password auth tokens response", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/user-password-auth.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        clientId: CLIENT_ID,
        username: testEmail,
        password: "NewPassword01!",
      }
    });
    idToken = response.data.userPasswordAuth.idToken;
    accessToken = response.data.userPasswordAuth.accessToken;
    expect(idToken).not.toBeUndefined();
    expect(accessToken).not.toBeUndefined();
  });

  test("mfa status false", async () => {
    mockRequestOptions.headers = {
      IdToken: idToken,
      AccessToken: accessToken
    };
    const query = fs.readFileSync(path.resolve(__dirname, "../queries/mfa-status.graphql"), "utf8");
    const response = await server.test(query, { variables: {} });
    expect(response.data.mfaStatus).toEqual(false);
  });

  test("mfa auth url verification code", async () => {
    const query = fs.readFileSync(path.resolve(__dirname, "../queries/mfa-auth-url.graphql"), "utf8");
    const response = await server.test(query, { variables: {} });
    const secret = response.data.mfaAuthUrl.split("secret=")[1];
    verificationCode = authenticator.generate(secret);
    expect(verificationCode).not.toBeUndefined();
  });

  test("validate mfa code", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/validate-mfa-code.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        verificationCode,
      }
    });
    expect(response.errors).toBeUndefined();
  });

  test("enable mfa", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/set-user-mfa-preference.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        isMFAEnabled: true,
      }
    });
    expect(response.data.setUserMfaPreference).toEqual(true);
    expect(response.errors).toBeUndefined();
  });

  test("mfa status true", async () => {
    const query = fs.readFileSync(path.resolve(__dirname, "../queries/mfa-status.graphql"), "utf8");
    const response = await server.test(query, { variables: {} });
    expect(response.data.mfaStatus).toEqual(true);
  });

  test("user password auth challenge software token mfa", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/user-password-auth.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        clientId: CLIENT_ID,
        username: testEmail,
        password: "NewPassword01!",
      }
    });
    challenge = response.data.userPasswordAuth;
    expect(response.data.userPasswordAuth.challengeName).toEqual("SOFTWARE_TOKEN_MFA");
  });

  test("delete user", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/delete-user.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        where: {
          _id: { _eq: user._id }
        }
      }
    });
    expect(response.errors).toBeUndefined();
  });

  test("delete tenant", async () => {
    const mutation = fs.readFileSync(path.resolve(__dirname, "../mutations/delete-tenant.graphql"), "utf8");
    const response = await server.test(mutation, {
      variables: {
        where: {
          _id: { _eq: tenant._id }
        }
      }
    });
    expect(response.errors).toBeUndefined();
  });
});