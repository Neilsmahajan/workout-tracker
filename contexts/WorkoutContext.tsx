import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { Workout, Exercise, WorkoutSet } from '@/types/workout';
import { StorageService } from '@/utils/storage';

// Action types
type WorkoutAction =
    | { type: 'SET_WORKOUTS'; payload: Workout[] }
    | { type: 'ADD_WORKOUT'; payload: Workout }
    | { type: 'UPDATE_WORKOUT'; payload: Workout }
    | { type: 'DELETE_WORKOUT'; payload: string }
    | { type: 'REORDER_WORKOUTS'; payload: Workout[] }
    | { type: 'ADD_EXERCISE'; payload: { workoutId: string; exercise: Exercise } }
    | { type: 'UPDATE_EXERCISE'; payload: { workoutId: string; exercise: Exercise } }
    | { type: 'DELETE_EXERCISE'; payload: { workoutId: string; exerciseId: string } }
    | { type: 'REORDER_EXERCISES'; payload: { workoutId: string; exercises: Exercise[] } }
    | { type: 'ADD_SET'; payload: { workoutId: string; exerciseId: string; set: WorkoutSet } }
    | { type: 'UPDATE_SET'; payload: { workoutId: string; exerciseId: string; set: WorkoutSet } }
    | { type: 'DELETE_SET'; payload: { workoutId: string; exerciseId: string; setId: string } }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null };

// State type
interface WorkoutState {
    workouts: Workout[];
    loading: boolean;
    error: string | null;
}

// Context type
interface WorkoutContextType extends WorkoutState {
    // Workout actions
    loadWorkouts: () => Promise<void>;
    addWorkout: (name: string) => Promise<void>;
    updateWorkout: (workout: Workout) => Promise<void>;
    deleteWorkout: (workoutId: string) => Promise<void>;
    reorderWorkouts: (workouts: Workout[]) => Promise<void>;

    // Exercise actions
    addExercise: (workoutId: string, name: string) => Promise<void>;
    updateExercise: (workoutId: string, exercise: Exercise) => Promise<void>;
    deleteExercise: (workoutId: string, exerciseId: string) => Promise<void>;
    reorderExercises: (workoutId: string, exercises: Exercise[]) => Promise<void>;

    // Set actions
    addSet: (workoutId: string, exerciseId: string, weight: number, reps: number) => Promise<void>;
    updateSet: (workoutId: string, exerciseId: string, set: WorkoutSet) => Promise<void>;
    deleteSet: (workoutId: string, exerciseId: string, setId: string) => Promise<void>;

    // Getters
    getWorkout: (workoutId: string) => Workout | undefined;
    getExercise: (workoutId: string, exerciseId: string) => Exercise | undefined;
}

// Initial state
const initialState: WorkoutState = {
    workouts: [],
    loading: false,
    error: null,
};

// Reducer
function workoutReducer(state: WorkoutState, action: WorkoutAction): WorkoutState {
    switch (action.type) {
        case 'SET_WORKOUTS':
            return { ...state, workouts: action.payload };

        case 'ADD_WORKOUT':
            return { ...state, workouts: [...state.workouts, action.payload] };

        case 'UPDATE_WORKOUT':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.id ? action.payload : w
                ),
            };

        case 'DELETE_WORKOUT':
            return {
                ...state,
                workouts: state.workouts.filter(w => w.id !== action.payload),
            };

        case 'REORDER_WORKOUTS':
            return { ...state, workouts: action.payload };

        case 'ADD_EXERCISE':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? { ...w, exercises: [...w.exercises, action.payload.exercise] }
                        : w
                ),
            };

        case 'UPDATE_EXERCISE':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? {
                            ...w,
                            exercises: w.exercises.map(e =>
                                e.id === action.payload.exercise.id ? action.payload.exercise : e
                            ),
                        }
                        : w
                ),
            };

        case 'DELETE_EXERCISE':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? { ...w, exercises: w.exercises.filter(e => e.id !== action.payload.exerciseId) }
                        : w
                ),
            };

        case 'REORDER_EXERCISES':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? { ...w, exercises: action.payload.exercises }
                        : w
                ),
            };

        case 'ADD_SET':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? {
                            ...w,
                            exercises: w.exercises.map(e =>
                                e.id === action.payload.exerciseId
                                    ? { ...e, sets: [...e.sets, action.payload.set] }
                                    : e
                            ),
                        }
                        : w
                ),
            };

        case 'UPDATE_SET':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? {
                            ...w,
                            exercises: w.exercises.map(e =>
                                e.id === action.payload.exerciseId
                                    ? {
                                        ...e,
                                        sets: e.sets.map(s =>
                                            s.id === action.payload.set.id ? action.payload.set : s
                                        ),
                                    }
                                    : e
                            ),
                        }
                        : w
                ),
            };

        case 'DELETE_SET':
            return {
                ...state,
                workouts: state.workouts.map(w =>
                    w.id === action.payload.workoutId
                        ? {
                            ...w,
                            exercises: w.exercises.map(e =>
                                e.id === action.payload.exerciseId
                                    ? { ...e, sets: e.sets.filter(s => s.id !== action.payload.setId) }
                                    : e
                            ),
                        }
                        : w
                ),
            };

        case 'SET_LOADING':
            return { ...state, loading: action.payload };

        case 'SET_ERROR':
            return { ...state, error: action.payload };

        default:
            return state;
    }
}

