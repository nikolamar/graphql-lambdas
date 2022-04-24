import { LambdaResolver } from "/opt/lambda";
import { save } from "./save";

export function handler (event) {
  return new LambdaResolver(event)
    .add(save)
    .resolve();
}