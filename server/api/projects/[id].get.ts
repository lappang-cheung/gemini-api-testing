// server/api/projects/[id].get.ts
import { promises as fs } from 'node:fs'
import path from 'node:path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }
  const projectsDir = path.resolve(process.cwd(), 'public', 'projects')
  const filePath = path.join(projectsDir, `${id}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf-8')
    const project = JSON.parse(raw)
    return { ok: true, project }
  } catch (err: any) {
    throw createError({ statusCode: 404, statusMessage: `Project not found: ${id}` })
  }
})
