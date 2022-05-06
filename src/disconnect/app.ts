import { LambdaResolver } from "/opt/utils/lambda";
import { remove } from "./delete";

export function handler (event) {
  return new LambdaResolver(event)
    .add(remove)
    .resolve();
}

