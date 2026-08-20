import { 
  BookOpen, 
  Clock, 
  HelpCircle, 
  Moon, 
  Flame, 
  Smile, 
  Users, 
  Compass 
} from "lucide-react";

export const concernsData = [
  {
    id: "academic-stress",
    title: "Academic Stress",
    icon: BookOpen,
    description: "Stress arising from academic workload, grades, or expectations, which can affect focus and mental well-being.",
    signs: [
      "Difficulty concentrating on study materials",
      "Feeling overwhelmed by assignment deadlines",
      "Irritability or changes in mood",
      "Physical tension or trouble relaxing"
    ],
    factors: [
      "Heavy academic course workload",
      "High examination or grade pressures",
      "Procrastination or poor study planning",
      "Lack of adequate rest and leisure time"
    ],
    copingStrategies: [
      "Break large assignments into smaller, manageable goals",
      "Create a realistic weekly study schedule and stick to it",
      "Take regular short breaks (e.g., Pomodoro technique)",
      "Maintain adequate sleep and eat balanced meals",
      "Talk to friends, family, or a counsellor when overwhelmed"
    ],
    supportAdvice: "If academic stress is persistent, significantly affects your daily routine, or feels too heavy to manage on your own, consider speaking with a campus counsellor."
  },
  {
    id: "exam-anxiety",
    title: "Exam Anxiety",
    icon: HelpCircle,
    description: "A combination of physical symptoms and anxiety related to fear of failing or performing poorly in assessments.",
    signs: [
      "Rapid heartbeat or shallow breathing during exams",
      "Racing thoughts or mind 'going blank' during tests",
      "Nausea, headaches, or muscle tension before exams",
      "Difficulty sleeping leading up to examination week"
    ],
    factors: [
      "Lack of preparation or last-minute cramming",
      "Fear of negative outcomes or high grade expectations",
      "Negative past experiences with examinations",
      "Perfectionism or self-imposed pressure to excel"
    ],
    copingStrategies: [
      "Establish a steady preparation routine weeks in advance",
      "Practice deep breathing exercises to calm physical tension",
      "Remind yourself that your worth is not defined by a single exam grade",
      "Avoid post-exam reviews or comparisons with classmates if they trigger anxiety",
      "Simulate exam conditions with practice papers to build familiarity"
    ],
    supportAdvice: "If exam anxiety severely impacts your academic performance, leads to panic attacks, or causes extreme distress, reaching out for counselling support can be highly beneficial."
  },
  {
    id: "burnout",
    title: "Burnout",
    icon: Flame,
    description: "A state of physical and emotional exhaustion caused by prolonged stress, often leading to detachment or lack of interest.",
    signs: [
      "Chronic exhaustion and constant feelings of tiredness",
      "Loss of interest in studies or activities you used to enjoy",
      "Feelings of cynicism or detachment towards academic goals",
      "Decreased sense of accomplishment or self-efficacy"
    ],
    factors: [
      "Prolonged exposure to academic pressure without breaks",
      "Lack of supportive relationships or social outlets",
      "Imbalance between academic work and personal relaxation",
      "Unrealistic standards of academic perfection"
    ],
    copingStrategies: [
      "Set firm boundaries between study hours and personal time",
      "Engage in hobbies or activities completely unrelated to college",
      "Delegate tasks or seek help with heavy responsibilities",
      "Incorporate daily mindfulness or relaxation exercises",
      "Re-evaluate your goals and prioritize what is truly essential"
    ],
    supportAdvice: "If you feel completely drained, hopeless, or unable to participate in normal daily activities, consider talking to a college counsellor to help you recover."
  },
  {
    id: "sleep-difficulties",
    title: "Sleep Difficulties",
    icon: Moon,
    description: "Trouble falling asleep, staying asleep, or waking up feeling unrefreshed, which can impact daily energy and mood.",
    signs: [
      "Lying awake for hours trying to fall asleep",
      "Frequent nighttime wakings or waking up too early",
      "Daytime sleepiness, fatigue, or low concentration",
      "Increased irritability or moodiness during the day"
    ],
    factors: [
      "High levels of stress, anxiety, or racing thoughts",
      "Irregular sleeping hours or late-night screen time",
      "Excessive caffeine or heavy meals close to bedtime",
      "Uncomfortable study or sleeping environment"
    ],
    copingStrategies: [
      "Go to bed and wake up at the same time every day, even on weekends",
      "Ensure your sleeping area is dark, quiet, and cool",
      "Avoid screens (phone, laptop) for at least 30-60 minutes before bed",
      "Incorporate a calming pre-sleep routine (e.g., reading, stretching)",
      "Limit caffeine intake during the afternoon and evening"
    ],
    supportAdvice: "If sleep difficulties persist for several weeks and significantly affect your energy, focus, and emotional well-being during the day, consulting a professional can help restore balance."
  },
  {
    id: "low-motivation",
    title: "Low Motivation",
    icon: Compass,
    description: "A feeling of lacking direction, energy, or drive to complete tasks or engage in academic and personal goals.",
    signs: [
      "Repeated procrastination on important tasks",
      "Difficulty starting or completing assignments",
      "Lack of enthusiasm or interest in future achievements",
      "Preferring passive distractions over productive activities"
    ],
    factors: [
      "Unclear goals or disconnection from academic interests",
      "Fear of failure or self-doubt about your abilities",
      "Prolonged fatigue or early signs of academic burnout",
      "Overwhelming task size leading to inertia"
    ],
    copingStrategies: [
      "Clarify your 'why' and connect tasks to your long-term goals",
      "Use the '5-minute rule'—start a task for just five minutes",
      "Break down overwhelming tasks into bite-sized actions",
      "Reward yourself for small accomplishments and milestones",
      "Seek accountability from a study buddy or mentor"
    ],
    supportAdvice: "If low motivation is accompanied by persistent sadness, worthlessness, or withdrawal from friends, consider reaching out to counselling services for support."
  },
  {
    id: "loneliness-isolation",
    title: "Loneliness & Isolation",
    icon: Users,
    description: "A feeling of disconnection from others, lack of belonging, or finding it difficult to establish meaningful social bonds.",
    signs: [
      "Feeling disconnected even when surrounded by other students",
      "Withdrawing from social interactions, group projects, or clubs",
      "Feeling that no one understands or supports you",
      "Experiencing sadness or emptiness due to lack of companionship"
    ],
    factors: [
      "Transitioning to a new college environment or hostel life",
      "Social anxiety or shyness in making new friends",
      "Academic schedule leaving little room for social activities",
      "Differences in cultural background or personal interests"
    ],
    copingStrategies: [
      "Join student clubs, sports groups, or interest-based communities",
      "Initiate brief interactions (e.g., greeting classmates, study groups)",
      "Reach out to old friends or family members for familiar support",
      "Practice volunteering or engaging in community activities",
      "Remind yourself that adjusting to college transitions takes time"
    ],
    supportAdvice: "If social isolation is causing deep distress, anxiety, or keeping you from participating in campus life, talking to a counsellor can help you explore ways to connect."
  },
  {
    id: "time-management",
    title: "Time Management",
    icon: Clock,
    description: "Challenges in planning, prioritizing, and executing daily schedules, leading to rushed deadlines and elevated stress.",
    signs: [
      "Frequently missing assignment deadlines or appointments",
      "Rushing to finish work at the very last minute",
      "Feeling constantly busy but achieving very little progress",
      "Experiencing high stress due to conflicting commitments"
    ],
    factors: [
      "Underestimating the time needed to complete academic tasks",
      "Distractions from social media, gaming, or phone notifications",
      "Difficulty prioritizing between urgent and important items",
      "Taking on too many extra-curricular or personal activities"
    ],
    copingStrategies: [
      "Use digital calendars or planners to track academic deadlines",
      "Prioritize tasks using the Eisenhower Matrix (Urgent vs. Important)",
      "Set specific, distraction-free study blocks during your high-energy hours",
      "Learn to say 'no' to non-essential commitments when overloaded",
      "Review your schedule weekly to adjust plans and incorporate breaks"
    ],
    supportAdvice: "If time management challenges are causing persistent stress or leading to academic difficulties, a counsellor can guide you through personalized planning strategies."
  },
  {
    id: "general-wellbeing",
    title: "General Wellbeing",
    icon: Smile,
    description: "Nurturing your emotional, mental, and physical health to maintain balance and feel fulfilled throughout college.",
    signs: [
      "Fluctuations in mood or temporary, mild stress",
      "Desire to build healthier daily routines and habits",
      "Seeking a greater sense of purpose or academic balance",
      "Occasional difficulties in managing daily stressors"
    ],
    factors: [
      "Daily college routines and study expectations",
      "Adapting to personal changes and campus environment",
      "Balancing personal relationships and study schedules",
      "General lifestyle habits (diet, activity level, sleep)"
    ],
    copingStrategies: [
      "Practice daily gratitude by noting down three positive things",
      "Engage in regular light exercise or outdoor campus walks",
      "Incorporate simple breathing exercises or mindfulness breaks",
      "Stay connected with supportive peer networks and friends",
      "Establish healthy boundaries around academic and personal time"
    ],
    supportAdvice: "Counselling is not just for crises. If you wish to work on self-improvement, establish better wellness habits, or just want to chat about your well-being, the support desk is always here."
  }
];
