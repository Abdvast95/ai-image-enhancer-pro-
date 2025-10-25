
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ControlPanel } from './components/ControlPanel';
import { ResultDisplay } from './components/ResultDisplay';
import { PrintModal } from './components/PrintModal';
import { enhanceImage } from './services/geminiService';
import type { ImageData, EnhancementSettings } from './types';
import { ART_STYLES, UPSCALE_FACTORS, translations } from './constants';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<ImageData | null>(null);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [settings, setSettings] = useState<EnhancementSettings>({
    style: ART_STYLES[0],
    aiStrength: 50,
    resemblance: 70,
    negativePrompt: '',
    upscaleFactor: UPSCALE_FACTORS[3], // Default to 16x
    facialHair: 'none',
    removeBlemishes: false,
    faceSmoothing: false,
    depixelateFace: false,
    fillHairGaps: false,
    changeClothes: '',
    hairStyle: 'none',
    changeBackground: '',
    sourceFaceImage: null,
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [imageToPrint, setImageToPrint] = useState<string | null>(null);
  const [imagesForPrint, setImagesForPrint] = useState<string[]>([]);
  const directPrintInputRef = useRef<HTMLInputElement>(null);
  
  const t = translations[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);
  
  useEffect(() => {
    if (resultImages.length > 0) {
      setSelectedImageIndex(0);
    }
  }, [resultImages]);

  const handleImageUpload = (imageData: ImageData) => {
    setOriginalImage(imageData);
    setResultImages([]);
    setError(null);
  };
  
  const handleSourceFaceUpload = useCallback((imageData: ImageData | null) => {
    setSettings(prev => ({ ...prev, sourceFaceImage: imageData }));
  }, []);

  const handleSettingsChange = useCallback(<K extends keyof EnhancementSettings>(
    key: K,
    value: EnhancementSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleEnhance = async () => {
    if (!originalImage) {
      setError(t.errorUpload);
      return;
    }
    setIsLoading(true);
    setResultImages([]);
    setError(null);
    try {
      const enhancedImages = await enhanceImage(originalImage, settings);
      setResultImages(enhancedImages);
    } catch (err) {
      console.error(err);
      setError(t.errorEnhance);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDownload = (format: 'png' | 'jpeg') => {
      const imageSrc = resultImages[selectedImageIndex];
      if (!imageSrc) return;
      // For PNGs from the API that might not have a transparent background,
      // we draw to canvas to convert to JPEG with a white background.
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          if (format === 'jpeg' && ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx?.drawImage(img, 0, 0);
          const link = document.createElement('a');
          link.href = canvas.toDataURL(`image/${format}`);
          link.download = `enhanced-image.${format}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
      img.src = imageSrc;
  };

  const handlePrint = () => {
    const imageSrc = resultImages[selectedImageIndex];
    if (imageSrc) {
      setImageToPrint(imageSrc);
      setImagesForPrint(resultImages);
      setIsPrintModalOpen(true);
    }
  };

  const handlePrintOriginal = () => {
    if (originalImage) {
      const src = `data:${originalImage.mimeType};base64,${originalImage.base64}`;
      setImageToPrint(src);
      setImagesForPrint([src]);
      setIsPrintModalOpen(true);
    }
  };
  
  const handleSelectImage = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleClosePrintModal = () => {
    setIsPrintModalOpen(false);
    setImageToPrint(null);
    setImagesForPrint([]);
  };

  const handleDirectPrint = () => {
    directPrintInputRef.current?.click();
  };

  const handleDirectPrintFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const openModalWithImage = (imageData: { base64: string, mimeType: string }) => {
        const src = `data:${imageData.mimeType};base64,${imageData.base64}`;
        setImageToPrint(src);
        setImagesForPrint([src]);
        setIsPrintModalOpen(true);
    };

    if (file.type === 'application/pdf') {
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
                if (pdf.numPages === 0) throw new Error("PDF has no pages.");
                const page = await pdf.getPage(1);
                const viewport = page.getViewport({ scale: 4.0 }); // Increased scale for higher resolution
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (!context) throw new Error("Could not create canvas context.");
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport: viewport }).promise;
                const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
                openModalWithImage({ base64: dataUrl.split(',')[1], mimeType: 'image/jpeg' });
            } catch (error) {
                console.error("Error processing PDF for printing: ", error);
                alert("Failed to extract image from PDF.");
            }
        };
        reader.readAsArrayBuffer(file);
    } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = (e.target?.result as string).split(',')[1];
            openModalWithImage({ base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
    } else {
        alert("Unsupported file type. Please upload an image or a PDF.");
    }
    event.target.value = '';
  };

  return (
    <>
      <input type="file" ref={directPrintInputRef} onChange={handleDirectPrintFileSelected} className="hidden" accept="image/png, image/jpeg, image/webp, application/pdf" />
      <div className="min-h-screen bg-transparent text-gray-200 flex flex-col">
        <Header lang={lang} setLang={setLang} onDirectPrint={handleDirectPrint} t={t} />
        <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-6 lg:gap-8">
              <ImageUploader
                onImageUpload={handleImageUpload}
                originalImage={originalImage}
                onPrint={handlePrintOriginal}
                t={t}
              />
              <ControlPanel
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSourceFaceUpload={handleSourceFaceUpload}
                onEnhance={handleEnhance}
                isDisabled={!originalImage || isLoading}
                t={t}
              />
            </div>
            <div className="lg:col-span-8 xl:col-span-9">
              <ResultDisplay
                resultImages={resultImages}
                originalImage={originalImage}
                isLoading={isLoading}
                error={error}
                onDownload={handleDownload}
                onPrint={handlePrint}
                t={t}
                selectedImageIndex={selectedImageIndex}
                onSelectImage={handleSelectImage}
              />
            </div>
          </div>
        </main>
        <footer className="text-center p-4 text-xs text-gray-500">
          <p>{t.footer}</p>
        </footer>
      </div>
      {imageToPrint && (
        <PrintModal 
          isOpen={isPrintModalOpen}
          onClose={handleClosePrintModal}
          imageSrc={imageToPrint}
          allImages={imagesForPrint}
          t={t}
        />
      )}
    </>
  );
};

export default App;
