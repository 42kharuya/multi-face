"use client";

import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { createLookupMap } from "@/lib/display";
import SeedRow from "@/components/ui/SeedRow";

type ActivityFeedProps = {
  selectedFaceId?: string | null;
};

const ActivityFeed = ({ selectedFaceId }: ActivityFeedProps) => {
  const user = userRepository.getCurrentUser();

  const allActivities = activityRepository.listByUserId(user.id);
  const displayActivities = selectedFaceId
    ? allActivities.filter((a) => a.faceId === selectedFaceId)
    : allActivities;

  const faceCache = createLookupMap(
    displayActivities.flatMap((activity) => {
      const face = faceRepository.findById(activity.faceId);
      return face ? [face] : [];
    }),
    (face) => face.id,
  );

  if (displayActivities.length === 0) {
    return (
      <p
        style={{
          textAlign: "center",
          fontSize: 13,
          color: "var(--mf-text-muted)",
          padding: "64px 0",
        }}
      >
        アクティビティがありません
      </p>
    );
  }

  return (
    <div>
      {displayActivities.map((activity, index) => {
        const face = faceCache.get(activity.faceId);
        if (!face) return null;
        return (
          <SeedRow
            key={activity.id}
            activity={activity}
            face={face}
            noBorder={index === displayActivities.length - 1}
          />
        );
      })}
    </div>
  );
};

export default ActivityFeed;
