<template>
  <div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading admin dashboard..." />
    </div>
    <div v-else-if="isError">
      <div class="text-destructive">
        Error: {{ error?.message || 'Failed to load admin dashboard.' }}
      </div>
    </div>
    <div v-else-if="data">
      <AdminDashboardAlerts :alerts="data.alerts" />
      <AdminDashboardSummary :summary="data.summary" />
      <AdminDashboardRecent
        :bookings="data.recent.bookings"
        :payments="data.recent.payments"
        :feedback="data.recent.feedback"
      />
    </div>
  </div>
</template>

<script setup>
import { useAdminOverview } from '@/services/useAdminOverview'
import AdminDashboardSummary from './admin-dashboard/AdminDashboardSummary.vue'
import AdminDashboardRecent from './admin-dashboard/AdminDashboardRecent.vue'
import AdminDashboardAlerts from './admin-dashboard/AdminDashboardAlerts.vue'
import Loading from './Loading.vue'

const { data, isLoading, isError, error } = useAdminOverview()

defineExpose({ data, isLoading, isError, error })
</script>
