import React, { useState, useEffect } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./ReactionTapGame.css";

const ReactionTapGame: React.FC = () => {
  const [gameStatus, setGameStatus] = useState<
    "waiting" | "ready" | "active" | "finished"
  >("waiting");
  const [reactionTime, setReactionTime] = useState<number>(0);
  const [userPoints, setUserPoints] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [score, setScore] = useState<number>(0);

  // Listen to user's points from workouts
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

  const startChallenge = () => {
    setGameStatus("ready");
    // Random delay before target appears (1-3 seconds)
    setTimeout(() => {
      setGameStatus("active");
      setStartTime(Date.now());
    }, 1000 + Math.random() * 2000);
  };

  const handleTap = () => {
    if (gameStatus !== "active") return;

    const endTime = Date.now();
    const timeDiff = endTime - startTime;
    setReactionTime(timeDiff);

    // Calculate points (faster = more points)
    const calculatedPoints = Math.max(100 - Math.floor(timeDiff / 10), 0);
    setScore(calculatedPoints);
    setGameStatus("finished");

    // Save to Firestore
    if (auth.currentUser && calculatedPoints > 0) {
      const workoutsCollection = collection(
        db,
        "users",
        auth.currentUser.uid,
        "workouts"
      );
      addDoc(workoutsCollection, {
        workoutName: "Reaction Challenge",
        points: calculatedPoints,
        durationMinutes: 0,
        caloriesBurned: 0,
        timestamp: serverTimestamp(),
      }).catch((error) => console.error("Error saving reaction score:", error));
    }
  };

  return (
    <div className="reaction-tap-game">
      <p className="points-display">Current Points: {userPoints}</p>

      {gameStatus === "waiting" && (
        <button className="start-button" onClick={startChallenge}>
          Start Challenge
        </button>
      )}

      {gameStatus === "ready" && (
        <p className="instruction-text">Get ready... Wait for the target!</p>
      )}

      {gameStatus === "active" && (
        <div className="target-box" onClick={handleTap}>
          TAP NOW!
        </div>
      )}

      {gameStatus === "finished" && (
        <div className="result-display">
          <p className="result-text">
            Reaction Time: {reactionTime}ms
            <br />
            Points Earned: +{score}
          </p>
          <button
            className="play-again"
            onClick={() => setGameStatus("waiting")}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionTapGame;
