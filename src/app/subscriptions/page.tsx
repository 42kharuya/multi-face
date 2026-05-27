import SubscriptionFeed from "@/components/subscriptions/SubscriptionFeed";
import FAB from "@/components/ui/FAB";

export default function SubscriptionsPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main>
        <SubscriptionFeed />
      </main>
      <FAB />
    </div>
  );
}
