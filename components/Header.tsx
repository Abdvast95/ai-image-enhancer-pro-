
import React from 'react';

interface HeaderProps {
  lang: 'en' | 'ar';
  setLang: (lang: 'en' | 'ar') => void;
  onDirectPrint: () => void;
  t: any;
}

const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 01.75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 019.75 22.5a.75.75 0 01-.75-.75v-7.19c0-.266.064-.523.185-.758zM10.5 6a.75.75 0 00-1.5 0v4.19c0 .266-.064.523-.185.758A6.75 6.75 0 004.5 22.5a.75.75 0 00.75.75c5.056 0 9.555-2.383 12.436-6.084A6.75 6.75 0 0022.5 10.5a.75.75 0 00-.75-.75h-7.19a.75.75 0 00-.758.185z" clipRule="evenodd" />
  </svg>
);

const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 18.25m0 0a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25M9 18.25l-1.5-1.5M15 18.25l1.5-1.5m-5.25-6.75L9.75 9.75l.47-2.25H13.5l.47 2.25L12 11.51m-2.25 2.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h3.75a2.25 2.25 0 0 1 2.25 2.25v5.25a2.25 2.25 0 0 1-2.25-2.25m-3.75-2.25a2.25 2.25 0 0 0-2.25-2.25V6.75a2.25 2.25 0 0 0 2.25-2.25h3.75a2.25 2.25 0 0 0 2.25 2.25v5.25a2.25 2.25 0 0 0-2.25-2.25m-3.75-2.25h.008v.008h-.008z" />
    </svg>
);


export const Header: React.FC<HeaderProps> = ({ lang, setLang, onDirectPrint, t }) => {
  const handleLangChange = () => {
    setLang(lang === 'en' ? 'ar' : 'en');
  };

  return (
    <header className="bg-gray-950/70 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 md:px-8 flex justify-between items-center">
        <div className="flex items-center space-x-3 rtl:space-x-reverse">
          <SparklesIcon className="w-8 h-8 text-purple-500 drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]"/>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {t.headerTitle} <span className="text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]">{t.headerPro}</span>
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDirectPrint}
            className="flex items-center text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 hover:border-purple-500"
            >
            <PrintIcon className="w-4 h-4 me-2 rtl:ms-2 rtl:me-0" />
            {t.printImage}
          </button>
          <button
            onClick={handleLangChange}
            className="text-sm font-medium text-gray-300 hover:text-purple-400 transition-colors px-3 py-1.5 rounded-md bg-gray-800/50 border border-gray-700 hover:border-purple-500"
          >
            {t.langSwitch}
          </button>
        </div>
      </div>
    </header>
  );
};
