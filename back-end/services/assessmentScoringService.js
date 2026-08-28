// Validate answers
const validateAnswers = (
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

  if (
    submittedAnswers.length !==
    assessment.questions.length
  ) {
    throw new Error(
      "All questions must be answered"
    );
  }
};


// Normal sum scoring
const calculateSumScore = (
  assessment,
  submittedAnswers
) => {
  validateAnswers(
    assessment,
    submittedAnswers
  );

  let rawScore = 0;

  const calculatedAnswers = [];

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

    if (!Number.isFinite(response)) {
      throw new Error(
        `Invalid score for question ${question.questionId}`
      );
    }

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

    rawScore += response;

    calculatedAnswers.push({
      questionId:
        question.questionId,

      response,

      score: response,
    });
  }

  return buildResult(
    assessment,
    calculatedAnswers,
    rawScore
  );
};


// Reverse sum scoring
const calculateReverseSumScore = (
  assessment,
  submittedAnswers
) => {
  validateAnswers(
    assessment,
    submittedAnswers
  );

  let rawScore = 0;

  const calculatedAnswers = [];

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

    if (!Number.isFinite(response)) {
      throw new Error(
        `Invalid score for question ${question.questionId}`
      );
    }

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

    // Reverse scoring
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

      response,

      score: finalScore,
    });
  }

  return buildResult(
    assessment,
    calculatedAnswers,
    rawScore
  );
};


// WHO-5 scoring
const calculateWHO5Score = (
  assessment,
  submittedAnswers
) => {
  validateAnswers(
    assessment,
    submittedAnswers
  );

  let rawScore = 0;

  const calculatedAnswers = [];

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

    if (!Number.isFinite(response)) {
      throw new Error(
        `Invalid score for question ${question.questionId}`
      );
    }

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

    rawScore += response;

    calculatedAnswers.push({
      questionId:
        question.questionId,

      response,

      score: response,
    });
  }

  // WHO-5 raw score: 0–25
  // Converted to 0–100
  const multiplier =
    assessment.scoring.multiplier || 4;

  const totalScore =
    rawScore * multiplier;

  const maxScore =
    assessment.scoring.maxScore;

  const percentage =
    Number(
      (
        (totalScore / maxScore) *
        100
      ).toFixed(2)
    );

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

    percentage,

    level:
      interpretation.level,

    description:
      interpretation.description,

    recommendation:
      interpretation.recommendation,
  };
};


// PSQI scoring
const calculatePSQIScore = (
  assessment,
  submittedAnswers
) => {
  validateAnswers(
    assessment,
    submittedAnswers
  );

  const answers = {};

  // Collect PSQI answers
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

    const value =
      submittedAnswer.value !==
        undefined
        ? submittedAnswer.value
        : submittedAnswer.score;

    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      throw new Error(
        `Missing value for question ${question.questionId}`
      );
    }

    answers[
      question.questionId
    ] = value;
  }

  /*
    IMPORTANT

    The seven component values must be
    calculated according to the official
    PSQI scoring instructions.

    Component 1:
    Subjective sleep quality

    Component 2:
    Sleep latency

    Component 3:
    Sleep duration

    Component 4:
    Habitual sleep efficiency

    Component 5:
    Sleep disturbances

    Component 6:
    Use of sleeping medication

    Component 7:
    Daytime dysfunction
  */

  /*
    DO NOT put invented values here.

    Once the authorized PSQI scoring
    configuration is available, calculate
    the seven components here.
  */

  throw new Error(
    "PSQI scoring is not configured yet. Add the authorized PSQI scoring rules before enabling this assessment."
  );
};


// Build result for normal assessments
const buildResult = (
  assessment,
  calculatedAnswers,
  rawScore
) => {
  const multiplier =
    assessment.scoring.multiplier || 1;

  const totalScore =
    rawScore * multiplier;

  const maxScore =
    assessment.scoring.maxScore;

  if (
    !maxScore ||
    maxScore <= 0
  ) {
    throw new Error(
      "Invalid maximum score"
    );
  }

  const percentage =
    Number(
      (
        (totalScore / maxScore) *
        100
      ).toFixed(2)
    );

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

    percentage,

    level:
      interpretation.level,

    description:
      interpretation.description,

    recommendation:
      interpretation.recommendation,
  };
};


// Main scoring function
const calculateAssessmentScore = (
  assessment,
  submittedAnswers
) => {
  switch (
    assessment.scoring.method
  ) {
    case "sum":
      return calculateSumScore(
        assessment,
        submittedAnswers
      );

    case "reverse_sum":
      return calculateReverseSumScore(
        assessment,
        submittedAnswers
      );

    case "who5":
      return calculateWHO5Score(
        assessment,
        submittedAnswers
      );

    case "psqi":
      return calculatePSQIScore(
        assessment,
        submittedAnswers
      );

    default:
      throw new Error(
        `Unsupported scoring method: ${assessment.scoring.method}`
      );
  }
};


module.exports = {
  calculateAssessmentScore,
};