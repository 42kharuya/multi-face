import { userRepository } from "@/repositories/user-repository";
import { faceRepository } from "@/repositories/face-repository";
import { activityRepository } from "@/repositories/activity-repository";
import ActivityTileCalendar from "./ActivityTileCalendar";

const HomeProfile = () => {
  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);
  const activities = activityRepository.listByUserId(user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: "20px 28px 12px" }}>
      {/* アバター・名前 */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: "50%", overflow: "hidden", flexShrink: 0 }}>
          <img
            src={user.avatarUrl}
            alt={user.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--mf-brand)" }}>
            {user.name}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 12.5,
              color: "var(--mf-text-muted)",
              marginTop: 2,
            }}
          >
            <span>
              <b style={{ color: "var(--mf-text)", fontWeight: 700 }}>{faces.length}</b>{" "}
              フェイス
            </span>
            <span style={{ width: 1, height: 12, background: "var(--mf-line)", display: "inline-block" }} />
            <span>
              <b style={{ color: "var(--mf-text)", fontWeight: 700 }}>{activities.length}</b>{" "}
              シード
            </span>
          </div>
        </div>
      </div>

      {/* タイルカレンダー */}
      <ActivityTileCalendar activities={activities} />
    </div>
  );
};

export default HomeProfile;
