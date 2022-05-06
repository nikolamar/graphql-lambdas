import fs from "fs";
import path from "path";
import { authenticator } from "otplib";
import { CLIENT_ID } from "/opt/configs/cognito";
import { getMongodbConnectionWithClient } from "/opt/utils/db";
import { ApolloTestServer, mockRequestOptions } from "../../utils/server-test";
import type { Challenge, Tenant, User } from "../../generated";

const createTenant = fs.readFileSync(path.resolve(__dirname, "../../mutations/create-tenant.graphql"), "utf8");
const createUser = fs.readFileSync(path.resolve(__dirname, "../../mutations/create-user.graphql"), "utf8");
const userPasswordAuth = fs.readFileSync(path.resolve(__dirname, "../../mutations/user-password-auth.graphql"), "utf8");
const challengeNewPassword = fs.readFileSync(path.resolve(__dirname, "../../mutations/challenge-new-password.graphql"), "utf8");
const mfaStatus = fs.readFileSync(path.resolve(__dirname, "../../queries/mfa-status.graphql"), "utf8");
const mfaStatusUrl = fs.readFileSync(path.resolve(__dirname, "../../queries/mfa-auth-url.graphql"), "utf8");
const validateMfaCode = fs.readFileSync(path.resolve(__dirname, "../../mutations/validate-mfa-code.graphql"), "utf8");
const setUserMfaPreference = fs.readFileSync(path.resolve(__dirname, "../../mutations/set-user-mfa-preference.graphql"), "utf8");
const deleteUser = fs.readFileSync(path.resolve(__dirname, "../../mutations/delete-user.graphql"), "utf8");
const deleteTenant = fs.readFileSync(path.resolve(__dirname, "../../mutations/delete-tenant.graphql"), "utf8");

describe("sign-up", () => {
  let user: User;
  let tenant: Tenant;
  let challenge: Challenge;
  let idToken: string;
  let accessToken: string;
  let verificationCode: string;

  let server: ApolloTestServer;

  const adminEmail = "admin+0@test.com";

  beforeAll(async () => {
    const [connection, client] = await getMongodbConnectionWithClient();
    server = new ApolloTestServer(connection, client);
  });
  
  afterAll(() => {
    return server.dbConnection.then((mongo) => mongo.close());
  });

  test("create tenant", async () => {
    const response = await server.test(createTenant, {
      variables: { 
        input: {
          name: "Admin Tenant 0",
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
    const response = await server.test(createUser, {
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

  test("user password auth challenge response", async () => {
    const response = await server.test(userPasswordAuth, {
      variables: {
        clientId: CLIENT_ID,
        username: adminEmail,
        password: "Password01!",
      }
    });
    challenge = response.data.userPasswordAuth;
    expect(response.data.userPasswordAuth.challengeName).toEqual("NEW_PASSWORD_REQUIRED");
  });

  test("challenge new password", async () => {
    const response = await server.test(challengeNewPassword, {
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

  test("user password auth tokens response", async () => {
    const response = await server.test(userPasswordAuth, {
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

  test("mfa status false", async () => {
    mockRequestOptions.headers = {
      IdToken: idToken,
      AccessToken: accessToken
    };
    const response = await server.test(mfaStatus, { variables: {} });
    expect(response.data.mfaStatus).toEqual(false);
  });

  test("mfa auth url verification code", async () => {
    const response = await server.test(mfaStatusUrl, { variables: {} });
    const secret = response.data.mfaAuthUrl.split("secret=")[1];
    verificationCode = authenticator.generate(secret);
    expect(verificationCode).not.toBeUndefined();
  });

  test("validate mfa code", async () => {
    const response = await server.test(validateMfaCode, {
      variables: {
        verificationCode,
      }
    });
    expect(response.errors).toBeUndefined();
  });

  test("enable mfa", async () => {
    const response = await server.test(setUserMfaPreference, {
      variables: {
        mfa: true,
      }
    });
    expect(response.data.setUserMfaPreference).toEqual(true);
    expect(response.errors).toBeUndefined();
  });

  test("mfa status true", async () => {
    const response = await server.test(mfaStatus, { variables: {} });
    expect(response.data.mfaStatus).toEqual(true);
  });

  test("user password auth challenge software token mfa", async () => {
    const response = await server.test(userPasswordAuth, {
      variables: {
        clientId: CLIENT_ID,
        username: adminEmail,
        password: "NewPassword01!",
      }
    });
    challenge = response.data.userPasswordAuth;
    expect(response.data.userPasswordAuth.challengeName).toEqual("SOFTWARE_TOKEN_MFA");
  });

  test("delete user", async () => {
    const response = await server.test(deleteUser, {
      variables: {
        where: {
          _id: { _eq: user._id }
        }
      }
    });
    expect(response.errors).toBeUndefined();
  });

  test("delete tenant", async () => {
    const response = await server.test(deleteTenant, {
      variables: {
        where: {
          _id: { _eq: tenant._id }
        }
      }
    });
    expect(response.errors).toBeUndefined();
  });
});