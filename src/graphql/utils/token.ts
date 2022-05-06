import jwkToPem from "jwk-to-pem";
import * as Axios from "axios";
import * as jsonwebtoken from "jsonwebtoken";
import { promisify } from "util";
import { REGION, POOL_ID } from "/opt/configs/cognito";
import { assert, ERROR_CODES, ERROR_MESSAGES } from "/opt/utils/errors";

export type TokenUse = "access" | "id";

export interface ClaimVerifyRequest {
  readonly token?: string;
}

export interface ClaimVerifyResult {
  readonly role?: string
  readonly userName?: string;
  readonly clientId?: string;
  readonly isValid: boolean;
  readonly error?: any;
}

interface TokenHeader {
  kid: string;
  alg: string;
}

interface PublicKey {
  alg: string;
  e: string;
  kid: string;
  kty: string;
  n: string;
  use: string;
}

interface PublicKeyMeta {
  instance: PublicKey;
  pem: string;
}

interface PublicKeys {
  keys: PublicKey[];
}

interface MapOfKidToPublicKey {
  [key: string]: PublicKeyMeta;
}

interface Claim {
  sub: string;
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  username: string;
  client_id: string;
}

const cognitoIssuer = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`;

let cacheKeys: MapOfKidToPublicKey | undefined;

const getPublicKeys = async (): Promise<MapOfKidToPublicKey> => {
  if (!cacheKeys) {
    const url = `${cognitoIssuer}/.well-known/jwks.json`;
    const publicKeys = await Axios.default.get<PublicKeys>(url);
    cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
      const pem = jwkToPem(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {} as MapOfKidToPublicKey);
    return cacheKeys;
  } else {
    return cacheKeys;
  }
};

const verifyPromised = promisify(jsonwebtoken.verify.bind(jsonwebtoken));

export const getClaim = async (token: string): Promise<Claim> => {
  const tokenSections = (token || "").split(".");
  assert(tokenSections.length >= 2, ERROR_MESSAGES.TOKEN_SECTION_REQUIRED, ERROR_CODES.UNAUTHENTICATED);
  const headerJSON = Buffer.from(tokenSections[0], "base64").toString("utf8");
  const header = JSON.parse(headerJSON) as TokenHeader;
  const keys = await getPublicKeys();
  const key = keys[header.kid];
  assert(key, ERROR_MESSAGES.KID_REQUIRED, ERROR_CODES.UNAUTHENTICATED);
  const claim = await verifyPromised(token, key.pem) as Claim;
  return claim;
};

export const verifyToken = async (token: string, tokenUse: TokenUse = "access"): Promise<ClaimVerifyResult> => {
  const claim = await getClaim(token);
  const currentSeconds = Math.floor((new Date()).valueOf() / 1000);
  assert(currentSeconds < claim.exp || currentSeconds > claim.auth_time, ERROR_MESSAGES.CLAIM_EXPIRED, ERROR_CODES.UNAUTHENTICATED);
  assert(claim.iss === cognitoIssuer, ERROR_MESSAGES.CLAIM_REQUIRED_ISSUER + " " + cognitoIssuer, ERROR_CODES.UNAUTHENTICATED);
  assert(claim.token_use === tokenUse, ERROR_MESSAGES.CLAIM_REQUIRED_TYPE + " " + tokenUse, ERROR_CODES.UNAUTHENTICATED);
  switch (tokenUse) {
  case "access":
    return {
      userName: claim.username,
      clientId: claim.client_id,
      isValid: true,
    };
    break;
  case "id":
    return {
      role: claim["custom:roles"],
      isValid: true,
    };
    break;
  default:
    return {
      isValid: false,
    };
  }
};
