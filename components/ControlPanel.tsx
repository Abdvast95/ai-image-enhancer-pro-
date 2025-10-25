
import React from 'react';
import type { EnhancementSettings, FacialHairOption, HairStyleOption } from '../types';
import { ART_STYLES, UPSCALE_FACTORS, FACIAL_HAIR_OPTIONS, HAIR_STYLE_OPTIONS } from '../constants';
import { SourceFaceUploader } from './SourceFaceUploader';

interface ControlPanelProps {
  settings: EnhancementSettings;
  onSettingsChange: <K extends keyof EnhancementSettings>(
    key: K,
    value: EnhancementSettings[K]
  ) => void;
  onSourceFaceUpload: (imageData: import('../types').ImageData | null) => void;
  onEnhance: () => void;
  isDisabled: boolean;
  t: any;
}

const WandIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.4-c.364.463-.7.893-1.027 1.335a7.5 7.5 0 001.263 8.107 4.505 4.505 0 015.625-2.472a3.375 3.375 0 006.304-2.223c0-1.007-.468-1.896-1.263-2.472a3.375 3.375 0 00-3.086-1.027 2.25 2.25 0 01-2.4-2.4z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.25-6.337M15 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 01-2.963 1.262M15 5.25a3.375 3.375 0 00-3.75 0" />
    </svg>
);

const InfoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
  
const Tooltip: React.FC<{ text: string }> = ({ text }) => (
    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-max max-w-xs px-3 py-1.5 text-xs font-medium text-white bg-gray-700 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
      {text}
      <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-700"></div>
    </div>
);

