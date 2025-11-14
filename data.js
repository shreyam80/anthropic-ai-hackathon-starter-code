// backend/data.js

// --------------------
// LECTURE CONTENT
// --------------------

export const lectures = [
  {
    id: "lec1",
    title: "Introduction to Machine Learning",
    sections: [
      {
        id: "lec1-sec1",
        order: 1,
        text: `Machine learning is the study of algorithms that automatically improve from experience. 
In simple terms, ML allows computers to learn patterns from data instead of being explicitly programmed. 
This lecture introduces the basic terminology and categories of ML.`,
      },
      {
        id: "lec1-sec2",
        order: 2,
        text: `In supervised learning, the model is trained using labeled data—meaning each input comes with a correct output.
Common tasks include classification, where the goal is to predict a category, and regression, where the goal is to predict a numerical value.`,
      },
      {
        id: "lec1-sec3",
        order: 3,
        text: `Unsupervised learning deals with unlabeled data. 
The system tries to discover hidden structure, such as grouping similar data points together using clustering algorithms or finding underlying patterns with dimensionality reduction techniques.`,
      },
      {
        id: "lec1-sec4",
        order: 4,
        text: `Loss functions measure how wrong the model's predictions are. 
The goal of training is to minimize this loss using optimization techniques such as gradient descent. 
Smaller loss usually implies better model performance, though overfitting can complicate this.`,
      },
      {
        id: "lec1-sec5",
        order: 5,
        text: `Gradient descent is an optimization algorithm used to minimize a loss function. 
The model's parameters are updated in the opposite direction of the gradient of the loss function. 
The size of each step is determined by the learning rate.`,
      },
      {
        id: "lec1-sec6",
        order: 6,
        text: `Overfitting occurs when the model memorizes the training data and performs poorly on unseen data.
Regularization techniques such as L2 penalty, dropout, or early stopping can help prevent this problem.`,
      },
    ],
    publishedAt: null,
  },

  {
    id: "lec2",
    title: "Operating Systems: Processes & Scheduling",
    sections: [
      {
        id: "lec2-sec1",
        order: 1,
        text: `An operating system (OS) manages hardware, software, and system resources.
One of its core responsibilities is process management—deciding which programs run and when.`,
      },
      {
        id: "lec2-sec2",
        order: 2,
        text: `A process is an instance of a running program. 
It contains code, data, registers, an instruction pointer, and associated resources. 
Processes are isolated from each other for safety and reliability.`,
      },
      {
        id: "lec2-sec3",
        order: 3,
        text: `Context switching is when the OS saves the state of a currently running process and loads the state of another. 
This is required for multitasking and preemptive scheduling. 
However, context switching introduces overhead because the OS must save/restore state.`,
      },
      {
        id: "lec2-sec4",
        order: 4,
        text: `CPU scheduling policies determine the order in which processes run.
Common policies include First-Come First-Served (FCFS), Shortest Job First (SJF), Priority Scheduling, and Round Robin (RR). 
The goal is to balance throughput, responsiveness, and fairness.`,
      },
      {
        id: "lec2-sec5",
        order: 5,
        text: `Round Robin scheduling gives each process a fixed time slice called a quantum.
After the quantum expires, the OS preempts the process and switches to the next ready process. 
This ensures responsiveness but increases context switch overhead if the quantum is too small.`,
      },
      {
        id: "lec2-sec6",
        order: 6,
        text: `Starvation occurs when a process never gets scheduled because others keep taking priority. 
Aging is a technique where the priority of waiting processes gradually increases to ensure fairness.`,
      },
      {
        id: "lec2-sec7",
        order: 7,
        text: `Modern OS schedulers like Linux’s Completely Fair Scheduler (CFS) aim to approximate fair CPU sharing. 
CFS uses virtual runtimes to track how much CPU time each process should receive over time.`,
      },
    ],
    publishedAt: null,
  },
];

// --------------------
// STUDENT REACTIONS
// --------------------
// Stored dynamically during runtime
export const reactions = [];

// --------------------
// AI SUGGESTIONS
// --------------------
// Stored dynamically when LLM generates updates
export const suggestions = [];

// --------------------
// LEARNING / META-STATS
// --------------------
// To track accepted/rejected suggestions per section
export const sectionStats = {
  // Example shape:
  // "lec1-sec3": { total: 3, accepted: 2, rejected: 1 }
};
