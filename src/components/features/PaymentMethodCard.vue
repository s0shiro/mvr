<template>
  <div
    class="rounded-lg border bg-card p-4 shadow flex flex-col gap-2 relative"
  >
    <div class="flex items-center justify-between mb-2">
      <div class="font-bold text-lg">{{ method.label }}</div>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="ghost" size="icon" class="size-8"><Ellipsis class="w-5 h-5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem @click="$emit('edit', method)">Edit</DropdownMenuItem>
          <DropdownMenuItem class="text-destructive" @click="$emit('delete', method.id)">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="text-xs text-muted-foreground mb-1">Key: <span class="font-mono">{{ method.key }}</span></div>
    <div class="flex flex-col gap-1">
      <div class="flex justify-between">
        <span class="text-muted-foreground">Account Name</span>
        <span class="font-medium">{{ method.account_name }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted-foreground">Account Number</span>
        <span class="font-medium">{{ method.account_number }}</span>
      </div>
      <div v-if="method.bank_name" class="flex justify-between">
        <span class="text-muted-foreground">Bank Name</span>
        <span class="font-medium">{{ method.bank_name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Ellipsis } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

defineProps({ method: Object })

defineEmits(['edit', 'delete'])
</script>
