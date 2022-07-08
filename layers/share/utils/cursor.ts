import { InputMaybe, Maybe, PageInfo, Scalars } from "/opt/schemas/generated";
import type { ObjectId } from "mongodb";

type Entity = {
  __typename?: any;
  cursor: Scalars["String"];
  node: any;
};

type ReturnEdges = {
  __typename?: any;
  edges: Array<Maybe<Entity>>;
  pageInfo?: Maybe<PageInfo>;
  count?: number;
  totalCount?: number;
};

type DataResponse = {
  data: any[];
  totalCount: number;
  firstRecordId: ObjectId;
};

type Args = {
  first?: InputMaybe<number>;
  sortBy?: InputMaybe<string>;
};

export function createEdgesWithPageInfo(dataResponse: DataResponse, args: Args): ReturnEdges {
  const data = dataResponse?.data ?? [];
  const totalCount = dataResponse?.totalCount ?? 0;
  const firstRecordId = dataResponse?.firstRecordId ?? {}; // this is mongodb object id
  const first = args?.first ?? Infinity;
  const sortBy = args?.sortBy ?? "_id";

  const edges = data?.map((node: any) => ({
    node,
    cursor: Buffer.from(node?.[sortBy] ? node?.[sortBy].toString() : "").toString("base64"), // making opaque
  }));

  let hasNextPage;
  let hasPreviousPage;

  if (totalCount === 0) {
    hasNextPage = false;
    hasPreviousPage = false;
  } else {
    hasNextPage = data?.length > first;
    hasPreviousPage = firstRecordId?.toString() !== data?.[0]?._id?.toString();
  }

  /**
   * we are getting one more to check are there more records
   * that is why we are removing after hasNextPage check
   */
  if (data?.length > first) {
    edges.pop();
  }

  const startCursor = edges[0]?.cursor || "";
  const endCursor = edges?.[edges.length - 1]?.cursor || "";

  return {
    edges,
    pageInfo: {
      hasPreviousPage,
      hasNextPage,
      startCursor,
      endCursor,
      count: edges?.length,
      totalCount,
    },
  };
}
