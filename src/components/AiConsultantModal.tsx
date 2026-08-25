import React, { useState } from 'react';
import { Bot, X, Send, Sparkles, User, RefreshCw, Phone } from 'lucide-react';
import { ACADEMY_INFO } from '../data/coursesData';
import { useModalA11y } from '../lib/useModalA11y';

interface AiConsultantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToInquiry: () => void;
}

export const AiConsultantModal: React.FC<AiConsultantModalProps> = ({
  isOpen,
  onClose,
  onNavigateToInquiry,
}) => {
  const [messages, setMessages] = useState<
    Array<{ sender: 'ai' | 'user'; text: string; time: string }>
  >([
    {
      sender: 'ai',
      text: `안녕하세요! 홍천 중앙정보처리학원 AI 수강 상담 선생님입니다. 🤖✨\n\n국비지원(내일배움카드), 자격증(컴활/전산회계), 시니어 기초, 파이썬/AI 등 원하시는 강좌나 학습 목표를 자유롭게 물어보세요!`,
      time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [userCategory, setUserCategory] = useState('취업준비생');
  const [isLoading, setIsLoading] = useState(false);

  const panelRef = useModalA11y(isOpen, onClose);

  if (!isOpen) return null;

  const quickPrompts = [
    '취업용 자격증 추천해주세요',
    '국민내일배움카드 발급방법 알려주세요',
    '컴활 1급과 2급 차이가 궁금해요',
    '50대 시니어 스마트폰/컴퓨터 반 문의',
  ];

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const currentTime = new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });

    const newMessages = [
      ...messages,
      { sender: 'user' as const, text: textToSend, time: currentTime },
    ];
    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: textToSend,
          userCategory: userCategory,
        }),
      });

      const data = await response.json();
      const aiReply = data.reply || '질문에 감사드립니다. 상세한 상담은 전화 033-433-1926으로 문의해 주세요!';

      setMessages([
        ...newMessages,
        { sender: 'ai', text: aiReply, time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'ai',
          text: `상담을 환영합니다! 홍천 중앙정보처리학원(033-433-1926)으로 전화 주시면 더욱 친절하게 1:1 맞춤 안내를 받으실 수 있습니다.`,
          time: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ai-consultant-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/90 backdrop-blur-2xl rounded-3xl max-w-lg w-full h-[85vh] max-h-[650px] flex flex-col shadow-2xl border border-white/80 overflow-hidden"
      >
        
        {/* Modal Header */}
        <div className="bg-slate-900/90 backdrop-blur-md text-white p-4 sm:p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Bot className="w-6 h-6 text-blue-100" />
            </div>
            <div>
              <h3 id="ai-consultant-title" className="font-extrabold text-base sm:text-lg flex items-center gap-1.5">
                <span>AI 수강 상담 선생님</span>
                <span className="text-[10px] bg-emerald-500 text-white font-bold px-2 py-0.5 rounded-full">
                  Gemini AI
                </span>
              </h3>
              <p className="text-xs text-blue-200">홍천 중앙정보처리학원 맞춤 추천</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Category Selector */}
        <div className="px-4 py-2.5 bg-white/50 backdrop-blur-sm border-b border-white/60 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <span className="text-slate-500 whitespace-nowrap">신분:</span>
          {['취업준비생', '재직자', '대학생', '시니어/주부'].map((cat) => (
            <button
              key={cat}
              onClick={() => setUserCategory(cat)}
              className={`px-3 py-1 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                userCategory === cat
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-200'
                  : 'bg-white/80 border border-slate-200/80 text-slate-700 hover:bg-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-transparent">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2.5 ${
                m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {m.sender === 'ai' ? (
                <div className="w-8 h-8 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                  AI
                </div>
              ) : (
                <div className="w-8 h-8 rounded-2xl bg-slate-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-sm">
                  나
                </div>
              )}

              <div
                className={`max-w-[80%] rounded-3xl p-4 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : 'bg-white/80 backdrop-blur-md text-slate-800 border border-white/80 rounded-tl-none'
                }`}
              >
                {m.text}
                <div
                  className={`text-[10px] mt-1.5 text-right ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-600 p-3 bg-white/80 backdrop-blur-sm rounded-2xl border border-white/80 max-w-xs animate-pulse">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
              <span>선생님이 답변을 작성하고 있습니다...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-white/40 backdrop-blur-sm border-t border-white/60 overflow-x-auto flex gap-1.5 scrollbar-none">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 bg-blue-50/90 hover:bg-blue-100 text-blue-800 border border-blue-200/80 text-xs font-bold rounded-full whitespace-nowrap transition-all"
            >
              💡 {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white/60 backdrop-blur-md border-t border-white/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="질문을 입력하세요 (예: 컴활 야간반 있나요?)"
              className="flex-1 px-4 py-2.5 bg-white/80 border border-slate-200/80 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all shadow-sm"
            />
            <button
              type="submit"
              disabled={isLoading || !inputQuery.trim()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-all shadow-md shadow-blue-200 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 font-medium">
            <span>☎ 전화 문의: {ACADEMY_INFO.phone}</span>
            <button
              onClick={() => {
                onClose();
                onNavigateToInquiry();
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              온라인 상담신청 서식으로 이동
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
