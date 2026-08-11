import React, { useState } from 'react';
import { Cpu, Mic, Volume2, Sparkles, CheckCircle2, Award, Smartphone, RefreshCw, Play } from 'lucide-react';

export const AIFeatureShowcase: React.FC = () => {
  const [selectedPhrase, setSelectedPhrase] = useState('안녕하세요, 홍천군민 모두 반갑습니다.');
  const [analyzing, setAnalyzing] = useState(false);
  const [scoreResult, setScoreResult] = useState<{ score: number; feedback: string } | null>({
    score: 96,
    feedback: '정확하고 자연스러운 억양과 발음입니다. (상급)'
  });

  const SAMPLE_PHRASES = [
    '안녕하세요, 홍천군민 모두 반갑습니다.',
    '너브내행복나눔재단과 함께해서 기쁩니다.',
    '따뜻한 나눔이 홍천에 크게 흐릅니다.',
    '홍천군가족센터에서 다문화 교육을 받아요.'
  ];

  const handlePracticePlay = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }

    setAnalyzing(true);
    setScoreResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      const randomScore = Math.floor(Math.random() * 8) + 92;
      setScoreResult({
        score: randomScore,
        feedback: `음성 파형 및 자음/모음 전달력 우수! 발음 정확도 ${randomScore}%`
      });
    }, 1200);
  };

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white relative overflow-hidden">
      
      {/* Background Tech Mesh Graphic */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-12 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30 backdrop-blur-xs">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <span>재단 특화 미래형 복지 모델</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            AI 음성인식 & 디지털 포용 복지사업
          </h2>
          <p className="text-sm sm:text-base text-slate-300">
            결혼이민자와 이주민 가족의 한국어 정착을 위한 AI 발음 분석 솔루션과 어르신 디지털 문해교육을 펼칩니다.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Feature Description */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/30 flex items-center justify-center text-indigo-300 border border-indigo-400/30">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">AI 한국어 발음 교정 (Master K 연계)</h3>
                  <p className="text-xs text-slate-400">결혼이민자 및 다문화 가정 대상</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                스마트폰 음성인식(STT)과 맞춤형 음성합성(TTS) 기술을 결합하여, 이주여성과 다문화 자녀가 
                언제 어디서나 실시간으로 발음 교정과 음절 정밀 피드백을 받을 수 있는 디지털 한국어 교실입니다.
              </p>
              <ul className="space-y-1.5 text-xs text-indigo-200">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>실시간 음성 파형 정밀 분석 및 점수 측정</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>지역사회 일상 생활용어 맞춤형 문장 탑재</span>
                </li>
              </ul>
            </div>

            <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/30 flex items-center justify-center text-amber-300 border border-amber-400/30">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">어르신 & 다문화 디지털 문해 교육</h3>
                  <p className="text-xs text-slate-400">정보격차 해소 및 생성형 AI 체험</p>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                스마트폰 활용법부터 버스 예약, 키오스크 이용, 생성형 AI를 활용한 생활 정보 탐색까지 
                디지털 소외 계층이 자신감 있게 사회와 소통하도록 지원합니다.
              </p>
            </div>
          </div>

          {/* Right Interactive Pronunciation Demo Box */}
          <div className="lg:col-span-7 bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-2xl relative">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-indigo-300">AI 발음분석 체감 시뮬레이션</span>
              </div>
              <span className="text-[11px] bg-indigo-950 text-indigo-300 px-2.5 py-1 rounded-md border border-indigo-800">
                음성합성(TTS) 체험 가능
              </span>
            </div>

            <div className="mt-6 space-y-6">
              
              {/* Phrase Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-400 mb-2 block">
                  실습할 문장을 선택해 보세요:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SAMPLE_PHRASES.map((phrase, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setSelectedPhrase(phrase);
                        setScoreResult(null);
                      }}
                      className={`p-2.5 text-xs text-left rounded-xl transition-all border ${
                        selectedPhrase === phrase
                          ? 'bg-indigo-600/40 text-white border-indigo-400 font-bold'
                          : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      "{phrase}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Phrase Display & Play Button */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
                <div className="text-xs text-indigo-400 font-semibold">선택된 실습 문장</div>
                <div className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  "{selectedPhrase}"
                </div>

                <div className="pt-2 flex justify-center gap-3">
                  <button
                    onClick={() => handlePracticePlay(selectedPhrase)}
                    disabled={analyzing}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
                  >
                    {analyzing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>AI 분석 중...</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4" />
                        <span>발음 듣기 & AI 진단</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Score Feedback Box */}
              {scoreResult && (
                <div className="bg-gradient-to-r from-emerald-950/80 to-slate-950 p-4 rounded-2xl border border-emerald-500/40 animate-in fade-in duration-300 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center font-black border border-emerald-500/40 shrink-0">
                    <span className="text-xl leading-none">{scoreResult.score}</span>
                    <span className="text-[9px] opacity-80 mt-0.5">점</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>AI 정밀 분석 결과</span>
                    </div>
                    <p className="text-xs text-slate-200 mt-0.5">
                      {scoreResult.feedback}
                    </p>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
