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
        Register
      </h2>
      <form @submit.prevent="onRegister">
        <div class="mb-4">
          <Label for="username" class="block mb-1 font-medium">Username</Label>
          <Input
            v-model="form.username"
            id="username"
            type="text"
            placeholder="Enter your username"
            required
            class="focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <div class="mb-4">
          <Label for="name" class="block mb-1 font-medium">Full Name</Label>
          <Input
            v-model="form.name"
            id="name"
            type="text"
            placeholder="Enter your full name"
            required
            class="focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <div class="mb-4">
          <Label for="email" class="block mb-1 font-medium">Email</Label>
          <Input
            v-model="form.email"
            id="email"
            type="email"
            placeholder="Enter your email address"
            required
            class="focus:ring-2 focus:ring-primary/50 transition"
          />
        </div>
        <div class="mb-4 relative">
          <Label for="password" class="block mb-1 font-medium">Password</Label>
          <Input
            v-model="form.password"
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            class="focus:ring-2 focus:ring-primary/50 transition pr-10"
            @input="checkPasswordStrength"
          />
          <div v-if="passwordStrength" class="mt-1 text-xs" :class="passwordStrengthColor">
            {{ passwordStrength }}
          </div>
        </div>
        <div class="mb-6 relative">
          <Label for="password_confirmation" class="block mb-1 font-medium">Confirm Password</Label>
          <Input
            v-model="form.password_confirmation"
            type="password"
            id="password_confirmation"
            placeholder="Re-enter your password"
            required
            class="focus:ring-2 focus:ring-primary/50 transition pr-10"
          />
        </div>
        <Button type="submit" class="w-full flex items-center justify-center" :disabled="isLoading">
          <svg v-if="isLoading" class="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
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
          <span>{{ isLoading ? 'Registering...' : 'Register' }}</span>
        </Button>
        <div v-if="error" class="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>
        <div class="mt-6 text-center">
          <router-link to="/login" class="text-sm text-primary hover:underline"
            >Already have an account? Sign In</router-link
          >
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/auth-api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const isLoading = ref(false)
const error = ref(null)
const passwordStrength = ref('')
const passwordStrengthColor = ref('')

function checkPasswordStrength() {
  const val = form.value.password
  if (!val) {
    passwordStrength.value = ''
    passwordStrengthColor.value = ''
    return
  }
  let score = 0
  if (val.length >= 8) score++
  if (/[A-Z]/.test(val)) score++
  if (/[a-z]/.test(val)) score++
  if (/[0-9]/.test(val)) score++
  if (/[^A-Za-z0-9]/.test(val)) score++
  if (score <= 2) {
    passwordStrength.value = 'Weak password'
    passwordStrengthColor.value = 'text-red-500'
  } else if (score === 3 || score === 4) {
    passwordStrength.value = 'Moderate password'
    passwordStrengthColor.value = 'text-yellow-500'
  } else {
    passwordStrength.value = 'Strong password'
    passwordStrengthColor.value = 'text-green-600'
  }
}

async function onRegister() {
  isLoading.value = true
  error.value = null
  try {
    const res = await authStore.register(form.value)
    if (res.success) {
      // Redirect to verification page after successful registration
      router.push({ name: 'verify' })
    } else {
      error.value = res.errors?.general?.[0] || 'Registration failed.'
    }
  } catch (e) {
    error.value = 'Registration failed.'
  } finally {
    isLoading.value = false
  }
}
</script>
