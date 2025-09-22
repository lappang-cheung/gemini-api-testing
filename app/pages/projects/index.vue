<template>
  <div class="container">
    <header class="header">
      <h1>Projects</h1>
      <NuxtLink class="btn" to="/projects/create">Create Project</NuxtLink>
    </header>

    <p v-if="error" class="error">{{ error }}</p>

    <div v-if="pending">Loading projects…</div>
    <div v-else>
      <div v-if="projects.length === 0" class="empty">
        No projects yet. <NuxtLink to="/projects/create">Create your first project</NuxtLink>.
      </div>
      <ul class="list" v-else>
        <li v-for="p in projects" :key="p.id">
          <NuxtLink :to="`/projects/${p.id}`" class="card link-card">
            <div class="title">{{ p.title }}</div>
            <div class="meta">
              <span>Template: {{ p.template?.title || p.template?.slug }}</span>
              <span>Submitted: {{ p.submitted ? 'Yes' : 'No' }}</span>
              <span>Published: {{ p.published ? 'Yes' : 'No' }}</span>
              <span v-if="p.createdAt">Created: {{ new Date(p.createdAt).toLocaleString() }}</span>
            </div>
            <p class="desc">{{ p.description }}</p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProjectSummary {
  id: string
  title: string
  description?: string
  template?: { slug?: string; title?: string }
  submitted?: boolean
  published?: boolean
  createdAt?: string
}

const { data, pending, error: fetchError } = await useFetch('/api/projects')
const projects = computed<ProjectSummary[]>(() => (data.value?.projects as any[]) || [])
const error = computed(() => (fetchError.value as any)?.data?.statusMessage || (fetchError.value as any)?.message || '')
</script>

<style scoped>
.container { max-width: 900px; margin: 2rem auto; padding: 1rem; }
.header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.btn { background: #1a73e8; color: #fff; padding: 0.5rem 0.75rem; border-radius: 6px; text-decoration: none; }
.list { display: grid; gap: 1rem; padding: 0; list-style: none; }
.card { border: 1px solid #e3e3e3; border-radius: 8px; padding: 0.75rem; }
.link-card { display: block; text-decoration: none; color: inherit; }
.link-card:hover { border-color: #c9c9c9; background: #fafafa; }
.title { font-size: 1.1rem; font-weight: 700; color: #111; }
.meta { display: flex; flex-wrap: wrap; gap: 0.75rem; color: #555; font-size: 0.9rem; margin: 0.25rem 0 0.5rem; }
.desc { margin: 0; color: #333; }
.error { color: #b00020; }
.empty { color: #666; }
</style>
