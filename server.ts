import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Google GenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API route: Today's AI-generated plan
app.post("/api/schedule", async (req: Request, res: Response): Promise<void> => {
  try {
    const { userInput, profile, pendingTasks } = req.body;
    if (!userInput || typeof userInput !== 'string') {
      res.status(400).json({ error: "userInput is required as a string." });
      return;
    }

    const currentLocalTime = new Date().toLocaleTimeString();

    let profileContext = '';
    if (profile) {
      const commitmentsStr = (profile.commitments || []).map((c: string) => `  * ${c}`).join('\n') || "  None";
      const goalsStr = (profile.goals || []).map((g: string) => `  * ${g}`).join('\n') || "  None";
      const workStyleDesc = 
        profile.workStyle === 'focused' ? 'Focused Long Sessions (90-120 minute blocks of deep work)' :
        profile.workStyle === 'pomodoro' ? 'Short Bursts (25-50 minute blocks of focused work with short 5-10 minute rest breaks)' :
        'Fluid and flexible (mix of short/long durations)';

      profileContext = `
Personal Profile Constraints & Context (STRICTLY RESPECT THESE):
- User's Name: ${profile.name || "User"} (IMPORTANT: Address them by their name, "${profile.name}", in the priority insights or the productivity tip!)
- Wake-up Time: ${profile.wakeUpTime || "Not specified"} (Schedule should start after this time)
- Sleep Time: ${profile.sleepTime || "Not specified"} (Schedule must wind down and end by or before this time)
- Preferred Work Style: ${workStyleDesc} (Tailor time block lengths to fit this preference!)
- Recurring Daily Commitments (Ensure you do NOT overlap other demanding tasks during these times, or clearly account for them as Routine blocks):
${commitmentsStr}
- Personal Goals (Factored into the day as reminders or minor habit blocks, e.g. "Drink more water", "Do a stretch"):
${goalsStr}

Please customize the schedule specifically for ${profile.name || "them"}:
1. Start/end times must be bounded reasonably within their waking hours: ${profile.wakeUpTime || "08:00 AM"} to ${profile.sleepTime || "11:00 PM"}.
2. Ensure you add 1-2 small habit/routine tasks representing their goals (e.g. stretching, hydration, or quick reviews).
3. The block durations should reflect their work style: ${profile.workStyle}.
`;
    }

    let pendingTasksContext = '';
    if (pendingTasks && pendingTasks.length > 0) {
      const pendingStr = pendingTasks.map((t: any) => `  * ${t.title} - ${t.description} (Priority: ${t.priority}, originally from ${t.date})`).join('\n');
      pendingTasksContext = `
INCOMPLETE/CARRIED OVER TASKS FROM PREVIOUS SESSION(S):
The user has some unfinished tasks from previous sessions that MUST be integrated into today's new schedule.
You MUST schedule these in today's timeline, set their property "isCarriedOver" to true, and start their description (or prefix it) with a clear note like: "Carried over from yesterday:".
Here are the pending tasks to incorporate:
${pendingStr}
`;
    }
    
    const prompt = `You are an elite, practical productivity assistant. The user is in a last-minute panic or high-stress scenario, or simply wants to organize their day.
Analyze the following description of their day, tasks, and deadlines:
"${userInput}"

${profileContext}

${pendingTasksContext}

Guidelines:
1. Break down the user's input into logical, realistic time blocks throughout the day.
2. Ensure there are realistic start and end times for each block (e.g., "09:00 AM - 10:30 AM").
3. Assign priority ('high' | 'medium' | 'low') based on critical deadlines, importance, or stress levels described.
4. Assign a type ('work' | 'personal' | 'routine' | 'break' | 'critical') to help visual categorization.
5. Create a list of 2-3 specific, encouraging "priorityInsights" highlighting what to focus on first, how to handle conflicts, and why the schedule is ordered this way.
6. Provide a customized, actionable "productivityTip" tailored to their workload.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are 'Last-Minute Life Saver', a direct, clear, highly encouraging productivity coach. You transform chaotic inputs into beautiful, hyper-actionable, structured schedules. When the user mentions specific exams, interviews, physical fitness/diet goals, or technical/academic subject areas (e.g., 'JEE exam', 'SAT', 'robotics kinematics', 'coding interview', 'marathon prep'), you MUST use the Google Search tool to look up verified strategies, syllabus, or preparation tips, and ground your insights, schedule, or tips in these reliable web findings.",
        responseMimeType: "application/json",
        tools: [{ googleSearch: {} }],
        responseSchema: {
          type: Type.OBJECT,
          required: ["timeBlocks", "priorityInsights", "productivityTip"],
          properties: {
            timeBlocks: {
              type: Type.ARRAY,
              description: "The time-blocked list of events.",
              items: {
                type: Type.OBJECT,
                required: ["time", "title", "description", "priority", "type"],
                properties: {
                  time: {
                    type: Type.STRING,
                    description: "Time range, e.g., '09:00 AM - 10:00 AM' or '02:30 PM - 03:00 PM'."
                  },
                  title: {
                    type: Type.STRING,
                    description: "Concise, action-oriented title."
                  },
                  description: {
                    type: Type.STRING,
                    description: "Brief details or tips on what to accomplish."
                  },
                  priority: {
                    type: Type.STRING,
                    enum: ["high", "medium", "low"],
                    description: "Urgency of this time block."
                  },
                  type: {
                    type: Type.STRING,
                    enum: ["work", "personal", "routine", "break", "critical"],
                    description: "The category of the task block."
                  },
                  isCarriedOver: {
                    type: Type.BOOLEAN,
                    description: "True if this task is one of the incomplete/carried over tasks from previous sessions."
                  }
                }
              }
            },
            priorityInsights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "2-3 highly customized insights about today's structure."
            },
            productivityTip: {
              type: Type.STRING,
              description: "A customized mental trick or productivity advice for this situation."
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response received from Gemini.");
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const searchQueries = groundingMetadata?.webSearchQueries || [];
    const groundingChunks = groundingMetadata?.groundingChunks || [];
    const isSearchGroundingActive = (searchQueries.length > 0 || groundingChunks.length > 0);
    const searchSources = groundingChunks.map((chunk: any) => ({
      title: chunk.web?.title || chunk.title || "Web Source",
      uri: chunk.web?.uri || chunk.uri || ""
    })).filter((source: any) => source.uri);

    const data = JSON.parse(text);
    res.json({
      ...data,
      isSearchGroundingActive,
      searchSources
    });
  } catch (error: any) {
    console.error("Error generating schedule:", error);
    res.status(500).json({ error: error.message || "Failed to generate schedule" });
  }
});

// API route: Journal Entry analysis and encouraging feedback
app.post("/api/journal-analyze", async (req: Request, res: Response): Promise<void> => {
  try {
    const { content } = req.body;
    if (!content || typeof content !== 'string') {
      res.status(400).json({ error: "content is required as a string." });
      return;
    }

    const prompt = `Analyze this daily journal entry:
"${content}"

Provide an empathetic feedback packet containing:
1. "mood": A single word or short phrase representing the dominant emotional state (e.g., "Overwhelmed but Determined", "Grateful", "Exhausted").
2. "insights": A 1-2 sentence positive interpretation or deep observation about what they wrote.
3. "advice": Gentle, practical, short encouragement on how to keep balance or reset.
4. "tags": 2-4 tag keywords relevant to the emotional themes, activities, or topics in the entry.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an empathetic, emotionally intelligent, positive counselor assistant. You parse daily logs to extract healthy trends, offer positive reframing, and highlight user strength.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["mood", "insights", "advice", "tags"],
          properties: {
            mood: {
              type: Type.STRING,
              description: "Determined dominant emotion."
            },
            insights: {
              type: Type.STRING,
              description: "Insightful reflection or positive validation."
            },
            advice: {
              type: Type.STRING,
              description: "A compassionate suggestion for wellness, focus, or peace."
            },
            tags: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Brief context tags, e.g., 'career', 'anxiety', 'family', 'growth'."
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini.");
    }

    const data = JSON.parse(text);
    res.json(data);
  } catch (error: any) {
    console.error("Error analyzing journal:", error);
    res.status(500).json({ error: error.message || "Failed to analyze journal" });
  }
});

// Serve frontend assets
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
