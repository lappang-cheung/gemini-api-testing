<script setup lang="ts">
import {onMounted, ref} from 'vue'

const prompt = ref('Explain the difference between X and Y in simple terms.')
const result = ref('')
const loading = ref(false)
const status = ref('unknown')

async function send() {
  result.value = ''
  loading.value = true
  try {
    const res = await $fetch('/api/gemini', {
      method: 'POST',
      body: { prompt: prompt.value }
    })
    result.value = res.text || JSON.stringify(res)
  } catch (err: any) {
    result.value = 'Error: ' + (err?.message || String(err))
  } finally {
    loading.value = false
  }
}

onMounted(async() => {
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
    <h1 class="text-2xl font-semibold mb-4">Nuxt → Gemini (demo) {{status}}</h1>

    <textarea v-model="prompt" rows="6" class="w-full p-3 border rounded" placeholder="Type a prompt..."></textarea>

    <div class="flex gap-2 mt-3">
      <button @click="send" :disabled="loading" class="px-4 py-2 bg-slate-800 text-white rounded">
        {{ loading ? 'Thinking…' : 'Send' }}
      </button>
      <button @click="prompt=''" class="px-3 py-2 border rounded">Clear</button>
    </div>

    <section v-if="result" class="mt-6">
      <h2 class="font-medium mb-2">Response</h2>
      <pre class="whitespace-pre-wrap bg-gray-100 p-4 rounded">{{ result }}</pre>
    </section>
  </main>
</template>
