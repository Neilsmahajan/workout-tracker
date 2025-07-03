import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Calendar, TrendingUp } from "lucide-react-native";
import { StorageService } from "@/utils/storage";
import type { Workout } from "@/types/workout";

export default function HistoryScreen() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);

  useEffect(() => {
    loadWorkouts();
  }, []);

  const loadWorkouts = async () => {
    const savedWorkouts = await StorageService.getWorkouts();
    // Sort by date, newest first
    const sortedWorkouts = savedWorkouts.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
    setWorkouts(sortedWorkouts);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getTotalSets = (workout: Workout) => {
    return workout.exercises.reduce(
      (total, exercise) => total + exercise.sets.length,
      0,
    );
  };

  const getTotalWeight = (workout: Workout) => {
    return workout.exercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce((setTotal, set) => {
          return setTotal + set.weight * set.reps;
        }, 0)
      );
    }, 0);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Workout History</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <TrendingUp size={64} color="#C7C7CC" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No workout history</Text>
            <Text style={styles.emptySubtitle}>
              Complete your first workout to see your progress here
            </Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{workouts.length}</Text>
                <Text style={styles.statLabel}>Total Workouts</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {workouts.reduce(
                    (total, workout) => total + workout.exercises.length,
                    0,
                  )}
                </Text>
                <Text style={styles.statLabel}>Total Exercises</Text>
              </View>
            </View>

            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Workouts</Text>
              {workouts.map((workout) => (
                <View key={workout.id} style={styles.historyCard}>
                  <View style={styles.historyHeader}>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <View style={styles.dateContainer}>
                      <Calendar size={14} color="#8E8E93" strokeWidth={2} />
                      <Text style={styles.workoutDate}>
                        {formatDate(workout.date)}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.workoutStats}>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {workout.exercises.length}
                      </Text>
                      <Text style={styles.statText}>exercises</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {getTotalSets(workout)}
                      </Text>
                      <Text style={styles.statText}>sets</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statValue}>
                        {getTotalWeight(workout).toLocaleString()}
                      </Text>
                      <Text style={styles.statText}>total lbs</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#8E8E93",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#C7C7CC",
    marginTop: 8,
    textAlign: "center",
  },
  statsContainer: {
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#8E8E93",
    textAlign: "center",
  },
  historySection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  workoutName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  workoutDate: {
    fontSize: 14,
    color: "#8E8E93",
  },
  workoutStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  statText: {
    fontSize: 12,
    color: "#8E8E93",
    marginTop: 2,
  },
});
