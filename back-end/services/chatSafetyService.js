const checkMessageSafety = (
  message
) => {
  const text =
    message.toLowerCase();



  const urgentKeywords = [
    "kill myself",
    "suicide",
    "suicidal",
    "end my life",
    "hurt myself",
    "self harm",
    "self-harm",
  ];

  const concernKeywords = [
    "hopeless",
    "worthless",
    "can't cope",
    "cannot cope",
    "extremely stressed",
    "panic",
    "very anxious",
  ];

  const urgent =
    urgentKeywords.some(
      (keyword) =>
        text.includes(keyword)
    );

  if (urgent) {
    return {
      level: "urgent",
      requiresEscalation: true,
    };
  }

  const concern =
    concernKeywords.some(
      (keyword) =>
        text.includes(keyword)
    );

  if (concern) {
    return {
      level: "concern",
      requiresEscalation: false,
    };
  }

  return {
    level: "normal",
    requiresEscalation: false,
  };
};

module.exports = {
  checkMessageSafety,
};