<template>
  <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
    <div class="space-y-2">
      <Label for="method">Payment Method</Label>
      <Select v-model="form.method">
        <SelectTrigger class="w-full">
          <SelectValue
            :placeholder="
              form.method ? paymentMethods[form.method]?.label : 'Select payment method'
            "
          />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem v-for="(info, key) in paymentMethods" :key="key" :value="key">
              {{ info.label }}
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>

    <Accordion
      v-if="form.method && paymentMethods[form.method] && form.method !== 'cash'"
      type="single"
      collapsible
      class="mb-2"
    >
      <AccordionItem value="details">
        <AccordionTrigger>Show Payment Details</AccordionTrigger>
        <AccordionContent>
          <Card class="bg-gradient-to-br from-primary/10 to-muted border border-primary/30 shadow-lg rounded-xl">
            <CardContent class="pt-6 pb-4">
              <div class="flex flex-col gap-3">
                <div v-if="paymentMethods[form.method].bank_name" class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M3 10l9-7 9 7-9 7-9-7z"
                      />
                    </svg>
                  </span>
                  <div>
                    <div class="text-xs text-muted-foreground">Bank</div>
                    <div class="font-semibold text-base">
                      {{ paymentMethods[form.method].bank_name }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <div>
                    <div class="text-xs text-muted-foreground">Account Name</div>
                    <div class="font-semibold text-base">
                      {{ paymentMethods[form.method].account_name }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      class="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 11c0-1.104.896-2 2-2s2 .896 2 2-.896 2-2 2-2-.896-2-2z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 11V7a5 5 0 00-10 0v4"
                      />
                    </svg>
                  </span>
                  <div>
                    <div class="text-xs text-muted-foreground">Account Number</div>
                    <div class="font-semibold text-base tracking-wider">
                      {{ paymentMethods[form.method].account_number }}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </AccordionContent>
      </AccordionItem>
    </Accordion>

    <div v-if="form.method === 'cash'" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-2">
      <p class="text-sm text-yellow-800">
        For cash payments, please pay in person at our office.
      </p>
    </div>

    <div v-if="form.method !== 'cash'" class="space-y-2">
      <Label for="reference_number">Reference Number</Label>
      <Input
        v-model="form.reference_number"
        id="reference_number"
        placeholder="Enter reference number"
        required
        :class="{ 'border-red-500': referenceNumberError }"
      />
      <p v-if="referenceNumberError" class="text-sm text-red-500">{{ referenceNumberError }}</p>
    </div>

    <div v-if="form.method !== 'cash'" class="space-y-2">
      <Label for="proof_image">Proof of Payment</Label>
      <div class="grid w-full max-w-sm items-center gap-1.5">
        <Label
          for="proof_image"
          :class="[
            'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed',
            'text-sm text-muted-foreground hover:bg-muted transition-colors',
            form.proof_image ? 'border-primary' : 'border-border',
          ]"
        >
          <div v-if="form.proof_image" class="relative w-full h-full">
            <img :src="form.proof_image" alt="Proof" class="w-full h-full object-contain rounded-md" />
            <div
              class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white"
            >
              Click to change
            </div>
          </div>
          <div v-else class="flex flex-col items-center gap-1">
            <UploadCloud class="h-10 w-10 text-muted-foreground" />
            <span>Click to upload proof of payment</span>
          </div>
        </Label>
        <input
          type="file"
          id="proof_image"
          accept="image/*"
          @change="onFileChange"
          class="sr-only"
          :required="form.method !== 'cash'"
        />
      </div>
    </div>

    <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>

    <Button type="submit" :disabled="loading">
      <slot name="submit-label">Submit Payment</slot>
    </Button>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { UploadCloud } from 'lucide-vue-next'
import { usePaymentMethods, useSubmitPayment } from '@/services/booking-service'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
import { useQueryClient } from '@tanstack/vue-query'

const props = defineProps({
  bookingId: { type: [String, Number], required: true },
  type: { type: String, default: 'deposit' },
})

const emit = defineEmits(['submitted'])

const paymentMethodsQuery = usePaymentMethods()
const submitPayment = useSubmitPayment()
const queryClient = useQueryClient()

const paymentMethods = computed(() => {
  const arr = paymentMethodsQuery.data?.value
  const obj = {}
  if (Array.isArray(arr)) {
    for (const method of arr) {
      obj[method.key] = method
    }
  } else if (arr && typeof arr === 'object') {
    Object.assign(obj, arr)
  }
  return obj
})

const form = ref({
  method: '',
  reference_number: '',
  proof_image: '',
})
const error = ref('')
const referenceNumberError = ref('')
const loading = ref(false)

watch(
  () => form.value.reference_number,
  () => {
    if (referenceNumberError.value) {
      referenceNumberError.value = ''
    }
  }
)

function onFileChange(e) {
  const file = e.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (event) => {
    form.value.proof_image = event.target.result
  }
  reader.readAsDataURL(file)
}

async function onSubmit() {
  loading.value = true
  error.value = ''
  referenceNumberError.value = ''

  const isCash = form.value.method === 'cash'
  if (!form.value.method) {
    error.value = 'Please select a payment method'
    loading.value = false
    return
  }
  if (!isCash && !form.value.reference_number.trim()) {
    referenceNumberError.value = 'Reference number is required'
    loading.value = false
    return
  }
  if (!isCash && !form.value.proof_image) {
    error.value = 'Proof of payment is required'
    loading.value = false
    return
  }

  try {
    await submitPayment.mutateAsync({
      bookingId: props.bookingId,
      ...form.value,
      type: props.type,
    })
    await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    emit('submitted')
    form.value = {
      method: '',
      reference_number: '',
      proof_image: '',
    }
  } catch (e) {
    const response = e.response?.data
    if (response?.errors) {
      if (response.errors.reference_number) {
        referenceNumberError.value = response.errors.reference_number[0]
      } else {
        error.value = 'Validation failed. Please check your inputs.'
      }
    } else {
      error.value = response?.message || 'Payment submission failed'
    }
  } finally {
    loading.value = false
  }
}
</script>
