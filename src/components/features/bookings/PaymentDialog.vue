<template>
  <Dialog :open="open" @update:open="(val) => $emit('update:open', val)">
    <DialogContent class="max-h-[90vh] p-0">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>Submit Payment</DialogTitle>
        <DialogDescription>Upload your payment details to confirm your booking.</DialogDescription>
      </DialogHeader>
      <ScrollArea class="px-4 pb-4 max-h-[70vh]">
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
            v-if="form.method && paymentMethods[form.method]"
            type="single"
            collapsible
            class="mb-2"
          >
            <AccordionItem value="details">
              <AccordionTrigger>Show Payment Details</AccordionTrigger>
              <AccordionContent>
                <Card
                  class="bg-gradient-to-br from-primary/10 to-muted border border-primary/30 shadow-lg rounded-xl"
                >
                  <CardContent class="pt-6 pb-4">
                    <div class="flex flex-col gap-3">
                      <div
                        v-if="paymentMethods[form.method].bank_name"
                        class="flex items-center gap-2"
                      >
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
          <div class="space-y-2">
            <Label for="reference_number">Reference Number</Label>
            <Input
              v-model="form.reference_number"
              id="reference_number"
              placeholder="Enter reference number"
              required
            />
          </div>
          <div class="space-y-2">
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
                  <img
                    :src="form.proof_image"
                    alt="Proof"
                    class="w-full h-full object-contain rounded-md"
                  />
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
                required
              />
            </div>
          </div>
          <div v-if="error" class="text-red-500">{{ error }}</div>
          <DialogFooter class="mt-4">
            <Button type="submit" :disabled="loading">Submit Payment</Button>
          </DialogFooter>
        </form>
      </ScrollArea>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { UploadCloud } from 'lucide-vue-next'
import { usePaymentMethods, useSubmitPayment } from '@/services/booking-service'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ScrollArea } from '@/components/ui/scroll-area'

const props = defineProps({
  bookingId: { type: [String, Number], required: true },
  open: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  type: { type: String, default: 'deposit' }, // 'deposit' or 'rental'
})

const emit = defineEmits(['paid'])

const paymentMethodsQuery = usePaymentMethods()

const paymentMethods = computed(() => {
  // If the API returns an array, convert to object keyed by method key for compatibility
  const arr = paymentMethodsQuery.data?.value
  if (Array.isArray(arr)) {
    const obj = {}
    for (const method of arr) {
      obj[method.key] = method
    }
    return obj
  }
  // If already object (legacy), just return
  return arr || {}
})

const form = ref({
  method: '',
  reference_number: '',
  proof_image: '',
})
const error = ref('')
const loading = ref(false)
const submitPayment = useSubmitPayment()

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
  try {
    await submitPayment.mutateAsync({
      bookingId: props.bookingId,
      ...form.value,
      type: props.type,
    })
    emit('paid')
    onClose()
  } catch (e) {
    error.value = e.response?.data?.message || 'Payment submission failed'
  } finally {
    loading.value = false
  }
}
</script>
