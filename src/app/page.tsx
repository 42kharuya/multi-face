import HomeProfile from "@/components/home/HomeProfile";
import HomeClient from "@/components/home/HomeClient";
import FAB from "@/components/ui/FAB";

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main>
        <HomeProfile />
        <HomeClient />
      </main>
      <FAB />
    </div>
  );
}
