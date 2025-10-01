// services/chatbotService.ts

interface HealthQnAEntry {
  answer: string;
  category: string;
  followUp: string[];
}

interface ChatbotResponse {
  text: string;
  source: string;
  category: string;
  followUp: string[];
}

// Predefined questions and answers for health topics
const healthQnA: Record<string, HealthQnAEntry> = {
  // Menstrual Cycle Questions
  "what is follicular phase": {
    answer: "The follicular phase is the first part of your menstrual cycle, starting from day 1 of your period until ovulation. During this phase, your body prepares for potential pregnancy by developing follicles in your ovaries. You might experience lighter discharge, increased energy, and better mood as estrogen levels rise.",
    category: "Menstrual Health",
    followUp: ["What happens during ovulation?", "How long does follicular phase last?", "What are the signs of follicular phase?"]
  },

  "tell me about the follicular phase": {
    answer: "The follicular phase is the first part of your menstrual cycle, starting from day 1 of your period until ovulation. During this phase, your body prepares for potential pregnancy by developing follicles in your ovaries. You might experience lighter discharge, increased energy, and better mood as estrogen levels rise.",
    category: "Menstrual Health",
    followUp: ["What happens during ovulation?", "How long does follicular phase last?", "What are the signs of follicular phase?"]
  },

  "what is ovulation?": {
    answer: "Ovulation occurs when a mature egg is released from your ovary, typically around day 14 of a 28-day cycle. Signs include clear, stretchy cervical mucus, slight temperature rise, and sometimes mild pelvic pain. This is your most fertile time if you're trying to conceive.",
    category: "Menstrual Health",
    followUp: ["How to track ovulation?", "What is luteal phase?", "Ovulation pain normal?"]
  },

  "what happens during ovulation?": {
    answer: "During ovulation, a mature egg is released from your ovary and travels down the fallopian tube. Hormone levels peak, causing changes like clear cervical mucus, slight body temperature increase, and increased libido. Some women experience mittelschmerz (ovulation pain) on one side.",
    category: "Menstrual Health",
    followUp: ["How long does ovulation last?", "Can you feel ovulation?", "Best time to conceive?"]
  },

  "what is luteal phase": {
    answer: "The luteal phase occurs after ovulation until your next period starts. Progesterone levels rise to prepare the uterine lining for potential pregnancy. You might experience PMS symptoms like bloating, breast tenderness, mood changes, and food cravings during this phase.",
    category: "Menstrual Health",
    followUp: ["How long is luteal phase?", "PMS symptoms normal?", "What is menstruation?"]
  },

  "period late": {
    answer: "A late period can be caused by stress, weight changes, exercise, illness, hormonal imbalances, or pregnancy. If you're sexually active, consider taking a pregnancy test. If periods are frequently irregular, consult a healthcare provider to rule out underlying conditions.",
    category: "Menstrual Health",
    followUp: ["When to take pregnancy test?", "Irregular periods causes?", "When to see doctor?"]
  },

  "period pain relief": {
    answer: "For period pain relief, try heat therapy (heating pad or warm bath), gentle exercise, over-the-counter pain relievers like ibuprofen, staying hydrated, and getting enough rest. Severe pain that interferes with daily activities should be discussed with a healthcare provider.",
    category: "Menstrual Health",
    followUp: ["Natural pain relief methods?", "When is period pain serious?", "Exercises for cramps?"]
  },

  // Reproductive Health
  "discharge normal": {
    answer: "Normal vaginal discharge varies throughout your cycle. It's usually clear or white, odorless or with a mild scent, and changes texture from sticky to creamy to stretchy. Abnormal discharge that's green, gray, has a strong odor, or causes itching needs medical attention.",
    category: "Reproductive Health",
    followUp: ["Types of discharge?", "Discharge colors meaning?", "When to see doctor?"]
  },

  "birth control options": {
    answer: "Birth control options include hormonal methods (pills, patches, rings, shots, implants, IUDs), barrier methods (condoms, diaphragms), natural methods (fertility awareness), and permanent options (sterilization). Each has different effectiveness rates, benefits, and considerations.",
    category: "Reproductive Health",
    followUp: ["Birth control side effects?", "Most effective birth control?", "Natural family planning?"]
  },

  "pregnancy symptoms": {
    answer: "Early pregnancy symptoms include missed period, nausea, breast tenderness, frequent urination, fatigue, and food aversions or cravings. These symptoms can also be caused by other factors, so a pregnancy test is needed for confirmation.",
    category: "Reproductive Health",
    followUp: ["When to take pregnancy test?", "False pregnancy symptoms?", "Early pregnancy care?"]
  },

  // Lifestyle and Wellness
  "healthy diet": {
    answer: "A healthy diet for reproductive health includes plenty of fruits, vegetables, whole grains, lean proteins, and healthy fats. Focus on iron-rich foods during menstruation, calcium for bone health, and folate if planning pregnancy. Stay hydrated and limit processed foods.",
    category: "Lifestyle",
    followUp: ["Foods for period health?", "Supplements needed?", "Diet for fertility?"]
  },

  "exercise during period": {
    answer: "Light to moderate exercise during your period can actually help reduce cramps and improve mood. Try walking, gentle yoga, swimming, or light strength training. Listen to your body and reduce intensity if needed. Avoid exercises that cause discomfort.",
    category: "Lifestyle",
    followUp: ["Best exercises for cramps?", "Yoga poses for periods?", "Exercise and irregular periods?"]
  },

  "stress and periods": {
    answer: "Stress can significantly impact your menstrual cycle, causing irregular periods, missed periods, or more painful cramps. Chronic stress affects hormone production. Managing stress through relaxation techniques, exercise, adequate sleep, and healthy coping strategies can help regulate your cycle.",
    category: "Lifestyle",
    followUp: ["Stress management techniques?", "How stress affects hormones?", "Natural stress relief?"]
  },

  // General Help
  "help": {
    answer: "I can help you with questions about menstrual cycles, reproductive health, and healthy lifestyle choices. You can ask about period symptoms, ovulation, birth control, pregnancy, nutrition, exercise, and wellness tips. What would you like to know?",
    category: "General",
    followUp: ["Common period questions", "Reproductive health topics", "Lifestyle tips"]
  },

  "hi": {
    answer: "Hello! I'm here to help you with questions about reproductive health, menstrual cycles, and healthy lifestyle choices. What would you like to know today?",
    category: "General",
    followUp: ["Tell me about menstrual cycle", "Reproductive health questions", "Healthy lifestyle tips"]
  },

  "hello": {
    answer: "Hi there! I'm your HealthPathCoach assistant. I can answer questions about periods, reproductive health, and wellness. How can I help you today?",
    category: "General",
    followUp: ["Period tracking tips", "Ovulation questions", "Health and wellness"]
  }
};

