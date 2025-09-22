// server/api/gemini/status.get.ts
import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
	const config = useRuntimeConfig()
	const apiKey = config.geminiApiKey || process.env.GEMINI_API_KEY
	if (!apiKey) throw createError({ statusCode: 500, statusMessage: 'Missing GEMINI_API_KEY' })

	const ai = new GoogleGenAI({ apiKey })

	try {
		// Make a lightweight call to verify connectivity/auth. We don't need the list itself.
		await ai.models.list()
		return { ok: true }
	} catch (err: any) {
		return { ok: false, error: err?.message || String(err) }
	}
})
