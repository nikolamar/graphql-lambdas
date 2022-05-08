import { Maybe, PageInfo, Scalars } from "../generated";

type Entity = {
  __typename?: any;
  cursor: Scalars["String"];
  node: any;
}

type ReturnEdges = {
  __typename?: any;
  edges: Array<Maybe<Entity>>;
  pageInfo?: Maybe<PageInfo>;
  count?: number;
  totalCount?: number;
}

export function createEdgesWithPageInfo ({ data, totalCount, firstRecordId }, { first = Infinity, sortBy = "_id" }): ReturnEdges {
  const edges = data?.map(node => ({
    node,
    cursor: Buffer.from(
      node?.[sortBy] ? node?.[sortBy].toString() : "",
    ).toString("base64"), // making opaque
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
