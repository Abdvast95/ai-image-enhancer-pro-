import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  allImages: string[];
  t: any;
}

const PAPER_SIZES = {
    A4: { width: 210, height: 297 }, // mm
    Letter: { width: 215.9, height: 279.4 }, // mm
};

const PHOTO_PRESETS = {
    passport: { width: 35, height: 45 }, // mm
    id_card: { width: 50.8, height: 50.8 }, // 2x2 inches in mm
};

const PRINT_DPI = 600; // For high-resolution printing

type LayoutOption = 'repeat' | 'single' | 'contactSheet' | 'grid';

const loadImages = async (sources: string[]): Promise<HTMLImageElement[]> => {
    const promises = sources.map(src => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    });
    return Promise.all(promises);
};

export const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose, imageSrc, allImages, t }) => {
    const [paperSize, setPaperSize] = useState<'A4' | 'Letter'>('A4');
    const [photoSizePreset, setPhotoSizePreset] = useState<'passport' | 'id_card' | 'custom'>('passport');
    const [customWidth, setCustomWidth] = useState(35);
    const [customHeight, setCustomHeight] = useState(45);
    const [margin] = useState(10); // mm
    const [gap, setGap] = useState(5); // mm
    const [photosPerPage, setPhotosPerPage] = useState(0);

    const [layout, setLayout] = useState<LayoutOption>('repeat');
    const [gridRows, setGridRows] = useState(3);
    const [gridCols, setGridCols] = useState(4);

    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 0, y: 0 });
    const isPanningRef = useRef(false);
    const lastPanPointRef = useRef({ x: 0, y: 0 });

    const previewCanvasRef = useRef<HTMLCanvasElement>(null); // Offscreen high-res canvas
    const displayCanvasRef = useRef<HTMLCanvasElement>(null); // Visible canvas
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const imageRef = useRef<HTMLImageElement>(new Image());

    useEffect(() => {
        const img = imageRef.current;
        img.src = imageSrc;
    }, [imageSrc]);
    
    const resetView = useCallback((fitToScreen: boolean) => {
        const container = canvasContainerRef.current;
        const preview = previewCanvasRef.current;
        if (!container || !preview || preview.width === 0) return;
        
        let initialZoom = 1;
        if(fitToScreen) {
            const hScale = container.clientHeight / preview.height;
            const wScale = container.clientWidth / preview.width;
            initialZoom = Math.min(hScale, wScale) * 0.95;
        }

        setZoom(initialZoom);

        const initialPanX = (container.clientWidth - preview.width * initialZoom) / 2;
        const initialPanY = (container.clientHeight - preview.height * initialZoom) / 2;
        setPan({ x: initialPanX, y: initialPanY });

    }, []);

    const redrawDisplayCanvas = useCallback(() => {
        const displayCanvas = displayCanvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        if (!displayCanvas || !previewCanvas) return;
        
        const ctx = displayCanvas.getContext('2d');
        if (!ctx) return;

        const container = canvasContainerRef.current;
        if(container) {
          displayCanvas.width = container.clientWidth;
          displayCanvas.height = container.clientHeight;
        }

        ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height);
        ctx.save();
        ctx.fillStyle = '#27272a'; // zinc-800
        ctx.fillRect(0, 0, displayCanvas.width, displayCanvas.height);
        ctx.translate(pan.x, pan.y);
        ctx.scale(zoom, zoom);
        ctx.drawImage(previewCanvas, 0, 0);
        ctx.restore();
    }, [zoom, pan]);

    const drawOffscreenCanvas = useCallback(async () => {
        if (!previewCanvasRef.current) {
             previewCanvasRef.current = document.createElement('canvas');
        }
        const canvas = previewCanvasRef.current;
        const img = imageRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const paper = PAPER_SIZES[paperSize];
        const mmToPx = (mm: number) => (mm / 25.4) * PRINT_DPI;

        canvas.width = mmToPx(paper.width);
        canvas.height = mmToPx(paper.height);

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const marginPx = mmToPx(margin);
        const gapPx = mmToPx(gap);
        const availableWidth = canvas.width - 2 * marginPx;
        const availableHeight = canvas.height - 2 * marginPx;

        switch (layout) {
            case 'repeat': {
                if (!img.complete || img.naturalWidth === 0) return;
                const photoW = photoSizePreset === 'custom' ? customWidth : PHOTO_PRESETS[photoSizePreset].width;
                const photoH = photoSizePreset === 'custom' ? customHeight : PHOTO_PRESETS[photoSizePreset].height;
                const photoPxW = mmToPx(photoW);
                const photoPxH = mmToPx(photoH);
                if (photoPxW <= 0 || photoPxH <= 0) { setPhotosPerPage(0); break; }
                const cols = Math.floor((availableWidth + gapPx) / (photoPxW + gapPx));
                const rows = Math.floor((availableHeight + gapPx) / (photoPxH + gapPx));
                if (cols <= 0 || rows <= 0) { setPhotosPerPage(0); break; }
                setPhotosPerPage(cols * rows);
                for (let row = 0; row < rows; row++) for (let col = 0; col < cols; col++) ctx.drawImage(img, marginPx + col * (photoPxW + gapPx), marginPx + row * (photoPxH + gapPx), photoPxW, photoPxH);
                break;
            }
            case 'single': {
                if (!img.complete || img.naturalWidth === 0) return;
                const photoW = photoSizePreset === 'custom' ? customWidth : PHOTO_PRESETS[photoSizePreset].width;
                const photoH = photoSizePreset === 'custom' ? customHeight : PHOTO_PRESETS[photoSizePreset].height;
                const photoPxW = mmToPx(photoW);
                const photoPxH = mmToPx(photoH);
                ctx.drawImage(img, (canvas.width - photoPxW) / 2, (canvas.height - photoPxH) / 2, photoPxW, photoPxH);
                setPhotosPerPage(1);
                break;
            }
            case 'grid': {
                if (!img.complete || img.naturalWidth === 0) return;
                if (gridCols <= 0 || gridRows <= 0) { setPhotosPerPage(0); break; }
                const photoPxW = (availableWidth - (gridCols - 1) * gapPx) / gridCols;
                const photoPxH = (availableHeight - (gridRows - 1) * gapPx) / gridRows;
                if (photoPxW <= 0 || photoPxH <= 0) { setPhotosPerPage(0); break; }
                for (let row = 0; row < gridRows; row++) for (let col = 0; col < gridCols; col++) ctx.drawImage(img, marginPx + col * (photoPxW + gapPx), marginPx + row * (photoPxH + gapPx), photoPxW, photoPxH);
                setPhotosPerPage(gridRows * gridCols);
                break;
            }
            case 'contactSheet': {
                if (allImages.length === 0) { setPhotosPerPage(0); break; }
                const loadedImages = await loadImages(allImages);
                const numImages = loadedImages.length;
                const cols = Math.ceil(Math.sqrt(numImages));
                const rows = Math.ceil(numImages / cols);
                const photoPxW = (availableWidth - (cols - 1) * gapPx) / cols;
                const photoPxH = (availableHeight - (rows - 1) * gapPx) / rows;
                if (photoPxW <= 0 || photoPxH <= 0) { setPhotosPerPage(0); break; }
                let imageIndex = 0;
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (imageIndex >= numImages) break;
                        ctx.drawImage(loadedImages[imageIndex++], marginPx + col * (photoPxW + gapPx), marginPx + row * (photoPxH + gapPx), photoPxW, photoPxH);
                    }
                }
                setPhotosPerPage(numImages);
                break;
            }
        }
        resetView(true);
        redrawDisplayCanvas();
    }, [paperSize, photoSizePreset, customWidth, customHeight, margin, gap, layout, gridRows, gridCols, allImages, redrawDisplayCanvas, resetView]);

    useEffect(() => {
        const img = imageRef.current;
        const triggerDraw = () => {
            (async () => {
                try {
                    await drawOffscreenCanvas();
                } catch (e) {
                    console.error("Failed to draw print preview:", e);
                }
            })();
        };

        if (layout === 'repeat' || layout === 'single' || layout === 'grid') {
            img.addEventListener('load', triggerDraw);
            if (img.complete) triggerDraw();
        } else {
            triggerDraw();
        }
        
        return () => img.removeEventListener('load', triggerDraw);
    }, [drawOffscreenCanvas, layout]);

    useEffect(() => {
        redrawDisplayCanvas();
    }, [pan, zoom, redrawDisplayCanvas]);
    
    useEffect(() => {
        const handleResize = () => resetView(true);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [resetView]);


    const handlePrint = () => {
        const canvas = previewCanvasRef.current;
        if (!canvas) return;

        const dataUrl = canvas.toDataURL('image/png');
        const printWindow = window.open('', '_blank');
        if(printWindow) {
            const paper = PAPER_SIZES[paperSize];
            printWindow.document.write(`
                <html>
                    <head>
                        <title>${t.print}</title>
                        <style>
                            @page {
                                size: ${paper.width}mm ${paper.height}mm;
                                margin: 0;
                            }
                            body {
                                margin: 0;
                                padding: 0;
                            }
                            img {
                                width: 100%;
                                height: 100%;
                                page-break-inside: avoid;
                            }
                        </style>
                    </head>
                    <body onload="window.print(); window.close();">
                        <img src="${dataUrl}" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        }
    };
    
    useEffect(() => {
        if (photoSizePreset !== 'custom') {
            const preset = PHOTO_PRESETS[photoSizePreset];
            setCustomWidth(preset.width);
            setCustomHeight(preset.height);
        }
    }, [photoSizePreset]);

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const zoomFactor = 1.1;
        const newZoom = e.deltaY > 0 ? zoom / zoomFactor : zoom * zoomFactor;
        const clampedZoom = Math.max(0.1, Math.min(newZoom, 10));

        const rect = e.currentTarget.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const newPan = {
            x: mouseX - (mouseX - pan.x) * (clampedZoom / zoom),
            y: mouseY - (mouseY - pan.y) * (clampedZoom / zoom)
        };
        
        setZoom(clampedZoom);
        setPan(newPan);
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        isPanningRef.current = true;
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isPanningRef.current) return;
        const dx = e.clientX - lastPanPointRef.current.x;
        const dy = e.clientY - lastPanPointRef.current.y;
        setPan(prevPan => ({ x: prevPan.x + dx, y: prevPan.y + dy }));
        lastPanPointRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUpOrLeave = () => { isPanningRef.current = false; };
    
    const handleZoom = (direction: 'in' | 'out') => {
        const container = canvasContainerRef.current;
        if (!container) return;
        
        const zoomFactor = 1.25;
        const newZoom = direction === 'in' ? zoom * zoomFactor : zoom / zoomFactor;
        const clampedZoom = Math.max(0.1, Math.min(newZoom, 10));

        const centerX = container.clientWidth / 2;
        const centerY = container.clientHeight / 2;
        
        const newPan = {
            x: centerX - (centerX - pan.x) * (clampedZoom / zoom),
            y: centerY - (centerY - pan.y) * (clampedZoom / zoom)
        };
        setZoom(clampedZoom);
        setPan(newPan);
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" dir={t.langSwitch === 'English' ? 'rtl' : 'ltr'}>
            <div className="bg-gray-900 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{t.printSettings}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>

                <div className="flex-grow flex flex-col md:flex-row gap-4 overflow-hidden p-4">
                    {/* Controls */}
                    <div className="w-full md:w-1/3 space-y-4 overflow-y-auto pr-2">
                        <div>
                            <label htmlFor="paper-size" className="block text-sm font-medium text-gray-300 mb-2">{t.paperSize}</label>
                            <select id="paper-size" value={paperSize} onChange={(e) => setPaperSize(e.target.value as 'A4' | 'Letter')} className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500">
                                <option value="A4">A4 (210 x 297 mm)</option>
                                <option value="Letter">Letter (8.5 x 11 in)</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="layout-option" className="block text-sm font-medium text-gray-300 mb-2">{t.layout}</label>
                            <select id="layout-option" value={layout} onChange={(e) => setLayout(e.target.value as LayoutOption)} className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500">
                                <option value="repeat">{t.layout_repeat}</option>
                                <option value="single">{t.layout_single}</option>
                                <option value="contactSheet" disabled={allImages.length <= 1}>{t.layout_contactSheet}</option>
                                <option value="grid">{t.layout_grid}</option>
                            </select>
                        </div>
                        
                        {(layout === 'repeat' || layout === 'single') && (
                            <>
                                <div>
                                    <label htmlFor="photo-size" className="block text-sm font-medium text-gray-300 mb-2">{t.photoSize}</label>
                                    <select id="photo-size" value={photoSizePreset} onChange={(e) => setPhotoSizePreset(e.target.value as 'passport' | 'id_card' | 'custom')} className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500">
                                        <option value="passport">{t.passportPhoto}</option>
                                        <option value="id_card">{t.idCardPhoto}</option>
                                        <option value="custom">{t.custom}</option>
                                    </select>
                                </div>
                                {photoSizePreset === 'custom' && (
                                    <div className="flex gap-2">
                                        <div>
                                            <label htmlFor="custom-width" className="block text-xs font-medium text-gray-400 mb-1">{t.width} (mm)</label>
                                            <input type="number" id="custom-width" value={customWidth} onChange={(e) => setCustomWidth(Number(e.target.value))} className="w-full bg-gray-800 border-gray-600 rounded-md px-2 py-1 text-white" />
                                        </div>
                                        <div>
                                            <label htmlFor="custom-height" className="block text-xs font-medium text-gray-400 mb-1">{t.height} (mm)</label>
                                            <input type="number" id="custom-height" value={customHeight} onChange={(e) => setCustomHeight(Number(e.target.value))} className="w-full bg-gray-800 border-gray-600 rounded-md px-2 py-1 text-white" />
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                        
                        {layout === 'grid' && (
                           <div className="flex gap-2">
                                <div>
                                    <label htmlFor="grid-rows" className="block text-xs font-medium text-gray-400 mb-1">{t.rows}</label>
                                    <input type="number" id="grid-rows" value={gridRows} onChange={(e) => setGridRows(Math.max(1, Number(e.target.value)))} className="w-full bg-gray-800 border-gray-600 rounded-md px-2 py-1 text-white" />
                                </div>
                                <div>
                                    <label htmlFor="grid-cols" className="block text-xs font-medium text-gray-400 mb-1">{t.columns}</label>
                                    <input type="number" id="grid-cols" value={gridCols} onChange={(e) => setGridCols(Math.max(1, Number(e.target.value)))} className="w-full bg-gray-800 border-gray-600 rounded-md px-2 py-1 text-white" />
                                </div>
                            </div>
                        )}
                        
                         {(layout === 'repeat' || layout === 'grid' || layout === 'contactSheet') && (
                            <div>
                                <label htmlFor="photo-gap" className="block text-sm font-medium text-gray-300 mb-2">{t.gapBetweenPhotos} (mm)</label>
                                <input
                                    type="number"
                                    id="photo-gap"
                                    value={gap}
                                    onChange={(e) => setGap(Math.max(0, Number(e.target.value)))}
                                    className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                         )}
                    </div>

                    {/* Preview */}
                    <div className="w-full md:w-2/3 bg-black/40 rounded-lg p-2 flex flex-col items-center justify-center relative">
                        <h3 className="text-sm font-medium text-gray-400 mb-2">{t.pagePreview}</h3>
                        <div 
                           ref={canvasContainerRef} 
                           className="w-full h-full border border-dashed border-gray-600 rounded flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing"
                           onWheel={handleWheel}
                           onMouseDown={handleMouseDown}
                           onMouseMove={handleMouseMove}
                           onMouseUp={handleMouseUpOrLeave}
                           onMouseLeave={handleMouseUpOrLeave}
                        >
                            <canvas ref={displayCanvasRef} />
                        </div>
                        <div className="absolute bottom-4 right-4 rtl:right-auto rtl:left-4 flex items-center gap-2 bg-gray-900/70 p-1 rounded-lg">
                           <button onClick={() => handleZoom('out')} title={t.zoomOut} className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">-</button>
                           <span className="text-xs text-gray-400 tabular-nums w-12 text-center">{Math.round(zoom * 100)}%</span>
                           <button onClick={() => handleZoom('in')} title={t.zoomIn} className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">+</button>
                           <button onClick={() => resetView(true)} title={t.resetView} className="p-1 text-gray-300 hover:text-white hover:bg-gray-700 rounded-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l16 16" /></svg>
                           </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">{photosPerPage} {t.photosPerPage}</p>
                    </div>
                </div>
                
                <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
                    <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-colors">{t.close}</button>
                    <button onClick={handlePrint} className="bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-500 text-white font-bold py-2 px-4 rounded-lg transition-all">{t.printPage}</button>
                </div>
            </div>
        </div>
    );
};