import HomeProfile from "@/components/home/HomeProfile";
import HomeClient from "@/components/home/HomeClient";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main>
        <HomeProfile />
        <HomeClient />
      </main>
    </div>
  );
}
