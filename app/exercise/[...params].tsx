import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ArrowLeft, Plus, ChevronRight, Trash2 } from "lucide-react-native";
import { StorageService } from "@/utils/storage";
import { showAlert } from "@/utils/alert";
import type { Workout, Exercise, WorkoutSet } from "@/types/workout";

export default function ExerciseDetailScreen() {
  const { params } = useLocalSearchParams<{ params: string[] }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSet, setEditingSet] = useState<WorkoutSet | null>(null);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("");

  const workoutId = params?.[0];
  const exerciseId = params?.[1];

  const loadExercise = useCallback(async () => {
    if (!workoutId || !exerciseId) return;

    const workouts = await StorageService.getWorkouts();
    const foundWorkout = workouts.find((w) => w.id === workoutId);
    const foundExercise = foundWorkout?.exercises.find(
      (e) => e.id === exerciseId,
    );

    setWorkout(foundWorkout || null);
    setExercise(foundExercise || null);
  }, [workoutId, exerciseId]);

  useEffect(() => {
    loadExercise();
  }, [loadExercise]);

  const handleAddSet = async () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (!weightNum || !repsNum || !workout || !exercise) return;

    const newSet: WorkoutSet = {
      id: Date.now().toString(),
      weight: weightNum,
      reps: repsNum,
    };

    const updatedExercise = {
      ...exercise,
      sets: [...exercise.sets, newSet],
    };

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === exercise.id ? updatedExercise : e,
      ),
    };

    await StorageService.updateWorkout(updatedWorkout);
    setWeight("");
    setReps("");
    setShowAddModal(false);
    loadExercise();
  };

  const handleEditSet = async () => {
    const weightNum = parseFloat(weight);
    const repsNum = parseInt(reps, 10);

    if (!weightNum || !repsNum || !workout || !exercise || !editingSet) return;

    const updatedSet = {
      ...editingSet,
      weight: weightNum,
      reps: repsNum,
    };

    const updatedExercise = {
      ...exercise,
      sets: exercise.sets.map((s) => (s.id === editingSet.id ? updatedSet : s)),
    };

    const updatedWorkout = {
      ...workout,
      exercises: workout.exercises.map((e) =>
        e.id === exercise.id ? updatedExercise : e,
      ),
    };

    await StorageService.updateWorkout(updatedWorkout);
    setWeight("");
    setReps("");
    setEditingSet(null);
    loadExercise();
  };

  const handleDeleteSet = (setId: string) => {
    showAlert("Delete Set", "Are you sure you want to delete this set?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          if (!workout || !exercise) return;

          const updatedExercise = {
            ...exercise,
            sets: exercise.sets.filter((s) => s.id !== setId),
          };

          const updatedWorkout = {
            ...workout,
            exercises: workout.exercises.map((e) =>
              e.id === exercise.id ? updatedExercise : e,
            ),
          };

          await StorageService.updateWorkout(updatedWorkout);
          loadExercise();
        },
      },
    ]);
  };

  const openEditModal = (set: WorkoutSet) => {
    setEditingSet(set);
    setWeight(set.weight.toString());
    setReps(set.reps.toString());
  };

  const openAddModal = () => {
    setEditingSet(null);
    setWeight("");
    setReps("");
    setShowAddModal(true);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setEditingSet(null);
    setWeight("");
    setReps("");
  };

  if (!workout || !exercise) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Exercise not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft size={24} color="#007AFF" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={1}>
          {exercise.name}
        </Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {exercise.sets.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No sets yet</Text>
            <Text style={styles.emptySubtitle}>
              Add sets to track your exercise progress
            </Text>
          </View>
        ) : (
          <View style={styles.setsContainer}>
            <Text style={styles.sectionTitle}>Sets</Text>
            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setCard}>
                <View style={styles.setRow}>
                  <TouchableOpacity
                    style={styles.setContent}
                    onPress={() => openEditModal(set)}
                  >
                    <View style={styles.setInfo}>
                      <Text style={styles.setNumber}>Set {index + 1}</Text>
                      <Text style={styles.setDetails}>
                        {set.weight} lbs × {set.reps} reps
                      </Text>
                    </View>
                    <ChevronRight size={20} color="#C7C7CC" strokeWidth={2} />
                  </TouchableOpacity>
                  <View style={styles.setActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => handleDeleteSet(set.id)}
                    >
                      <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showAddModal || editingSet !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingSet ? "Edit Set" : "New Set"}
            </Text>
            <TouchableOpacity
              onPress={editingSet ? handleEditSet : handleAddSet}
            >
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <View style={styles.inputRow}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Weight (lbs)</Text>
                <TextInput
                  style={styles.textInput}
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="115"
                  keyboardType="numeric"
                  autoFocus
                />
              </View>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Reps</Text>
                <TextInput
                  style={styles.textInput}
                  value={reps}
                  onChangeText={setReps}
                  placeholder="10"
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000000",
    flex: 1,
    marginHorizontal: 16,
    textAlign: "center",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
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
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#C7C7CC",
    textAlign: "center",
  },
  setsContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 16,
  },
  setCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  setRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  setContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingRight: 8,
    flex: 1,
  },
  setInfo: {
    flex: 1,
  },
  setNumber: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  setDetails: {
    fontSize: 14,
    color: "#8E8E93",
  },
  setActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    paddingLeft: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5EA",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
  },
  cancelButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  saveButton: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
  },
  modalContent: {
    padding: 20,
  },
  inputRow: {
    flexDirection: "row",
    gap: 16,
  },
  inputContainer: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#000000",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
});
