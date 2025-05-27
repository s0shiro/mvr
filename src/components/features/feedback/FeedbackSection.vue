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
        <Button size="sm" @click="formOpen = true">Leave Feedback</Button>
      </div>
      <div v-else class="rounded-lg border bg-card p-4 shadow-md max-w-md">
        <div class="flex items-center gap-2 mb-2">
          <span class="font-medium">Rate your experience:</span>
          <div class="flex items-center">
            <Button
              v-for="n in 5"
              :key="n"
              type="button"
              variant="ghost"
              size="icon"
              class="p-0"
              :aria-label="`Rate ${n}`"
              @click="form.rating = n"
            >
              <Star
                :class="n <= form.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                class="w-7 h-7 transition-colors"
              />
            </Button>
          </div>
        </div>
        <Textarea
          v-model="form.comment"
          rows="3"
          class="w-full mt-2"
          placeholder="Leave a comment (optional)"
        />
        <div class="flex items-center gap-2 mt-3">
          <Button
            type="button"
            :disabled="submitMutation.isLoading || form.rating === 0"
            @click="handleSubmit"
            size="sm"
          >
            <Loader2
              v-if="submitMutation.isLoading"
              class="animate-spin w-4 h-4 inline-block mr-1"
            />
            Submit Feedback
          </Button>
          <span v-if="errorMsg" class="text-destructive text-xs">{{ errorMsg }}</span>
          <span v-if="successMsg" class="text-green-600 text-xs">Thank you for your feedback!</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useBookingFeedbackQuery, useSubmitFeedbackMutation } from '@/services/feedback-api'
import { Loader2, Star } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

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
