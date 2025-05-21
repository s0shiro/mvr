<template>
  <Dialog :open="open" @update:open="(val) => $emit('update:open', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader class="px-6 pt-6">
        <DialogTitle>Submit Payment</DialogTitle>
        <DialogDescription>Upload your payment details to confirm your booking.</DialogDescription>
      </DialogHeader>
      <form @submit.prevent="onSubmit" class="flex flex-col gap-6 px-6 pb-6">
        <div class="space-y-2">
          <Label for="method">Payment Method</Label>
          <Select v-model="form.method">
            <SelectTrigger class="w-full">
              <SelectValue :placeholder="form.method ? paymentMethods[form.method]?.label : 'Select payment method'" />
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
        <Card v-if="form.method && paymentMethods[form.method]" class="bg-muted">
          <CardContent class="pt-6">
            <div v-if="form.method === 'gcash'" class="space-y-1">
              <div class="flex justify-between">
                <span class="text-muted-foreground">GCash Name</span>
                <span class="font-medium">{{ paymentMethods.gcash.account_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">GCash Number</span>
                <span class="font-medium">{{ paymentMethods.gcash.account_number }}</span>
              </div>
            </div>
            <div v-else-if="form.method === 'bank_transfer'" class="space-y-1">
              <div class="flex justify-between">
                <span class="text-muted-foreground">Bank</span>
                <span class="font-medium">{{ paymentMethods.bank_transfer.bank_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Account Name</span>
                <span class="font-medium">{{ paymentMethods.bank_transfer.account_name }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted-foreground">Account Number</span>
                <span class="font-medium">{{ paymentMethods.bank_transfer.account_number }}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div class="space-y-2">
          <Label for="reference_number">Reference Number</Label>
          <Input v-model="form.reference_number" id="reference_number" placeholder="Enter reference number" required />
        </div>
        <div class="space-y-2">
          <Label for="proof_image">Proof of Payment</Label>
          <div class="grid w-full max-w-sm items-center gap-1.5">
            <Label 
              for="proof_image" 
              :class="[
                'flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-md border border-dashed',
                'text-sm text-muted-foreground hover:bg-muted transition-colors',
                form.proof_image ? 'border-primary' : 'border-border'
              ]"
            >
              <div v-if="form.proof_image" class="relative w-full h-full">
                <img :src="form.proof_image" alt="Proof" class="w-full h-full object-contain rounded-md" />
                <div class="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  Click to change
                </div>
              </div>
              <div v-else class="flex flex-col items-center gap-1">
                <UploadCloud class="h-10 w-10 text-muted-foreground" />
                <span>Click to upload proof of payment</span>
              </div>
            </Label>
            <input type="file" id="proof_image" accept="image/*" @change="onFileChange" class="sr-only" required />
          </div>
        </div>
        <div v-if="error" class="text-red-500">{{ error }}</div>
        <DialogFooter class="mt-4">
          <Button type="button" variant="secondary" @click="onClose">Cancel</Button>
          <Button type="submit" :disabled="loading">Submit Payment</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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
import {
  Card,
  CardContent,
} from '@/components/ui/card'
import { UploadCloud } from 'lucide-vue-next'
import { usePaymentMethods, useSubmitPayment } from '@/services/booking-service'

const props = defineProps({
  bookingId: { type: [String, Number], required: true },
  open: { type: Boolean, required: true },
  onClose: { type: Function, required: true },
  type: { type: String, default: 'deposit' }, // 'deposit' or 'rental'
})

const emit = defineEmits(['paid'])

const paymentMethods = ref({})
const form = ref({
  method: '',
  reference_number: '',
  proof_image: '',
})
const error = ref('')
const loading = ref(false)
const submitPayment = useSubmitPayment()

onMounted(async () => {
  try {
    const getMethods = usePaymentMethods()
    paymentMethods.value = await getMethods()
  } catch (e) {
    error.value = 'Failed to load payment methods'
  }
})

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
