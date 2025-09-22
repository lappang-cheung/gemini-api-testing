// server/api/gemini.stream.ts
import { GoogleGenAI } from '@google/genai'

export default defineEventHandler(async (event) => {
	const body = await readBody<{ prompt?: string }>(event)
	const prompt = body?.prompt || ''

	if (!prompt) {
		throw createError({ statusCode: 400, statusMessage: 'Prompt is required' })
	}

	const config = useRuntimeConfig()
	const apiKey = config.geminiApiKey
	if (!apiKey) {
		throw createError({ statusCode: 500, statusMessage: 'Missing GEMINI_API_KEY' })
	}

	const ai = new GoogleGenAI({ apiKey })

	// Streaming call
	const stream = await ai.models.generateContentStream({
		model: 'gemini-2.5-flash',
		contents: prompt
	})

	// Configure response as SSE
	setHeader(event, 'Content-Type', 'text/event-stream')
	setHeader(event, 'Cache-Control', 'no-cache')
	setHeader(event, 'Connection', 'keep-alive')

	for await (const chunk of stream.stream) {
		if (chunk.candidates) {
			for (const part of chunk.candidates[0].content.parts) {
				if (part.text) {
					event.node.res.write(`data: ${JSON.stringify(part.text)}\n\n`)
				}
			}
		}
	}

	// End stream
	event.node.res.write(`data: [DONE]\n\n`)
	event.node.res.end()
})
