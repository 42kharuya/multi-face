"use client";

import { type Face } from "@/types/face";
import { activityRepository } from "@/repositories/activity-repository";
import SeedRow from "@/components/ui/SeedRow";
import type { SortOrder } from "./FaceHeader";

type FaceActivityFeedProps = {
  face: Face;
  sortOrder?: SortOrder;
};

const FaceActivityFeed = ({ face, sortOrder = "newest" }: FaceActivityFeedProps) => {

  let faceActivities = activityRepository.listByFaceId(face.id);

  if (sortOrder === "oldest") {
    faceActivities = [...faceActivities].reverse();
  } else if (sortOrder === "images") {
    faceActivities = faceActivities.filter((a) => (a.imageUrls?.length ?? 0) > 0);
  }
  // "newest" は repository がデフォルトで降順ソート済み

  if (faceActivities.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "var(--mf-text-muted)",
          padding: "64px 0",
        }}
      >
        {sortOrder === "images" ? "画像付きのシードがありません" : "まだシードがありません"}
      </p>
    );
  }

  return (
    <div style={{ padding: "0 28px" }}>
      {faceActivities.map((activity, i) => (
        <SeedRow
          key={activity.id}
          activity={activity}
          face={face}
          noBorder={i === faceActivities.length - 1}
        />
      ))}
    </div>
  );
};

export default FaceActivityFeed;
