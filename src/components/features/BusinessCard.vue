<template>
  <Card
    class="business-card rounded-xl border bg-card text-card-foreground shadow-md hover:shadow-xl transition overflow-hidden"
  >
    <CardHeader class="flex flex-col gap-1 pb-2">
      <div class="flex items-center justify-between w-full">
        <div>
          <CardTitle class="text-lg font-semibold leading-tight mb-1 truncate">{{
            business.name
          }}</CardTitle>
          <CardDescription class="text-muted-foreground text-sm line-clamp-2">
            {{ business.description || 'No description provided.' }}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost" size="icon" class="ml-2">
              <Ellipsis class="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="min-w-[160px]">
            <DropdownMenuItem @click="$emit('view', business)">
              <span class="pr-2">View</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('edit', business)">
              <span class="pr-2">Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('delete', business.id)">
              <span class="pr-2">Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
  </Card>
</template>

<script setup>
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Ellipsis } from 'lucide-vue-next'

const props = defineProps({
  business: { type: Object, required: true },
})
</script>

<style scoped>
.business-card {
  background-color: var(--color-card);
  color: var(--color-card-foreground);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 2;
}
</style>
