import SubscriptionFeed from "@/components/subscriptions/SubscriptionFeed";
import { subscriptionRepository } from "@/repositories/subscription-repository";
import FAB from "@/components/ui/FAB";

export default function SubscriptionsPage() {
  const count = subscriptionRepository.getSubscribedFaceIds().length;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main>
        {count > 0 && (
          <p
            style={{
              padding: "14px 28px 0",
              fontSize: 11.5,
              color: "var(--mf-text-muted)",
              fontWeight: 600,
            }}
          >
            {count} フェイスをサブスク中
          </p>
        )}
        <div style={{ padding: "0 28px" }}>
          <SubscriptionFeed />
        </div>
      </main>
      <FAB />
    </div>
  );
}
