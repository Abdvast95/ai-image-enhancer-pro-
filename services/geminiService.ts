import { GoogleGenAI, Modality } from "@google/genai";
import type { ImageData, EnhancementSettings, FacialHairOption, HairStyleOption } from '../types';

const getStrengthPrompt = (value: number): string => {
  if (value < 20) return "subtle changes and improvements";
  if (value < 40) return "moderate enhancement";
  if (value < 60) return "significant creative enhancement";
  if (value < 80) return "strong creative reimagination";
  return "a complete artistic reimagination";
};

const getResemblancePrompt = (value: number): string => {
  if (value < 20) return "take significant creative liberties, differing greatly from the original";
  if (value < 40) return "be a creative interpretation inspired by the original";
  if (value < 60) return "maintain a balanced resemblance to the original with noticeable creative changes";
  if (value < 80) return "be mostly faithful to the original image's composition and subjects";
  return "be extremely faithful and closely resemble the original image";
};

const getFacialHairPrompt = (option: FacialHairOption): string => {
    switch(option) {
        case 'add':
            return `
    6.  **Facial Hair Modification:** Add a realistic, well-groomed beard and mustache to the person in the main image. Ensure it matches their facial structure and hair color naturally.`;
        case 'remove':
            return `
    6.  **Facial Hair Modification:** Completely and cleanly remove any beard, mustache, or stubble from the person in the main image. The result should be a smooth, clean-shaven look that appears natural.`;
        default:
            return '';
    }
}

const getBlemishRemovalPrompt = (enabled: boolean): string => {
    if (!enabled) return '';
    return `
    7.  **Blemish Removal:** Scan the main image for any skin blemishes, acne, or imperfections and carefully remove them. Ensure the skin texture remains natural and is not overly smoothed or plastic-like.`;
}

const getFaceSmoothingPrompt = (enabled: boolean): string => {
    if (!enabled) return '';
    return `
    8.  **Face Smoothing:** Apply a subtle but effective skin smoothing effect to the person in the main image. Reduce minor wrinkles and pores for a clear, soft, and radiant complexion. CRUCIAL: The final result must preserve natural skin texture and avoid any artificial or 'plastic' look.`;
}

const getDepixelateFacePrompt = (enabled: boolean): string => {
    if (!enabled) return '';
    return `
    9.  **Depixelate Face:** Analyze the face in the main image for any low-resolution pixelation. Intelligently reconstruct facial features, smooth out blocky artifacts, and enhance details to create a clear, high-definition appearance.`;
}

const getFillHairGapsPrompt = (enabled: boolean): string => {
    if (!enabled) return '';
    return `
    10. **Fill Hair Gaps:** Identify any areas of thinning hair or gaps on the scalp in the main image. Realistically generate new hair strands that match the original hair's color, texture, and flow to create a fuller, denser look.`;
}

const getChangeClothesPrompt = (description: string): string => {
    if (!description.trim()) return '';
    return `
    11. **Change Clothes:** Change the clothing of the person in the main image to the following description: "${description}". The new clothing should look realistic, fit the person's body and pose naturally, and match the overall lighting and style of the image.`;
}

const getHairStylingPrompt = (style: HairStyleOption): string => {
    if (style === 'none') return '';
    const styleDescriptions: Record<HairStyleOption, string> = {
        none: '',
        neat: 'Restyle the hair to be very neat, combed, and well-groomed. Tame any flyaways for a sharp, clean look.',
        short: 'Restyle the hair to be a short, stylish haircut. The final look should be clean and suit the person\'s face.',
        wavy: 'Restyle the hair to have natural-looking waves. Add volume and texture for a relaxed, wavy look.',
        curly: 'Restyle the hair to be curly. Add defined, natural-looking curls with volume and bounce.',
    };
    return `
    12. **Hair Styling:** Modify the person's hairstyle in the main image to be "${style}". Specifically: ${styleDescriptions[style]}`;
}

const getChangeBackgroundPrompt = (description: string): string => {
    if (!description.trim()) return '';
    return `
    13. **Change Background:** Replace the background of the main image with a new one based on this description: "${description}". The person/subject from the original image must be seamlessly integrated into the new background, matching the lighting, perspective, and atmosphere.`;
}

