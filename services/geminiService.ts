
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, GenerationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generatePeachySchedule(profile: UserProfile): Promise<GenerationResponse> {
  const subjectContext = profile.subjects
    .map(s => `Subject: ${s.name}, Strength Rating: ${s.strengthRating}/10 (1=Hardest/Weakest, 10=Easiest/Strongest), Syllabus Units: ${s.syllabusSize}, Progress: ${s.completedTopics} units done.`)
    .join("\n");

  const prompt = `
    Act as "Peachy", the soul of the 'Index 🍓' productivity app. You are a senior productivity coach with a Pinterest-style aesthetic.
    
    Create a daily routine for ${profile.name} based on these strict algorithmic rules:

    1. BRIDGING THE GAP: The day starts at ${profile.wakeUpTime} and ends at ${profile.sleepTime}.
    2. THE BIG FROG: The very first study session MUST be the subject with the LOWEST Strength Rating. This is non-negotiable.
    3. POMODORO PROTOCOL: 
       - Study blocks should be broken into 25-minute focus units followed by 5-minute short breaks.
       - AFTER EVERY FOUR (4) Pomodoro work sessions, schedule a LONG BREAK of 20-30 minutes.
       - Label each work session clearly (e.g., "Session 1/4 - Focus").
    4. INTENSITY: ${profile.intensity}. 
       - 'low': More generous wellness breaks, fewer study blocks.
       - 'medium': Balanced workload.
       - 'high': Maximized study blocks, tighter schedule.
    5. BIAS FOR WEAKNESS: Weak subjects (Rating 1-5) must receive double the total time of strong subjects (Rating 8-10).
    6. WELLNESS & HOLISTIC HEALTH:
       - 💧 Hydration: Reminders every 2 hours.
       - 🍽️ Meals: Standard Breakfast, Lunch, Dinner.
       - 🧘‍♀️ Movement: One 15-minute stretch or walk after a long block.
    7. STYLE: Cute, motivational, but disciplined. Every block needs a short, punchy, aesthetic motivational quote about overcoming challenges.

    User Profile Context:
    - Subjects:
    ${subjectContext}

    JSON Output Requirements:
    - assessment: Strategy summary, total focus hours, and categorization of subjects.
    - schedule: Array of objects with time, task, category, quote, icon, duration, and pomodoro cycle.
    - dailyGoals: 3-5 specific syllabus milestones for today.
    - recommendation: A personalized message from Peachy.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          assessment: {
            type: Type.OBJECT,
            properties: {
              strongSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
              weakSubjects: { type: Type.ARRAY, items: { type: Type.STRING } },
              strategy: { type: Type.STRING },
              totalStudyHours: { type: Type.NUMBER }
            },
            required: ['strongSubjects', 'weakSubjects', 'strategy', 'totalStudyHours']
          },
          schedule: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                task: { type: Type.STRING },
                category: { type: Type.STRING, enum: ['study', 'break', 'life', 'frog', 'meal', 'exercise'] },
                quote: { type: Type.STRING },
                icon: { type: Type.STRING },
                durationMinutes: { type: Type.NUMBER },
                pomodoroCycle: { type: Type.NUMBER }
              },
              required: ['time', 'task', 'category', 'quote', 'icon', 'durationMinutes']
            }
          },
          dailyGoals: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          recommendation: { type: Type.STRING }
        },
        required: ['schedule', 'dailyGoals', 'recommendation', 'assessment']
      }
    }
  });

  return JSON.parse(response.text.trim());
}
