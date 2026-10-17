import { useEffect, useState } from "react";
import { Alert } from "@mantine/core";
import { useTranslation } from "react-i18next";

/**
 * "Nincs kapcsolat" (plan §3.5). Calculators keep working because they are
 * pure client code; practice answers need the connection.
 */
export function OfflineBanner() {
  const { t } = useTranslation();
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) {
    return null;
  }
  return (
    <Alert color="yellow" variant="light" role="status" mb="sm" data-testid="offline-banner">
      {t("feedback.offline")}
    </Alert>
  );
}
