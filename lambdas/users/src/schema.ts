import { join } from "path";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { loadFilesSync } from "@graphql-tools/load-files";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { resolvers } from "./resolvers";

const typesArray = loadFilesSync(join(__dirname, "/opt/schemas"));
const typeDefs = mergeTypeDefs(typesArray);

export const schemaWithResolvers = makeExecutableSchema({
  typeDefs,
  resolvers,
});
