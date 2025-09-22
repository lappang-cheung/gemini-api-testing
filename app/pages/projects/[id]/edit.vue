<template>
  <div class="container" v-if="loaded">
    <nav class="breadcrumbs">
      <NuxtLink :to="`/projects/${route.params.id}`">← Back to Project</NuxtLink>
      <NuxtLink to="/projects" class="ml">All Projects</NuxtLink>
    </nav>

    <h1>Edit Project</h1>

    <form class="form" @submit.prevent="onSubmit">
      <label>
        <span>Title</span>
        <input v-model="form.title" type="text" placeholder="Project title" required />
      </label>

      <label>
        <span>Description</span>
        <textarea v-model="form.description" rows="5" placeholder="Describe your project"></textarea>
      </label>

      <div class="row">
        <label class="check">
          <input type="checkbox" v-model="form.submitted" />
          <span>Submitted</span>
        </label>
        <label class="check">
          <input type="checkbox" v-model="form.published" />
          <span>Published</span>
        </label>
      </div>

      <div class="actions">
        <NuxtLink :to="`/projects/${route.params.id}`" class="btn secondary">Cancel</NuxtLink>
        <button class="btn" type="submit" :disabled="saving">{{ saving ? 'Saving…' : 'Save Changes' }}</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
      <p v-if="success" class="success">Saved!</p>
    </form>
  </div>
  <div v-else class="container">
    <p>Loading…</p>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

interface ProjectResp { ok: boolean; project: any }

const form = reactive({
  title: '',
  description: '',
  submitted: false,
  published: false,
})

const loaded = ref(false)
const saving = ref(false)
const error = ref('')
const success = ref(false)

onMounted(async () => {
  try {
    const { project } = await $fetch<ProjectResp>(`/api/projects/${route.params.id}`)
    form.title = project?.title || ''
    form.description = project?.description || ''
    form.submitted = !!project?.submitted
    form.published = !!project?.published
    loaded.value = true
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Failed to load project.'
  }
})

async function onSubmit() {
  error.value = ''
  success.value = false
  saving.value = true
  try {
    await $fetch(`/api/projects/${route.params.id}`, {
      method: 'PATCH',
      body: {
        title: form.title,
        description: form.description,
        submitted: form.submitted,
        published: form.published,
      }
    })
    success.value = true
    // Navigate back to detail after a tiny delay
    setTimeout(() => router.push(`/projects/${route.params.id}`), 400)
  } catch (e: any) {
    error.value = e?.data?.statusMessage || e?.message || 'Failed to save project.'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.container { max-width: 760px; margin: 2rem auto; padding: 1rem; }
.breadcrumbs { display: flex; gap: 0.75rem; margin-bottom: 0.5rem; }
.h1 { margin-bottom: 1rem; }
.form { display: grid; gap: 0.75rem; }
label { display: grid; gap: 0.25rem; }
input[type="text"], textarea { width: 100%; padding: 0.5rem 0.6rem; border: 1px solid #ddd; border-radius: 6px; font: inherit; }
.row { display: flex; gap: 1rem; align-items: center; }
.check { display: inline-flex; gap: 0.5rem; align-items: center; }
.actions { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
.btn { background: #1a73e8; color: #fff; padding: 0.5rem 0.75rem; border-radius: 6px; border: 0; cursor: pointer; text-decoration: none; }
.btn.secondary { background: #888; }
.error { color: #b00020; }
.success { color: #0a7a28; }
.ml { margin-left: auto; }
</style>
