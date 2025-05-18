<script setup>
import { RouterView } from 'vue-router'
import { VueQueryDevtools } from '@tanstack/vue-query-devtools'
import { Toaster } from '@/components/ui/sonner'
</script>

<template>
  <Toaster />
  <VueQueryDevtools />
  <RouterView />
</template>

<style scoped></style>
