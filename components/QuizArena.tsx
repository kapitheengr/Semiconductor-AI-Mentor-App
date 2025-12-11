import React, { useState } from 'react';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion } from '../types';
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

const QuizArena: React.FC = () => {
  const [topic, setTopic] = useState("Semiconductor Physics");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    try {
      const data = await generateQuiz(topic);
      if (data.questions) setQuestions(data.questions);
    } catch (e) {
      alert("Error generating quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (qId: number, optionIdx: number) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) score++;
    });
    return score;
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Assessment Center</h2>
        <div className="flex gap-4">
          <input 
            type="text" 
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
            placeholder="Enter a topic (e.g. CMOS Fabrication)"
          />
          <button 
            onClick={handleGenerate}
            disabled={loading}
            className="bg-blue-700 text-white px-6 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            {loading ? 'Generating...' : 'Start Quiz'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q) => {
          const isCorrect = answers[q.id] === q.correctAnswer;
          const isSelected = (idx: number) => answers[q.id] === idx;
          
          return (
            <div key={q.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 transition-colors">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">{q.question}</h3>
              <div className="space-y-3">
                {q.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(q.id, idx)}
                    className={`w-full text-left p-4 rounded-lg border transition-all flex justify-between items-center ${
                      submitted 
                        ? idx === q.correctAnswer 
                          ? 'bg-green-50 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-300'
                          : isSelected(idx) 
                            ? 'bg-red-50 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-300'
                            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 opacity-60 dark:text-gray-400'
                        : isSelected(idx)
                          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-300 ring-1 ring-blue-500'
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {submitted && idx === q.correctAnswer && <CheckCircle2 size={20} className="text-green-600" />}
                    {submitted && isSelected(idx) && idx !== q.correctAnswer && <XCircle size={20} className="text-red-600" />}
                  </button>
                ))}
              </div>
              {submitted && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-900 dark:text-blue-100">
                  <strong>Explanation:</strong> {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {questions.length > 0 && !submitted && (
        <div className="mt-8 text-center">
          <button 
            onClick={() => setSubmitted(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-12 py-3 rounded-lg font-bold text-lg shadow-md transition-transform active:scale-95"
          >
            Submit Answers
          </button>
        </div>
      )}

      {submitted && (
        <div className="fixed bottom-8 right-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-600 animate-in slide-in-from-bottom-4 z-50">
          <h4 className="text-xl font-bold mb-2 dark:text-white">Quiz Complete!</h4>
          <p className="text-4xl font-black text-blue-700 dark:text-blue-400 mb-2">
            {Math.round((calculateScore() / questions.length) * 100)}%
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">You answered {calculateScore()} out of {questions.length} correctly.</p>
          <button onClick={handleGenerate} className="mt-4 w-full flex items-center justify-center gap-2 text-blue-700 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-gray-700 p-2 rounded">
             <RefreshCw size={16} /> Try Another
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizArena;