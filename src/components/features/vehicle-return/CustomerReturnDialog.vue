<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <DialogHeader class="flex-shrink-0">
        <DialogTitle>Submit Vehicle Return</DialogTitle>
        <DialogDescription>
          Please upload photos and provide details about the vehicle condition upon return.
        </DialogDescription>
      </DialogHeader>
      
      <div class="flex-1 overflow-y-auto pr-2">
        <form @submit.prevent="handleSubmit">
          <div class="space-y-4 pb-4">
          <div class="flex flex-col gap-2">
            <Label>Return Photos *</Label>
            <div
              class="border-2 border-dashed border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-background hover:border-primary transition relative min-h-[96px]"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="{ 'border-primary': isDragging }"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                accept="image/*"
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleFileChange"
                @click.stop
              />
              <div v-if="!form.customer_images.length && !isDragging" class="flex flex-col items-center">
                <Upload class="w-8 h-8 text-muted-foreground mb-2" />
                <span class="text-muted-foreground text-sm text-center">
                  Drag & drop images here or click to upload<br />
                  <span class="text-xs">Please upload at least one photo of the vehicle</span>
                </span>
              </div>
              <div v-if="isDragging" class="flex flex-col items-center">
                <span class="text-primary font-semibold">Drop files to upload</span>
              </div>
              <div v-if="form.customer_images.length" class="flex flex-wrap gap-2 mt-2 justify-center">
                <div
                  v-for="(img, i) in form.customer_images"
                  :key="i"
                  class="relative group"
                >
                  <img
                    :src="img"
                    class="w-16 h-16 object-cover rounded border"
                  />
                  <button
                    type="button"
                    @click="removeImage(i)"
                    class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
            <p v-if="imageError" class="text-sm text-red-600">{{ imageError }}</p>
          </div>
          
            <!-- Vehicle Condition Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="flex flex-col gap-2">
                <Label>Odometer Reading (optional)</Label>
                <Input 
                  v-model="form.odometer" 
                  type="number" 
                  min="0" 
                  placeholder="Current odometer reading" 
                />
              </div>
              
              <div class="flex flex-col gap-2">
                <Label>Fuel Level (optional)</Label>
                <Input 
                  v-model="form.fuel_level" 
                  placeholder="e.g. Full, 3/4, Half" 
                />
              </div>
            </div>
            
            <div class="flex flex-col gap-2">
              <Label>Vehicle Condition Notes (optional)</Label>
              <Textarea
                v-model="form.customer_condition_notes"
                placeholder="Describe any issues, damages, or observations..."
                rows="3"
              />
            </div>
          
            <!-- Security Deposit Refund Information -->
            <div class="border border-border rounded-lg p-4 space-y-3">
              <h3 class="font-semibold text-foreground">Security Deposit Refund (₱{{ booking?.vehicle?.deposit || 0 }})</h3>
              
              <div class="flex flex-col gap-2">
                <Label>Preferred Refund Method *</Label>
                <select 
                  v-model="form.customer_refund_method" 
                  required
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="">Select refund method</option>
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash Pickup</option>
                </select>
              </div>
              
              <!-- GCash Details -->
              <div v-if="form.customer_refund_method === 'gcash'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                  <Label>GCash Number *</Label>
                  <Input 
                    v-model="form.customer_account_number" 
                    type="tel" 
                    placeholder="09XXXXXXXXX"
                    required
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input 
                    v-model="form.customer_account_name" 
                    placeholder="Full name as registered"
                    required
                  />
                </div>
              </div>
              
              <!-- Bank Transfer Details -->
              <div v-if="form.customer_refund_method === 'bank_transfer'" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-2">
                    <Label>Bank Name *</Label>
                    <Input 
                      v-model="form.customer_bank_name" 
                      placeholder="e.g. BDO, BPI, Metrobank"
                      required
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label>Account Number *</Label>
                    <Input 
                      v-model="form.customer_account_number" 
                      placeholder="Bank account number"
                      required
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input 
                    v-model="form.customer_account_name" 
                    placeholder="Full name as registered in bank"
                    required
                  />
                </div>
              </div>
              
              <!-- Additional Notes -->
              <div class="flex flex-col gap-2">
                <Label>{{ form.customer_refund_method === 'cash' ? 'Pickup Instructions' : 'Additional Notes' }} (optional)</Label>
                <Textarea 
                  v-model="form.customer_refund_notes" 
                  :placeholder="form.customer_refund_method === 'cash' ? 'Specify pickup location or special instructions...' : 'Any special instructions for the refund process...'"
                  rows="2"
                />
              </div>
              
              <div class="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p class="text-sm text-blue-800">
                  <strong>Note:</strong> After submission, an admin will review your return and assess any fees before processing your deposit refund.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <DialogFooter class="flex-shrink-0 mt-4">
        <Button type="button" variant="outline" @click="$emit('update:open', false)">
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="isLoading || form.customer_images.length === 0"
          class="min-w-[120px]"
          @click="handleSubmit"
        >
          <Loader2 v-if="isLoading" class="w-4 h-4 animate-spin mr-2" />
          Submit Return
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useSubmitVehicleReturn } from '@/services/customer/vehicle-return-service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Upload, Loader2 } from 'lucide-vue-next'

