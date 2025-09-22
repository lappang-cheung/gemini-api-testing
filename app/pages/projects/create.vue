<template>
  <div class="container">
    <h1>Create Project</h1>

    <form @submit.prevent="submit">
      <div class="field">
        <label>Template</label>
        <select v-model="form.template" required>
          <option disabled value="">Select a template</option>
          <option v-for="t in templates" :key="t.slug" :value="t.slug">{{ t.title }}</option>
        </select>
      </div>

      <div class="field">
        <label>Title</label>
        <input v-model="form.title" type="text" placeholder="Enter project title (optional)" />
      </div>

      <div class="field">
        <label>Description</label>
        <textarea v-model="form.description" rows="4" placeholder="Enter project description (optional)"></textarea>
      </div>

      <div class="field">
        <label>Prompt</label>
        <textarea v-model="form.prompt" rows="3" placeholder="Describe your goal or what you want help with (optional)"></textarea>
      </div>

      <div class="row">
        <div class="field" style="flex:1;">
          <label>Deadline</label>
          <input v-model="form.deadline" type="date" />
        </div>
        <div class="field" style="flex:1;">
          <label>Priority</label>
          <select v-model="form.priority">
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div class="row">
        <label class="checkbox">
          <input v-model="form.submitted" type="checkbox" /> Submitted
        </label>
        <label class="checkbox">
          <input v-model="form.published" type="checkbox" /> Published
        </label>
      </div>

      <div class="actions">
        <button type="submit" :disabled="loading">{{ loading ? 'Creating…' : 'Create Project' }}</button>
        <NuxtLink to="/projects">Cancel</NuxtLink>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

// Minimal hardcoded templates list (matches files in public/templates)
const templates = [
  { slug: 'science-fair-project', title: 'Science Fair Project' },
  { slug: 'engineering-design-process', title: 'Engineering Design Process' },
  { slug: 'thesis-or-research-project', title: 'Thesis or Research Project' }
]

const form = reactive({
  template: '',
  title: '',
  description: '',
  prompt: '',
  deadline: '',
  priority: 'medium',
  submitted: false,
  published: false
})

const loading = ref(false)
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.template) {
    error.value = 'Please select a template.'
    return
  }
  try {
    loading.value = true
    const res = await $fetch('/api/projects', {
      method: 'POST',
      body: { ...form }
    }) as any
    if (res?.ok && res?.project?.id) {
      router.push(`/projects/${res.project.id}`)
    } else {
      throw new Error('Failed to create project')
    }
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || String(e)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.container { max-width: 800px; margin: 2rem auto; padding: 1rem; }
h1 { margin-bottom: 1rem; }
.field { display: flex; flex-direction: column; margin-bottom: 1rem; }
.field > label { font-weight: 600; margin-bottom: 0.25rem; }
input[type="text"], textarea, select { padding: 0.5rem; border: 1px solid #ccc; border-radius: 6px; }
.row { display: flex; gap: 1rem; margin: 1rem 0; }
.checkbox { display: flex; align-items: center; gap: 0.5rem; }
.actions { display: flex; gap: 1rem; align-items: center; }
.error { color: #b00020; margin-top: 0.5rem; }
</style>
