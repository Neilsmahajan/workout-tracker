import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import {
  ArrowLeft,
  Plus,
  ChevronRight,
  Trash2,
  GripVertical,
  Edit2,
} from "lucide-react-native";
import { StorageService } from "@/utils/storage";
import { showAlert } from "@/utils/alert";
import type { Workout, Exercise } from "@/types/workout";

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [editExerciseName, setEditExerciseName] = useState("");

  const loadWorkout = useCallback(async () => {
    const workouts = await StorageService.getWorkouts();
    const foundWorkout = workouts.find((w) => w.id === id);
    setWorkout(foundWorkout || null);
  }, [id]);

  useEffect(() => {
    loadWorkout();
  }, [loadWorkout]);

  const handleAddExercise = async () => {
    if (!newExerciseName.trim() || !workout) return;

    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: newExerciseName.trim(),
      sets: [],
    };

    const updatedWorkout = {
      ...workout,
      exercises: [...workout.exercises, newExercise],
    };

    await StorageService.updateWorkout(updatedWorkout);
    setNewExerciseName("");
    setShowAddModal(false);
    loadWorkout();
  };

  const handleEditExercise = async () => {
    if (!editExerciseName.trim() || !editingExercise || !workout) return;

    const updatedExercise = {
      ...editingExercise,
      name: editExerciseName.trim(),
    };

    await StorageService.updateExercise(workout.id, updatedExercise);
    setEditExerciseName("");
    setEditingExercise(null);
    loadWorkout();
  };

  const openEditExerciseModal = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setEditExerciseName(exercise.name);
  };

  const closeEditModal = () => {
    setEditingExercise(null);
    setEditExerciseName("");
  };

  const handleDeleteExercise = (exerciseId: string) => {
    showAlert(
      "Delete Exercise",
      "Are you sure you want to delete this exercise?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!workout) return;
            const updatedWorkout = {
              ...workout,
              exercises: workout.exercises.filter((e) => e.id !== exerciseId),
            };
            await StorageService.updateWorkout(updatedWorkout);
            loadWorkout();
          },
        },
      ],
    );
  };

  const handleDragEnd = async (data: Exercise[]) => {
    if (!workout) return;
    const updatedWorkout = {
      ...workout,
      exercises: data,
    };
    setWorkout(updatedWorkout);
    await StorageService.reorderExercises(workout.id, data);
  };

  const renderExerciseItem = ({
    item: exercise,
    drag,
    isActive,
  }: RenderItemParams<Exercise>) => {
    if (!workout) return null;

    return (
      <ScaleDecorator>
        <View
          style={[styles.exerciseCard, isActive && styles.exerciseCardDragging]}
        >
          <View style={styles.exerciseRow}>
            <TouchableOpacity style={styles.dragHandle} onLongPress={drag}>
              <GripVertical size={16} color="#C7C7CC" strokeWidth={2} />
            </TouchableOpacity>
            <Link href={`/exercise/${workout.id}/${exercise.id}`} asChild>
              <TouchableOpacity style={styles.exerciseContent}>
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{exercise.name}</Text>
                  <View style={styles.exerciseMeta}>
                    <Text style={styles.setCount}>
                      {exercise.sets.length} set
                      {exercise.sets.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#C7C7CC" strokeWidth={2} />
              </TouchableOpacity>
            </Link>
            <View style={styles.exerciseActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditExerciseModal(exercise)}
              >
                <Edit2 size={16} color="#007AFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteExercise(exercise.id)}
              >
                <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  if (!workout) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Workout not found</Text>
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
          {workout.name}
        </Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {workout.exercises.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No exercises yet</Text>
            <Text style={styles.emptySubtitle}>
              Add exercises to start tracking your workout
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={workout.exercises}
            onDragEnd={({ data }) => handleDragEnd(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderExerciseItem}
          />
        )}
      </View>

      <Modal
        visible={showAddModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowAddModal(false)}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Exercise</Text>
            <TouchableOpacity onPress={handleAddExercise}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.textInput}
              value={newExerciseName}
              onChangeText={setNewExerciseName}
              placeholder="e.g., Seated Barbell Shoulder Press"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddExercise}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={!!editingExercise}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Exercise</Text>
            <TouchableOpacity onPress={handleEditExercise}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Exercise Name</Text>
            <TextInput
              style={styles.textInput}
              value={editExerciseName}
              onChangeText={setEditExerciseName}
              placeholder="e.g., Seated Barbell Shoulder Press"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleEditExercise}
            />
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
  exerciseCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  exerciseRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    flex: 1,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  exerciseMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  setCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  exerciseActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    marginLeft: 8,
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
  },
  deleteButton: {
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
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
  exerciseCardDragging: {
    opacity: 0.8,
    transform: [{ scale: 1.02 }],
  },
  dragHandle: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#F2F2F7",
    marginLeft: 16,
    marginRight: 8,
  },
});
