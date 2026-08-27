// Calculate assessment score
const calculateAssessmentScore = (
  assessment,
  submittedAnswers
) => {
  if (
    !Array.isArray(submittedAnswers) ||
    submittedAnswers.length === 0
  ) {
    throw new Error("Answers are required");
  }

  let rawScore = 0;

  const calculatedAnswers = [];

  // Check that the number of answers is correct
  if (
    submittedAnswers.length !==
    assessment.questions.length
  ) {
    throw new Error(
      "All questions must be answered"
    );
  }

  // Process every question
  for (const question of assessment.questions) {
    const submittedAnswer =
      submittedAnswers.find(
        (answer) =>
          answer.questionId ===
          question.questionId
      );

    if (!submittedAnswer) {
      throw new Error(
        `Missing answer for question ${question.questionId}`
      );
    }

    const response = Number(
      submittedAnswer.score
    );

    // Validate response range
    if (
      response <
        assessment.scoring.responseMin ||
      response >
        assessment.scoring.responseMax
    ) {
      throw new Error(
        `Invalid score for question ${question.questionId}`
      );
    }

    // Check that response is actually
    // one of the configured options
    const validOption =
      question.options.find(
        (option) =>
          option.score === response
      );

    if (!validOption) {
      throw new Error(
        `Invalid answer for question ${question.questionId}`
      );
    }

    let finalScore = response;

    // Apply reverse scoring
    if (
      assessment.scoring.reverseScoredQuestions.includes(
        question.questionId
      )
    ) {
      finalScore =
        assessment.scoring.responseMax +
        assessment.scoring.responseMin -
        response;
    }

    rawScore += finalScore;

    calculatedAnswers.push({
      questionId:
        question.questionId,

      response: response,

      score: finalScore,
    });
  }

  // Apply multiplier
  const multiplier =
    assessment.scoring.multiplier || 1;

  const totalScore =
    rawScore * multiplier;

  // Get maximum score
  const maxScore =
    assessment.scoring.maxScore;

  if (!maxScore || maxScore <= 0) {
    throw new Error(
      "Invalid maximum score"
    );
  }

  // Calculate percentage
  const percentage =
    (totalScore / maxScore) * 100;

  const roundedPercentage =
    Number(
      percentage.toFixed(2)
    );

  // Find interpretation
  const interpretation =
    assessment.scoring.interpretations.find(
      (item) =>
        totalScore >= item.min &&
        totalScore <= item.max
    );

  if (!interpretation) {
    throw new Error(
      "No interpretation found for this score"
    );
  }

  return {
    answers: calculatedAnswers,

    rawScore,

    totalScore,

    maxScore,

    percentage:
      roundedPercentage,

    level:
      interpretation.level,

    description:
      interpretation.description,

    recommendation:
      interpretation.recommendation,
  };
};

module.exports = {
  calculateAssessmentScore,
};