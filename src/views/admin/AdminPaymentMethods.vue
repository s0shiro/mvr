<template>
  <div class="">
    <h1 class="text-2xl font-bold mb-4">Manage Payment Methods</h1>
    <div class="mb-6">
      <Button @click="openAddDialog" class="mb-4">Add Payment Method</Button>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading payment methods..." />
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <PaymentMethodCard
        v-for="method in paymentMethods"
        :key="method.id"
        :method="method"
        @edit="openEditDialog"
        @delete="deleteMethod"
      />
      <div v-if="!paymentMethods.length" class="col-span-full text-center py-4">
        No payment methods found.
      </div>
    </div>
    <PaymentMethodDialog
      :open="showDialog"
      :isEdit="isEdit"
      :paymentMethod="selectedMethod"
      :loading="dialogLoading"
      :error="dialogError"
      @close="closeDialog"
      @submit="handleDialogSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useQuery, useMutation, useQueryClient } from '@tanstack/vue-query'
import {
  fetchPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
} from '@/services/payment-method-service'
import { Button } from '@/components/ui/button'
import PaymentMethodDialog from '@/components/features/PaymentMethodDialog.vue'
import PaymentMethodCard from '@/components/features/PaymentMethodCard.vue'
import Loading from '@/components/features/Loading.vue'

const form = ref({
  key: '',
  label: '',
  account_name: '',
  account_number: '',
  bank_name: '',
  id: null,
})

const queryClient = useQueryClient()

const { data, isLoading } = useQuery({
  queryKey: ['payment-methods'],
  queryFn: fetchPaymentMethods,
})

const paymentMethods = computed(() => data.value || [])

const mutationCreate = useMutation({
  mutationFn: createPaymentMethod,
  onSuccess: () => queryClient.invalidateQueries(['payment-methods']),
})
const mutationUpdate = useMutation({
  mutationFn: updatePaymentMethod,
  onSuccess: () => queryClient.invalidateQueries(['payment-methods']),
})
const mutationDelete = useMutation({
  mutationFn: deletePaymentMethod,
  onSuccess: () => queryClient.invalidateQueries(['payment-methods']),
})

const showDialog = ref(false)
const isEdit = ref(false)
const selectedMethod = ref(null)
const dialogError = ref('')
const dialogLoading = ref(false)

function openAddDialog() {
  selectedMethod.value = null
  isEdit.value = false
  dialogError.value = ''
  showDialog.value = true
}
function openEditDialog(method) {
  selectedMethod.value = { ...method }
  isEdit.value = true
  dialogError.value = ''
  showDialog.value = true
}
function closeDialog() {
  showDialog.value = false
  dialogError.value = ''
}
async function handleDialogSubmit(data) {
  dialogLoading.value = true
  dialogError.value = ''
  try {
    if (isEdit.value && data.id) {
      await mutationUpdate.mutateAsync({ ...data })
    } else {
      await mutationCreate.mutateAsync({ ...data })
    }
    closeDialog()
  } catch (e) {
    dialogError.value = e?.response?.data?.message || 'Failed to save payment method.'
  } finally {
    dialogLoading.value = false
  }
}

async function deleteMethod(id) {
  if (confirm('Delete this payment method?')) {
    await mutationDelete.mutateAsync(id)
  }
}
</script>
