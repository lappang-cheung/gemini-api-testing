<script setup lang="ts">
import { onMounted, ref } from 'vue'

const prompt = ref('Help me start or update a project.')
const result = ref('')
const loading = ref(false)
const status = ref('unknown')
const projects = ref<any[]>([])

async function loadProjects() {
  try {
    const resp = await $fetch('/api/projects') // Your backend route
    projects.value = Array.isArray((resp as any)?.projects) ? (resp as any).projects : []
  } catch (err: any) {
    console.error('Failed to load projects:', err)
    projects.value = []
  }
}

function isProjectCreationIntent(text: string): boolean {
  const t = (text || '').toLowerCase().trim()
  if (!t) return false
  // Simple heuristics for intents like: "start a project", "create project", "new project", etc.
  const patterns = [
    /\bstart(ing)?\b.*\bproject\b/,
    /\bcreate\b.*\bproject\b/,
    /\bnew\b.*\bproject\b/,
    /\bbegin\b.*\bproject\b/,
    /\bmake\b.*\bproject\b/,
    /\bset\s*up\b.*\bproject\b/,
    /\bproject\b.*\b(start|create|new|begin|make|setup|set up)\b/
  ]
  return patterns.some(re => re.test(t))
}

async function send() {
  result.value = ''
  loading.value = true
  try {
    const useHelper = isProjectCreationIntent(prompt.value)
    let res: any
    if (useHelper) {
      // Route to AI Project Helper which fetches projects internally and returns { answer, action, project }
      res = await $fetch('/api/gemini/ai-project-helper', {
        method: 'POST',
        body: { userPrompt: prompt.value }
      })
      result.value = (res && (res.answer || res.text)) || JSON.stringify(res)
      if ((res as any)?.action === 'create') {
        // If a project was created, refresh the list to reflect it
        await loadProjects()
      }
    } else {
      // Default generic Gemini endpoint; include current projects for context
      res = await $fetch('/api/gemini', {
        method: 'POST',
        body: {
          prompt: prompt.value,
          projects: projects.value // send project context
        }
      })
      result.value = (res && (res.text || res.answer)) || JSON.stringify(res)
    }
  } catch (err: any) {
    result.value = 'Error: ' + (err?.message || String(err))
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadProjects()

  try {
    const res = await $fetch('/api/gemini/status')
    status.value = res.ok ? 'Online' : 'Offline'
  } catch {
    status.value = 'Offline'
  }
})
</script>

<template>
  <main class="p-6 max-w-2xl mx-auto">
    <h1 class="text-2xl font-semibold mb-4">Nuxt → Gemini (projects demo) {{ status }}</h1>

    <!-- Show project list -->
    <section class="mb-4">
      <h2 class="font-medium">Your Projects</h2>
      <ul class="list-disc pl-6 text-sm">
        <li v-if="projects.length === 0" class="text-gray-500">No projects yet</li>
        <li v-for="p in projects" :key="p.id">
          {{ p.title }} ({{ p.status }})
        </li>
      </ul>
    </section>

    <!-- User prompt -->
    <textarea v-model="prompt" rows="6" class="w-full p-3 border rounded" placeholder="Type a prompt..."></textarea>

    <div class="flex gap-2 mt-3">
      <button @click="send" :disabled="loading" class="px-4 py-2 bg-slate-800 text-white rounded">
        {{ loading ? 'Thinking…' : 'Send' }}
      </button>
      <button @click="prompt=''" class="px-3 py-2 border rounded">Clear</button>
    </div>

    <!-- AI Response -->
    <section v-if="result" class="mt-6">
      <h2 class="font-medium mb-2">AI Response</h2>
      <pre class="whitespace-pre-wrap bg-gray-100 p-4 rounded">{{ result }}</pre>
    </section>
  </main>
</template>
