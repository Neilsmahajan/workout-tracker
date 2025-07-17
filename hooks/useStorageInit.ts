import { useEffect, useState } from "react";
import { StorageService } from "@/utils/storage";

export function useStorageInit() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeStorage = async () => {
      try {
        await StorageService.initialize();
        setIsInitialized(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize storage",
        );
        console.error("Storage initialization failed:", err);
      }
    };

    initializeStorage();
  }, []);

  return { isInitialized, error };
}
