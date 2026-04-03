import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") return false;
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function scheduleAppointmentNotification(
  appointmentId: string,
  customerName: string,
  date: string,
  time: string
): Promise<string | null> {
  if (Platform.OS === "web") return null;
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return null;

    const [year, month, day] = date.split("-").map(Number);
    const [hour, minute] = time.split(":").map(Number);

    const apptDate = new Date(year, month - 1, day, hour, minute, 0);
    const notifDate = new Date(apptDate.getTime() - 30 * 60 * 1000);

    if (notifDate <= new Date()) return null;

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Yaklaşan Randevu",
        body: `Saat ${time}'de ${customerName} adlı müşterinizin randevusu var`,
        data: { appointmentId },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notifDate,
      },
    });
    return id;
  } catch (e) {
    console.warn("Bildirim zamanlanamadı:", e);
    return null;
  }
}

export async function cancelAppointmentNotification(notificationId: string): Promise<void> {
  if (Platform.OS === "web") return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (e) {
    console.warn("Bildirim iptal edilemedi:", e);
  }
}
