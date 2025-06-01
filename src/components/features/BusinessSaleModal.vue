<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ isEdit ? 'Edit' : 'Add' }} Sale/Note</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="flex flex-col gap-2">
          <Label for="date">Date</Label>
          <Popover>
            <PopoverTrigger as-child>
              <Button
                variant="outline"
                :class="'justify-start text-left font-normal ' + (!form.date ? 'text-muted-foreground' : '')"
                type="button"
              >
                <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
                <span v-if="calendarDate">{{ df.format(calendarDate.toDate(getLocalTimeZone())) }}</span>
                <span v-else>Pick a date</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent class="w-auto p-0">
              <Calendar
                v-model="calendarDate"
                initial-focus
                :max-value="intlToday(getLocalTimeZone())"
                @update:model-value="onCalendarChange"
              />
            </PopoverContent>
          </Popover>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="amount">Amount</Label>
          <Input id="amount" v-model="form.amount" type="number" step="0.01" placeholder="0.00" />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="type">Type</Label>
          <Select v-model="form.type">
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Type</SelectLabel>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="note">Note</SelectItem>
                <SelectItem value="refund">Refund</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div class="flex flex-col gap-2">
          <Label for="note">Note</Label>
          <Textarea id="note" v-model="form.note" placeholder="Details or remarks..." rows="3" />
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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { createBusinessSale, updateBusinessSale } from '@/services/businessSalesService'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, parseDate, today as intlToday } from '@internationalized/date'

const props = defineProps({
  businessId: { type: [String, Number], required: true },
  sale: { type: Object, default: null },
  isEdit: { type: Boolean, default: false },
})
const emit = defineEmits(['close', 'saved'])

const isOpen = ref(true)
const form = ref({ date: '', amount: '', type: 'sale', note: '' })
const queryClient = useQueryClient()
const isPending = ref(false)
const df = new DateFormatter('en-US', { dateStyle: 'long' })

// Use CalendarDate for calendarDate
const calendarDate = ref()

watch(
  () => props.sale,
  (val) => {
    if (val) {
      form.value = { ...val }
      calendarDate.value = val.date ? parseDate(val.date) : undefined
    } else {
      form.value = { date: '', amount: '', type: 'sale', note: '' }
      calendarDate.value = undefined
    }
  },
  { immediate: true },
)

function closeModal() {
  isOpen.value = false
  setTimeout(() => emit('close'), 200)
}

const mutationCreate = useMutation({
  mutationFn: (payload) => createBusinessSale({ businessId: props.businessId, ...payload }),
  onSuccess: () => {
    queryClient.invalidateQueries(['business-sales', props.businessId])
    emit('saved')
  },
})
const mutationUpdate = useMutation({
  mutationFn: (payload) => updateBusinessSale({ businessId: props.businessId, ...payload }),
  onSuccess: () => {
    queryClient.invalidateQueries(['business-sales', props.businessId])
    emit('saved')
  },
})

function onCalendarChange(v) {
  calendarDate.value = v
  if (v) {
    form.value.date = v.toString() // YYYY-MM-DD
  } else {
    form.value.date = ''
  }
}

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
