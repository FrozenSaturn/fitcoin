import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI("AIzaSyCHiuRpmb7zHec-9LI1gQYDpEJW4m1Jb4Q");

console.log("Environment Mode:", import.meta.env.MODE);

export async function parseWorkoutText(text: string) {
  try {
    const prompt = `You are a workout parser. Given the following workout description, extract and calculate details and output a valid JSON object without any additional text or commentary. The JSON object must have the following keys:

- "workoutName": string (the main workout activity, e.g., "Running", "Pushups")
- "intensity": string ("low", "medium", or "high")
- "durationMinutes": number (duration of the workout in minutes)
- "caloriesBurned": number (if not provided, estimate as 10 calories per minute)
- "metrics": an array of objects (each with:
    - "type": one of "reps", "distance", "steps", or "duration"
    - "value": number
    - "unit": string (optional, e.g., "km", "miles", "minutes")
  )
- "points": number (calculated using these rules:
    • 1 point per rep
    • 100 points per km (if distance is in miles, convert to km)
    • 0.1 points per step
    • 2 points per minute
    • Use a base of 50 points if no metrics are found)
- "notes": string (a brief summary)

Use these guidelines:
- For inputs that only mention time (e.g., "ran for 30 minutes"), assume "intensity" is "medium", estimate calories as (durationMinutes * 10), and treat the duration as a metric with type "duration".
- For inputs like "did 100 pushups today", extract the exercise and the number (using type "reps").
- Output strictly only the JSON.

Example:  
Input: "Ran for 30 minutes"  
Possible output: 
{
  "workoutName": "Running",
  "intensity": "medium",
  "durationMinutes": 30,
  "caloriesBurned": 300,
  "metrics": [
    { "type": "duration", "value": 30, "unit": "minutes" }
  ],
  "points": 60,
  "notes": "30-minute run"
}

Now, parse this workout description: "${text}"`;

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-latest",
      systemInstruction:
        "You are a fitness data parser that only returns valid JSON",
    });
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    console.log("Raw AI Response:", response); // Debug logging

    // Improved JSON extraction
    const jsonStr = response
      .replace(/```json/g, "") // Remove markdown code blocks
      .replace(/```/g, "")
      .trim();

    if (!jsonStr) throw new Error("Empty response from AI");

    const parsed = JSON.parse(jsonStr);

    // Validate required fields
    const requiredFields = [
      "workoutName",
      "durationMinutes",
      "caloriesBurned",
      "points",
    ];
    const missingFields = requiredFields.filter((field) => !(field in parsed));

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }

    // Type validation
    const numberFields = ["durationMinutes", "caloriesBurned", "points"];
    const invalidNumbers = numberFields.filter(
      (field) => typeof parsed[field] !== "number" || isNaN(parsed[field])
    );

    if (invalidNumbers.length > 0) {
      throw new Error(`Invalid number values in: ${invalidNumbers.join(", ")}`);
    }

    return parsed;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error(
      `API Error: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
