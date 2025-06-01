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
import {
  GalleryVerticalEnd,
  Home,
  Book,
  Users,
  Car,
  ClipboardList,
  LogOut,
  UserCircle,
  Clock3,
} from 'lucide-vue-next'
import { RouterLink, useRoute } from 'vue-router'

const props = defineProps({
  side: { type: String, required: false },
  variant: { type: String, required: false },
  collapsible: { type: String, required: false },
  class: { type: null, required: false },
})

const authStore = useAuthStore()
const route = useRoute()

const data = {
  navMain: [
    {
      title: 'Getting Started',
      url: '',
      icon: Home,
      items: [
        { title: 'Overview', url: '/overview', icon: ClipboardList },
        { title: 'Vehicles', url: '/vehicles', icon: Car },
      ],
    },
    {
      title: 'Booking',
      url: '',
      icon: Book,
      items: [{ title: 'My Bookings', url: '/my-bookings', icon: ClipboardList }],
      roleRequired: 'customer',
    },
    {
      title: 'Administration',
      url: '',
      icon: Users,
      items: [
        { title: 'Users', url: '/users', icon: Users },
        { title: 'Manage Bookings', url: '/admin/bookings', icon: ClipboardList },
      ],
      roleRequired: 'admin',
    },

    {
      title: 'Bookings',
      url: '',
      icon: ClipboardList,
      items: [
        { title: 'Vehicle Releases', url: '/admin/vehicle-releases', icon: Car },
        { title: 'Vehicle Returns', url: '/admin/vehicle-returns', icon: Car },
      ],
      roleRequired: 'admin',
    },
    {
      title: 'History',
      url: '',
      icon: Clock3,
      items: [
        {
          title: 'Completed Bookings',
          url: computed(() =>
            authStore.hasRole('admin') ? '/admin/completed-bookings' : '/my-completed-bookings',
          ),
          icon: ClipboardList,
        },
      ],
    },
    {
      title: 'Business/Services',
      url: '/admin/businesses',
      icon: ClipboardList,
      items: [],
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

// Highlight active route
function isActive(url) {
  return url && route.path.startsWith(url)
}
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
                <span class="font-bold text-lg">Worth a Ride</span>
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
              <RouterLink :to="item.url" class="font-semibold text-base flex items-center gap-2">
                <component :is="item.icon" class="w-5 h-5" />
                <span
                  class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                  >{{ item.title }}</span
                >
              </RouterLink>
            </SidebarMenuButton>
            <SidebarMenuSub v-if="item.items.length">
              <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                <SidebarMenuSubButton as-child :is-active="isActive(childItem.url)">
                  <RouterLink :to="childItem.url" class="flex items-center gap-2 text-base">
                    <component :is="childItem.icon" class="w-5 h-5" />
                    <span>{{ childItem.title }}</span>
                  </RouterLink>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            </SidebarMenuSub>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarGroup>
    </SidebarContent>
    <!-- User Info at the bottom -->
    <div class="flex items-center gap-2 m-4 mt-auto p-2 rounded-lg">
      <UserCircle class="w-8 h-8" />
      <div class="flex flex-col">
        <span class="font-bold text-base">{{ authStore.user?.name || 'Guest' }}</span>
        <span class="text-sm text-muted-foreground">{{ authStore.user?.role || 'User' }}</span>
      </div>
    </div>
    <SidebarRail />
  </Sidebar>
</template>
