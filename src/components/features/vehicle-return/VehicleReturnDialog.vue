<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Process Vehicle Return</DialogTitle>
        <DialogDescription>
          {{ isCustomerSubmitted 
            ? 'Review customer submission and assess any additional fees.' 
            : 'Please fill out the return details and assess the vehicle condition.' 
          }}
        </DialogDescription>
      </DialogHeader>
      
      <!-- Customer Submitted Section -->
      <div v-if="isCustomerSubmitted" class="mb-6 space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-blue-900 mb-2">Customer Submission</h3>
          <div class="text-sm text-blue-800">
            Submitted: {{ formatDate(booking.vehicle_return?.customer_submitted_at) }}
          </div>
        </div>
        
        <!-- Customer Images -->
        <div v-if="customerImages?.length" class="space-y-2">
          <Label class="text-sm font-semibold">Customer Photos</Label>
          <div class="grid grid-cols-3 gap-2">
            <img
              v-for="(img, i) in customerImages"
              :key="i"
              :src="img"
              class="w-full h-24 object-cover rounded border cursor-pointer hover:opacity-80"
              @click="openImageModal(img)"
            />
          </div>
        </div>
        
        <!-- Customer Condition Notes -->
        <div v-if="booking.vehicle_return?.customer_condition_notes" class="space-y-2">
          <Label class="text-sm font-semibold">Customer Condition Notes</Label>
          <div class="bg-muted p-3 rounded border text-sm text-foreground">
            {{ booking.vehicle_return.customer_condition_notes }}
          </div>
        </div>
        
        <!-- Customer Odometer/Fuel if provided -->
        <div class="grid grid-cols-2 gap-4">
          <div v-if="booking.vehicle_return?.odometer">
            <Label class="text-sm font-semibold">Customer Odometer</Label>
            <div class="text-sm">{{ booking.vehicle_return.odometer }}</div>
          </div>
          <div v-if="booking.vehicle_return?.fuel_level">
            <Label class="text-sm font-semibold">Customer Fuel Level</Label>
            <div class="text-sm">{{ booking.vehicle_return.fuel_level }}</div>
          </div>
        </div>
        
        <!-- Customer Refund Account Information -->
        <div v-if="booking.vehicle_return?.customer_refund_method" class="space-y-2">
          <Label class="text-sm font-semibold">Customer Deposit Refund Information</Label>
          <div class="bg-muted/50 border border-border rounded-lg p-3 space-y-2">
            <div class="text-sm text-foreground">
              <span class="font-medium">Refund Method:</span> 
              <span class="capitalize">{{ booking.vehicle_return.customer_refund_method.replace('_', ' ') }}</span>
            </div>
            
            <div v-if="booking.vehicle_return.customer_refund_method === 'gcash'" class="text-sm text-foreground space-y-1">
              <div><span class="font-medium">GCash Number:</span> {{ booking.vehicle_return.customer_account_number }}</div>
              <div><span class="font-medium">Account Name:</span> {{ booking.vehicle_return.customer_account_name }}</div>
            </div>
            
            <div v-if="booking.vehicle_return.customer_refund_method === 'bank_transfer'" class="text-sm text-foreground space-y-1">
              <div><span class="font-medium">Bank:</span> {{ booking.vehicle_return.customer_bank_name }}</div>
              <div><span class="font-medium">Account Number:</span> {{ booking.vehicle_return.customer_account_number }}</div>
              <div><span class="font-medium">Account Name:</span> {{ booking.vehicle_return.customer_account_name }}</div>
            </div>
            
            <div v-if="booking.vehicle_return.customer_refund_method === 'cash'" class="text-sm text-foreground">
              <div><span class="font-medium">Cash Pickup</span></div>
            </div>
            
            <div v-if="booking.vehicle_return.customer_refund_notes" class="text-sm text-foreground">
              <span class="font-medium">Customer Notes:</span> {{ booking.vehicle_return.customer_refund_notes }}
            </div>
          </div>
        </div>
      </div>
      
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div class="flex flex-col gap-2">
            <Label>Odometer</Label>
            <Input 
              v-model="form.odometer" 
              type="number" 
              min="0" 
              placeholder="Final odometer reading"
              :disabled="isCustomerSubmitted && booking.vehicle_return?.odometer" 
            />
          </div>
          
          <div class="flex flex-col gap-2">
            <Label>Fuel Level</Label>
            <Input 
              v-model="form.fuel_level" 
              placeholder="e.g. Full, 3/4, Half"
              :disabled="isCustomerSubmitted && booking.vehicle_return?.fuel_level" 
            />
          </div>
          
          <div v-if="!isCustomerSubmitted" class="flex flex-col gap-2">
            <Label>Return Photos</Label>
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
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleFileChange"
                @click.stop
              />
              <div v-if="!form.images.length && !isDragging" class="flex flex-col items-center">
                <span class="text-muted-foreground text-sm"
                  >Drag & drop images here or click to upload</span
                >
              </div>
              <div v-if="isDragging" class="flex flex-col items-center">
                <span class="text-primary font-semibold">Drop files to upload</span>
              </div>
              <div v-if="form.images.length" class="flex flex-wrap gap-2 mt-2 justify-center">
                <img
                  v-for="(img, i) in form.images"
                  :key="i"
                  :src="img"
                  class="w-16 h-16 object-cover rounded border"
                />
              </div>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div class="flex flex-col gap-2">
              <Label>Late Fee (₱)</Label>
              <Input v-model.number="form.late_fee" type="number" min="0" />
            </div>
            <div class="flex flex-col gap-2">
              <Label>Damage Fee (₱)</Label>
              <Input v-model.number="form.damage_fee" type="number" min="0" />
            </div>
            <div class="flex flex-col gap-2">
              <Label>Cleaning Fee (₱)</Label>
              <Input v-model.number="form.cleaning_fee" type="number" min="0" />
            </div>
          </div>
          
          <div class="flex flex-col gap-2">
            <Label>Admin Condition Notes</Label>
            <Textarea
              v-model="form.condition_notes"
              placeholder="Admin assessment of vehicle condition, damages, or additional notes..."
            />
          </div>
          
          <!-- Deposit Refund Section -->
          <div class="mt-6 border-t pt-6">
            <h3 class="text-lg font-semibold mb-4">Security Deposit Refund</h3>
            <div class="space-y-4">
              <div class="bg-muted/50 border border-border rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span class="font-semibold text-foreground">Original Deposit:</span>
                    <span class="ml-2 text-foreground">₱{{ booking.vehicle?.deposit || 0 }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-foreground">Total Fees:</span>
                    <span class="ml-2 text-foreground">₱{{ totalFees }}</span>
                  </div>
                  <div>
                    <span class="font-semibold text-foreground">Refund Amount:</span>
                    <span class="ml-2 text-primary font-bold">₱{{ calculatedRefundAmount }}</span>
                  </div>
                </div>
              </div>
              
              <div class="flex flex-col gap-2">
                <Label>Deposit Status</Label>
                <select v-model="form.deposit_status" class="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                  <option value="pending">Pending Refund</option>
                  <option value="refunded">Refunded</option>
                  <option value="withheld">Withheld</option>
                </select>
              </div>
              
              <div v-if="form.deposit_status === 'refunded'" class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="flex flex-col gap-2">
                    <Label>Refund Amount (₱)</Label>
                    <Input 
                      v-model.number="form.deposit_refund_amount" 
                      type="number" 
                      min="0" 
                      :max="booking.vehicle?.deposit || 0"
                      :placeholder="calculatedRefundAmount.toString()"
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label>Refund Method</Label>
                    <select v-model="form.refund_method" class="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground">
                      <option value="">Select method</option>
                      <option value="cash">Cash</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="gcash">GCash</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div class="flex flex-col gap-2">
                  <Label>Refund Notes</Label>
                  <Textarea
                    v-model="form.deposit_refund_notes"
                    placeholder="Notes about the refund transaction..."
                  />
                </div>
                
                <div class="flex flex-col gap-2">
                  <Label>Refund Proof Photos</Label>
                  <div
                    class="border-2 border-dashed border-primary/40 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer bg-primary/5 hover:border-primary transition relative min-h-[96px]"
                    @dragover.prevent="isRefundDragging = true"
                    @dragleave.prevent="isRefundDragging = false"
                    @drop.prevent="handleRefundDrop"
                    :class="{ 'border-primary': isRefundDragging }"
                  >
                    <input
                      ref="refundFileInput"
                      type="file"
                      multiple
                      accept="image/*"
                      class="absolute inset-0 opacity-0 cursor-pointer"
                      @change="handleRefundFileChange"
                      @click.stop
                    />
                    <div v-if="!form.deposit_refund_proof.length && !isRefundDragging" class="flex flex-col items-center">
                      <span class="text-foreground text-sm font-medium"
                        >Upload proof of refund transaction</span
                      >
                      <span class="text-muted-foreground text-xs mt-1">
                        (Receipt, transfer confirmation, etc.)
                      </span>
                    </div>
                    <div v-if="isRefundDragging" class="flex flex-col items-center">
                      <span class="text-primary font-semibold">Drop refund proof files</span>
                    </div>
                    <div v-if="form.deposit_refund_proof.length" class="flex flex-wrap gap-2 mt-2 justify-center">
                      <img
                        v-for="(img, i) in form.deposit_refund_proof"
                        :key="i"
                        :src="img"
                        class="w-16 h-16 object-cover rounded border cursor-pointer"
                        @click="openImageModal(img)"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div v-else-if="form.deposit_status === 'withheld'" class="space-y-4">
                <div class="flex flex-col gap-2">
                  <Label>Reason for Withholding</Label>
                  <Textarea
                    v-model="form.deposit_refund_notes"
                    placeholder="Explain why the deposit is being withheld..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter class="mt-6">
          <Button type="button" variant="outline" @click="$emit('update:open', false)">
            Cancel
          </Button>
          <Button type="submit" :loading="isLoading">
            {{ isCustomerSubmitted ? 'Complete Return Processing' : 'Submit Return' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
    
    <!-- Image Modal -->
    <Dialog :open="imageModalOpen" @update:open="imageModalOpen = $event">
      <DialogContent class="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Vehicle Photo</DialogTitle>
        </DialogHeader>
        <div class="flex justify-center">
          <img :src="selectedImage" class="max-w-full max-h-[70vh] object-contain" />
        </div>
      </DialogContent>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useReturnVehicle } from '@/services/admin/vehicle-return-service'
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

const props = defineProps({
  booking: Object,
  open: Boolean,
})
const emit = defineEmits(['update:open', 'returned'])

const form = ref({
  odometer: '',
  fuel_level: '',
  condition_notes: '',
  images: [],
  late_fee: 0,
  damage_fee: 0,
  cleaning_fee: 0,
  // Deposit refund fields
  deposit_status: 'pending',
  deposit_refund_amount: 0,
  deposit_refund_notes: '',
  deposit_refund_proof: [],
  refund_method: '',
})

const isDragging = ref(false)
const isRefundDragging = ref(false)
const fileInput = ref(null)
const refundFileInput = ref(null)
const imageModalOpen = ref(false)
const selectedImage = ref('')

const isCustomerSubmitted = computed(() => {
  return props.booking?.vehicle_return?.status === 'customer_submitted'
})

const customerImages = computed(() => {
  return props.booking?.vehicle_return?.customer_images || []
})

const totalFees = computed(() => {
  return (form.value.late_fee || 0) + (form.value.damage_fee || 0) + (form.value.cleaning_fee || 0)
})

const calculatedRefundAmount = computed(() => {
  const depositAmount = props.booking?.vehicle?.deposit || 0
  return Math.max(0, depositAmount - totalFees.value)
})

// Auto-update refund amount when fees change and status is refunded
watch([totalFees, () => form.value.deposit_status], () => {
  if (form.value.deposit_status === 'refunded' && !form.value.deposit_refund_amount) {
    form.value.deposit_refund_amount = calculatedRefundAmount.value
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function openImageModal(imageSrc) {
  selectedImage.value = imageSrc
  imageModalOpen.value = true
}

watch(
  () => props.open,
  (val) => {
    if (val && props.booking) {
      const vehicleReturn = props.booking.vehicle_return
      
      form.value = {
        odometer: vehicleReturn?.odometer || '',
        fuel_level: vehicleReturn?.fuel_level || '',
        condition_notes: '',
        images: [],
        late_fee: vehicleReturn?.late_fee || 0,
        damage_fee: vehicleReturn?.damage_fee || 0,
        cleaning_fee: vehicleReturn?.cleaning_fee || 0,
        // Deposit refund fields
        deposit_status: vehicleReturn?.deposit_status || 'pending',
        deposit_refund_amount: vehicleReturn?.deposit_refund_amount || calculatedRefundAmount.value,
        deposit_refund_notes: vehicleReturn?.deposit_refund_notes || '',
        deposit_refund_proof: vehicleReturn?.deposit_refund_proof || [],
        refund_method: vehicleReturn?.refund_method || '',
      }
    }
  },
)

const { mutate: returnVehicle, isLoading } = useReturnVehicle()

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files)
  processFiles(files)
}

function processFiles(files) {
  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )
  Promise.all(readers).then((images) => {
    form.value.images = [...form.value.images, ...images]
  })
}

function handleRefundDrop(e) {
  isRefundDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processRefundFiles(files)
}

function handleRefundFileChange(e) {
  const files = Array.from(e.target.files)
  processRefundFiles(files)
}

function processRefundFiles(files) {
  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )
  Promise.all(readers).then((images) => {
    form.value.deposit_refund_proof = [...form.value.deposit_refund_proof, ...images]
  })
}

function handleSubmit() {
  if (!props.booking) return
  returnVehicle(
    { bookingId: props.booking.id, ...form.value },
    {
      onSuccess: () => {
        emit('update:open', false)
        emit('returned')
      },
    },
  )
}
</script>
