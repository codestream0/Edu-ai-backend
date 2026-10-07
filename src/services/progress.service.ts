import DocumentModel from "../models/document.model";
import QuizAttemptModel from "../models/quiz-attempt.model";

function getStartOfRollingDays(days = 7, date = new Date()) {
  const start = new Date(date);

  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return start;
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function getDateKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function getDateString(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1,
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export async function getStudyProgress(ownerId: string) {
  const owner = ownerId;

  const rollingStart = getStartOfRollingDays(7);

  const [
    documentsStudied,
    allAttempts,
    recentAttempts,
    activityAttempts,
  ] = await Promise.all([
    DocumentModel.countDocuments({
      owner,
      status: "completed",
    }),

    QuizAttemptModel.find({ owner })
      .select(
        "score totalPoints percentage completedAt quiz answers",
      )
      .populate({
        path: "quiz",
        select: "title questionType questionCount questions",
      })
      .sort({ completedAt: -1 })
      .lean(),

    QuizAttemptModel.find({ owner })
      .select(
        "score totalPoints percentage correctCount totalQuestions completedAt quiz",
      )
      .populate({
        path: "quiz",
        select: "title questionType questionCount",
      })
      .sort({ completedAt: -1 })
      .limit(5)
      .lean(),

    // Get all completed quiz attempts from the last 7 calendar days.
    QuizAttemptModel.find({
      owner,
      completedAt: {
        $gte: rollingStart,
      },
    })
      .select("completedAt")
      .lean(),
  ]);

  const quizzesCompleted = allAttempts.length;

  const averageScore = quizzesCompleted
    ? Math.round(
        allAttempts.reduce(
          (sum, attempt) => sum + (attempt.percentage ?? 0),
          0,
        ) / quizzesCompleted,
      )
    : 0;

  // Latest quiz performance.
  const performance = allAttempts
    .slice()
    .reverse()
    .slice(-7)
    .map((attempt) => ({
      date: attempt.completedAt,
      score: attempt.percentage,
    }));

  const studyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(rollingStart);

    date.setDate(rollingStart.getDate() + index);

    const sessions = activityAttempts.filter((attempt) => {
      const completed = new Date(attempt.completedAt);

      return (
        completed.getFullYear() === date.getFullYear() &&
        completed.getMonth() === date.getMonth() &&
        completed.getDate() === date.getDate()
      );
    }).length;

    return {
      day: getDayLabel(date),
      date: getDateString(date),
      sessions,
    };
  });

  // ------------------------------------------------------------
  // Study streak
  // ------------------------------------------------------------

  const completedDays = new Set(
    allAttempts.map((attempt) => {
      const date = new Date(attempt.completedAt);
      return getDateKey(date);
    }),
  );

  const today = new Date();

  const todayKey = getDateKey(today);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const yesterdayKey = getDateKey(yesterday);

  let studyStreak = 0;

  const streakDate = new Date(today);

  // If the user hasn't studied today,
  // allow the streak to continue from yesterday.
  if (!completedDays.has(todayKey)) {
    if (completedDays.has(yesterdayKey)) {
      streakDate.setDate(streakDate.getDate() - 1);
    } else {
      // No activity today or yesterday.
      studyStreak = 0;
    }
  }

  if (studyStreak === 0 && completedDays.has(getDateKey(streakDate))) {
    while (completedDays.has(getDateKey(streakDate))) {
      studyStreak++;

      streakDate.setDate(streakDate.getDate() - 1);
    }
  }

  // ------------------------------------------------------------
  // Learning insights
  // ------------------------------------------------------------

  // Temporary learning insights:
  // group question accuracy by quiz title.
  //
  // These are quiz-level groupings,
  // not actual subject-topic classifications.

  const topicStats = new Map<
    string,
    { correct: number; total: number }
  >();

  for (const attempt of allAttempts) {
    const quiz = attempt.quiz;

    if (!quiz || typeof quiz === "string") continue;

    const title = quiz.title || "Untitled quiz";
    const questions = quiz.questions ?? [];
    const answers = attempt.answers ?? [];

    if (!questions.length || !answers.length) continue;

    const correctQuestionIds = new Set(
      answers
        .filter(
          (answer: { isCorrect: boolean }) => answer.isCorrect,
        )
        .map(
          (answer: { questionId: string }) => answer.questionId,
        ),
    );

    const existing = topicStats.get(title) ?? {
      correct: 0,
      total: 0,
    };

    existing.correct += correctQuestionIds.size;
    existing.total += answers.length;

    topicStats.set(title, existing);
  }

  const topicResults = Array.from(topicStats.entries())
    .map(([topic, stats]) => ({
      topic,
      accuracy: stats.total
        ? Math.round((stats.correct / stats.total) * 100)
        : 0,
    }))
    .sort((a, b) => b.accuracy - a.accuracy);

  const strongTopics = topicResults.filter(
    (item) => item.accuracy >= 80,
  );

  const practiceTopics = topicResults
    .filter((item) => item.accuracy < 70)
    .sort((a, b) => a.accuracy - b.accuracy);

  return {
    summary: {
      documentsStudied,
      quizzesCompleted,
      averageScore,
      studyStreak,
    },

    performance,

    recentAttempts,

    studyActivity,

    learningInsights: {
      strongTopics,
      practiceTopics,
    },
  };
}