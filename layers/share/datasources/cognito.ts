import AWS from "aws-sdk";
import { DataSource } from "apollo-datasource";
import { rndchars, rndletters, rndnums } from "../utils/nanoid";
import { REGION, POOL_ID } from "../configs/cognito";

export class CognitoDataSource extends DataSource {
  getCognitoUser(username: string) {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params: any = {
      UserPoolId: POOL_ID,
      Username: username,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminGetUser(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  deleteCognitoUser(email: string): Promise<any> {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params: any = {
      UserPoolId: POOL_ID,
      Username: email,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminDeleteUser(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  updateCognitoUserAttributes(username: string, userAttributes: any): Promise<any> {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params: any = {
      UserAttributes: userAttributes,
      UserPoolId: POOL_ID,
      Username: username,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminUpdateUserAttributes(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  confirmSignUp(username: string): Promise<any> {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params: any = {
      UserPoolId: POOL_ID,
      Username: username,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminConfirmSignUp(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  checkCognitoUserMFAStatus(accessToken: string): Promise<boolean> {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params = {
      AccessToken: accessToken,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.getUser(params, async (error, data) => {
        if (error) {
          reject(error);
        }
        const isEnabled = data?.UserMFASettingList?.includes("SOFTWARE_TOKEN_MFA");

        resolve(!!isEnabled);
      });
    });
  }

  fetchCognitoUserMultiFactorAuthUrl(accessToken: string): Promise<string> {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params = {
      AccessToken: accessToken,
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.associateSoftwareToken(params, (error, result) => {
        if (error) {
          reject(error);
        }
        const mfaTitle = "App_Name";
        const url = `otpauth://totp/${decodeURI(mfaTitle)}?secret=${result.SecretCode}`;
        resolve(url);
      });
    });
  }

  async setCognitoUserMFAPreference(email: string, mfa: boolean) {
    const cognitoUser: any = await this.getCognitoUser(email);
    if (!cognitoUser.UserMFASettingList) {
      return;
    }

    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params: any = {
      UserPoolId: POOL_ID,
      Username: email,
      SoftwareTokenMfaSettings: {
        Enabled: mfa,
        PreferredMfa: mfa,
      },
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminSetUserMFAPreference(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }

  validateCognitoUserMFA(userCode: string, accessToken: string): Promise<boolean> {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const params = {
      AccessToken: accessToken,
      UserCode: userCode,
    };

    return new Promise((resolve, reject) =>
      cognitoIdentityServiceProvider.verifySoftwareToken(params, (error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      }),
    );
  }

  createCognitoUser(input: any) {
    const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });

    const tempPassword = rndletters() + rndnums() + rndchars();
    const params: any = {
      UserPoolId: POOL_ID,
      Username: input.email,
      DesiredDeliveryMediums: ["EMAIL"],
      ForceAliasCreation: false,
      TemporaryPassword: input.password ?? tempPassword.charAt(0).toUpperCase() + tempPassword.slice(1),
      UserAttributes: [
        {
          Name: "email",
          Value: input.email,
        },
        {
          Name: "email_verified",
          Value: "true",
        },
        {
          Name: "custom:tenant",
          Value: input.tenantId.toString(),
        },
        {
          Name: "custom:roles",
          Value: input.role,
        },
      ],
    };

    return new Promise((resolve, reject) => {
      cognitoIdentityServiceProvider.adminCreateUser(params, async (err, data) => {
        const sub = data?.User?.Attributes?.filter((attr) => attr.Name === "sub")[0]?.Value;
        if (err) {
          return reject(err);
        }
        if (input.password) {
          delete input.password;
        }
        resolve({
          ...input,
          termsAndConditionsMetaData: {
            accepted: false,
            version: 1, // Hardcoded version for now
          },
          sub,
        });
      });
    });
  }
}
