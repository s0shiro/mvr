<template>
  <div class="">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold">{{ business?.name }}</h1>
        <span v-if="business?.type" class="text-xs font-bold uppercase text-primary">{{
          business.type
        }}</span>
        <p class="text-muted-foreground mt-1">{{ business?.description }}</p>
      </div>
      <Button variant="outline" @click="goBack">Back</Button>
    </div>
    <div class="mb-8">
      <BusinessSalesTable
        v-if="business"
        :business-id="business.id"
        :business-type="business.type"
      />
      <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
        <Loading text="Loading business..." />
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import BusinessSalesTable from '@/components/features/BusinessSalesTable.vue'
import Loading from '@/components/features/Loading.vue'
import { useQuery } from '@tanstack/vue-query'
import axiosInstance from '@/lib/axiosInstance'

const route = useRoute()
const router = useRouter()

const { data: business, isLoading } = useQuery({
  queryKey: ['business', route.params.id],
  queryFn: () => axiosInstance.get(`/api/businesses/${route.params.id}`).then((res) => res.data),
})

function goBack() {
  router.back()
}
</script>
