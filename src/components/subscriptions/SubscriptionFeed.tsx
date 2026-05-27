"use client";

import Link from "next/link";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import { subscriptionRepository } from "@/repositories/subscription-repository";
import SeedRow from "@/components/ui/SeedRow";
import { useDetailPanel } from "@/lib/detail-panel-context";
import { createLookupMap } from "@/lib/display";

const SubscriptionFeed = () => {
  const { openActivity } = useDetailPanel();

  const subscribedFaceIds = subscriptionRepository.getSubscribedFaceIds();
  const subscribedActivities = activityRepository.listByFaceIds(subscribedFaceIds);

  const faceMap = createLookupMap(
    subscribedFaceIds.flatMap((faceId) => {
      const face = faceRepository.findById(faceId);
      return face ? [face] : [];
    }),
    (face) => face.id,
  );
  const userMap = createLookupMap(userRepository.listAll(), (user) => user.id);
  void userMap;

  if (subscribedActivities.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          padding: "80px 0",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: 36 }}>🔔</p>
        <p style={{ fontSize: 13, color: "var(--mf-text-muted)" }}>
          まだサブスクしているフェイスがありません
        </p>
        <Link
          href="/search"
          style={{
            padding: "8px 20px",
            borderRadius: 999,
            background: "var(--mf-accent)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          検索してフェイスを探す
        </Link>
      </div>
    );
  }

  return (
    <div>
      {subscribedActivities.map((activity, i) => {
        const face = faceMap.get(activity.faceId);
        if (!face) return null;
        return (
          <SeedRow
            key={activity.id}
            activity={activity}
            face={face}
            onClick={() => openActivity(activity.id)}
            noBorder={i === subscribedActivities.length - 1}
          />
        );
      })}
    </div>
  );
};

export default SubscriptionFeed;
