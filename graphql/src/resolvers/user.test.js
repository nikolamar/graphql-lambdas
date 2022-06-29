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
const usersQuery = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../queries/users.graphql"), "utf8");
const createUserMutation = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/create-user.graphql"), "utf8");
const createTenantMutation = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/create-tenant.graphql"), "utf8");
const deleteUserMutation = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/delete-user.graphql"), "utf8");
const deleteTenantMutation = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/delete-tenant.graphql"), "utf8");
const signUp = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../mutations/sign-up.graphql"), "utf8");
describe("user resolver", () => {
    let adminUser;
    let tenant;
    let server;
    const usersList = [];
    const adminEmail = "admin.test+1@test.com";
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
        adminUser = response.data.signUp;
        expect(adminUser).not.toBeUndefined();
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
    test("create many users", async () => {
        // count and admin user that is already created
        for (let index = 1; index < 14; index++) {
            const userEmail = `user+${index}@test.com`;
            const userResponse = await server.test(createUserMutation, {
                variables: {
                    input: {
                        email: userEmail,
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
        usersList.forEach(async (user) => {
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
                    _id: { _eq: adminUser._id }
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
