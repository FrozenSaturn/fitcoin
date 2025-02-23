import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db, auth } from "../firebase";
import "./GamesSection.css";
import SpinWheelGame from "./games/SpinWheelGame";
import CoinFlipGame from "./games/CoinFlipGame";
import ReactionTapGame from "./games/ReactionTapGame";

const GamesSection: React.FC = () => {
  // selectedGame is null (show games list) or "spin", "coin", or "tap".
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [userPoints, setUserPoints] = useState<number>(0);

  // Track user points from workouts
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

  // If the spin the wheel game is selected, render it.
  if (selectedGame === "spin") {
    return (
      <div className="games-section">
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          ← Back to Games
        </button>
        <SpinWheelGame />
      </div>
    );
  }

  // Handle coin flip game (new section)
  if (selectedGame === "coin") {
    return (
      <div className="games-section">
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          ← Back to Games
        </button>
        <CoinFlipGame />
      </div>
    );
  }

  if (selectedGame === "tap") {
    return (
      <div className="games-section">
        <button className="back-button" onClick={() => setSelectedGame(null)}>
          ← Back to Games
        </button>
        <ReactionTapGame />
      </div>
    );
  }

  // Render the list of game cards.
  return (
    <div className="games-section">
      <div className="games-header">
        <h2 className="section-title">Games</h2>
        <div className="points-badge">🏆 Current Points: {userPoints}</div>
      </div>
      <div className="games-container">
        <div className="game-card">
          <h3>Spin the Wheel</h3>
          <p>Win points, lose them all, or something in between.</p>
          <button
            className="play-button"
            onClick={() => setSelectedGame("spin")}
          >
            Play
          </button>
        </div>
        <div className="game-card">
          <h3>Coin Flip Wager</h3>
          <p>Double your points if you win, else you lose them all.</p>
          <button
            className="play-button"
            onClick={() => setSelectedGame("coin")}
          >
            Play
          </button>
        </div>
        <div className="game-card">
          <h3>Reaction Tap Challenge</h3>
          <p>Tap as fast as you can for a bonus!</p>
          <button
            className="play-button"
            onClick={() => setSelectedGame("tap")}
          >
            Play
          </button>
        </div>
      </div>
    </div>
  );
};

export default GamesSection;
