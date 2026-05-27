"use client";

import FaceBadge from "@/components/ui/FaceBadge";
import type { Face } from "@/types/face";

type Props = {
  face: Face;
  activeFaceId?: string;
  onClick?: (face: Face) => void;
};

const FaceNavItem = ({ face, activeFaceId, onClick }: Props) => {
  const isActive = activeFaceId === face.id;

  return (
    <li>
      <button
        type="button"
        onClick={() => onClick?.(face)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          width: "100%",
          padding: "7px 14px",
          borderRadius: 8,
          background: isActive ? "rgba(30,42,74,0.07)" : "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          transition: "background 0.15s",
        }}
      >
        <FaceBadge face={face} size={26} radius={7} />
        <span
          style={{
            flex: 1,
            fontSize: 13,
            fontWeight: 600,
            color: "var(--mf-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {face.name}
        </span>
      </button>
    </li>
  );
};

export default FaceNavItem;
