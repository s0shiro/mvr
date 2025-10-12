<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-background transition-colors relative"
  >
    <button
      v-if="authStore.isAuthenticated"
      @click="logout"
      class="absolute top-6 right-6 px-4 py-2 rounded-md bg-gray-200 dark:bg-muted text-gray-800 dark:text-foreground hover:bg-gray-300 dark:hover:bg-muted-foreground transition-colors text-sm font-medium shadow"
    >
      Logout
    </button>
    <div
      class="w-full max-w-md p-8 bg-white dark:bg-card rounded-lg shadow-md dark:shadow-lg dark:border dark:border-border transition-colors"
    >
      <h2 class="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-foreground">
        Email Verification
      </h2>
      <form @submit.prevent="onVerifyCode">
        <div class="mb-4 text-center">
          <p class="mb-2">
            A verification code has been sent to <b>{{ email }}</b
            >.
          </p>
          <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Don't see the email? Check your spam folder.
          </p>
        </div>
        <div class="mb-6">
          <Input
            v-model="verificationCode"
            id="verification_code"
            type="text"
            maxlength="6"
            placeholder="Enter the code sent to your email"
            required
          />
        </div>
        <Button type="submit" class="w-full" :disabled="isVerifying">
          {{ isVerifying ? 'Verifying...' : 'Verify Code' }}
        </Button>
        <div v-if="verifyError" class="mt-4 text-red-600 dark:text-red-400 text-sm text-center">
          {{ verifyError }}
        </div>
        <div class="mt-4 text-center">
          <Button variant="link" type="button" @click="resendCode" :disabled="isResending">
            {{ isResending ? 'Resending...' : 'Resend Code' }}
          </Button>
          <span v-if="resendSuccess" class="text-green-600 ml-2">Code resent!</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { authApi } from '@/services/auth-api'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

const email = ref(authStore.user?.email || '')
const verificationCode = ref('')
const isVerifying = ref(false)
const verifyError = ref(null)
const isResending = ref(false)
const resendSuccess = ref(false)

onMounted(() => {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'login' })
  } else if (authStore.isVerified) {
    router.push({ name: 'overview' })
  } else {
    email.value = authStore.user?.email || ''
  }
})

async function onVerifyCode() {
  isVerifying.value = true
  verifyError.value = null
  try {
    const res = await authApi.verifyCode({
      email: email.value,
      code: verificationCode.value,
    })
    if (res.data.status === 'success') {
      // Refetch user data to update verification status
      await authStore.checkAuth()
      router.push({ name: 'overview' })
    } else {
      verifyError.value = res.data.message || 'Verification failed.'
    }
  } catch (e) {
    verifyError.value = e.response?.data?.message || 'Verification failed.'
  } finally {
    isVerifying.value = false
  }
}

async function resendCode() {
  isResending.value = true
  resendSuccess.value = false
  try {
    await authApi.resendVerificationCode({ email: email.value })
    resendSuccess.value = true
  } catch (e) {
    // Optionally show error
  } finally {
    isResending.value = false
  }
}

const logout = async () => {
  await authStore.logout()
}
</script>
