"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, CheckCircle, XCircle, RotateCcw } from "lucide-react";

interface Question {
  question: string;
  options: {
    text: string;
    correct: boolean;
  }[];
}

const QUIZ_QUESTIONS: Question[] = [
  {
    question: "Što je celijakija?",
    options: [
      { text: "Alergija na gluten", correct: false },
      { text: "Autoimuna bolest uzrokovana glutenom", correct: true },
      { text: "Intolerancija na šećer", correct: false },
    ],
  },
  {
    question: "Može li se celijakija izliječiti?",
    options: [
      { text: "Da, lijekovima", correct: false },
      { text: "Ne, ali se kontrolira bezglutenskom prehranom", correct: true },
      { text: "Da, vježbanjem", correct: false },
    ],
  },
  {
    question: "Koliko je grama glutena sigurno za osobu s celijakijom?",
    options: [
      { text: "20g dnevno", correct: false },
      { text: "10g dnevno", correct: false },
      { text: "Manje od 20mg dnevno", correct: true },
    ],
  },
  {
    question: "Koji od ovih proizvoda je prirodno bezglutenski?",
    options: [
      { text: "Pšenično brašno", correct: false },
      { text: "Riža", correct: true },
      { text: "Ječam", correct: false },
    ],
  },
  {
    question: "Što je cross-kontaminacija?",
    options: [
      { text: "Miješanje različitih vrsta brašna", correct: false },
      { text: "Nenamjerno unošenje glutena u bezglutenske proizvode", correct: true },
      { text: "Kuhanje na visokoj temperaturi", correct: false },
    ],
  },
];

const MAX_POSITION = 5; // Maksimalna pozicija lijevo/desno
const FINAL_POSITIONS = {
  wrong: -MAX_POSITION, // WC (lijevo)
  correct: MAX_POSITION, // Nasmijano lice (desno)
};

export function CeliacQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [position, setPosition] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  const handleAnswer = (optionIndex: number, isCorrect: boolean) => {
    setSelectedAnswer(optionIndex);
    
    // Pomakni poziciju
    const newPosition = isCorrect 
      ? Math.min(position + 1, MAX_POSITION)
      : Math.max(position - 1, -MAX_POSITION);
    
    setPosition(newPosition);

    // Provjeri je li kviz gotov
    setTimeout(() => {
      if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setPosition(0);
    setShowResult(false);
    setSelectedAnswer(null);
  };

  const question = QUIZ_QUESTIONS[currentQuestion];
  const isCorrect = position >= 0;
  const finalPosition = position <= -3 ? FINAL_POSITIONS.wrong : FINAL_POSITIONS.correct;

  return (
    <section className="relative bg-gf-bg-soft py-20 dark:bg-neutral-800 overflow-visible">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <div className="mb-4 inline-flex items-center gap-2">
            <HelpCircle className="h-6 w-6 text-gf-cta" />
            <h2 className="text-3xl font-bold text-gf-text-primary dark:text-neutral-100">
              Kviz o celijakiji
            </h2>
          </div>
          <p className="text-gf-text-secondary dark:text-neutral-400">
            Testiraj svoje znanje! Svaki točan odgovor te vodi desno, a krivi lijevo.
          </p>
        </motion.div>

        <div className="relative overflow-visible">
          {/* Progress bar */}
          <div className="mb-8 flex items-center justify-between gap-2">
            <div className="flex-1 h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                initial={{ width: "50%" }}
                animate={{ 
                  width: `${50 + (position / MAX_POSITION) * 50}%`,
                  x: `${(position / MAX_POSITION) * 50}%`,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                style={{ transformOrigin: "left" }}
              />
            </div>
            <div className="text-sm text-gf-text-secondary dark:text-neutral-400">
              {currentQuestion + 1} / {QUIZ_QUESTIONS.length}
            </div>
          </div>

          {/* Character position indicator */}
          <div className="relative mb-6 min-h-[120px] py-4">
            <div className="relative w-full h-20" style={{ paddingLeft: "200px", paddingRight: "200px" }}>
              <AnimatePresence mode="wait">
                {!showResult ? (
                  <motion.div
                    key="character"
                    initial={{ x: 0 }}
                    animate={{ 
                      x: `${(position / MAX_POSITION) * 400}px`,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ willChange: "transform" }}
                  >
                    <div className="text-4xl whitespace-nowrap">
                      {position < -2 ? "🚽" : position > 2 ? "😊" : "🤔"}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="result"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                  >
                    <div className="text-5xl">
                      {position <= -3 ? "🚽" : "😊"}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Question and answers */}
          <AnimatePresence mode="wait">
            {!showResult ? (
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-gf-bg-card rounded-2xl border border-neutral-200 p-8 dark:border-neutral-700 dark:bg-neutral-900"
              >
                <h3 className="text-2xl font-semibold text-gf-text-primary mb-6 dark:text-neutral-100">
                  {question.question}
                </h3>
                <div className="space-y-3">
                  {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === index;
                    const isCorrect = option.correct;
                    const showFeedback = selectedAnswer !== null;

                    return (
                      <motion.button
                        key={index}
                        onClick={() => !showFeedback && handleAnswer(index, option.correct)}
                        disabled={showFeedback}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          showFeedback
                            ? isSelected
                              ? isCorrect
                                ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                                : "border-red-500 bg-red-50 dark:bg-red-900/20"
                              : isCorrect && "border-green-500 bg-green-50 dark:bg-green-900/20"
                            : "border-neutral-300 hover:border-gf-cta hover:bg-gf-bg-soft dark:border-neutral-700 dark:hover:bg-neutral-800"
                        } ${showFeedback ? "cursor-not-allowed" : "cursor-pointer"}`}
                        whileHover={!showFeedback ? { scale: 1.02 } : {}}
                        whileTap={!showFeedback ? { scale: 0.98 } : {}}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gf-text-primary dark:text-neutral-100">
                            {option.text}
                          </span>
                          {showFeedback && isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              {isCorrect ? (
                                <CheckCircle className="h-6 w-6 text-green-500" />
                              ) : (
                                <XCircle className="h-6 w-6 text-red-500" />
                              )}
                            </motion.div>
                          )}
                          {showFeedback && !isSelected && isCorrect && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gf-bg-card rounded-2xl border border-neutral-200 p-8 text-center dark:border-neutral-700 dark:bg-neutral-900"
              >
                <h3 className="text-2xl font-semibold text-gf-text-primary mb-4 dark:text-neutral-100">
                  {position <= -3 
                    ? "Možda trebaš malo više pročitati o celijakiji!" 
                    : "Odlično! Dobro poznaješ celijakiju!"}
                </h3>
                <p className="text-gf-text-secondary dark:text-neutral-400 mb-6">
                  {position <= -3
                    ? "Pogledaj naše blog postove i saznaj više o celijakiji!"
                    : "Nastavi učiti i dijeliti znanje s drugima!"}
                </p>
                <motion.button
                  onClick={resetQuiz}
                  className="inline-flex items-center gap-2 rounded-xl bg-gf-cta px-6 py-3 text-sm font-semibold text-white hover:bg-gf-cta-hover transition-colors dark:bg-gf-cta dark:hover:bg-gf-cta-hover"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <RotateCcw className="h-4 w-4" />
                  Pokušaj ponovno
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

