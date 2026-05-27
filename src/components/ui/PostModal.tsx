"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceBadge from "./FaceBadge";
import { getFaceTitle } from "@/lib/display";

const MAX_IMAGES = 4;
const MAX_LENGTH = 5000;

type AttachedImage = {
  file: File;
  objectUrl: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  defaultFaceId?: string;
};

const PostModal = ({ isOpen, onClose, defaultFaceId }: Props) => {
  const currentUser = userRepository.getCurrentUser();
  const myFaces = useMemo(
    () => faceRepository.listByUserId(currentUser.id),
    [currentUser.id],
  );
  const initialSelectedFaceId = useMemo(
    () => defaultFaceId ?? myFaces[0]?.id ?? "",
    [defaultFaceId, myFaces],
  );
  const [selectedFaceId, setSelectedFaceId] = useState<string>(initialSelectedFaceId);
  const [text, setText] = useState("");
  const [images, setImages] = useState<AttachedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedFace = myFaces.find((f) => f.id === selectedFaceId);

  useEffect(() => {
    if (!isOpen) {
      setImages((prev) => {
        prev.forEach((img) => URL.revokeObjectURL(img.objectUrl));
        return [];
      });
      setText("");
      setSelectedFaceId(initialSelectedFaceId);
    }
  }, [initialSelectedFaceId, isOpen]);

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.objectUrl));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = MAX_IMAGES - images.length;
    const toAdd = files.slice(0, remaining);
    setImages((prev) => [
      ...prev,
      ...toAdd.map((file) => ({ file, objectUrl: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].objectUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* オーバーレイ */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 50,
          background: "rgba(20,24,36,0.5)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* モーダルパネル */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="投稿"
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          zIndex: 50,
          width: "calc(100% - 2rem)",
          maxWidth: 480,
          transform: "translate(-50%, -50%)",
          borderRadius: 20,
          background: "var(--mf-surface)",
          border: "0.5px solid var(--mf-line)",
          boxShadow: "0 20px 60px rgba(30,42,74,0.15)",
        }}
      >
        {/* ヘッダー */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 18px 14px",
            borderBottom: "0.5px solid var(--mf-line)",
          }}
        >
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "var(--mf-brand)", margin: 0 }}>
            新しいシードを書く
          </h2>
          <button
            type="button"
            onClick={onClose}
            style={{
              width: 28, height: 28,
              display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: "50%", border: "none", background: "transparent",
              color: "var(--mf-text-muted)", cursor: "pointer",
            }}
            aria-label="閉じる"
          >
            <svg width={16} height={16} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <div style={{ padding: "16px 18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          {/* フェイス選択 */}
          <div>
            <label
              htmlFor="face-select"
              style={{ fontSize: 11.5, fontWeight: 600, color: "var(--mf-text-muted)", display: "block", marginBottom: 6 }}
            >
              フェイス
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px 8px 8px", borderRadius: 12, border: "0.5px solid var(--mf-line)", background: "var(--mf-bg-paper)" }}>
              {selectedFace && <FaceBadge face={selectedFace} size={28} radius={7} />}
              <select
                id="face-select"
                value={selectedFaceId}
                onChange={(e) => setSelectedFaceId(e.target.value)}
                style={{
                  flex: 1,
                  appearance: "none",
                  border: "none",
                  background: "transparent",
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "var(--mf-brand)",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                {myFaces.map((face) => (
                  <option key={face.id} value={face.id}>
                    {getFaceTitle(face)}
                  </option>
                ))}
              </select>
            </div>
            {selectedFace?.description && (
              <p style={{ fontSize: 11.5, color: "var(--mf-text-muted)", margin: "6px 0 0", lineHeight: 1.5 }}>
                {selectedFace.description}
              </p>
            )}
          </div>

          {/* テキストエリア */}
          <div>
            <textarea
              id="post-text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={MAX_LENGTH}
              rows={5}
              placeholder="気軽に書き留めてみましょう…"
              style={{
                width: "100%",
                resize: "none",
                borderRadius: 12,
                border: "0.5px solid var(--mf-line)",
                background: "var(--mf-bg-paper)",
                padding: "12px 14px",
                fontSize: 14,
                lineHeight: 1.75,
                color: "var(--mf-ink)",
                outline: "none",
                fontFamily: "var(--mf-font-sans)",
                boxSizing: "border-box",
              }}
            />
            <p style={{ textAlign: "right", fontSize: 11, color: "var(--mf-text-muted)", margin: "4px 0 0" }}>
              {text.length} / {MAX_LENGTH.toLocaleString()}
            </p>
          </div>

          {/* 画像添付 */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={images.length >= MAX_IMAGES}
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 999,
                border: "0.5px solid var(--mf-line)",
                background: "transparent",
                fontSize: 12.5,
                fontWeight: 600,
                color: images.length >= MAX_IMAGES ? "var(--mf-text-faint)" : "var(--mf-text-sub)",
                cursor: images.length >= MAX_IMAGES ? "not-allowed" : "pointer",
              }}
            >
              <svg width={15} height={15} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
                <rect x={3} y={3} width={14} height={14} rx={2} />
                <circle cx={7} cy={7.5} r={1.2} />
                <path d="M3 14l4-4 4 4 3-3 3 3" />
              </svg>
              写真を追加
              {images.length > 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--mf-accent)" }}>
                  {images.length}/{MAX_IMAGES}
                </span>
              )}
            </button>

            {images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6, marginTop: 8 }}>
                {images.map((img, index) => (
                  <div key={img.objectUrl} style={{ position: "relative", aspectRatio: "1/1" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.objectUrl}
                      alt={`添付画像${index + 1}`}
                      style={{ width: "100%", height: "100%", borderRadius: 10, objectFit: "cover" }}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      style={{
                        position: "absolute", top: 4, right: 4,
                        width: 20, height: 20,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        borderRadius: "50%", background: "rgba(20,24,36,0.70)",
                        color: "#fff", border: "none", cursor: "pointer",
                      }}
                      aria-label={`画像${index + 1}を削除`}
                    >
                      <svg width={10} height={10} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
                        <path d="M5 5l10 10M15 5L5 15" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 投稿ボタン */}
          <button
            type="button"
            disabled={text.trim().length === 0}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 999,
              background: text.trim().length > 0 ? "var(--mf-accent)" : "var(--mf-surface-tint)",
              color: text.trim().length > 0 ? "#fff" : "var(--mf-text-faint)",
              fontSize: 14,
              fontWeight: 700,
              border: "none",
              cursor: text.trim().length > 0 ? "pointer" : "not-allowed",
              boxShadow: text.trim().length > 0 ? "0 4px 14px rgba(212,146,42,0.25)" : "none",
              transition: "background 0.15s, box-shadow 0.15s",
            }}
          >
            投稿する
          </button>
        </div>
      </div>
    </>
  );
};

export default PostModal;
