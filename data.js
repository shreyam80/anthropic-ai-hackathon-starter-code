// backend/data.js

export const lectures = [
  {
    id: "lec1",
    title: "Intro to Machine Learning",
    sections: [
      { id: "s1", order: 1, text: "What is machine learning?" },
      { id: "s2", order: 2, text: "Supervised vs unsupervised learning..." },
      // add more
    ],
    publishedAt: null, // optional
  },
];

export const reactions = [
  // { id, lectureId, sectionId, userId, type, comment, createdAt }
];

export const suggestions = [
  // { id, lectureId, sectionId, originalText, suggestedText, status, createdAt }
];

// Optional simple learning stats
export const sectionStats = {
  // sectionId: { totalSuggestions, acceptedSuggestions, rejectedSuggestions }
};
