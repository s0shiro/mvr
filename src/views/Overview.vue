<script setup>
import { computed } from 'vue'
import { useUserAuth } from '@/services/useUserAuth'
import AdminDashboard from '@/components/features/AdminDashboard.vue'
import ManagerDashboard from '@/components/features/ManagerDashboard.vue'
import CustomerDashboard from '@/components/features/CustomerDashboard.vue'
import Loading from '@/components/features/Loading.vue'

const { role, isLoading: isAuthLoading } = useUserAuth()
const dashboardRole = computed(() => (role && typeof role === 'function' ? role() : role))
</script>

<template>
  <div>
    <div v-if="isAuthLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading dashboard..." />
    </div>
    <div v-else>
      <template v-if="dashboardRole === 'admin'">
        <AdminDashboard />
      </template>
      <template v-else-if="dashboardRole === 'manager'">
        <ManagerDashboard />
      </template>
      <template v-else-if="dashboardRole === 'customer'">
        <CustomerDashboard />
      </template>
      <template v-else>
        <div class="text-muted-foreground">No dashboard available for your role.</div>
      </template>
    </div>
  </div>
</template>
