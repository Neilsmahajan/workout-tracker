import { Platform, Alert } from "react-native";

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
) => {
  if (Platform.OS === "web") {
    // For web, use native browser confirm/alert
    if (buttons && buttons.length > 1) {
      const confirmMessage = message ? `${title}\n\n${message}` : title;
      const confirmed = window.confirm(confirmMessage);

      if (confirmed) {
        // Find the first non-cancel button
        const actionButton = buttons.find((b) => b.style !== "cancel");
        if (actionButton?.onPress) {
          actionButton.onPress();
        }
      } else {
        // Find the cancel button
        const cancelButton = buttons.find((b) => b.style === "cancel");
        if (cancelButton?.onPress) {
          cancelButton.onPress();
        }
      }
    } else {
      const alertMessage = message ? `${title}\n\n${message}` : title;
      window.alert(alertMessage);
      if (buttons?.[0]?.onPress) {
        buttons[0].onPress();
      }
    }
  } else {
    // For mobile, use React Native Alert
    Alert.alert(title, message, buttons);
  }
};
