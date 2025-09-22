// server/api/projects.get.ts
import { promises as fs } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async () => {
  const projectsDir = path.resolve(process.cwd(), 'public', 'projects')
  try {
    await fs.mkdir(projectsDir, { recursive: true })
    const files = await fs.readdir(projectsDir)
    const items: any[] = []
    for (const f of files) {
      if (!f.endsWith('.json')) continue
      try {
        const raw = await fs.readFile(path.join(projectsDir, f), 'utf-8')
        const json = JSON.parse(raw)
        items.push(json)
      } catch {
        // skip invalid file
      }
    }
    // sort by createdAt desc if available
    items.sort((a, b) => String(b?.createdAt || '').localeCompare(String(a?.createdAt || '')))
    return { ok: true, projects: items }
  } catch (err: any) {
    throw createError({ statusCode: 500, statusMessage: `Failed to list projects: ${err?.message || String(err)}` })
  }
})
