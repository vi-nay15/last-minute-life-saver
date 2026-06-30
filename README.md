# 🔥 Last-Minute Life Saver

> Turn chaos into a masterplan — AI-powered personal productivity cockpit built with Gemini.

## 🚀 Live Demo
https://ai.studio/apps/eaf4a470-10be-47ab-b394-ac3dceb0fee3 <!-- We'll fill this after Publish -->

## 📌 Problem Statement
Students and professionals constantly face overwhelming days with competing deadlines, 
forgotten commitments, and zero structure. Existing schedulers are rigid and impersonal. 
Last-Minute Life Saver uses conversational AI to transform a chaotic brain dump into a 
personalized, actionable day plan in seconds.

## ✨ Key Features

- **AI Schedule Engine** — Describe your day in plain text, get a prioritized 
  hour-by-hour rescue plan powered by Gemini
- **Personalized User Profile** — Remembers your name, wake/sleep times, recurring 
  commitments, work style, and personal goals
- **Google Search Grounding** — Fetches real-world strategies for exams, interviews, 
  and fitness goals via live search
- **Persistent Task Memory** — Incomplete tasks carry over automatically to the next 
  session with amber "Carried Over" badges
- **Decompression Journal** — AI-powered mood analysis with compassionate reframing 
  and wellness insights
- **Crisis Checklist** — Priority-tagged standalone task tracker for micro-tasks
- **Universal Calendar Export** — Downloads .ics file compatible with Google Calendar, 
  Apple Calendar, and Outlook

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + TypeScript + Vite |
| Backend | Node.js + Express |
| AI Engine | Google Gemini 1.5 Flash |
| Search Grounding | Gemini Google Search Tool |
| Styling | Tailwind CSS |
| Persistence | Browser localStorage |
| Deployment | Google Cloud Platform via AI Studio |

## 🧠 Agentic Behavior
The app demonstrates multi-step agentic depth:
1. Parses natural language input
2. Retrieves user profile context
3. Fetches pending tasks from memory
4. Optionally grounds in live search data
5. Generates structured, personalized schedule
6. Exports to calendar format

## 🏃 Running Locally
```bash
git clone https://github.com/vi-nay15/last-minute-life-saver
cd last-minute-life-saver
npm install
npm run dev
```

## 📋 Environment Variables
GEMINI_API_KEY=your_api_key_here

## 🏆 Built For
Vibe Coding Competition using Google AI Studio — June 2026
