import React, { useState } from "react";
import "./LogWorkout.css";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { parseWorkoutText } from "../lib/gemini";

type Message = {
  content: string;
  isUser: boolean;
  points?: number;
};

const LogWorkoutSection: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessages = [...messages, { content: input, isUser: true }];
    setMessages(newMessages);

    try {
      const workoutData = await parseWorkoutText(input);
      console.log("Raw AI Response:", workoutData);

      if (!workoutData || typeof workoutData !== "object") {
        throw new Error("AI returned invalid format");
      }

      const validatedData = {
        workoutName: workoutData.workoutName || "Unknown Exercise",
        durationMinutes: Number(workoutData.durationMinutes) || 0,
        caloriesBurned: Number(workoutData.caloriesBurned) || 0,
        points: Number(workoutData.points) || 0,
        metrics: workoutData.metrics || [],
      };

      if (
        validatedData.durationMinutes <= 0 ||
        validatedData.caloriesBurned <= 0
      ) {
        throw new Error("Invalid duration or calories values");
      }

      const userId = auth.currentUser?.uid;
      if (!userId) throw new Error("User not authenticated");

      const requiredFields = ["durationMinutes", "caloriesBurned", "points"];
      requiredFields.forEach((field) => {
        if (typeof workoutData[field] === "undefined") {
          throw new Error(`Missing required field: ${field}`);
        }
      });

      await addDoc(collection(db, "users", userId, "workouts"), {
        ...workoutData,
        timestamp: serverTimestamp(),
      });

      setMessages([
        ...newMessages,
        {
          content: `🏋️ ${workoutData.workoutName} (${workoutData.durationMinutes} min)
🔥 ${workoutData.caloriesBurned} calories (+${workoutData.points} pts)`,
          isUser: false,
          points: workoutData.points,
        },
      ]);
    } catch (error) {
      console.error("Workout logging error:", error);
      setMessages([
        ...newMessages,
        {
          content:
            error instanceof Error
              ? `❌ ${error.message}`
              : "❌ Failed to log workout. Please check your input format",
          isUser: false,
        },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.isUser ? "user" : "ai"}`}>
            <div className="bubble">
              <p>{msg.content}</p>
              {msg.points && (
                <div className="points-badge">+{msg.points} pts</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Describe your workout (e.g., 'Ran for 30 minutes')"
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default LogWorkoutSection;
