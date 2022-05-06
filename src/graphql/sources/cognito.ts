import AWS from "aws-sdk";
import { DataSource } from "apollo-datasource";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { rndchars, rndletters, rndnums } from "/opt/utils/nanoid";
import { REGION, POOL_ID } from "/opt/configs/cognito";

export class CognitoDataSource extends DataSource {
  private _cognitoIdentityProvider: CognitoIdentityProvider;
  private _cognitoIdentityServiceProvider: AWS.CognitoIdentityServiceProvider;

  constructor(cognitoIdentityProvider = null, cognitoIdentityServiceProvider = null) {
    super();
    this._cognitoIdentityProvider = cognitoIdentityProvider;
    this._cognitoIdentityServiceProvider = cognitoIdentityServiceProvider;
  }

  async initialize (): Promise<void> {
    if (this._cognitoIdentityProvider && this._cognitoIdentityServiceProvider) {
      return;
    }

    this._cognitoIdentityProvider = new CognitoIdentityProvider({
      region: REGION,
    });
    
    this._cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider({
      apiVersion: "2016-04-18",
      region: REGION,
    });
  }

  getCognitoUser (username) {
    const params = {
      UserPoolId: POOL_ID,
      Username: username,
    };
    return new Promise((resolve, reject) => {
      this._cognitoIdentityServiceProvider.adminGetUser(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
  
  deleteCognitoUser (email): Promise<any> {
    const params = {
      UserPoolId: POOL_ID,
      Username: email,
    };
    return new Promise((resolve, reject) => {
      this._cognitoIdentityServiceProvider.adminDeleteUser(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
  
  updateCognitoUserAttributes (username: string, userAttributes): Promise<any> {
    const params = {
      UserAttributes: userAttributes,
      UserPoolId: POOL_ID,
      Username: username,
    };
  
    return new Promise((resolve, reject) => {
      this._cognitoIdentityServiceProvider.adminUpdateUserAttributes(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
  
  checkCognitoUserMFAStatus (accessToken: string): Promise<boolean> {
    const params = {
      AccessToken: accessToken,
    };
  
    return new Promise((resolve, reject) => {
      this._cognitoIdentityServiceProvider.getUser(params, async (error, data) => {
        if (error) {
          reject(error);
        }
        const isEnabled = data?.UserMFASettingList?.includes("SOFTWARE_TOKEN_MFA");
  
        resolve(!!isEnabled);
      });
    });
  }
  
  fetchCognitoUserMultiFactorAuthUrl (accessToken: string): Promise<string> {
    const params = {
      AccessToken: accessToken,
    };
  
    return new Promise((resolve, reject) => {
      this._cognitoIdentityServiceProvider.associateSoftwareToken(params, (error, result) => {
        if (error) {
          reject(error);
        }
        const mfaTitle = "App_Designer";
        const url = `otpauth://totp/${decodeURI(mfaTitle)}?secret=${result.SecretCode}`;
        resolve(url);
      });
    });
  }
  
  async setCognitoUserMFAPreference (email: string, mfa: boolean) {
    const cognitoUser: any = await this.getCognitoUser(email);
    if (!cognitoUser.UserMFASettingList) {
      return;
    }
  
    const params = {
      UserPoolId: POOL_ID,
      Username: email,
      SoftwareTokenMfaSettings: {
        Enabled: mfa,
        PreferredMfa: mfa,
      },
    };
  
    return new Promise((resolve, reject) => {
      this._cognitoIdentityServiceProvider.adminSetUserMFAPreference(params, (error, data) => {
        if (error) {
          reject(error);
        }
        resolve(data);
      });
    });
  }
  
  validateCognitoUserMFA (userCode: string, accessToken: string): Promise<boolean> {
    const params = {
      AccessToken: accessToken,
      UserCode: userCode,
    };
  
    return new Promise((resolve, reject) =>
      this._cognitoIdentityServiceProvider.verifySoftwareToken(params, (error) => {
        if (error) {
          reject(error);
        }
        resolve(true);
      }),
    );
  }

  createCognitoUser (input) {
    const tempPassword = rndletters() + rndnums() + rndchars();
    const params = {
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
      this._cognitoIdentityServiceProvider.adminCreateUser(
        params,
        async (err, data) => {
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
        },
      );
    });
  }

  async userPasswordAuth (clientId: string, username: string, password: string) {
    const response = await this._cognitoIdentityProvider.initiateAuth({
      ClientId: clientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password,
      }
    });
    return {
      session: response.Session,
      challengeName: response.ChallengeName,
      idToken: response.AuthenticationResult?.IdToken,
      accessToken: response.AuthenticationResult?.AccessToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
    };
  }

  async challengeNewPassword (clientId: string, session: string, username: string, newPassword: string) {
    const response = await this._cognitoIdentityProvider.respondToAuthChallenge({
      ChallengeName: "NEW_PASSWORD_REQUIRED",
      ChallengeResponses: {
        USERNAME: username,
        NEW_PASSWORD: newPassword,
      },
      ClientId: clientId,
      Session: session,
    });
    return {
      idToken: response.AuthenticationResult.IdToken,
      accessToken: response.AuthenticationResult.AccessToken,
      refreshToken: response.AuthenticationResult.RefreshToken,
    };
  }

  async setUserMfaPreference (accessToken: string, mfa: boolean) {
    await this._cognitoIdentityProvider.setUserMFAPreference({
      AccessToken: accessToken,
      SoftwareTokenMfaSettings: {
        Enabled: mfa,
        PreferredMfa: mfa,
      }
    });
    return mfa;
  }
}