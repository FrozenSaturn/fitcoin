import React, { useState, useEffect } from "react";
import {
  doc,
  onSnapshot,
  runTransaction,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebase";
import "./CoinFlipGame.css";

const CoinFlipGame: React.FC = () => {
  const [userChoice, setUserChoice] = useState<"heads" | "tails" | null>(null);
  const [result, setResult] = useState<"heads" | "tails" | null>(null);
  const [flipping, setFlipping] = useState(false);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Listen to user's points in real time
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

  const handleFlip = async () => {
    if (!auth.currentUser || !userChoice || flipping) return;
    setFlipping(true);
    setResult(null);

    // Generate random result after 1s delay for suspense
    setTimeout(async () => {
      const coinResult = Math.random() < 0.5 ? "heads" : "tails";
      setResult(coinResult);

      try {
        const workoutsCollection = collection(
          db,
          "users",
          auth.currentUser!.uid,
          "workouts"
        );

        // Add win/loss as workout entry
        await addDoc(workoutsCollection, {
          workoutName: "Coin Flip Game",
          points: coinResult === userChoice ? userPoints : -userPoints,
          durationMinutes: 0,
          caloriesBurned: 0,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error("Error adding workout:", error);
      } finally {
        setFlipping(false);
      }
    }, 1000);
  };

  return (
    <div className="coin-flip-game">
      <p className="points-display">Current Points: {userPoints}</p>

      <div className="choice-buttons">
        <button
          className={`choice-btn ${userChoice === "heads" ? "selected" : ""}`}
          onClick={() => setUserChoice("heads")}
          disabled={flipping || userPoints === 0}
        >
          Heads
        </button>
        <button
          className={`choice-btn ${userChoice === "tails" ? "selected" : ""}`}
          onClick={() => setUserChoice("tails")}
          disabled={flipping || userPoints === 0}
        >
          Tails
        </button>
      </div>

      <button
        className="flip-button"
        onClick={handleFlip}
        disabled={!userChoice || flipping || userPoints === 0}
      >
        {flipping ? "Flipping..." : "Flip Coin"}
      </button>

      {result && (
        <div className="result-display">
          <p className="result-text">
            Result: {result}!
            <br />
            {result === userChoice ? "🎉 You won!" : "😢 You lost..."}
          </p>
        </div>
      )}
    </div>
  );
};

export default CoinFlipGame;
