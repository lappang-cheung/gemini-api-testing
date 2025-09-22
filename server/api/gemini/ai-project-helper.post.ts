import { GoogleGenAI } from "@google/genai"
import { readBody, getRequestURL } from "h3"

export default defineEventHandler(async (event) => {
	const { userPrompt } = await readBody<{ userPrompt: string }>(event)
	if (!userPrompt) throw createError({ statusCode: 400, statusMessage: "Prompt required" })

	const config = useRuntimeConfig()
	const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

	// 🔎 1. Load your projects (from your backend/public folder)
	let projects: any[] = []
	let origin = ''
	try {
		// Use absolute URL to ensure correct routing in server context
		origin = getRequestURL(event).origin
		const resp = await $fetch<{ ok: boolean; projects: any[] }>("/api/projects", { baseURL: origin })
		projects = Array.isArray(resp?.projects) ? resp.projects : []
	} catch (err) {
		// If fetching fails, proceed with empty list to keep endpoint resilient
		projects = []
	}
	// Example: [{ id: 1, name: "AI Dashboard", status: "draft" }]

	// 🔗 2. Give Gemini the project list + user prompt and ask for STRICT JSON output
	const context = `You are helping manage projects. Consider the current list and the user request.

CurrentProjects: ${JSON.stringify(projects)}
UserRequest: ${JSON.stringify(userPrompt)}

Return ONLY a single JSON object with keys: explanation (string), action ("create" | "update" | "none"), data (object|null).
- If action is "create", the data MUST include at least: template (one of: "engineering-design-process", "thesis-or-research-project"), title, description (can be short), and any optional fields you infer.
- Prefer template "engineering-design-process" when unsure.
- Do not include any additional commentary outside the JSON.
`

	const response = await ai.models.generateContent({
		model: "gemini-2.5-flash",
		contents: context,
	})

	const rawText = response.text || ''

	function extractFirstJsonObject(text: string): any | null {
		try {
			// naive first-object extraction
			const start = text.indexOf('{')
			const end = text.lastIndexOf('}')
			if (start === -1 || end === -1 || end <= start) return null
			const candidate = text.slice(start, end + 1)
			return JSON.parse(candidate)
		} catch {
			return null
		}
	}

	const parsed = extractFirstJsonObject(rawText) || {}
	const action = typeof parsed?.action === 'string' ? parsed.action : 'none'
	const data = (parsed && typeof parsed === 'object') ? (parsed.data ?? null) : null
	const explanation = typeof parsed?.explanation === 'string' ? parsed.explanation : rawText

	let created: any = null
	if (action === 'create' && data && typeof data === 'object') {
		// Ensure minimal payload for project creation
		const payload: any = {
			template: typeof data.template === 'string' && data.template ? data.template : 'engineering-design-process',
			title: typeof data.title === 'string' && data.title ? data.title : 'Untitled Project',
			description: typeof data.description === 'string' ? data.description : '',
			submitted: typeof data.submitted === 'boolean' ? data.submitted : false,
			published: typeof data.published === 'boolean' ? data.published : false,
			deadline: data.deadline ?? undefined,
			priority: data.priority ?? undefined,
			prompt: userPrompt,
		}
		try {
			const res = await $fetch<{ ok: boolean; project: any }>("/api/projects", {
				method: 'POST',
				baseURL: origin || getRequestURL(event).origin,
				body: payload,
			})
			created = res?.project || null
		} catch (err: any) {
			// Surface creation error in explanation but don't crash endpoint
			// Keep the original explanation and append error info
			const msg = err?.statusMessage || err?.message || String(err)
			created = { error: msg }
		}
	}

	return { answer: explanation, action, data, project: created }
})
