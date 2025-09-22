// server/api/projects.post.ts
import { readBody } from 'h3'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

function safeId() {
  try {
    return randomUUID()
  } catch {
    return 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
  }
}

function isBoolean(v: any): v is boolean {
  return typeof v === 'boolean'
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event as any).catch(() => ({})) as any
  const {
    template,
    title,
    description,
    submitted,
    published
  } = body || {}

  if (!template || typeof template !== 'string') {
    throw createError({ statusCode: 400, statusMessage: 'Missing required field: template (string). Use one of: science-fair-project, engineering-design-process, thesis-or-research-project or provide a filename in public/templates' })
  }

  // Resolve template file path from slug or filename
  const templatesDir = path.resolve(process.cwd(), 'public', 'templates')
  let templateFile = template
  if (!templateFile.endsWith('.json')) {
    templateFile = `${template}.json`
  }
  const templatePath = path.join(templatesDir, templateFile)

  // Read template
  let templateJson: any
  try {
    const raw = await fs.readFile(templatePath, 'utf-8')
    templateJson = JSON.parse(raw)
  } catch (err: any) {
    throw createError({ statusCode: 404, statusMessage: `Template not found or invalid JSON: ${templateFile}` })
  }

  // Prepare project data
  const id = safeId()
  const now = new Date().toISOString()

  const project = {
    id,
    template: {
      slug: template.replace(/\.json$/i, ''),
      title: templateJson.title || template,
    },
    title: typeof title === 'string' && title.trim() ? title.trim() : (templateJson.title || 'Untitled Project'),
    description: typeof description === 'string' ? description : (templateJson.description || ''),
    submitted: isBoolean(submitted) ? submitted : false,
    published: isBoolean(published) ? published : false,
    createdAt: now,
    updatedAt: now,
    categories: templateJson.categories || {}
  }

  // Ensure projects directory exists and write file
  const projectsDir = path.resolve(process.cwd(), 'public', 'projects')
  const filePath = path.join(projectsDir, `${id}.json`)
  try {
    await fs.mkdir(projectsDir, { recursive: true })
    await fs.writeFile(filePath, JSON.stringify(project, null, 2), 'utf-8')
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `Failed to save project: ${err?.message || String(err)}` })
  }

  return { ok: true, project }
})
