import React, { useEffect, useState } from "react";
import "./Dashboard.css";
import { collection, query, getDocs, doc, setDoc } from "firebase/firestore";
import { db, auth } from "../firebase";

type Workout = {
  workoutName: string;
  durationMinutes: number;
  caloriesBurned: number;
  points: number;
  timestamp: { toDate: () => Date };
  metrics?: {
    type: "reps" | "distance" | "steps" | "duration";
    value: number;
    unit?: string;
  }[];
};

type FirestoreWorkout = Workout & { id: string };

const DashboardSection: React.FC = () => {
  const [workouts, setWorkouts] = useState<FirestoreWorkout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkouts = async () => {
      const workoutCollection = collection(
        db,
        "users",
        auth.currentUser?.uid as string,
        "workouts"
      );
      const q = query(workoutCollection);
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Workout),
      })) as FirestoreWorkout[];

      setWorkouts(data);
      setLoading(false);
    };

    fetchWorkouts();
  }, []);

  const totalPoints = workouts.reduce(
    (sum, workout) => sum + workout.points,
    0
  );

  const purchaseLimit = (totalPoints / 1000) * 50;

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, "users", auth.currentUser.uid);
      setDoc(userDocRef, { purchaseLimit: purchaseLimit }, { merge: true })
        .then(() => {
          console.log("User purchase limit updated in Firestore");
        })
        .catch((error) => {
          console.error("Error updating purchase limit:", error);
        });
    }
  }, [totalPoints, purchaseLimit]);

  return (
    <div className="dashboard-container">
      <div className="stats-header">
        <h2>Activity History</h2>
        <div className="total-points">Total Points: {totalPoints}</div>
        <div className="purchase-limit">
          Purchase Limit: ${purchaseLimit.toFixed(2)}
        </div>
      </div>

      {loading && <p>Loading workouts...</p>}
      {!loading && (
        <div className="workout-list">
          {workouts.map((workout, index) => (
            <div key={index} className="workout-card">
              <div className="workout-date">
                {workout.timestamp.toDate().toLocaleDateString()}
              </div>
              <div className="workout-activity">
                <div className="workout-title">
                  {workout.workoutName}
                  {workout.metrics?.map((metric, idx) => (
                    <span key={idx} className="workout-metric">
                      {metric.value} {metric.unit || metric.type}
                    </span>
                  ))}
                </div>
                <div className="workout-meta">
                  ⏱ {workout.durationMinutes} mins | 🔥 {workout.caloriesBurned}{" "}
                  calories | 🏆 {workout.points} points
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardSection;