// Keywords for fuzzy matching
const keywordMapping: Record<string, string> = {
  // Menstrual cycle keywords
  "follicular": "what is follicular phase",
  "follicle": "what is follicular phase",
  "ovulation": "what is ovulation?",
  "ovulate": "what is ovulation?",
  "luteal": "what is luteal phase",
  "period": "period pain relief",
  "menstruation": "what is luteal phase",
  "cycle": "what is follicular phase",
  "cramps": "period pain relief",
  "pain": "period pain relief",
  "late": "period late",
  "irregular": "period late",
  "missed period": "period late",
  "spotting": "period late",
  "heavy bleeding": "period pain relief",
  "light period": "period late",
  "pms": "what is luteal phase",
  "bloating": "what is luteal phase",
  "breast tenderness": "what is luteal phase",
  "mood swings": "what is luteal phase",
  "menstrual": "what is follicular phase",
  "period pain": "period pain relief",
  "painful period": "period pain relief",
  "menstrual pain": "period pain relief",
  "cramping": "period pain relief",
  "period cramps": "period pain relief",
  "menstrual cramps": "period pain relief",
  "spotting before period": "period late",
  "irregular cycles": "period late",
  "missed menstruation": "period late",

  // Reproductive health keywords
  "discharge": "discharge normal",
  "vaginal discharge": "discharge normal",
  "smelly discharge": "discharge normal",
  "itchy": "discharge normal",
  "infection": "discharge normal",
  "yeast": "discharge normal",
  "bacterial": "discharge normal",
  "birth control": "birth control options",
  "contraception": "birth control options",
  "contraceptive": "birth control options",
  "pill": "birth control options",
  "condom": "birth control options",
  "iud": "birth control options",
  "implant": "birth control options",
  "pregnant": "pregnancy symptoms",
  "pregnancy": "pregnancy symptoms",
  "morning sickness": "pregnancy symptoms",
  "nausea": "pregnancy symptoms",
  "fertility": "what is ovulation?",
  "fertile": "what is ovulation?",
  "trying to conceive": "what is ovulation?",

  // Lifestyle keywords
  "diet": "healthy diet",
  "nutrition": "healthy diet",
  "healthy eating": "healthy diet",
  "food": "healthy diet",
  "supplements": "healthy diet",
  "exercise": "exercise during period",
  "workout": "exercise during period",
  "yoga": "exercise during period",
  "swimming": "exercise during period",
  "walking": "exercise during period",
  "stress": "stress and periods",
  "anxiety": "stress and periods",
  "mental health": "stress and periods",
  "sleep": "stress and periods",
  "rest": "stress and periods",

  // Ovulation – Variations
  "ovulating": "what is ovulation?",
  "fertile window": "what is ovulation?",
  "when can I get pregnant": "what is ovulation?",
  "when am I fertile": "what is ovulation?",
  "egg release": "what is ovulation?",
  "fertility window": "what is ovulation?",

  // Luteal Phase & PMS
  "pms symptoms": "what is luteal phase",
  "mood change": "what is luteal phase",
  "breast pain": "what is luteal phase",
  "tired before period": "what is luteal phase",

  // Discharge – More natural queries
  "vaginal smell": "discharge normal",
  "green discharge": "discharge normal",
  "white discharge": "discharge normal",
  "discharge color": "discharge normal",
  "burning discharge": "discharge normal",
  "yeast infection": "discharge normal",

  // Pregnancy – Natural queries
  "am I pregnant": "pregnancy symptoms",
  "pregnancy signs": "pregnancy symptoms",
  "early signs of pregnancy": "pregnancy symptoms",
  "when do pregnancy symptoms show": "pregnancy symptoms",

  // Birth Control – Expanded
  "prevent pregnancy": "birth control options",
  "types of birth control": "birth control options",
  "family planning": "birth control options",
  "how to not get pregnant": "birth control options",
  "contraceptive pills": "birth control options",
  "injection contraception": "birth control options",

  // Lifestyle – Expanded
  "food during period": "healthy diet",
  "eat healthy": "healthy diet",
  "period diet": "healthy diet",
  "balanced diet": "healthy diet",
  "sleep and cycle": "stress and periods",
  "sleep problems": "stress and periods",

  // Mental health – Additional triggers
  "depression": "stress and periods",
  "anxious": "stress and periods",
  "emotional before period": "stress and periods",
  "mental well-being": "stress and periods",

  // Exercise
  "workout on period": "exercise during period",
  "can I exercise during menstruation": "exercise during period",
  "gym on period": "exercise during period",

  // Greetings and Help – Variants
  "i need help": "help",
  "i have a question": "help",
  "ask question": "help",
  "reproductive health": "help",
  "learning about cycle": "help",
  "how this app works": "help",
  "hey": "hi",
  "good morning": "hello",
  "good afternoon": "hello",
  "good evening": "hello",
  "hi": "hi",
  "hello": "hello",
  "help": "help",
  "support": "help",
  "question": "help",
  "faq": "help",

  // Misspellings and common variations
  "ovulashun": "what is ovulation?",
  "menstration": "what is follicular phase",
  "contraseption": "birth control options",
  "pregnency": "pregnancy symptoms",
  "nutrician": "healthy diet",
  "excersize": "exercise during period",
  "stres": "stress and periods",
};

