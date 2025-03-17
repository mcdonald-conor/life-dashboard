interface Exercise {
  name: string
  sets: number | string
  reps: number | string
  weight?: number // in kg
}

interface WorkoutTemplate {
  id: string
  name: string
  exercises: Exercise[]
}

export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "glutes-hamstring",
    name: "Glutes and Hamstring",
    exercises: [
      { name: "Hip Thrust", sets: 3, reps: 10 },
      { name: "Cable Glute Kickback", sets: 3, reps: 10 },
      { name: "Abduction", sets: 3, reps: 10 },
      { name: "Treadmill", sets: "-", reps: "30mins" },
    ],
  },
  {
    id: "back-shoulders",
    name: "Back and Shoulders",
    exercises: [
      { name: "Assisted Chin Up", sets: 3, reps: 10 },
      { name: "Lat pull down", sets: 3, reps: 10 },
      { name: "Seated arnold press", sets: 3, reps: 10 },
      { name: "Lateral raise", sets: 3, reps: 10 },
      { name: "Front raise", sets: 3, reps: 10 },
      { name: "Treadmill", sets: "-", reps: "30mins" },
    ],
  },
  {
    id: "quad-glutes",
    name: "Quad and Glutes",
    exercises: [
      { name: "Hip thrust", sets: 3, reps: 10 },
      { name: "Abduction", sets: 3, reps: "20-25" },
      { name: "RDL", sets: 3, reps: 10 },
      { name: "Cable Glute Kickback", sets: 3, reps: "MAX" },
    ],
  },
  {
    id: "ab-finisher",
    name: "Ab Finisher",
    exercises: [
      { name: "Dead bug with plates", sets: "50 seconds", reps: "x3" },
      { name: "Star side plank", sets: "50 seconds", reps: "x3" },
      { name: "Flutter kicks", sets: "50 seconds", reps: "x3" },
    ],
  },
]
