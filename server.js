// backend/server.js
import express from "express";
import cors from "cors";
import {
  lectures,
  reactions,
  suggestions,
  sectionStats,
} from "./data.js";
import { generateUpdatedSection } from "./llm.js";

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Helper functions ----------

function findLecture(lectureId) {
  return lectures.find((lec) => lec.id === lectureId);
}

function findSection(lecture, sectionId) {
  return lecture.sections.find((sec) => sec.id === sectionId);
}

function makeId(prefix = "id") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

// ---------- Routes ----------

// 1) GET /lecture/:id
app.get("/lecture/:id", (req, res) => {
  const lectureId = req.params.id;
  const lecture = findLecture(lectureId);

  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  res.json(lecture);
});

// 2) GET /lecture/:id/reactions
app.get("/lecture/:id/reactions", (req, res) => {
  const lectureId = req.params.id;
  const lecture = findLecture(lectureId);

  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  const lectureReactions = reactions.filter(
    (r) => r.lectureId === lectureId
  );
  res.json(lectureReactions);
});

// 3) POST /reactions
app.post("/reactions", (req, res) => {
  const { lectureId, sectionId, userId, type, comment } = req.body;

  if (!lectureId || !sectionId || !userId || !type) {
    return res
      .status(400)
      .json({ error: "lectureId, sectionId, userId, and type are required" });
  }

  const lecture = findLecture(lectureId);
  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  const section = findSection(lecture, sectionId);
  if (!section) {
    return res.status(404).json({ error: "Section not found" });
  }

  if (!["like", "confused", "dislike"].includes(type)) {
    return res.status(400).json({ error: "Invalid reaction type" });
  }

  const newReaction = {
    id: makeId("reaction"),
    lectureId,
    sectionId,
    userId,
    type,
    comment: comment || "",
    createdAt: new Date().toISOString(),
  };

  reactions.push(newReaction);
  res.status(201).json(newReaction);
});

// 4) POST /lecture/:id/generate-updates
app.post("/lecture/:id/generate-updates", async (req, res) => {
  const lectureId = req.params.id;
  const lecture = findLecture(lectureId);

  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  // Get reactions for this lecture
  const lectureReactions = reactions.filter(
    (r) => r.lectureId === lectureId
  );

  // Group reactions by sectionId
  const bySection = {};
  for (const r of lectureReactions) {
    if (!bySection[r.sectionId]) {
      bySection[r.sectionId] = {
        likes: 0,
        confused: 0,
        dislike: 0,
        comments: [],
      };
    }
    bySection[r.sectionId][r.type] += 1;
    if (r.comment && r.comment.trim().length > 0) {
      bySection[r.sectionId].comments.push(r.comment.trim());
    }
  }

  let generatedCount = 0;
  const generatedSuggestionIds = [];

  // Loop over sections and decide which ones need updates
  for (const section of lecture.sections) {
    const feedback = bySection[section.id];

    if (!feedback) {
      continue; // no reactions for this section
    }

    const confusionCount = feedback.confused + feedback.dislike;

    // Simple "learning" rule: if this section's suggestions are mostly rejected, skip it
    const stats = sectionStats[section.id];
    if (stats && stats.total > 0) {
      const rejectRatio = stats.rejected / stats.total;
      if (rejectRatio > 0.7) {
        // Prof usually hates suggestions for this section → skip
        continue;
      }
    }

    // Threshold: only generate updates if at least 2 confused/dislike
    if (confusionCount < 2) {
      continue;
    }

    // Call LLM to generate updated text
    try {
      const suggestedText = await generateUpdatedSection(
        section.text,
        feedback
      );

      const suggestion = {
        id: makeId("sugg"),
        lectureId,
        sectionId: section.id,
        originalText: section.text,
        suggestedText,
        status: "pending", // 'pending' | 'accepted' | 'rejected'
        createdAt: new Date().toISOString(),
      };

      suggestions.push(suggestion);
      generatedCount += 1;
      generatedSuggestionIds.push(suggestion.id);
    } catch (err) {
      console.error("Error generating suggestion:", err);
      // continue to next section
    }
  }

  res.json({
    message: "Generated AI suggestions",
    generatedCount,
    generatedSuggestionIds,
  });
});

// 5) GET /lecture/:id/suggestions
app.get("/lecture/:id/suggestions", (req, res) => {
  const lectureId = req.params.id;
  const lecture = findLecture(lectureId);

  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  const lectureSuggestions = suggestions.filter(
    (s) => s.lectureId === lectureId
  );
  res.json(lectureSuggestions);
});

// 6) POST /suggestions/:id/accept
app.post("/suggestions/:id/accept", (req, res) => {
  const suggestionId = req.params.id;
  const suggestion = suggestions.find((s) => s.id === suggestionId);

  if (!suggestion) {
    return res.status(404).json({ error: "Suggestion not found" });
  }

  const lecture = findLecture(suggestion.lectureId);
  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  const section = findSection(lecture, suggestion.sectionId);
  if (!section) {
    return res.status(404).json({ error: "Section not found" });
  }

  // Update lecture content with suggested text
  section.text = suggestion.suggestedText;
  suggestion.status = "accepted";

  // Update section stats
  if (!sectionStats[section.id]) {
    sectionStats[section.id] = { total: 0, accepted: 0, rejected: 0 };
  }
  sectionStats[section.id].total += 1;
  sectionStats[section.id].accepted += 1;

  res.json({
    message: "Suggestion accepted and lecture updated",
    suggestion,
    updatedSection: section,
  });
});

// 7) POST /suggestions/:id/reject
app.post("/suggestions/:id/reject", (req, res) => {
  const suggestionId = req.params.id;
  const suggestion = suggestions.find((s) => s.id === suggestionId);

  if (!suggestion) {
    return res.status(404).json({ error: "Suggestion not found" });
  }

  suggestion.status = "rejected";

  // Update section stats
  const sectionId = suggestion.sectionId;
  if (!sectionStats[sectionId]) {
    sectionStats[sectionId] = { total: 0, accepted: 0, rejected: 0 };
  }
  sectionStats[sectionId].total += 1;
  sectionStats[sectionId].rejected += 1;

  res.json({
    message: "Suggestion rejected",
    suggestion,
  });
});

// 8) PATCH /lecture/:id/section/:sectionId  (prof live edit)
app.patch("/lecture/:id/section/:sectionId", (req, res) => {
  const lectureId = req.params.id;
  const sectionId = req.params.sectionId;
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: "New text is required" });
  }

  const lecture = findLecture(lectureId);
  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  const section = findSection(lecture, sectionId);
  if (!section) {
    return res.status(404).json({ error: "Section not found" });
  }

  section.text = text;

  res.json({
    message: "Section updated",
    section,
  });
});

// 9) POST /lecture/:id/publish
app.post("/lecture/:id/publish", (req, res) => {
  const lectureId = req.params.id;
  const lecture = findLecture(lectureId);

  if (!lecture) {
    return res.status(404).json({ error: "Lecture not found" });
  }

  lecture.publishedAt = new Date().toISOString();

  res.json({
    message: "Lecture published",
    lecture,
  });
});

// ---------- Start server ----------
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
