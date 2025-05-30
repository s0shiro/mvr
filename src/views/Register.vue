<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background transition-colors"
  >
    <div
      class="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-md dark:shadow-lg dark:border dark:border-border transition-colors"
    >
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
          />
        </div>
        <div class="mb-4">
          <Label for="password" class="block mb-1 font-medium">Password</Label>
          <Input
            v-model="form.password"
            id="password"
            type="password"
            placeholder="Enter your password"
            required
          />
        </div>
        <div class="mb-6">
          <Label for="password_confirmation" class="block mb-1 font-medium">Confirm Password</Label>
          <Input
            v-model="form.password_confirmation"
            id="password_confirmation"
            type="password"
            placeholder="Re-enter your password"
            required
          />
        </div>
        <Button type="submit" class="w-full" :disabled="isLoading">
          {{ isLoading ? 'Registering...' : 'Register' }}
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
