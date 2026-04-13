# LLM: Lies, Lies, Mystery
[![Watch the video](https://img.youtube.com/vi/gGDYwaV1RF0/0.jpg)](https://www.youtube.com/watch?v=gGDYwaV1RF0)
## Overview
**Lies, Lies, Mystery** is a an AI-powered interrogation game where players take on the role of a detective solving a murder case. Each game spins up a fresh victim, location, weapon, and suspects with distinct personalities, making each playthrough slightly different.

## Gameplay Loop
1. **Interrogate Suspects** - Click on any suspect to question them, but keep in mind that each question costs one action.
2. **Retrieve Evidence via database** – Utilise the provided database to retrieve info/evidence that can be leveraged in your interrogation. Each command is single use and also spends an action.
3. **Accuse the Murderer** – When you’ve exhausted all actions or identified the murderer, accuse the suspect!

## Architecture
- **Frontend** – React + Next.js App Router with a custom 8-bit-style UI and music.
- **Routing / API** – API routes for LLM integration via Groq API.
- **AI Integration** 
  - Backstory generation
  - Evidence and info generation
  - Suspect response generation

## How to Run
```bash
git clone https://github.com/<org>/lies-lies-mystery.git
cd lies-lies-mystery
cp .env.example .env.local   # add GROQ_API_KEY=<your_key> and optionally choose a different LLM 
npm install
npm run dev
```
Visit http://localhost:3000 to start playing!

## Future Improvements
- Add crime scene/location exploration (like a Pokemon game) to make gameplay more engaging
- Improve evidence system with actual items that user can discover and examine to uncover insights and add depth to gameplay
- Introduce a clue tracking or notebook system to help players organize information
- Improve AI memory and consistency across longer conversations
- Explore multiplayer or competitive detective modes