// Context
const WorkoutContext = createContext<WorkoutContextType | null>(null);

// Provider
interface WorkoutProviderProps {
    children: React.ReactNode;
}

export function WorkoutProvider({ children }: WorkoutProviderProps) {
    const [state, dispatch] = useReducer(workoutReducer, initialState);

    // Load workouts on mount
    useEffect(() => {
        loadWorkouts();
    }, []);

    // Sync with storage whenever state changes
    useEffect(() => {
        if (state.workouts.length > 0 || state.workouts.length === 0) {
            StorageService.saveWorkouts(state.workouts).catch(error => {
                console.error('Failed to sync workouts to storage:', error);
                dispatch({ type: 'SET_ERROR', payload: 'Failed to save data' });
            });
        }
    }, [state.workouts]);

    const loadWorkouts = async () => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true });
            dispatch({ type: 'SET_ERROR', payload: null });
            const workouts = await StorageService.getWorkouts();
            dispatch({ type: 'SET_WORKOUTS', payload: workouts });
        } catch (error) {
            console.error('Failed to load workouts:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load workouts' });
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    };

    const addWorkout = async (name: string) => {
        const workout: Workout = {
            id: Date.now().toString(),
            name: name.trim(),
            exercises: [],
        };
        dispatch({ type: 'ADD_WORKOUT', payload: workout });
    };

    const updateWorkout = async (workout: Workout) => {
        dispatch({ type: 'UPDATE_WORKOUT', payload: workout });
    };

    const deleteWorkout = async (workoutId: string) => {
        dispatch({ type: 'DELETE_WORKOUT', payload: workoutId });
    };

    const reorderWorkouts = async (workouts: Workout[]) => {
        dispatch({ type: 'REORDER_WORKOUTS', payload: workouts });
    };

    const addExercise = async (workoutId: string, name: string) => {
        const exercise: Exercise = {
            id: Date.now().toString(),
            name: name.trim(),
            sets: [],
        };
        dispatch({ type: 'ADD_EXERCISE', payload: { workoutId, exercise } });
    };

    const updateExercise = async (workoutId: string, exercise: Exercise) => {
        dispatch({ type: 'UPDATE_EXERCISE', payload: { workoutId, exercise } });
    };

    const deleteExercise = async (workoutId: string, exerciseId: string) => {
        dispatch({ type: 'DELETE_EXERCISE', payload: { workoutId, exerciseId } });
    };

    const reorderExercises = async (workoutId: string, exercises: Exercise[]) => {
        dispatch({ type: 'REORDER_EXERCISES', payload: { workoutId, exercises } });
    };

    const addSet = async (workoutId: string, exerciseId: string, weight: number, reps: number) => {
        const set: WorkoutSet = {
            id: Date.now().toString(),
            weight,
            reps,
        };
        dispatch({ type: 'ADD_SET', payload: { workoutId, exerciseId, set } });
    };

    const updateSet = async (workoutId: string, exerciseId: string, set: WorkoutSet) => {
        dispatch({ type: 'UPDATE_SET', payload: { workoutId, exerciseId, set } });
    };

    const deleteSet = async (workoutId: string, exerciseId: string, setId: string) => {
        dispatch({ type: 'DELETE_SET', payload: { workoutId, exerciseId, setId } });
    };

    const getWorkout = (workoutId: string) => {
        return state.workouts.find(w => w.id === workoutId);
    };

    const getExercise = (workoutId: string, exerciseId: string) => {
        const workout = getWorkout(workoutId);
        return workout?.exercises.find(e => e.id === exerciseId);
    };

    const contextValue: WorkoutContextType = {
        ...state,
        loadWorkouts,
        addWorkout,
        updateWorkout,
        deleteWorkout,
        reorderWorkouts,
        addExercise,
        updateExercise,
        deleteExercise,
        reorderExercises,
        addSet,
        updateSet,
        deleteSet,
        getWorkout,
        getExercise,
    };

    return (
        <WorkoutContext.Provider value={contextValue}>
            {children}
        </WorkoutContext.Provider>
    );
}

// Hook
export function useWorkouts() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkouts must be used within a WorkoutProvider');
    }
    return context;
}
