<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="space-y-2">
      <h1 class="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
      <p class="text-muted-foreground text-sm">Operational overview and recent platform activity</p>
    </div>

    <!-- States -->
    <div v-if="isLoading" class="h-40">
      <Loading text="Loading admin dashboard..." />
    </div>
    <div v-else-if="isError">
      <Alert variant="destructive" class="max-w-lg">
        <AlertCircle class="h-4 w-4" />
        <AlertTitle>Failed to load</AlertTitle>
        <AlertDescription>{{ error?.message || 'Could not load admin dashboard.' }}</AlertDescription>
      </Alert>
    </div>
    <div v-else-if="data" class="space-y-8">
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-vue-next'

const { data, isLoading, isError, error } = useAdminOverview()

defineExpose({ data, isLoading, isError, error })
</script>
