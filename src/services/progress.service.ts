import DocumentModel from "../models/document.model";
import QuizModel from "../models/quiz.model";
import QuizAttemptModel from "../models/quiz-attempt.model";

function getStartOfWeek(date = new Date()) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  // Monday is the first day of the week.
  const day = start.getDay();
  const daysSinceMonday = (day + 6) % 7;

  start.setDate(start.getDate() - daysSinceMonday);
  return start;
}

function getDayLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export async function getStudyProgress(ownerId: string) {
  const owner = ownerId;

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

    QuizAttemptModel.find({
      owner,
      completedAt: { $gte: getStartOfWeek() },
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

  const performance = allAttempts
    .slice()
    .reverse()
    .slice(-7)
    .map((attempt) => ({
      date: attempt.completedAt,
      score: attempt.percentage,
    }));

  // Count completed quiz attempts for each day of the current week.
  const weekStart = getStartOfWeek();
  const studyActivity = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + index);

    return {
      day: getDayLabel(date),
      date: date.toISOString().slice(0, 10),
      sessions: activityAttempts.filter((attempt) => {
        const completed = new Date(attempt.completedAt);
        return (
          completed.getFullYear() === date.getFullYear() &&
          completed.getMonth() === date.getMonth() &&
          completed.getDate() === date.getDate()
        );
      }).length,
    };
  });

  // Consecutive calendar days with at least one completed quiz.
  const completedDays = new Set(
    allAttempts.map((attempt) => {
      const date = new Date(attempt.completedAt);
      return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    }),
  );

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = `${yesterday.getFullYear()}-${yesterday.getMonth()}-${yesterday.getDate()}`;

  let studyStreak = 0;
  const streakDate = new Date(today);

  // If the user hasn't studied today, allow the streak to continue
  // from yesterday. Otherwise, count from today.
  if (!completedDays.has(todayKey)) {
    if (completedDays.has(yesterdayKey)) {
      streakDate.setDate(streakDate.getDate() - 1);
    } else {
      streakDate.setTime(0);
    }
  }

  if (
    completedDays.has(
      `${streakDate.getFullYear()}-${streakDate.getMonth()}-${streakDate.getDate()}`,
    )
  ) {
    while (
      completedDays.has(
        `${streakDate.getFullYear()}-${streakDate.getMonth()}-${streakDate.getDate()}`,
      )
    ) {
      studyStreak++;
      streakDate.setDate(streakDate.getDate() - 1);
    }
  }

  // Temporary learning insights: group question accuracy by quiz title.
  // These are quiz-level groupings, not actual subject-topic classifications.
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
        .filter((answer: { isCorrect: boolean }) => answer.isCorrect)
        .map((answer: { questionId: string }) => answer.questionId),
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