export const ControlPanel: React.FC<ControlPanelProps> = ({ settings, onSettingsChange, onSourceFaceUpload, onEnhance, isDisabled, t }) => {
  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700 space-y-6 shadow-lg">
      <h2 className="text-lg font-semibold text-white">{t.controls}</h2>

      {/* Style Selector */}
      <div>
        <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-2">{t.style}</label>
        <select
          id="style"
          value={settings.style}
          onChange={(e) => onSettingsChange('style', e.target.value)}
          className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        >
          {ART_STYLES.map(style => <option key={style} value={style}>{style}</option>)}
        </select>
      </div>

       {/* Facial Hair */}
       <div>
        <label htmlFor="facial-hair" className="block text-sm font-medium text-gray-300 mb-2">{t.facialHair}</label>
        <select
          id="facial-hair"
          value={settings.facialHair}
          onChange={(e) => onSettingsChange('facialHair', e.target.value as FacialHairOption)}
          className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        >
          {FACIAL_HAIR_OPTIONS.map(option => <option key={option} value={option}>{t[`facialHair_${option}`]}</option>)}
        </select>
      </div>

       {/* Hair Style */}
       <div>
        <label htmlFor="hair-style" className="block text-sm font-medium text-gray-300 mb-2">{t.hairStyle}</label>
        <select
          id="hair-style"
          value={settings.hairStyle}
          onChange={(e) => onSettingsChange('hairStyle', e.target.value as HairStyleOption)}
          className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        >
          {HAIR_STYLE_OPTIONS.map(option => <option key={option} value={option}>{t[`hairStyle_${option}`]}</option>)}
        </select>
      </div>

      {/* Upscale Factor */}
      <div>
        <label htmlFor="upscale" className="block text-sm font-medium text-gray-300 mb-2">{t.upscale}</label>
        <select
          id="upscale"
          value={settings.upscaleFactor}
          onChange={(e) => onSettingsChange('upscaleFactor', parseInt(e.target.value))}
          className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        >
          {UPSCALE_FACTORS.map(factor => <option key={factor} value={factor}>{factor}x</option>)}
        </select>
      </div>

       {/* Portrait Enhancement Options */}
       <div className="space-y-3">
        <div className="flex items-center">
            <input
                id="remove-blemishes"
                type="checkbox"
                checked={settings.removeBlemishes}
                onChange={(e) => onSettingsChange('removeBlemishes', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="remove-blemishes" className="ms-2 text-sm font-medium text-gray-300">{t.removeBlemishes}</label>
        </div>
        <div className="flex items-center">
            <input
                id="face-smoothing"
                type="checkbox"
                checked={settings.faceSmoothing}
                onChange={(e) => onSettingsChange('faceSmoothing', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="face-smoothing" className="ms-2 text-sm font-medium text-gray-300">{t.faceSmoothing}</label>
        </div>
        <div className="flex items-center">
            <input
                id="depixelate-face"
                type="checkbox"
                checked={settings.depixelateFace}
                onChange={(e) => onSettingsChange('depixelateFace', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="depixelate-face" className="ms-2 text-sm font-medium text-gray-300">{t.depixelateFace}</label>
        </div>
        <div className="flex items-center">
            <input
                id="fill-hair-gaps"
                type="checkbox"
                checked={settings.fillHairGaps}
                onChange={(e) => onSettingsChange('fillHairGaps', e.target.checked)}
                className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="fill-hair-gaps" className="ms-2 text-sm font-medium text-gray-300">{t.fillHairGaps}</label>
        </div>
      </div>

      {/* Change Clothes & Background */}
      <div className="space-y-4">
        <div>
          <label htmlFor="change-clothes" className="block text-sm font-medium text-gray-300 mb-2">{t.changeClothes}</label>
          <input
            id="change-clothes"
            type="text"
            value={settings.changeClothes}
            onChange={(e) => onSettingsChange('changeClothes', e.target.value)}
            placeholder={t.changeClothesPlaceholder}
            className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          />
        </div>
        <div>
          <label htmlFor="change-background" className="block text-sm font-medium text-gray-300 mb-2">{t.changeBackground}</label>
          <input
            id="change-background"
            type="text"
            value={settings.changeBackground}
            onChange={(e) => onSettingsChange('changeBackground', e.target.value)}
            placeholder={t.changeBackgroundPlaceholder}
            className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
          />
        </div>
      </div>
      
      {/* Face Merge Section */}
      <div className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
         <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-medium text-gray-300">{t.faceMerge}</h3>
            <div className="group relative">
                <InfoIcon className="w-4 h-4 text-gray-500" />
                <Tooltip text={t.faceMergeTooltip} />
            </div>
        </div>
        <SourceFaceUploader 
            onImageUpload={onSourceFaceUpload}
            sourceImage={settings.sourceFaceImage}
            t={t}
        />
      </div>


      {/* AI Strength Slider */}
      <div>
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <label htmlFor="ai-strength" className="block text-sm font-medium text-gray-300">{t.aiStrength}</label>
                <div className="group relative">
                    <InfoIcon className="w-4 h-4 text-gray-500" />
                    <Tooltip text={t.aiStrengthTooltip} />
                </div>
            </div>
            <span className="text-sm font-bold text-purple-400 tabular-nums">{settings.aiStrength}</span>
        </div>
        <input
          id="ai-strength"
          type="range"
          min="0"
          max="100"
          value={settings.aiStrength}
          onChange={(e) => onSettingsChange('aiStrength', parseInt(e.target.value))}
        />
      </div>
      
      {/* Resemblance Strength Slider */}
      <div>
         <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <label htmlFor="resemblance" className="block text-sm font-medium text-gray-300">{t.resemblance}</label>
                <div className="group relative">
                    <InfoIcon className="w-4 h-4 text-gray-500" />
                    <Tooltip text={t.resemblanceTooltip} />
                </div>
            </div>
            <span className="text-sm font-bold text-purple-400 tabular-nums">{settings.resemblance}</span>
        </div>
        <input
          id="resemblance"
          type="range"
          min="0"
          max="100"
          value={settings.resemblance}
          onChange={(e) => onSettingsChange('resemblance', parseInt(e.target.value))}
        />
      </div>

      {/* Negative Prompt */}
      <div>
        <label htmlFor="negative-prompt" className="block text-sm font-medium text-gray-300 mb-2">{t.negativePrompt}</label>
        <input
          id="negative-prompt"
          type="text"
          value={settings.negativePrompt}
          onChange={(e) => onSettingsChange('negativePrompt', e.target.value)}
          placeholder={t.negativePromptPlaceholder}
          className="w-full bg-gray-800 border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
        />
      </div>
      
      {/* Enhance Button */}
      <button
        onClick={onEnhance}
        disabled={isDisabled}
        className="w-full flex items-center justify-center bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 text-lg shadow-[0_0_15px_rgba(217,70,239,0.4)] hover:shadow-[0_0_25px_rgba(217,70,239,0.6)] disabled:shadow-none transform hover:scale-105 disabled:scale-100"
      >
        <WandIcon className="w-6 h-6 me-2 rtl:ms-2 rtl:me-0"/>
        {t.enhanceButton}
      </button>
    </div>
  );
};