// server/api/gemini.post.ts
import { readBody } from 'h3';
import { GoogleGenAI } from '@google/genai';

export default defineEventHandler(async (event) => {
	const body = await readBody(event)
	const prompt = (body && (body.prompt || body.text)) || body || ''

	const config = useRuntimeConfig()
	const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY
	if (!apiKey) {
		throw createError({ statusCode: 500, statusMessage: 'Missing GEMINI_API_KEY' })
	}

	// init client with explicit apiKey so we don't rely on global env only
	const ai = new GoogleGenAI({ apiKey })

	// Basic call (non-streaming). Pick a model (gemini-2.5-flash used in examples).
	const response = await ai.models.generateContent({
		model: 'gemini-2.5-flash',
		contents: prompt
	})

	// response.text is the textual answer
	return {
		ok: true,
		text: response.text
	}
});
