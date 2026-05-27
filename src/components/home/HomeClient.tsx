"use client";

import { useState } from "react";
import { faceRepository } from "@/repositories/face-repository";
import { userRepository } from "@/repositories/user-repository";
import FaceFilterBar from "./FaceFilterBar";
import ActivityFeed from "./ActivityFeed";

const HomeClient = () => {
  const [selectedFaceId, setSelectedFaceId] = useState<string | null>(null);

  const user = userRepository.getCurrentUser();
  const faces = faceRepository.listByUserId(user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <FaceFilterBar
        faces={faces}
        selectedFaceId={selectedFaceId}
        onSelect={setSelectedFaceId}
      />
      <div style={{ padding: "0 28px" }}>
        <ActivityFeed selectedFaceId={selectedFaceId} />
      </div>
    </div>
  );
};

export default HomeClient;
