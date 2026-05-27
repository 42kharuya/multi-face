import { notFound } from "next/navigation";
import Link from "next/link";
import { activityRepository } from "@/repositories/activity-repository";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import SeedDetailPage from "@/components/seed/SeedDetailPage";

type Props = {
  params: Promise<{ seedId: string }>;
};

const SeedPage = async ({ params }: Props) => {
  const { seedId } = await params;
  const activity = activityRepository.findById(seedId);

  if (!activity) {
    notFound();
  }

  const face = faceRepository.findById(activity.faceId);
  if (!face) notFound();

  const currentUser = userRepository.getCurrentUser();
  const isOwner = activity.userId === currentUser.id;

  return (
    <div className="flex flex-col">
      {/* ヘッダー */}
      <header
        style={{
          height: 52,
          padding: "0 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "0.5px solid var(--mf-line-soft)",
          background: "var(--mf-bg-light)",
        }}
        className="sticky top-0 z-10"
      >
        <Link
          href="javascript:history.back()"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mf-brand)",
            textDecoration: "none",
          }}
          onClick={(e) => {
            e.preventDefault();
            window.history.back();
          }}
        >
          <svg width={20} height={20} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 4l-6 6 6 6" />
          </svg>
        </Link>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--mf-brand)" }}>シード</span>
        <button
          type="button"
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--mf-brand)",
            fontSize: 18,
            letterSpacing: 1,
          }}
          aria-label="その他"
        >
          ···
        </button>
      </header>

      <main>
        <SeedDetailPage activity={activity} face={face} isOwner={isOwner} />
      </main>
    </div>
  );
};

export default SeedPage;
