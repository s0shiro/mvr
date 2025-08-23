<script setup>
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bell } from 'lucide-vue-next'
import { useNotifications } from '@/services/useNotifications'
import { format } from 'date-fns'
import { RouterLink } from 'vue-router'
import { computed } from 'vue'

const {
  data: notifications,
  isLoading,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  markAsRead,
  markAllAsRead,
  unreadCount,
  isUnreadCountLoading,
} = useNotifications()

const formatDate = (date) => {
  return format(new Date(date), 'MMM d, yyyy h:mm a')
}
</script>

<template>
  <Popover>
    <PopoverTrigger asChild>
      <Button variant="ghost" size="icon" class="relative">
        <Bell class="h-5 w-5" />
        <!-- Notification badge -->
        <span
          v-if="!isUnreadCountLoading && unreadCount > 0"
          class="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] text-destructive-foreground flex items-center justify-center"
        >
          {{ unreadCount }}
        </span>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-80 p-0" align="end">
      <div class="flex items-center justify-between p-4 border-b">
        <h4 class="font-semibold">Notifications</h4>
        <Button
          v-if="notifications?.notifications?.some((n) => !n.read_at)"
          variant="ghost"
          size="sm"
          @click="markAllAsRead"
        >
          Mark all as read
        </Button>
      </div>
      <ScrollArea class="h-[300px]">
        <div v-if="isLoading" class="p-4 text-center text-muted-foreground">Loading...</div>
        <div
          v-else-if="!notifications?.notifications?.length"
          class="p-4 text-center text-muted-foreground"
        >
          No notifications
        </div>
        <div v-else>
          <button
            v-for="notification in notifications.notifications"
            :key="notification.id"
            class="w-full text-left p-4 border-b hover:bg-muted/50 transition-colors"
            :class="{ 'bg-muted/20': !notification.read_at }"
            @click="markAsRead(notification.id)"
          >
            <p class="text-sm font-medium">{{ notification.data.message }}</p>

            <!-- Common notification data -->
            <div class="text-xs text-muted-foreground mt-1">
              <p v-if="notification.data.customer_name">
                Customer: {{ notification.data.customer_name }}
              </p>

              <!-- Booking notification specific data -->
              <template v-if="notification.type === 'booking_created'">
                <p>
                  Booking Period: {{ formatDate(notification.data.start_date) }} -
                  {{ formatDate(notification.data.end_date) }}
                </p>
              </template>

              <!-- Payment notification specific data -->
              <template
                v-if="['payment_submitted', 'payment_status_updated'].includes(notification.type)"
              >
                <p>
                  <span class="capitalize">{{ notification.data.payment_type }}</span> Payment
                  <template v-if="notification.data.payment_method">
                    via {{ notification.data.payment_method }}
                  </template>
                </p>
                <p v-if="notification.data.payment_status" class="capitalize">
                  Status: {{ notification.data.payment_status }}
                </p>
                <RouterLink
                  v-if="notification.data.frontend_url"
                  :to="{
                    name: 'admin-booking-details',
                    params: { id: notification.data.booking_id },
                  }"
                  class="text-primary underline text-xs mt-1 inline-block"
                  @click.stop
                >
                  View Booking
                </RouterLink>
              </template>

              <!-- Vehicle released notification specific data -->
              <template v-if="notification.type === 'vehicle_released'">
                <p v-if="notification.data.vehicle">Vehicle: {{ notification.data.vehicle }}</p>
                <p>Booking #: {{ notification.data.booking_id }}</p>
                <p>
                  Period: {{ formatDate(notification.data.start_date) }} -
                  {{ formatDate(notification.data.end_date) }}
                </p>
              </template>

              <!-- Vehicle return submitted notification specific data -->
              <template v-if="notification.type === 'vehicle_return_submitted'">
                <p v-if="notification.data.vehicle_name">Vehicle: {{ notification.data.vehicle_name }}</p>
                <p>Booking #: {{ notification.data.booking_id }}</p>
                <p v-if="notification.data.customer_images_count">
                  Photos submitted: {{ notification.data.customer_images_count }}
                </p>
              </template>

              <!-- Vehicle return completed notification specific data -->
              <template v-if="notification.type === 'vehicle_return_completed'">
                <p v-if="notification.data.vehicle_name">Vehicle: {{ notification.data.vehicle_name }}</p>
                <p>Booking #: {{ notification.data.booking_id }}</p>
                <div v-if="notification.data.total_additional_fees > 0" class="mt-1">
                  <p class="text-red-600 font-medium">Additional Fees: ₱{{ notification.data.total_additional_fees }}</p>
                  <div class="text-xs">
                    <span v-if="notification.data.late_fee > 0">Late: ₱{{ notification.data.late_fee }}</span>
                    <span v-if="notification.data.damage_fee > 0" class="ml-2">Damage: ₱{{ notification.data.damage_fee }}</span>
                    <span v-if="notification.data.cleaning_fee > 0" class="ml-2">Cleaning: ₱{{ notification.data.cleaning_fee }}</span>
                  </div>
                </div>
                <div v-if="notification.data.deposit_status" class="mt-1">
                  <p class="font-medium">
                    Deposit: 
                    <span :class="{
                      'text-green-600': notification.data.deposit_status === 'refunded',
                      'text-red-600': notification.data.deposit_status === 'withheld',
                      'text-yellow-600': notification.data.deposit_status === 'pending'
                    }">
                      {{ notification.data.deposit_status === 'refunded' ? 'Refunded' : 
                         notification.data.deposit_status === 'withheld' ? 'Withheld' : 'Pending' }}
                    </span>
                  </p>
                  <p v-if="notification.data.deposit_refund_amount && notification.data.deposit_status === 'refunded'" 
                     class="text-xs text-green-600">
                    Amount: ₱{{ notification.data.deposit_refund_amount }}
                    <span v-if="notification.data.refund_method"> via {{ notification.data.refund_method }}</span>
                  </p>
                </div>
              </template>

              <!-- Deposit refund processed notification specific data -->
              <template v-if="notification.type === 'deposit_refund_processed'">
                <p v-if="notification.data.vehicle_name">Vehicle: {{ notification.data.vehicle_name }}</p>
                <p>Booking #: {{ notification.data.booking_id }}</p>
                <div class="mt-1">
                  <p class="font-medium">
                    Status: 
                    <span :class="{
                      'text-green-600': notification.data.deposit_status === 'refunded',
                      'text-red-600': notification.data.deposit_status === 'withheld'
                    }">
                      {{ notification.data.deposit_status === 'refunded' ? 'Refunded' : 'Withheld' }}
                    </span>
                  </p>
                  <p v-if="notification.data.deposit_refund_amount && notification.data.deposit_status === 'refunded'" 
                     class="text-xs text-green-600">
                    Amount: ₱{{ notification.data.deposit_refund_amount }}
                    <span v-if="notification.data.refund_method"> via {{ notification.data.refund_method }}</span>
                  </p>
                </div>
              </template>
            </div>

            <div class="flex items-center gap-2 mt-1">
              <span class="text-xs text-muted-foreground">
                {{ formatDate(notification.created_at) }}
              </span>
              <span
                v-if="!notification.read_at"
                class="text-[10px] font-medium text-primary px-1.5 py-0.5 rounded-full bg-primary/10"
              >
                New
              </span>
            </div>
          </button>
          <div class="flex justify-center mt-2">
            <Button
              v-if="hasNextPage"
              @click="fetchNextPage"
              :disabled="isFetchingNextPage"
              variant="outline"
              size="sm"
            >
              <span v-if="isFetchingNextPage">Loading...</span>
              <span v-else>Load More</span>
            </Button>
          </div>
        </div>
      </ScrollArea>
    </PopoverContent>
  </Popover>
</template>
