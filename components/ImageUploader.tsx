
import React, { useRef } from 'react';
import type { ImageData } from '../types';

interface ImageUploaderProps {
  onImageUpload: (imageData: ImageData) => void;
  originalImage: ImageData | null;
  onPrint: () => void;
  t: any;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const ReplaceIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
  </svg>
);

const PrintIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6 18.25m0 0a2.25 2.25 0 0 0 2.25 2.25h8.5a2.25 2.25 0 0 0 2.25-2.25M9 18.25l-1.5-1.5M15 18.25l1.5-1.5m-5.25-6.75L9.75 9.75l.47-2.25H13.5l.47 2.25L12 11.51m-2.25 2.25a2.25 2.25 0 0 1-2.25-2.25V6.75a2.25 2.25 0 0 1 2.25-2.25h3.75a2.25 2.25 0 0 1 2.25 2.25v5.25a2.25 2.25 0 0 1-2.25-2.25m-3.75-2.25a2.25 2.25 0 0 0-2.25-2.25V6.75a2.25 2.25 0 0 0 2.25-2.25h3.75a2.25 2.25 0 0 0 2.25 2.25v5.25a2.25 2.25 0 0 0-2.25-2.25m-3.75-2.25h.008v.008h-.008z" />
    </svg>
);


export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, originalImage, onPrint, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      onImageUpload({ base64, mimeType: file.type, name: file.name });
    };
    reader.readAsDataURL(file);
  };

  const handlePdfFile = async (file: File) => {
    const pdfjsLib = (window as any).pdfjsLib;
    if (!pdfjsLib) {
        console.error("pdf.js is not loaded.");
        alert("Could not process PDF file. The required library is missing.");
        return;
    }
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
            const pdf = await pdfjsLib.getDocument(typedArray).promise;
            if (pdf.numPages === 0) {
              throw new Error("PDF has no pages.");
            }
            const page = await pdf.getPage(1); // Get the first page
            const viewport = page.getViewport({ scale: 4.0 }); // Render at higher scale for better quality
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            if (!context) {
              throw new Error("Could not create canvas context.");
            }

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
            const base64 = dataUrl.split(',')[1];
            onImageUpload({ base64, mimeType: 'image/jpeg', name: file.name.replace(/\.pdf$/i, '.jpg') });
        } catch (error) {
            console.error("Error processing PDF: ", error);
            alert("Failed to extract image from PDF. The file might be corrupted or empty.");
        }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      handlePdfFile(file);
    } else if (file.type.startsWith('image/')) {
      handleImageFile(file);
    } else {
      alert("Unsupported file type. Please upload an image or a PDF.");
    }
     // Reset the input value to allow uploading the same file again
     event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handlePrintClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onPrint();
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-4 shadow-lg">
      <h2 className="text-lg font-semibold text-white">{t.originalImage}</h2>
      <div
        className="relative group border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-purple-500 hover:bg-gray-800/50 transition-all duration-300"
        onClick={handleClick}
        aria-label={t.uploadTitle}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp, application/pdf"
        />
        {originalImage ? (
          <>
            <img
              src={`data:${originalImage.mimeType};base64,${originalImage.base64}`}
              alt="Original Preview"
              className="mx-auto max-h-60 rounded-md object-contain transition-opacity group-hover:opacity-30"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                <ReplaceIcon className="w-10 h-10 text-white mb-2"/>
                <p className="font-semibold text-white">{t.changeImage}</p>
            </div>
            <div className="absolute top-2 right-2 rtl:right-auto rtl:left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={handlePrintClick} 
                    className="p-2 rounded-full bg-black/50 hover:bg-purple-600 text-white transition-colors"
                    title={t.print}
                >
                    <PrintIcon className="w-5 h-5"/>
                </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 p-4 transition-colors group-hover:text-purple-400">
            <UploadIcon className="w-12 h-12 mb-3"/>
            <p className="font-semibold text-white">{t.uploadTitle}</p>
            <p className="text-sm">{t.uploadSubtitle}</p>
          </div>
        )}
      </div>
      {originalImage && (
        <p className="text-xs text-gray-400 truncate text-center" title={originalImage.name}>
          {originalImage.name}
        </p>
      )}
    </div>
  );
};
