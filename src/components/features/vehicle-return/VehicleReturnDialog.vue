<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-lg w-full">
      <DialogHeader>
        <DialogTitle>Process Vehicle Return</DialogTitle>
        <DialogDescription>
          Please fill out the return details and assess the vehicle condition.
        </DialogDescription>
      </DialogHeader>
      <form @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <Label>Odometer</Label>
            <Input v-model="form.odometer" type="number" min="0" placeholder="Odometer reading" />
          </div>
          <div>
            <Label>Fuel Level</Label>
            <Input v-model="form.fuel_level" placeholder="e.g. Full, 3/4, Half" />
          </div>
          <div>
            <Label>Condition Notes</Label>
            <Textarea
              v-model="form.condition_notes"
              placeholder="Describe any issues, damages, or notes..."
            />
          </div>
          <div>
            <Label>Return Photos</Label>
            <Input type="file" multiple @change="handleFileChange" />
            <div v-if="form.images.length" class="flex flex-wrap gap-2 mt-2">
              <img
                v-for="(img, i) in form.images"
                :key="i"
                :src="img"
                class="w-16 h-16 object-cover rounded border"
              />
            </div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <Label>Late Fee (₱)</Label>
              <Input v-model.number="form.late_fee" type="number" min="0" />
            </div>
            <div>
              <Label>Damage Fee (₱)</Label>
              <Input v-model.number="form.damage_fee" type="number" min="0" />
            </div>
            <div>
              <Label>Cleaning Fee (₱)</Label>
              <Input v-model.number="form.cleaning_fee" type="number" min="0" />
            </div>
          </div>
        </div>
        <DialogFooter class="mt-6">
          <Button type="button" variant="outline" @click="$emit('update:open', false)"
            >Cancel</Button
          >
          <Button type="submit" :loading="isLoading">Submit Return</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
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
})

watch(
  () => props.open,
  (val) => {
    if (val) {
      form.value = {
        odometer: '',
        fuel_level: '',
        condition_notes: '',
        images: [],
        late_fee: 0,
        damage_fee: 0,
        cleaning_fee: 0,
      }
    }
  },
)

const { mutate: returnVehicle, isLoading } = useReturnVehicle()

function handleFileChange(e) {
  const files = Array.from(e.target.files)
  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )
  Promise.all(readers).then((images) => {
    form.value.images = images
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
