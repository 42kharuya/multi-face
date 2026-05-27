"use client";

import { useState } from "react";
import type { Face } from "@/types/face";
import FaceHeader, { type SortOrder } from "./FaceHeader";
import FaceActivityFeed from "./FaceActivityFeed";

type Props = {
  face: Face;
  isOwner: boolean;
};

const FaceDetailClient = ({ face, isOwner }: Props) => {
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

  return (
    <>
      <div style={{ borderBottom: "0.5px solid var(--mf-line)" }}>
        <FaceHeader
          face={face}
          isOwner={isOwner}
          onSortChange={setSortOrder}
        />
      </div>
      <section>
        <FaceActivityFeed face={face} sortOrder={sortOrder} />
      </section>
    </>
  );
};

export default FaceDetailClient;