const getFaceMergePrompt = (hasSourceFace: boolean): string => {
    if (!hasSourceFace) return '';
    return `
    14. **Advanced Face Merge:** You have been provided with a second image, a "Source Face". Your task is to transfer the skin quality (texture, smoothness, clarity, tone) from the "Source Face" to the face in the main image.
        **CRITICAL RULES:**
        -   **DO NOT** change the identity of the person in the main image.
        -   You **MUST** preserve the original person's unique facial features: eyes (shape, color), nose, mouth, lips, chin, jawline, and overall head shape.
        -   You **MUST** preserve unique markers like moles, freckles, or scars from the original face.
        -   The goal is ONLY to make the skin on the original face look as clear and high-quality as the skin on the "Source Face", not to replace the face. The result should look natural and subtle.`;
}


export const enhanceImage = async (
  imageData: ImageData,
  settings: EnhancementSettings
): Promise<string[]> => {
  // This check is for the browser environment where process.env is not available
  const apiKey = typeof process !== 'undefined' && process.env && process.env.API_KEY
    ? process.env.API_KEY
    : (window as any).process?.env?.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY environment variable not set.");
  }
  
  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
    IMPORTANT: You are an advanced AI image enhancement tool. Your primary goal is to regenerate the user's main image with significant improvements and creative alterations based on the settings provided. Do NOT return the original image. If two images are provided, the first is the main image to be edited, and the second is a "Source Face" for reference only. Generate 4 slightly different versions.

    **Enhancement Instructions:**

    1.  **Primary Goal:** Dramatically enhance and upscale the provided main image. Imagine you are increasing its resolution ${settings.upscaleFactor}x, making it ultra-sharp, clear, and packed with fine details. The output must be a noticeable improvement over the original.

    2.  **Artistic Style:** Apply a professional "${settings.style}" aesthetic to the main image.

    3.  **AI Creative Strength (${settings.aiStrength}/100):** This slider controls your creative freedom. At its current level, you should apply: ${getStrengthPrompt(settings.aiStrength)}.

    4.  **Resemblance to Original (${settings.resemblance}/100):** This slider controls how much the output should look like the original main image. At its current level, the final image should ${getResemblancePrompt(settings.resemblance)}.

    5.  **Negative Prompts (Avoid These):** ${settings.negativePrompt || 'None specified'}.
    ${getFacialHairPrompt(settings.facialHair)}
    ${getBlemishRemovalPrompt(settings.removeBlemishes)}
    ${getFaceSmoothingPrompt(settings.faceSmoothing)}
    ${getDepixelateFacePrompt(settings.depixelateFace)}
    ${getFillHairGapsPrompt(settings.fillHairGaps)}
    ${getChangeClothesPrompt(settings.changeClothes)}
    ${getHairStylingPrompt(settings.hairStyle)}
    ${getChangeBackgroundPrompt(settings.changeBackground)}
    ${getFaceMergePrompt(!!settings.sourceFaceImage)}

    **Final Output Rule:** Your output MUST be ONLY the newly generated images. Do not include any text, captions, or explanations.
    `;

  const mainImagePart = {
    inlineData: {
      data: imageData.base64,
      mimeType: imageData.mimeType,
    },
  };

  const textPart = {
    text: prompt,
  };
  
  const parts = [mainImagePart, textPart];

  if (settings.sourceFaceImage) {
    const sourceFaceImagePart = {
        inlineData: {
            data: settings.sourceFaceImage.base64,
            mimeType: settings.sourceFaceImage.mimeType,
        }
    };
    parts.splice(1, 0, sourceFaceImagePart); // Insert source face between main image and text
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: parts,
      },
      config: {
        responseModalities: [Modality.IMAGE],
        numberOfImages: 4,
      },
    });
    
    const images: string[] = [];
    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          const mimeType = part.inlineData.mimeType;
          images.push(`data:${mimeType};base64,${base64ImageBytes}`);
        }
    }

    if (images.length === 0) {
        throw new Error('No image was generated in the response.');
    }
    
    return images;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("The AI model failed to process the request. The image might be unsupported or the prompt too restrictive.");
  }
};