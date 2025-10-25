
import React, { useRef } from 'react';
import type { ImageData } from '../types';

interface SourceFaceUploaderProps {
  onImageUpload: (imageData: ImageData | null) => void;
  sourceImage: ImageData | null;
  t: any;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

const XCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);


export const SourceFaceUploader: React.FC<SourceFaceUploaderProps> = ({ onImageUpload, sourceImage, t }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = (e.target?.result as string).split(',')[1];
          onImageUpload({ base64, mimeType: file.type, name: file.name });
        };
        reader.readAsDataURL(file);
    } else {
      alert("Unsupported file type. Please upload an image.");
    }
     event.target.value = '';
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
      e.stopPropagation();
      onImageUpload(null);
  }

  return (
    <div className="mt-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
        />
        {sourceImage ? (
            <div className="relative group">
                <img
                    src={`data:${sourceImage.mimeType};base64,${sourceImage.base64}`}
                    alt="Source Face Preview"
                    className="w-full h-24 object-cover rounded-md"
                />
                <button
                    onClick={handleRemove}
                    className="absolute top-1 right-1 rtl:right-auto rtl:left-1 bg-black/60 hover:bg-red-500/80 text-white p-1 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                    title={t.removeSourceFace}
                >
                    <XCircleIcon className="w-5 h-5" />
                </button>
            </div>
        ) : (
            <button
                onClick={handleClick}
                className="w-full flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg text-center cursor-pointer hover:border-purple-500 hover:bg-gray-800/50 transition-all duration-300"
            >
                <UploadIcon className="w-6 h-6 mb-1 text-gray-400"/>
                <span className="text-xs font-semibold text-gray-300">{t.uploadSourceFace}</span>
            </button>
        )}
    </div>
  );
};