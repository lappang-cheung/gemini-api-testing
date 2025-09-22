// server/api/projects/[id].patch.ts
import { readBody } from 'h3'
import { promises as fs } from 'node:fs'
import path from 'node:path'

function isBoolean(v: any): v is boolean { return typeof v === 'boolean' }

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  const body = await readBody(event as any).catch(() => ({})) as any
  const { title, description, submitted, published } = body || {}

  const projectsDir = path.resolve(process.cwd(), 'public', 'projects')
  const filePath = path.join(projectsDir, `${id}.json`)

  // Load existing project
  let project: any
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    project = JSON.parse(raw)
  } catch {
    throw createError({ statusCode: 404, statusMessage: `Project not found: ${id}` })
  }

  // Apply updates
  if (typeof title === 'string' && title.trim()) project.title = title.trim()
  if (typeof description === 'string') project.description = description
  if (isBoolean(submitted)) project.submitted = submitted
  if (isBoolean(published)) project.published = published
  project.updatedAt = new Date().toISOString()

  try {
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8')
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `Failed to save project: ${err?.message || String(err)}` })
  }

  return { ok: true, project }
})