const props = defineProps({
  booking: Object,
  open: Boolean,
})

const emit = defineEmits(['update:open', 'submitted'])

const form = ref({
  customer_images: [],
  customer_condition_notes: '',
  odometer: '',
  fuel_level: '',
  // Customer refund account information
  customer_refund_method: '',
  customer_account_number: '',
  customer_account_name: '',
  customer_bank_name: '',
  customer_refund_notes: '',
})

const isDragging = ref(false)
const fileInput = ref(null)
const imageError = ref('')

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = {
        customer_images: [],
        customer_condition_notes: '',
        odometer: '',
        fuel_level: '',
        // Reset refund fields
        customer_refund_method: '',
        customer_account_number: '',
        customer_account_name: '',
        customer_bank_name: '',
        customer_refund_notes: '',
      }
      imageError.value = ''
    }
  },
)

const { mutate: submitReturn, isLoading } = useSubmitVehicleReturn()

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'))
  processFiles(files)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'))
  processFiles(files)
}

function processFiles(files) {
  if (files.length === 0) {
    imageError.value = 'Please select at least one image file'
    return
  }

  const maxSize = 5 * 1024 * 1024 // 5MB
  const validFiles = files.filter(file => {
    if (file.size > maxSize) {
      imageError.value = `File ${file.name} is too large. Maximum size is 5MB.`
      return false
    }
    return true
  })

  if (validFiles.length === 0) return

  imageError.value = ''
  
  const readers = validFiles.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )
  
  Promise.all(readers).then((images) => {
    form.value.customer_images = [...form.value.customer_images, ...images]
  })
}

function removeImage(index) {
  form.value.customer_images.splice(index, 1)
}

function handleSubmit() {
  if (!props.booking) return
  
  if (form.value.customer_images.length === 0) {
    imageError.value = 'Please upload at least one photo of the vehicle'
    return
  }

  // Validate refund method is selected
  if (!form.value.customer_refund_method) {
    imageError.value = 'Please select a refund method for your security deposit'
    return
  }

  // Validate refund account details based on method
  if (form.value.customer_refund_method === 'gcash') {
    if (!form.value.customer_account_number || !form.value.customer_account_name) {
      imageError.value = 'Please provide your GCash number and account holder name'
      return
    }
  } else if (form.value.customer_refund_method === 'bank_transfer') {
    if (!form.value.customer_bank_name || !form.value.customer_account_number || !form.value.customer_account_name) {
      imageError.value = 'Please provide complete bank account details'
      return
    }
  }

  imageError.value = ''

  submitReturn(
    { bookingId: props.booking.id, ...form.value },
    {
      onSuccess: () => {
        emit('update:open', false)
        emit('submitted')
      },
      onError: (error) => {
        console.error('Return submission failed:', error)
        imageError.value = error?.response?.data?.message || 'Failed to submit return. Please try again.'
      }
    },
  )
}
</script>
