export type Namespace = "test" | "local" | "dev" | "prod";

export function isNodeEnvOneOf(...namespaces: Namespace[]): boolean {
  return namespaces.includes(process.env.NODE_ENV as Namespace);
}
