// backend/server.js
import express from "express";
import cors from "cors";
import { lectures, reactions, suggestions, sectionStats } from "./data.js";
import { generateUpdatedSection } from "./llm.js";

const app = express();
app.use(cors());
app.use(express.json());

// GET lecture
app.get("/lecture/:id", (req, res) => { ... });

// POST reaction
app.post("/reactions", (req, res) => { ... });

// POST generate updates
app.post("/lecture/:id/generate-updates", async (req, res) => { ... });

// GET suggestions
app.get("/lecture/:id/suggestions", (req, res) => { ... });

// POST accept suggestion
app.post("/suggestions/:id/accept", (req, res) => { ... });

// POST reject suggestion
app.post("/suggestions/:id/reject", (req, res) => { ... });

// POST publish
app.post("/lecture/:id/publish", (req, res) => { ... });

app.listen(4000, () => console.log("Server running on http://localhost:4000"));

