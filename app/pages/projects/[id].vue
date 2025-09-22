<template>
  <div class="container" v-if="project">
    <nav class="breadcrumbs">
      <NuxtLink to="/projects">← All Projects</NuxtLink>
    </nav>

    <header class="header">
      <h1>{{ project.title }}</h1>
      <div class="badges">
        <span class="badge" :class="{ on: project.submitted }">Submitted</span>
        <span class="badge" :class="{ on: project.published }">Published</span>
      </div>
    </header>

    <p class="desc">{{ project.description }}</p>

    <section class="meta">
      <div><strong>Template:</strong> {{ project.template?.title || project.template?.slug }}</div>
      <div v-if="project.createdAt"><strong>Created:</strong> {{ new Date(project.createdAt).toLocaleString() }}</div>
      <div v-if="project.updatedAt"><strong>Updated:</strong> {{ new Date(project.updatedAt).toLocaleString() }}</div>
      <div v-if="project.deadline"><strong>Deadline:</strong> {{ new Date(project.deadline).toLocaleDateString() }}</div>
      <div v-if="project.priority"><strong>Priority:</strong> {{ project.priority }}</div>
      <div><strong>ID:</strong> {{ project.id }}</div>
    </section>

    <section v-if="project.prompt" class="prompt">
      <h2>Prompt</h2>
      <pre class="value">{{ project.prompt }}</pre>
    </section>

    <section class="categories" v-if="categoryEntries.length">
      <h2>Categories</h2>
      <div class="grid">
        <div v-for="([key, cat]) in categoryEntries" :key="key" class="cat">
          <h3>{{ key }}</h3>
          <p class="small">{{ (cat as any)?.description }}</p>
          <pre class="value">{{ formatValue((cat as any)?.value) }}</pre>
        </div>
      </div>
    </section>

    <section class="actions">
      <NuxtLink to="/projects" class="btn">Back to list</NuxtLink>
      <NuxtLink :to="`/projects/${route.params.id}/edit`" class="btn secondary">Edit</NuxtLink>
    </section>
  </div>
  <div v-else class="container">
    <p v-if="error" class="error">{{ error }}</p>
    <p v-else>Loading…</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()

interface Category { description?: string; value?: unknown }
interface Project {
  id: string
  title: string
  description?: string
  prompt?: string
  deadline?: string
  priority?: 'low' | 'medium' | 'high'
  template?: { slug?: string; title?: string }
  submitted?: boolean
  published?: boolean
  createdAt?: string
  updatedAt?: string
  categories?: Record<string, Category>
}

const { data, error: fetchError } = await useFetch(`/api/projects/${route.params.id}`)
const project = computed<Project | null>(() => (data.value?.project as Project) || null)
const error = computed(() => (fetchError.value as any)?.data?.statusMessage || (fetchError.value as any)?.message || '')

const categoryEntries = computed(() => Object.entries(project.value?.categories || {}))

function formatValue(v: unknown) {
  if (v === null || v === undefined) return ''
  if (typeof v === 'string') return v
  try { return JSON.stringify(v, null, 2) } catch { return String(v) }
}
</script>

<style scoped>
.container { max-width: 900px; margin: 2rem auto; padding: 1rem; }
.breadcrumbs { margin-bottom: 0.5rem; }
.header { display: flex; align-items: center; justify-content: space-between; gap: 1rem; }
.badges { display: flex; gap: 0.5rem; }
.badge { border-radius: 999px; padding: 0.2rem 0.6rem; background: #eee; color: #555; font-size: 0.8rem; }
.badge.on { background: #16a34a; color: #fff; }
.desc { margin: 0.75rem 0 1rem; }
.meta { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.5rem 1rem; margin-bottom: 1.5rem; color: #444; }
.categories h2 { margin-bottom: 0.5rem; }
.grid { display: grid; gap: 1rem; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); }
.cat { border: 1px solid #e5e5e5; border-radius: 8px; padding: 0.75rem; }
.cat h3 { margin: 0 0 0.25rem; text-transform: capitalize; }
.small { color: #666; margin: 0 0 0.5rem; }
.value { white-space: pre-wrap; background: #fafafa; border-radius: 6px; padding: 0.5rem; border: 1px dashed #e0e0e0; }
.actions { display: flex; gap: 0.75rem; margin-top: 1.25rem; }
.btn { background: #1a73e8; color: #fff; padding: 0.5rem 0.75rem; border-radius: 6px; text-decoration: none; }
.btn.secondary { background: #888; }
.error { color: #b00020; }
</style>
