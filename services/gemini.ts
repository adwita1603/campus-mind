
import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const extractSkillsFromSyllabus = async (text: string): Promise<string[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Extract a list of 5-8 specific professional or technical skills from this syllabus description. Return ONLY a comma-separated list of skill names.\n\nSyllabus: ${text}`,
  });
  return response.text?.split(',').map(s => s.trim()) || [];
};

export const suggestGoalSkills = async (goal: string): Promise<any[]> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `For the career goal of "${goal}", suggest the top 6 essential skills. For each skill, suggest 2 learning platforms. Return the response in JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            category: { type: Type.STRING },
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  platform: { type: Type.STRING },
                  url: { type: Type.STRING }
                }
              }
            }
          },
          required: ["name", "category", "recommendations"]
        }
      }
    }
  });
  try {
    return JSON.parse(response.text || '[]');
  } catch (e) {
    return [];
  }
};

export const calculateMatchAnalysis = async (goal: string, collegeSkills: string[], completedSkills: string[]) => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze the career readiness for a student aiming to be a "${goal}". 
    Your college curriculum teaches: ${collegeSkills.join(', ')}. 
    You have personally completed: ${completedSkills.join(', ')}.
    Address the user directly as "you". Tell them how close they are to their dream and what steps to take next.
    Provide a motivational analysis and a career match percentage (0-100). 
    Return JSON with 'analysis' (string) and 'score' (number).`,
    config: { 
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING },
          score: { type: Type.NUMBER }
        },
        required: ["analysis", "score"]
      }
    }
  });
  try {
    return JSON.parse(response.text || '{"analysis": "Unable to analyze at this moment.", "score": 0}');
  } catch (e) {
    return { analysis: "Error during analysis.", score: 0 };
  }
};

export const summarizeNotes = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Please summarize the following lecture notes into key insights, bullet points, and main takeaways:\n\n${text}`,
  });
  return response.text || "No summary was generated.";
};

export const researchTopic = async (query: string): Promise<{ text: string; sources: any[] }> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });
  
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map((chunk: any) => ({
    title: chunk.web?.title || 'Web Source',
    uri: chunk.web?.uri,
  })).filter((s: any) => s.uri) || [];

  return {
    text: response.text || "I couldn't find any specific information for your query.",
    sources,
  };
};

export const generateVisualAid = async (prompt: string): Promise<string | null> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Create an educational visualization, diagram, or illustration for the academic concept: ${prompt}. The style should be minimalist, professional, clear, on a plain white background, optimized for study notes.` }
      ],
    },
  });
  
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  }
  return null;
};

export const chatWithTutor = async (history: { role: 'user' | 'model'; text: string }[], message: string): Promise<string> => {
  const ai = getAI();
  const contents = history.map(m => ({
    role: m.role,
    parts: [{ text: m.text }]
  }));
  contents.push({ role: 'user', parts: [{ text: message }] });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: contents,
    config: {
      systemInstruction: 'You are CampusMind, a friendly and expert academic tutor. Help students understand complex concepts, provide step-by-step explanations, and encourage critical thinking. Address the student directly as "you".',
    }
  });
  return response.text || "I'm sorry, I'm having trouble thinking clearly right now.";
};
