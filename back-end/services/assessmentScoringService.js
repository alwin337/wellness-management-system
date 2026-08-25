const calculateAssessmentScore = (
  assessment,
  submittedAnswers
) => {

  if (
    !Array.isArray(submittedAnswers) ||
    submittedAnswers.length === 0
  ) {
    throw new Error(
      "Answers are required"
    );
  }

  let totalScore = 0;

  const calculatedAnswers = [];


  // Validate every question

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

    // Find whether submitted score is
    // one of the available options
    const validOption =
      question.options.find(
        (option) =>
          option.score ===
          Number(submittedAnswer.score)
      );

    if (!validOption) {
      throw new Error(
        `Invalid answer for question ${question.questionId}`
      );
    }

    totalScore += validOption.score;

    calculatedAnswers.push({
      questionId: question.questionId,
      score: validOption.score,
    });
  }

  // Apply multiplier


  const multiplier =
    assessment.scoring.multiplier || 1;

  totalScore =
    totalScore * multiplier;

  // Maximum score

  const maxScore =
    assessment.scoring.maxScore;

  if (!maxScore || maxScore <= 0) {
    throw new Error(
      "Invalid assessment maximum score"
    );
  }

  // Percentage

  const percentage =
    (totalScore / maxScore) * 100;

  const roundedPercentage =
    Number(
      percentage.toFixed(2)
    );

  // Find result level

  const level =
    assessment.scoring.levels.find(
      (item) =>
        totalScore >= item.min &&
        totalScore <= item.max
    );

  if (!level) {
    throw new Error(
      `No result level configured for score ${totalScore}`
    );
  }

  return {
    answers: calculatedAnswers,

    totalScore,

    maxScore,

    percentage: roundedPercentage,

    level: level.name,

    description:
      level.description || "",

    recommendation:
      level.recommendation || "",
  };
};


module.exports = {
  calculateAssessmentScore,
};