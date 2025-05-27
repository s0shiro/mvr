<template>
  <div>
    <div v-if="isLoading" class="flex items-center gap-2 text-muted-foreground">
      <Loader2 class="animate-spin w-4 h-4" /> Loading feedback...
    </div>
    <div v-else-if="feedback && feedback.id" class="space-y-1">
      <div class="flex items-center gap-2 mb-1">
        <span class="font-medium">Your Feedback:</span>
        <span class="flex items-center">
          <Star
            v-for="n in 5"
            :key="n"
            :class="n <= feedback.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
            class="w-4 h-4"
          />
        </span>
      </div>
      <div class="text-muted-foreground text-sm">
        {{ feedback.comment || 'No comment provided.' }}
      </div>
    </div>
    <div v-else>
      <div v-if="!formOpen">
        <button class="btn btn-sm btn-primary" @click="formOpen = true">Leave Feedback</button>
      </div>
      <form v-else @submit.prevent="handleSubmit" class="space-y-2">
        <div class="flex items-center gap-2">
          <span class="font-medium">Rate your experience:</span>
          <button
            v-for="n in 5"
            :key="n"
            type="button"
            @click="form.rating = n"
            :aria-label="`Rate ${n}`"
          >
            <Star
              :class="n <= form.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
              class="w-6 h-6 transition-colors"
            />
          </button>
        </div>
        <textarea
          v-model="form.comment"
          rows="2"
          class="w-full rounded border px-2 py-1 bg-background text-foreground"
          placeholder="Leave a comment (optional)"
        ></textarea>
        <div class="flex items-center gap-2">
          <button
            class="btn btn-primary btn-sm"
            :disabled="submitMutation.isLoading || form.rating === 0"
          >
            <Loader2
              v-if="submitMutation.isLoading"
              class="animate-spin w-4 h-4 inline-block mr-1"
            />
            Submit Feedback
          </button>
          <span v-if="errorMsg" class="text-destructive text-xs">{{ errorMsg }}</span>
          <span v-if="successMsg" class="text-green-600 text-xs">Thank you for your feedback!</span>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookingFeedbackQuery, useSubmitFeedbackMutation } from '@/services/feedback-api'
import { Loader2, Star } from 'lucide-vue-next'

const props = defineProps({ bookingId: { type: [String, Number], required: true } })
const formOpen = ref(false)
const form = ref({ rating: 0, comment: '' })
const errorMsg = ref('')
const successMsg = ref('')

const feedbackQuery = useBookingFeedbackQuery(props.bookingId, { enabled: !!props.bookingId })

// Fix: Use .value for isLoading, as it's a ref in vue-query
const isLoading = computed(() => feedbackQuery.isLoading?.value ?? feedbackQuery.isLoading)

const feedback = computed(() => {
  const val = feedbackQuery.data.value
  if (Array.isArray(val) && val.length > 0) return val[0]
  if (val && typeof val === 'object' && val.id) return val
  return null
})

const submitMutation = useSubmitFeedbackMutation()

async function handleSubmit() {
  errorMsg.value = ''
  successMsg.value = ''
  try {
    await submitMutation.mutateAsync({
      booking_id: props.bookingId,
      rating: form.value.rating,
      comment: form.value.comment,
    })
    successMsg.value = 'Thank you for your feedback!'
    formOpen.value = false
    form.value = { rating: 0, comment: '' }
    feedbackQuery.refetch()
  } catch (e) {
    errorMsg.value = 'Failed to submit feedback.'
  }
}
</script>
