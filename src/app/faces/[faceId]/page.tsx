import { notFound } from "next/navigation";
import Link from "next/link";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceDetailClient from "@/components/face/FaceDetailClient";

type Props = {
  params: Promise<{ faceId: string }>;
};

const FaceDetailPage = async ({ params }: Props) => {
  const { faceId } = await params;
  const face = faceRepository.findById(faceId);

  if (!face) {
    notFound();
  }

  const currentUser = userRepository.getCurrentUser();

  return (
    <div className="flex flex-col">
      {/* スティッキーヘッダー */}
      <header
        className="sticky top-0 z-10 flex items-center gap-3"
        style={{
          height: 52,
          padding: "0 18px",
          background: "var(--mf-bg-light)",
          borderBottom: "0.5px solid var(--mf-line)",
        }}
      >
        <Link
          href="/faces"
          style={{
            width: 34,
            height: 34,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--mf-brand)",
            textDecoration: "none",
          }}
          aria-label="フェイス一覧に戻る"
        >
          <svg
            width={20}
            height={20}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>
        <h2
          style={{
            flex: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 16,
            fontWeight: 700,
            color: "var(--mf-brand)",
            margin: 0,
          }}
        >
          {face.emoji ? `${face.emoji} ${face.name}` : face.name}
        </h2>
      </header>

      <main>
        <FaceDetailClient
          face={face}
          isOwner={face.userId === currentUser.id}
        />
      </main>

    </div>
  );
};

export default FaceDetailPage;
