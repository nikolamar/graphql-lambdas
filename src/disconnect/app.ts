import { LambdaResolver } from "/opt/lambda";
import { remove } from "./delete";

export function handler (event) {
  return new LambdaResolver(event)
    .add(remove)
    .resolve();
}

