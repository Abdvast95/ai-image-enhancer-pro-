import React, { useState } from 'react';
import { ImageData } from '../types';

interface ResultDisplayProps {
  resultImages: string[];
  originalImage: ImageData | null;
  isLoading: boolean;
  error: string | null;
  onDownload: (format: 'png' | 'jpeg') => void;
  onPrint: () => void;
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
  t: any;
}

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 18.25m0 0a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25M9 18.25l-1.5-1.5M15 18.25l1.5-1.5m-5.25-6.75L9.75 9.75l.47-2.25H13.5l.47 2.25L12 11.51m-2.25 2.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h3.75a2.25 2.25 0 0 1 2.25 2.25v5.25a2.25 2.25 0 0 1-2.25-2.25m-3.75-2.25a2.25 2.25 0 0 0-2.25-2.25V6.75a2.25 2.25 0 0 0 2.25-2.25h3.75a2.25 2.25 0 0 0 2.25 2.25v5.25a2.25 2.25 0 0 0-2.25-2.25m-3.75-2.25h.008v.008h-.008z" />
    </svg>
);

const ImageIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
);

const LoadingSpinner: React.FC<{ t: any }> = ({ t }) => (
    <div className="flex flex-col items-center justify-center text-center">
        <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-gray-800 rounded-full opacity-30"></div>
        </div>
        <p className="mt-6 text-lg font-semibold text-gray-300">{t.loadingTitle}</p>
        <p className="text-sm text-gray-400">{t.loadingSubtitle}</p>
    </div>
);

const Placeholder: React.FC<{ t: any }> = ({ t }) => (
    <div className="text-center text-gray-600 flex flex-col items-center">
        <ImageIcon className="w-24 h-24 mb-4" />
        <h3 className="text-xl font-bold text-gray-400 mb-2">{t.placeholderTitle}</h3>
        <p>{t.placeholderSubtitle}</p>
    </div>
);


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ resultImages, originalImage, isLoading, error, onDownload, onPrint, selectedImageIndex, onSelectImage, t }) => {
  const [isComparing, setIsComparing] = useState(false);
  const hasResults = resultImages.length > 0;
  const selectedImage = hasResults ? resultImages[selectedImageIndex] : null;

  const handleStartCompare = () => setIsComparing(true);
  const handleEndCompare = () => setIsComparing(false);

  return (
    <div className="bg-gray-900/50 rounded-xl border border-gray-700 p-4 h-full flex flex-col shadow-lg">
      <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
        <h2 className="text-lg font-semibold text-white">{t.result}</h2>
        {hasResults && !isLoading && (
             <p className="text-sm text-gray-400">{t.selectBestResult}</p>
        )}
      </div>

      <div className="flex-grow bg-black/40 rounded-lg flex items-center justify-center p-4 min-h-[300px] lg:min-h-0 relative">
        {isLoading && <LoadingSpinner t={t} />}
        {!isLoading && error && <p className="text-red-400 text-center">{error}</p>}
        {!isLoading && !error && !hasResults && <Placeholder t={t} />}
        {!isLoading && !error && selectedImage && (
             <div
                className="w-full h-full select-none cursor-pointer"
                onMouseDown={handleStartCompare}
                onMouseUp={handleEndCompare}
                onMouseLeave={handleEndCompare}
                onTouchStart={handleStartCompare}
                onTouchEnd={handleEndCompare}
             >
                <img
                    src={selectedImage}
                    alt="Enhanced Result"
                    className={`w-full h-full object-contain rounded-md transition-opacity duration-300 ${isComparing ? 'opacity-0' : 'opacity-100'}`}
                />
                {originalImage && (
                    <img
                        src={`data:${originalImage.mimeType};base64,${originalImage.base64}`}
                        alt="Original"
                        className={`absolute top-0 left-0 w-full h-full object-contain rounded-md transition-opacity duration-300 pointer-events-none ${isComparing ? 'opacity-100' : 'opacity-0'}`}
                    />
                )}
                 <div className={`absolute top-2 right-2 rtl:right-auto rtl:left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full pointer-events-none transition-opacity duration-300 ${isComparing ? 'opacity-100' : 'opacity-0'}`}>
                    {t.originalLabel}
                 </div>
                 <div className="absolute top-3 right-3 rtl:right-auto rtl:left-3 flex flex-col md:flex-row gap-2">
                    <div className="relative group">
                         <button onClick={() => onDownload('png')} title={t.downloadPng} className="p-2 rounded-full bg-black/50 hover:bg-purple-600 text-white transition-colors">
                            <DownloadIcon className="w-5 h-5"/>
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">{t.downloadPng}</span>
                    </div>
                    <div className="relative group">
                        <button onClick={() => onDownload('jpeg')} title={t.downloadJpeg} className="p-2 rounded-full bg-black/50 hover:bg-purple-600 text-white transition-colors">
                           <DownloadIcon className="w-5 h-5"/>
                        </button>
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">{t.downloadJpeg}</span>
                    </div>
                     <div className="relative group">
                        <button onClick={onPrint} title={t.print} className="p-2 rounded-full bg-black/50 hover:bg-purple-600 text-white transition-colors">
                            <PrintIcon className="w-5 h-5"/>
                        </button>
                         <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-gray-700 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">{t.print}</span>
                    </div>
                 </div>
            </div>
        )}
      </div>

      {hasResults && !isLoading && (
        <div className="flex-shrink-0 pt-4">
            <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {resultImages.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => onSelectImage(index)}
                        className={`relative aspect-square rounded-md overflow-hidden transition-all duration-300 focus:outline-none group ${selectedImageIndex === index ? 'ring-2 ring-purple-500 scale-105' : 'ring-2 ring-transparent hover:ring-purple-500/50'}`}
                    >
                        <img 
                            src={image} 
                            alt={`Result ${index + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};