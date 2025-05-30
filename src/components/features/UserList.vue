<script setup>
import { defineProps } from 'vue'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import Loading from '@/components/features/Loading.vue'

const props = defineProps({
  users: Array,
  isLoading: Boolean,
  isFetchingNextPage: Boolean,
  fetchNextPage: Function,
  hasNextPage: Boolean,
})

const getRoleBadgeVariant = (role) => {
  switch (role?.toLowerCase()) {
    case 'admin':
      return 'destructive'
    case 'manager':
      return 'default'
    default:
      return 'secondary'
  }
}
</script>

<template>
  <div>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <template v-if="Array.isArray(props.users) && props.users.length">
        <div
          v-for="user in props.users"
          :key="user.id"
          class="p-4 rounded-lg border bg-card hover:shadow-lg transition-shadow space-y-3"
        >
          <div class="flex justify-between items-start">
            <div class="space-y-1">
              <h3 class="font-semibold text-lg">{{ user.name }}</h3>
              <p class="text-sm text-muted-foreground">@{{ user.username }}</p>
            </div>
            <Badge :variant="getRoleBadgeVariant(user.role)" class="capitalize">
              {{ user.role }}
            </Badge>
          </div>
          <div class="space-y-2">
            <div class="flex items-center space-x-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-muted-foreground"
              >
                <path
                  d="M22 20v-7.826a4 4 0 0 0-1.253-2.908l-7.373-6.968a2 2 0 0 0-2.748 0L3.253 9.266A4 4 0 0 0 2 12.174V20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"
                />
              </svg>
              <span class="text-muted-foreground">{{ user.email }}</span>
            </div>
            <div class="flex items-center space-x-2 text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-muted-foreground"
              >
                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <span class="text-muted-foreground">ID: {{ user.id }}</span>
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="!props.isLoading">
        <div class="col-span-full text-center py-8 text-muted-foreground">No users found.</div>
      </template>
      <template v-else>
        <div v-for="i in 6" :key="i" class="p-4 rounded-lg border bg-card space-y-4">
          <div class="space-y-2">
            <Skeleton class="h-5 w-3/4" />
            <Skeleton class="h-4 w-1/2" />
          </div>
          <div class="space-y-2">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-4/5" />
          </div>
        </div>
      </template>
    </div>

    <!-- Load More Button -->
    <div class="flex justify-center mt-6">
      <Button
        v-if="props.hasNextPage"
        @click="props.fetchNextPage"
        :disabled="props.isFetchingNextPage"
        variant="outline"
      >
        <template v-if="props.isFetchingNextPage">
          <div class="flex items-center gap-2">
            <Loading size="sm" text="" />
          </div>
        </template>
        <template v-else>Load More</template>
      </Button>
    </div>

    <!-- Loading State -->
    <div
      v-if="props.isLoading && !props.users?.length"
      class="text-center py-4 text-muted-foreground"
    >
      Loading users...
    </div>
  </div>
</template>
