'use client';

import React, { useState } from 'react';

interface OnboardingQuestionsProps {
  onQuestionSelect: (question: string) => void;
  mode?: 'overlay' | 'sidebar';
  isVisible?: boolean;
  onClose?: () => void;
}

const ONBOARDING_QUESTIONS = [
  {
    id: 'roles',
    text: 'What role do each of you play in my birth chart?',
    category: 'Roles & Purpose'
  },
  {
    id: 'personalities', 
    text: 'What personalities do each of you have?',
    category: 'Personality & Traits'
  }
];

export function OnboardingQuestions({ 
  onQuestionSelect, 
  mode = 'overlay', 
  isVisible = true,
  onClose 
}: OnboardingQuestionsProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
    setIsAnimating(true);
    
    // Trigger animation and then call the callback after a delay
    setTimeout(() => {
      onQuestionSelect(question);
    }, 800); // Animation duration
  };

  if (!isVisible) return null;

  // Overlay mode (initial popup for new users)
  if (mode === 'overlay') {
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/60 z-50 cursor-pointer" 
          onClick={onClose}
        />
        
        {/* Centered question panel */}
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none">
          <div 
            className={`bg-black/90 backdrop-blur-sm border border-white/30 rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4 shadow-2xl transition-all duration-800 ease-in-out pointer-events-auto ${
              isAnimating ? 'transform translate-x-full opacity-0 scale-95' : 'transform translate-x-0 opacity-100 scale-100'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <h3 className="text-amber-50/85 font-light text-lg mb-2">
                Welcome to Your Planetary Council
              </h3>
              <p className="text-amber-50/60 font-thin text-sm">
                Get started by asking one of these questions:
              </p>
            </div>
            
            <div className="space-y-3">
              {ONBOARDING_QUESTIONS.map((question) => (
                <button
                  key={question.id}
                  onClick={() => handleQuestionClick(question.text)}
                  className="w-full text-left p-4 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/20 hover:border-white/30 active:border-white/40 rounded-lg transition-all duration-200 group touch-manipulation"
                >
                  <div className="text-amber-50/85 font-light text-sm leading-relaxed group-hover:text-white">
                    {question.text}
                  </div>
                  <div className="text-amber-50/70 font-thin text-xs mt-2 group-hover:text-white/60">
                    {question.category}
                  </div>
                </button>
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={onClose}
                className="text-amber-50/70 font-light hover:text-white/70 active:text-white/80 text-xs transition-colors py-2 px-4 rounded touch-manipulation"
              >
                I'll ask my own question
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Sidebar mode (swipe-from-right panel)
  return (
    <div className="p-4 space-y-4">
      <div className="text-center mb-4">
        <h4 className="text-white text-sm font-medium mb-1">Quick Start</h4>
        <p className="text-white/60 text-xs">Try these questions:</p>
      </div>
      
      <div className="space-y-3">
        {ONBOARDING_QUESTIONS.map((question) => (
          <button
            key={question.id}
            onClick={() => handleQuestionClick(question.text)}
            className="w-full text-left p-3 bg-white/5 hover:bg-white/10 active:bg-white/15 border border-white/20 hover:border-white/30 active:border-white/40 rounded-md transition-all duration-200 group touch-manipulation"
          >
            <div className="text-white/90 text-xs leading-relaxed group-hover:text-white">
              {question.text}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}