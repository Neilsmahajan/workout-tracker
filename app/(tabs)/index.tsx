import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import {
  Plus,
  ChevronRight,
  Trash2,
  GripVertical,
  Edit2,
} from "lucide-react-native";
import { showAlert } from "@/utils/alert";
import type { Workout } from "@/types/workout";
import { Link } from "expo-router";
import { DumbbellIcon } from "@/components/DumbbellIcon";
import { useWorkouts } from "@/contexts/WorkoutContext";

export default function WorkoutsScreen() {
  const {
    workouts,
    addWorkout,
    updateWorkout,
    deleteWorkout,
    reorderWorkouts,
  } = useWorkouts();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [editWorkoutName, setEditWorkoutName] = useState("");

  const handleAddWorkout = async () => {
    if (!newWorkoutName.trim()) return;

    await addWorkout(newWorkoutName);
    setNewWorkoutName("");
    setShowAddModal(false);
  };

  const handleEditWorkout = async () => {
    if (!editWorkoutName.trim() || !editingWorkout) return;

    const updatedWorkout = {
      ...editingWorkout,
      name: editWorkoutName.trim(),
    };

    await updateWorkout(updatedWorkout);
    setEditWorkoutName("");
    setEditingWorkout(null);
  };

  const openEditWorkoutModal = (workout: Workout) => {
    setEditingWorkout(workout);
    setEditWorkoutName(workout.name);
  };

  const closeEditModal = () => {
    setEditingWorkout(null);
    setEditWorkoutName("");
  };

  const handleDeleteWorkout = (workoutId: string) => {
    showAlert(
      "Delete Workout",
      "Are you sure you want to delete this workout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteWorkout(workoutId);
          },
        },
      ],
    );
  };

  const handleDragEnd = async (data: Workout[]) => {
    await reorderWorkouts(data);
  };

  const renderWorkoutItem = ({
    item: workout,
    drag,
    isActive,
  }: RenderItemParams<Workout>) => {
    return (
      <ScaleDecorator>
        <View
          style={[styles.workoutCard, isActive && styles.workoutCardDragging]}
        >
          <View style={styles.workoutRow}>
            <TouchableOpacity style={styles.dragHandle} onLongPress={drag}>
              <GripVertical size={16} color="#C7C7CC" strokeWidth={2} />
            </TouchableOpacity>
            <Link href={`/workout/${workout.id}`} asChild>
              <TouchableOpacity style={styles.workoutContent}>
                <View style={styles.workoutInfo}>
                  <Text style={styles.workoutName}>{workout.name}</Text>
                  <View style={styles.workoutMeta}>
                    <Text style={styles.exerciseCount}>
                      {workout.exercises.length} exercise
                      {workout.exercises.length !== 1 ? "s" : ""}
                    </Text>
                  </View>
                </View>
                <ChevronRight size={20} color="#C7C7CC" strokeWidth={2} />
              </TouchableOpacity>
            </Link>
            <View style={styles.workoutActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openEditWorkoutModal(workout)}
              >
                <Edit2 size={16} color="#007AFF" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteWorkout(workout.id)}
              >
                <Trash2 size={16} color="#FF3B30" strokeWidth={2} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScaleDecorator>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Workouts</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Plus size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {workouts.length === 0 ? (
          <View style={styles.emptyState}>
            <DumbbellIcon size={64} color="#C7C7CC" strokeWidth={1.5} />
            <Text style={styles.emptyTitle}>No workouts yet</Text>
            <Text style={styles.emptySubtitle}>
              Tap the + button to create your first workout
            </Text>
          </View>
        ) : (
          <DraggableFlatList
            data={workouts}
            onDragEnd={({ data }) => handleDragEnd(data)}
            keyExtractor={(item) => item.id}
            renderItem={renderWorkoutItem}
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
            <Text style={styles.modalTitle}>New Workout</Text>
            <TouchableOpacity onPress={handleAddWorkout}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Workout Name</Text>
            <TextInput
              style={styles.textInput}
              value={newWorkoutName}
              onChangeText={setNewWorkoutName}
              placeholder="e.g., Shoulders and Chest"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddWorkout}
            />
          </View>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={!!editingWorkout}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeEditModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Workout</Text>
            <TouchableOpacity onPress={handleEditWorkout}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.inputLabel}>Workout Name</Text>
            <TextInput
              style={styles.textInput}
              value={editWorkoutName}
              onChangeText={setEditWorkoutName}
              placeholder="e.g., Shoulders and Chest"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleEditWorkout}
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
    fontSize: 28,
    fontWeight: "bold",
    color: "#000000",
  },
  addButton: {
    backgroundColor: "#007AFF",
    width: 44,
    height: 44,
    borderRadius: 22,
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
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#C7C7CC",
    marginTop: 8,
    textAlign: "center",
  },
  workoutCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  workoutRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  workoutContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingRight: 8,
    flex: 1,
  },
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000000",
    marginBottom: 4,
  },
  workoutMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  exerciseCount: {
    fontSize: 14,
    color: "#8E8E93",
  },
  workoutActions: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    paddingLeft: 8,
    gap: 8,
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
  workoutCardDragging: {
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