// Function to find the best match for user input
const findBestMatch = (userInput: string): HealthQnAEntry | null => {
  const input = userInput.toLowerCase().trim();

  // Direct match
  if (healthQnA[input]) {
    return healthQnA[input];
  }

  // Keyword matching
  for (const [keyword, questionKey] of Object.entries(keywordMapping)) {
    if (input.includes(keyword)) {
      return healthQnA[questionKey];
    }
  }

  // Partial matching for questions
  for (const [question, data] of Object.entries(healthQnA)) {
    if (input.includes(question.split(' ')[0]) || question.includes(input.split(' ')[0])) {
      return data;
    }
  }

  return null;
};

// Main chatbot service function
export const sendChatbotMessage = async (message: string): Promise<ChatbotResponse> => {
  return new Promise((resolve) => {
    // Simulate API delay for realistic feel
    setTimeout(() => {
      const match = findBestMatch(message);
      if (match) {
        resolve({
          text: match.answer,
          source: "HealthPathCoach",
          category: match.category,
          followUp: match.followUp
        });
      } else {
        // Explicit unknown response for unmatched/misspelled questions
        resolve({
          text: "I'm not sure I understand that question. Could you rephrase or try asking about topics like: menstrual cycle, period pain, birth control, or healthy lifestyle?",
          source: "unknown",
          category: "Unknown",
          followUp: [
            "What is follicular phase?",
            "Period pain relief",
            "Healthy diet tips",
            "Birth control options"
          ]
        });
      }
    }, 1000); // 1 second delay to simulate processing
  });
};

// Function to get popular questions
export const getPopularQuestions = (): string[] => {
  return [
    "What is follicular phase?",
    "Tell me about ovulation",
    "Period pain relief",
    "Is my discharge normal?",
    "Birth control options",
    "Healthy diet tips",
    "Exercise during period"
  ];
};

// Function to get questions by category
export const getQuestionsByCategory = (category: string): string[] => {
  return Object.entries(healthQnA)
    .filter(([_, data]) => data.category === category)
    .map(([question, _]) => question);
};