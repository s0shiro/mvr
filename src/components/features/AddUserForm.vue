<script setup>
import { ref, watch } from 'vue'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { addUser } from '@/services/userService'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const emit = defineEmits(['success', 'cancel'])
const isOpen = ref(true)
const form = ref({
  username: '',
  name: '',
  email: '',
  password: '',
  role: '',
})
const error = ref(null)
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: addUser,
  onSuccess: () => {
    queryClient.invalidateQueries(['users'])
    emit('success')
  },
  onError: (err) => {
    error.value = err.response?.data?.message || 'Failed to add user.'
  },
})

function closeModal() {
  isOpen.value = false
  setTimeout(() => emit('cancel'), 200)
}

function submit() {
  error.value = null
  mutation.mutate({ ...form.value })
}
</script>

<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add User</DialogTitle>
      </DialogHeader>
      <form @submit.prevent="submit" class="space-y-4">
        <div class="flex flex-col gap-2">
          <Label for="username">Username</Label>
          <Input id="username" v-model="form.username" placeholder="Username" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="name">Full Name</Label>
          <Input id="name" v-model="form.name" placeholder="Full Name" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="email">Email</Label>
          <Input id="email" v-model="form.email" placeholder="Email" type="email" required />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="form.password"
            placeholder="Password"
            type="password"
            required
          />
        </div>
        <div class="flex flex-col gap-2">
          <Label for="role">Role</Label>
          <Select v-model="form.role" required>
            <SelectTrigger>
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="manager">Manager</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div v-if="error" class="text-red-500 text-sm">{{ error }}</div>
        <div class="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" @click="closeModal">Cancel</Button>
          <Button type="submit" variant="primary" :disabled="mutation.isLoading">
            {{ mutation.isLoading ? 'Adding...' : 'Add User' }}
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>
