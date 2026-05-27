"use client";

import { type Face } from "@/types/face";
import { activityRepository } from "@/repositories/activity-repository";
import { useDetailPanel } from "@/lib/detail-panel-context";
import SeedRow from "@/components/ui/SeedRow";

type FaceActivityFeedProps = {
  face: Face;
};

const FaceActivityFeed = ({ face }: FaceActivityFeedProps) => {
  const { openActivity } = useDetailPanel();
  const faceActivities = activityRepository.listByFaceId(face.id);

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
        まだシードがありません
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
          onClick={() => openActivity(activity.id)}
          noBorder={i === faceActivities.length - 1}
        />
      ))}
    </div>
  );
};

export default FaceActivityFeed;
