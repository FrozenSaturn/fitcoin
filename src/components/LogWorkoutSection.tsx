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
      if (!workoutData) throw new Error("AI parsing failed");

      // Use the points provided by the AI output
      const points = workoutData.points;

      await addDoc(
        collection(db, "users", auth.currentUser?.uid as string, "workouts"),
        {
          ...workoutData,
          timestamp: serverTimestamp(),
        }
      );

      setMessages([
        ...newMessages,
        {
          content: `🏋️ ${workoutData.workoutName} (${workoutData.durationMinutes} min)
🔥 ${workoutData.caloriesBurned} calories (+${points} pts)`,
          isUser: false,
          points,
        },
      ]);
    } catch (error) {
      console.error("Workout logging error:", error);
      setMessages([
        ...newMessages,
        {
          content:
            "❌ Failed to log workout. Please check your input or try again.",
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
