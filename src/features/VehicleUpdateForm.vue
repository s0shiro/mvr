<template>
  <div>
    <form @submit.prevent="onSubmit">
      <div v-for="field in fields" :key="field.key" class="mb-4">
        <label :for="field.key" class="block font-medium mb-1">{{ field.label }}</label>
        <input
          v-model="form[field.key]"
          :id="field.key"
          :type="field.type || 'text'"
          class="border rounded px-3 py-2 w-full"
          :placeholder="field.placeholder"
          :required="field.required !== false"
        />
      </div>
      <div class="flex justify-end gap-2">
        <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          type="submit"
          :disabled="isLoading"
          class="px-4 py-2 bg-blue-600 text-white rounded"
        >
          <span v-if="isLoading">Updating...</span>
          <span v-else>Update</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useUpdateVehicle } from '@/services/vehicle-service'

const props = defineProps({
  vehicle: { type: Object, required: true },
})
const emit = defineEmits(['updated', 'close'])

const form = ref({ ...props.vehicle })

watch(
  () => props.vehicle,
  (val) => {
    form.value = { ...val }
  },
  { immediate: true },
)

const fields = [
  { key: 'make', label: 'Make', placeholder: 'Toyota' },
  { key: 'model', label: 'Model', placeholder: 'Corolla' },
  { key: 'year', label: 'Year', type: 'number', placeholder: '2020' },
  { key: 'color', label: 'Color', placeholder: 'Red' },
  // Add more fields as needed
]

const { mutate: updateVehicle, isLoading } = useUpdateVehicle()

function onSubmit() {
  updateVehicle(
    { vehicleId: props.vehicle.id, vehicleData: form.value },
    {
      onSuccess: (data) => {
        emit('updated', data)
        emit('close')
      },
    },
  )
}
</script>
