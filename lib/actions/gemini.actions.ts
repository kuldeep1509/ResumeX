"use server";

import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";

const useOpenRouter = process.env.USE_OPENROUTER === "true";
const useGroq = process.env.USE_GROQ === "true";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "dummy_key");

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
};

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
  }
  return cleaned.trim();
}

async function askGemini(prompt: string) {
  // Option 1: Groq (Incredibly fast and has a free tier)
  if (useGroq) {
    
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Or try llama3-8b-8192
        messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Respond ONLY with valid JSON, no other text." }],
        temperature: 0.7,
      }),
    });
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error(`Groq API error: ${JSON.stringify(data)}`);
    }
    return cleanJsonResponse(data.choices[0].message.content);
  }

  // Option 2: OpenRouter (Supports multiple free models like llama-3 or gemini-2.0-flash-lite:free)
  if (useOpenRouter) {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct:free", // Changed to a model that is completely free
        messages: [{ role: "user", content: prompt + "\n\nIMPORTANT: Respond ONLY with valid JSON, no other text." }],
      }),
    });
    const data = await response.json();
    if (!data.choices?.[0]?.message?.content) {
      throw new Error(`OpenRouter API error: ${JSON.stringify(data)}`);
    }
    return cleanJsonResponse(data.choices[0].message.content);
  }

  // Option 3: Standard Gemini 
  // Using the GoogleGenerativeAI sdk to avoid versioning/endpoint URL issues
  try {
    const geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest", generationConfig });
    const result = await geminiModel.generateContent(prompt + "\n\nIMPORTANT: Respond ONLY with valid JSON, no other text.");
    const response = result.response;
    return cleanJsonResponse(response.text());
  } catch (error: any) {
    throw new Error(`Gemini SDK error: ${error.message || JSON.stringify(error)}`);
  }
}

export async function generateSummary(jobTitle: string) {
  const prompt =
    jobTitle && jobTitle !== ""
      ? `Given the job title '${jobTitle}', provide a summary for three experience levels: Senior, Mid Level, and Fresher. Each summary should be 4-5 lines long and include the experience level and the corresponding summary in JSON format. The output should be an array of objects, each containing 'experience_level' and 'summary' fields. Ensure the summaries are tailored to each experience level.`
      : `Create a 3-4 line summary about myself for my resume, emphasizing my personality, social skills, and interests outside of work. The output should be an array of JSON objects and in humanize way, each containing 'experience_level' and 'summary' fields representing Active, Average, and Lazy personality traits. Use example hobbies if needed but do not insert placeholders for me to fill in.`;

  const result = await askGemini(prompt);

  return JSON.parse(result);
}

export async function generateEducationDescription(educationInfo: string) {
  const prompt = `Based on my education at ${educationInfo}, provide personal descriptions for three levels of curriculum activities: High Activity, Medium Activity, and Low Activity. Each description should be 4-5 lines long and written from my perspective, reflecting on past experiences. The output should be an array of JSON objects, each containing 'activity_level' and 'description' fields. Please include a subtle hint about my good (but not the best) results.`;

  const result = await askGemini(prompt);

  return JSON.parse(result);
}

export async function generateExperienceDescription(experienceInfo: string) {
  const prompt = `Given that I have experience working as ${experienceInfo}, provide a summary of three levels of activities I performed in that position, preferably as a list must be in  point 4-5: High Activity, Medium Activity, and Low Activity. Each summary should be 4-5 lines long and written from my perspective, reflecting on my past experiences in that workplace. The output should be an array of JSON objects, each containing 'activity_level' and 'description' fields. You can include <b>, <i>, <u>, <ul>, <ol>, and <li> to further enhance the descriptions. Do NOT use <s> or <blockquote> tags. Use example work samples if needed, but do not insert placeholders for me to fill in.`;

  const result = await askGemini(prompt);

  return JSON.parse(result);
}
