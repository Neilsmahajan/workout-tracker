import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useStorageInit } from "@/hooks/useStorageInit";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutProvider } from "@/contexts/WorkoutContext";

export default function RootLayout() {
  const { isInitialized, error } = useStorageInit();

  if (!isInitialized) {
    return null; // Or a loading screen
  }

  if (error) {
    console.error("Storage initialization error:", error);
  }

  return (
    <ErrorBoundary>
      <WorkoutProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar style="auto" />
        </GestureHandlerRootView>
      </WorkoutProvider>
    </ErrorBoundary>
  );
}
