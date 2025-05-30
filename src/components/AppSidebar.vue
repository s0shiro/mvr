<script setup>
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import { useAuthStore } from '@/stores/authStore'
import { computed } from 'vue'
import { GalleryVerticalEnd } from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false },
  class: { type: null, required: false },
})

const authStore = useAuthStore()

const data = {
  navMain: [
    {
      title: 'Getting Started',
      url: '',
      items: [
        {
          title: 'Overview',
          url: '/overview',
        },
        {
          title: 'Vehicles',
          url: '/vehicles',
        },
      ],
    },
    {
      title: 'Booking',
      url: '',
      items: [
        {
          title: 'My Bookings',
          url: '/my-bookings',
        },
        {
          title: 'Completed Bookings',
          url: '/my-completed-bookings',
        },
      ],
      roleRequired: 'customer',
    },
    {
      title: 'Administration',
      url: '',
      items: [
        {
          title: 'Users',
          url: '/users',
        },
        {
          title: 'Manage Bookings',
          url: '/admin/bookings',
        },
        {
          title: 'Vehicle Releases',
          url: '/admin/vehicle-releases',
        },
        {
          title: 'Vehicle Returns',
          url: '/admin/vehicle-returns',
        },
        {
          title: 'Completed Bookings',
          url: '/admin/completed-bookings',
        },
      ],
      roleRequired: 'admin',
    },
  ],
}

// Filter navigation items based on role requirements
const filteredNavMain = computed(() => {
  return data.navMain.filter((item) => {
    return !item.roleRequired || authStore.hasRole(item.roleRequired)
  })
})
</script>

<template>
  <Sidebar v-bind="props">
    <SidebarHeader>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" as-child>
            <RouterLink to="/">
              <div
                class="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground"
              >
                <img src="@/assets/mvr-logo.png" alt="MVR Logo" class="size-8" />
              </div>
              <div class="flex flex-col gap-0.5 leading-none">
                <span class="font-medium">Worth a Ride</span>
                <span class=""></span>
              </div>
            </RouterLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
    <SidebarContent>
      <SidebarGroup>
        <SidebarMenu>
          <SidebarMenuItem v-for="item in filteredNavMain" :key="item.title">
            <SidebarMenuButton as-child>
              <RouterLink :to="item.url" class="font-medium">
                {{ item.title }}
              </RouterLink>
            </SidebarMenuButton>
            <SidebarMenuSub v-if="item.items.length">
              <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                <SidebarMenuSubButton as-child :is-active="childItem.isActive">
                  <RouterLink :to="childItem.url">{{ childItem.title }}</RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <SidebarRail />
  </Sidebar>
</template>
