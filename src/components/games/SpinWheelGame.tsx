import React, { useState, useEffect } from "react";
import {
  updateDoc,
  doc,
  increment,
  onSnapshot,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase"; // Adjust path as needed
import "./SpinWheelGame.css";

type Outcome = {
  label: string;
  // points can be a number or a special flag "lose-all"
  points: number | "lose-all";
};

const outcomes: Outcome[] = [
  { label: "Jackpot! +200 Points", points: 200 },
  { label: "Win! +75 Points", points: 75 },
  { label: "No Luck - Nothing", points: 0 },
  { label: "Lose All - You lose all points!", points: "lose-all" },
  { label: "Loss! -25 Points", points: -25 },
];

const SpinWheelGame: React.FC = () => {
  const [spinning, setSpinning] = useState<boolean>(false);
  const [result, setResult] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Listen to user's points on their Firestore document in real time.
  useEffect(() => {
    if (!auth.currentUser) return;
    const workoutsCollection = collection(
      db,
      "users",
      auth.currentUser.uid,
      "workouts"
    );
    const unsubscribe = onSnapshot(workoutsCollection, (snapshot) => {
      const total = snapshot.docs.reduce(
        (sum, doc) => sum + (doc.data().points || 0),
        0
      );
      setUserPoints(total);
    });
    return () => unsubscribe();
  }, []);

  const handleSpin = () => {
    if (spinning) return;
    setResult(null);
    setSpinning(true);

    // Calculate a random rotation angle for the animation.
    const extraSpins = Math.floor(Math.random() * 5) + 5; // 5 to 9 full rotations
    const randomDegree = Math.floor(Math.random() * 360);
    const newRotation = extraSpins * 360 + randomDegree;
    setRotation(newRotation);

    // Pick a random outcome.
    const outcomeIndex = Math.floor(Math.random() * outcomes.length);
    const selectedOutcome = outcomes[outcomeIndex];

    // After the spin duration, update the user's points and display the outcome.
    setTimeout(async () => {
      setSpinning(false);
      setResult(selectedOutcome.label);

      if (!auth.currentUser) return;
      const workoutsCollection = collection(
        db,
        "users",
        auth.currentUser.uid,
        "workouts"
      );

      try {
        // Add workout entry instead of updating points directly
        await addDoc(workoutsCollection, {
          workoutName: "Spin the Wheel",
          points:
            selectedOutcome.points === "lose-all"
              ? -userPoints // Deduct all points
              : (selectedOutcome.points as number),
          durationMinutes: 0,
          caloriesBurned: 0,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error adding workout:", error);
      }
    }, 2500); // spin duration in milliseconds
  };

  return (
    <div className="spin-wheel-game">
      <p className="points-display">Current Points: {userPoints}</p>
      <div className="wheel-container">
        <div
          className={`wheel ${spinning ? "spinning" : ""}`}
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          <div className="wheel-center">Wheel</div>
        </div>
      </div>
      <button className="spin-button" onClick={handleSpin} disabled={spinning}>
        {spinning ? "Spinning..." : "Spin"}
      </button>
      {result && <p className="result-text">{result}</p>}
    </div>
  );
};

export default SpinWheelGame;
