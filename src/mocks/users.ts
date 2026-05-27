import { type User } from "@/types/user";

export const currentUser: User = {
  id: "user-1",
  name: "山田 太郎",
  handle: "yamada_t",
  avatarUrl: "https://i.pravatar.cc/150?u=user-1",
  badge: "🌟",
};

export const users: User[] = [
  currentUser,
  {
    id: "user-2",
    name: "佐藤 花子",
    handle: "sato_h",
    avatarUrl: "https://i.pravatar.cc/150?u=user-2",
    badge: "📚",
  },
  {
    id: "user-3",
    name: "鈴木 一郎",
    handle: "suzuki_i",
    avatarUrl: "https://i.pravatar.cc/150?u=user-3",
    badge: "🎮",
  },
  {
    id: "user-4",
    name: "田中 美咲",
    handle: "tanaka_m",
    avatarUrl: "https://i.pravatar.cc/150?u=user-4",
    badge: "🍳",
  },
];
