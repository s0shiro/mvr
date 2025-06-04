<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit' : 'Add' }} Business/Service</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex flex-col gap-2">
          <Label for="name">Name</Label>
          <Input id="name" v-model="form.name" placeholder="Business/Service Name" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="type">Type</Label>
          <select id="type" v-model="form.type" required class="input">
            <option value="resort">Resort</option>
            <option value="photography">Photography</option>
          </select>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="form.description"
            placeholder="Description (optional)"
            rows="3"
          />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" @click="closeModal">Cancel</Button>
          <Button type="submit" variant="primary" :disabled="isPending">
            {{ isPending ? (isEdit ? 'Updating...' : 'Adding...') : isEdit ? 'Update' : 'Add' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { createBusiness, updateBusiness } from '@/services/businessService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const props = defineProps({
  business: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'saved'])

const isOpen = ref(true)
const form = ref({ name: '', type: 'resort', description: '' })
const queryClient = useQueryClient()
const isPending = ref(false)

watch(
  () => props.business,
  (val) => {
    if (val) {
      form.value = { ...val }
      if (!form.value.type) form.value.type = 'resort'
    } else {
      form.value = { name: '', type: 'resort', description: '' }
    }
  },
  { immediate: true },
)

function closeModal() {
  isOpen.value = false
  setTimeout(() => emit('close'), 200)
}

const mutationCreate = useMutation({
  mutationFn: createBusiness,
  onSuccess: () => {
    queryClient.invalidateQueries(['businesses'])
    emit('saved')
  },
})
const mutationUpdate = useMutation({
  mutationFn: updateBusiness,
  onSuccess: () => {
    queryClient.invalidateQueries(['businesses'])
    emit('saved')
  },
})

function handleSubmit() {
  isPending.value = true
  if (props.isEdit) {
    mutationUpdate.mutate(
      { id: form.value.id, ...form.value },
      { onSettled: () => (isPending.value = false) },
    )
  } else {
    mutationCreate.mutate(form.value, { onSettled: () => (isPending.value = false) })
  }
}
</script>
