<template>
  <Dialog :open="open" @update:open="onClose">
    <DialogContent class="sm:max-w-[400px]">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit' : 'Add' }} Payment Method</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <Input v-model="localForm.key" placeholder="Key (e.g. gcash)" required :disabled="isEdit" />
        <Input v-model="localForm.label" placeholder="Label (e.g. GCash)" required />
        <Input v-model="localForm.account_name" placeholder="Account Name" required />
        <Input v-model="localForm.account_number" placeholder="Account Number" required />
        <Input v-model="localForm.bank_name" placeholder="Bank Name (optional)" />
        <div class="flex gap-2 mt-2">
          <Button type="submit" :disabled="loading">{{ isEdit ? 'Update' : 'Add' }}</Button>
          <Button type="button" variant="secondary" @click="onClose">Cancel</Button>
        </div>
        <div v-if="error" class="text-destructive text-xs">{{ error }}</div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const props = defineProps({
  open: Boolean,
  isEdit: Boolean,
  paymentMethod: Object,
  loading: Boolean,
  error: String,
})
const emit = defineEmits(['close', 'submit'])

const localForm = ref({
  key: '',
  label: '',
  account_name: '',
  account_number: '',
  bank_name: '',
})

watch(
  () => props.paymentMethod,
  (val) => {
    if (val) {
      localForm.value = { ...val }
    } else {
      localForm.value = { key: '', label: '', account_name: '', account_number: '', bank_name: '' }
    }
  },
  { immediate: true },
)

function onClose() {
  emit('close')
}

function handleSubmit() {
  emit('submit', { ...localForm.value })
}
</script>
