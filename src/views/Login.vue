<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background transition-colors"
  >
    <div
      class="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-md dark:shadow-lg dark:border dark:border-border transition-colors"
    >
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-foreground">
        Sign In
      </h2>
      <form @submit.prevent="onSubmit">
        <div class="mb-4">
          <Input
            v-model="form.login"
            type="text"
            placeholder="Username or Email"
            label="Username or Email"
            :disabled="isLoading"
            required
          />
        </div>
        <div class="mb-6">
          <Input
            v-model="form.password"
            type="password"
            placeholder="Password"
            label="Password"
            :disabled="isLoading"
            required
          />
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading">
          {{ isLoading ? 'Signing in...' : 'Sign In' }}
        </Button>
        <div v-if="error" class="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const authStore = useAuthStore()
const { isLoading, authError } = storeToRefs(authStore)
const router = useRouter()

const form = ref({
  login: '',
  password: '',
})

const error = ref(null)

const onSubmit = async () => {
  error.value = null
  const result = await authStore.login(form.value)
  if (!result.success) {
    error.value = result.errors?.general?.[0] || 'Login failed.'
  } else {
    // Redirect handled in store, but you can add logic here if needed
  }
}
</script>

<style scoped>
/* Add any additional styles if needed */
</style>
