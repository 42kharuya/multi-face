import NotificationList from "@/components/notifications/NotificationList";
import { notificationRepository } from "@/repositories/notification-repository";

export default function NotificationsPage() {
  const count = notificationRepository.listAll().length;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <main style={{ padding: "20px 28px 32px" }}>
        {count > 0 && (
          <p
            style={{
              fontSize: 11.5,
              color: "var(--mf-text-muted)",
              marginBottom: 14,
              fontWeight: 600,
            }}
          >
            {count} 件の通知
          </p>
        )}
        <NotificationList />
      </main>
    </div>
  );
}
