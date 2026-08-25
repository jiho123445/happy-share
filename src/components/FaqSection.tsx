import React, { useState } from 'react';
import { FAQ_DATA } from '../data/coursesData';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-12 lg:py-20 bg-transparent">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-100/80 backdrop-blur-sm text-amber-800 font-extrabold text-xs mb-3 border border-amber-200/60 shadow-sm">
            <HelpCircle className="w-3.5 h-3.5" />
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            자주 묻는 질문 (FAQ)
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            국비지원 카드 발급, 수강료 및 자격증 시험에 대한 궁금증을 풀어드립니다.
          </p>
        </div>

        <div className="space-y-4">
          {FAQ_DATA.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="glass-card rounded-3xl border border-white/70 overflow-hidden transition-all shadow-md"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 sm:p-6 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-white/60 transition-colors"
                >
                  <span className="flex items-start gap-2.5">
                    <span className="text-blue-600 font-black">Q.</span>
                    <span>{faq.question}</span>
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-2 text-slate-700 text-xs sm:text-sm leading-relaxed border-t border-white/60 bg-white/40 backdrop-blur-sm">
                    <p className="flex items-start gap-2.5">
                      <span className="text-emerald-600 font-black">A.</span>
                      <span>{faq.answer}</span>
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
