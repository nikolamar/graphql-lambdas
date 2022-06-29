"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_amplify_1 = require("aws-amplify");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cognito_1 = require("/opt/configs/cognito");
const db_1 = require("/opt/utils/db");
const server_test_1 = require("../utils/server-test");
const deleteUserMutation = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/delete-user.graphql"), "utf8");
const signUp = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/sign-up.graphql"), "utf8");
describe("sign-up", () => {
    let user;
    let server;
    const adminEmail = "admin.test+0@test.com";
    beforeAll(async () => {
        const [connection, client] = await (0, db_1.getMongodbConnectionWithClient)();
        server = new server_test_1.ApolloTestServer(connection, client);
        aws_amplify_1.Auth.configure({
            region: cognito_1.REGION,
            userPoolId: cognito_1.POOL_ID,
            userPoolWebClientId: cognito_1.CLIENT_ID,
        });
    });
    afterAll(() => {
        return server.dbConnection.then((mongo) => mongo.close());
    });
    test("sign up", async () => {
        await aws_amplify_1.Auth.signUp({
            username: adminEmail,
            password: "Password01!",
        });
        const response = await server.test(signUp, {
            variables: {
                input: {
                    role: "admin",
                    email: adminEmail,
                }
            }
        });
        expect(response.errors).toBeUndefined();
        user = response.data.signUp;
        expect(user).not.toBeUndefined();
    });
    test("delete user", async () => {
        const response = await server.test(deleteUserMutation, {
            variables: {
                where: {
                    _id: { _eq: user._id }
                }
            }
        });
        expect(response.errors).toBeUndefined();
    });
});
