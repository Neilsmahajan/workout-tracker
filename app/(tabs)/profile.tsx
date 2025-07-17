import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Share } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { User, Trash2, Download } from "lucide-react-native";
import { StorageService } from "@/utils/storage";
import { showAlert } from "@/utils/alert";

export default function ProfileScreen() {
  const handleClearData = () => {
    showAlert(
      "Clear All Data",
      "Are you sure you want to delete all your workouts? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            await StorageService.saveWorkouts([]);
            showAlert("Success", "All workout data has been cleared.");
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = await StorageService.exportData();
      if (exportData) {
        await Share.share({
          message: exportData,
          title: "Workout Data Backup",
        });
      } else {
        showAlert("Error", "Failed to export data");
      }
    } catch {
      showAlert("Error", "Failed to share data");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.profileSection}>
          <View style={styles.profileIcon}>
            <User size={32} color="#007AFF" strokeWidth={2} />
          </View>
          <Text style={styles.profileName}>Workout Tracker User</Text>
          <Text style={styles.profileEmail}>Keep crushing those PRs!</Text>
        </View>

        <View style={styles.settingsSection}>
          <Text style={styles.sectionTitle}>Data Management</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleExportData}
          >
            <View style={styles.settingIcon}>
              <Download size={20} color="#007AFF" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingLabel}>Export Data</Text>
              <Text style={styles.settingDescription}>
                Backup your workout data
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={handleClearData}
          >
            <View style={styles.settingIcon}>
              <Trash2 size={20} color="#FF3B30" strokeWidth={2} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingLabel, { color: "#FF3B30" }]}>
                Clear All Data
              </Text>
              <Text style={styles.settingDescription}>
                Delete all workouts and exercises
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.aboutSection}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.aboutText}>
            Workout Tracker helps you log and track your fitness progress. Keep
            track of your exercises, sets, reps, and weights all in one place.
          </Text>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  profileIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#8E8E93",
  },
  settingsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  settingItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F2F2F7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: "#8E8E93",
  },
  aboutSection: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  aboutText: {
    fontSize: 16,
    color: "#8E8E93",
    lineHeight: 24,
    marginBottom: 16,
  },
  versionText: {
    fontSize: 14,
    color: "#C7C7CC",
    textAlign: "center",
  },
});
