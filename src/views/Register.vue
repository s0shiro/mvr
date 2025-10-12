<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background transition-colors"
  >
    <div
      class="w-full max-w-md p-6 bg-white dark:bg-card rounded-2xl shadow-lg dark:shadow-2xl"
    >
      <div class="text-center mb-6">
        <img src="/mvr-logo.png" alt="MVR Logo" class="h-8 w-auto mx-auto mb-3" />
        <h2 class="text-2xl font-bold text-gray-900 dark:text-foreground">
          Create an account
        </h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Already have an account?
          <router-link to="/login" class="text-primary hover:underline">Log in</router-link>
        </p>
      </div>

      <form @submit.prevent="onRegister" class="space-y-3">
        <Input
          v-model="form.username"
          type="text"
          placeholder="Username"
          required
          class="w-full"
        />

        <Input
          v-model="form.name"
          type="text"
          placeholder="Full Name"
          required
          class="w-full"
        />

        <Input
          v-model="form.email"
          type="email"
          placeholder="Email Address"
          required
          class="w-full"
        />

        <Input
          v-model="form.address"
          type="text"
          placeholder="Address"
          required
          class="w-full"
        />

        <div class="relative">
          <Input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Password"
            required
            class="w-full pr-10"
            @input="checkPasswordStrength"
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
          <div v-if="passwordStrength" class="mt-1 text-xs" :class="passwordStrengthColor">
            {{ passwordStrength }}
          </div>

        <div class="relative">
          <Input
            v-model="form.password_confirmation"
            :type="showConfirmPassword ? 'text' : 'password'"
            placeholder="Confirm Password"
            required
            class="w-full pr-10"
          />
          <button
            type="button"
            @click="showConfirmPassword = !showConfirmPassword"
            tabindex="-1"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
          >
            <EyeOff v-if="showConfirmPassword" class="w-5 h-5" />
            <Eye v-else class="w-5 h-5" />
          </button>
        </div>

        <Button
          type="submit"
          class="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-lg transition-colors mt-2"
          :disabled="isLoading"
        >
          <svg v-if="isLoading" class="animate-spin h-4 w-4 mr-2 inline" viewBox="0 0 24 24">
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
          <span>{{ isLoading ? 'Creating account...' : 'Create account' }}</span>
        </Button>

        <div v-if="error" class="mt-3 text-red-600 dark:text-red-400 text-sm text-center">
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  username: '',
  name: '',
  address: '',
  email: '',
  password: '',
  password_confirmation: '',
})
const isLoading = ref(false)
const error = ref(null)
const passwordStrength = ref('')
const passwordStrengthColor = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)

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
