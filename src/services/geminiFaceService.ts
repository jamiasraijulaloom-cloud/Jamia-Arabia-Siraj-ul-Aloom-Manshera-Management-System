/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface FaceVerificationResult {
  isMatch: boolean;
  confidence: number;
  isLive: boolean;
  qualityScore: number;
  errorMessage: string | null;
}

export interface PhotoQualityResult {
  isGoodQuality: boolean;
  qualityScore: number;
  isLive: boolean;
  errorMessage: string | null;
}

const SYSTEM_INSTRUCTION = `
Role: You are the core AI module for a Madrasa Management System's Face Recognition feature. You process live image frames sent from the client application.

Capabilities:
- Face Detection & Verification: Compare a live frame (Image B) against a registered student/staff profile photo (Image A).
- Liveness Detection: Analyze Image B to ensure it's a live person, not a photo of a photo or a screen.
- Image Quality Check: Ensure the face in Image B is clear, well-lit, and fully visible.

Output Format (Strict JSON):
You must respond only with a JSON object. Do not include conversational text.
`;

export async function verifyFaceWithGemini(referencePhotoBase64: string, liveFrameBase64: string): Promise<FaceVerificationResult> {
  try {
    const model = "gemini-3-flash-preview";
    
    // Remove data:image/jpeg;base64, prefix if present
    const cleanRef = referencePhotoBase64.split(',')[1] || referencePhotoBase64;
    const cleanLive = liveFrameBase64.split(',')[1] || liveFrameBase64;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Compare these two images. Image A is the registered profile photo. Image B is the live camera frame. Verify if they are the same person, check for liveness in Image B, and assess quality." },
            { inlineData: { data: cleanRef, mimeType: "image/jpeg" } },
            { inlineData: { data: cleanLive, mimeType: "image/jpeg" } }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMatch: { type: Type.BOOLEAN, description: "True if Image A and Image B are the same person" },
            confidence: { type: Type.NUMBER, description: "Confidence score from 0 to 1" },
            isLive: { type: Type.BOOLEAN, description: "True if Image B is a live person, not a spoof" },
            qualityScore: { type: Type.NUMBER, description: "Quality score of Image B from 0 to 1" },
            errorMessage: { type: Type.STRING, description: "Explanation if verification fails or quality is low", nullable: true }
          },
          required: ["isMatch", "confidence", "isLive", "qualityScore"]
        }
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Face Verification Error:", error);
    return {
      isMatch: false,
      confidence: 0,
      isLive: false,
      qualityScore: 0,
      errorMessage: "AI verification failed. Please try again."
    };
  }
}

export async function checkPhotoQualityWithGemini(photoBase64: string): Promise<PhotoQualityResult> {
  try {
    const model = "gemini-3-flash-preview";
    const cleanPhoto = photoBase64.split(',')[1] || photoBase64;

    const response = await ai.models.generateContent({
      model,
      contents: [
        {
          parts: [
            { text: "Analyze this photo for registration. Check if it's a clear face, well-lit, and a live person." },
            { inlineData: { data: cleanPhoto, mimeType: "image/jpeg" } }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isGoodQuality: { type: Type.BOOLEAN, description: "True if the photo is suitable for registration" },
            qualityScore: { type: Type.NUMBER, description: "Quality score from 0 to 1" },
            isLive: { type: Type.BOOLEAN, description: "True if it's a live person" },
            errorMessage: { type: Type.STRING, description: "Explanation if quality is low", nullable: true }
          },
          required: ["isGoodQuality", "qualityScore", "isLive"]
        }
      }
    });

    if (!response.text) throw new Error("No response from Gemini");
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Photo Quality Error:", error);
    return {
      isGoodQuality: false,
      qualityScore: 0,
      isLive: false,
      errorMessage: "AI quality check failed."
    };
  }
}
