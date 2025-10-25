
export interface ImageData {
  base64: string;
  mimeType: string;
  name: string;
}

export type FacialHairOption = 'none' | 'add' | 'remove';
export type HairStyleOption = 'none' | 'neat' | 'short' | 'wavy' | 'curly';

export interface EnhancementSettings {
  style: string;
  aiStrength: number;
  resemblance: number;
  negativePrompt: string;
  upscaleFactor: number;
  facialHair: FacialHairOption;
  removeBlemishes: boolean;
  faceSmoothing: boolean;
  depixelateFace: boolean;
  fillHairGaps: boolean;
  changeClothes: string;
  hairStyle: HairStyleOption;
  changeBackground: string;
  sourceFaceImage: ImageData | null;
}