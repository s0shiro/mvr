<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background transition-colors"
  >
    <div
      class="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-md dark:shadow-lg dark:border dark:border-border transition-colors"
    >
      <div class="flex justify-center mb-6">
        <img src="/mvr-logo.png" alt="MVR Logo" class="h-10 w-auto" />
      </div>
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
            class="focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <div class="mb-2 relative">
          <Input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            label="Password"
            :disabled="isLoading"
            required
            class="focus:ring-2 focus:ring-primary/50 transition pr-10"
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            tabindex="-1"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
          >
            <EyeOff v-if="showPassword" class="w-5 h-5" />
            <Eye v-else class="w-5 h-5" />
          </button>
        </div>
        <div class="mb-4 text-right">
          <router-link to="/forgot-password" class="text-sm text-primary hover:underline"
            >Forgot password?</router-link
          >
        </div>
        <Button
          type="submit"
          class="w-full flex items-center justify-center"
          :disabled="isLoadingLocal"
        >
          <svg v-if="isLoadingLocal" class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
              fill="none"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          <span>{{ isLoadingLocal ? 'Signing in...' : 'Sign In' }}</span>
        </Button>
        <div v-if="error" class="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>
        <div class="mt-6 text-center">
          <router-link to="/register" class="text-sm text-primary hover:underline"
            >Don't have an account? Register</router-link
          >
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
import { Eye, EyeOff } from 'lucide-vue-next'

const authStore = useAuthStore()
const { isLoading, authError } = storeToRefs(authStore)
const router = useRouter()

const form = ref({
  login: '',
  password: '',
})

const error = ref(null)
const showPassword = ref(false)
const isLoadingLocal = ref(false)

const onSubmit = async () => {
  error.value = null
  isLoadingLocal.value = true
  const result = await authStore.login(form.value)
  isLoadingLocal.value = false
  if (!result.success) {
    error.value = result.errors?.general?.[0] || 'Login failed.'
  } else {
    // Redirect handled in store, but you can add logic here if needed
  }
}
</script>

<style scoped>
.text-primary {
  color: #2563eb;
}
</style>
