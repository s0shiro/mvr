<script setup>
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import AppSidebar from '@/components/AppSidebar.vue'
import { useRoute, RouterLink } from 'vue-router'
import { ref } from 'vue'

const route = useRoute()
const isLoading = false // You might want to control this with your actual loading state
</script>

<template>
  <SidebarProvider>
    <!-- Sidebar - Only show when not loading -->
    <AppSidebar v-if="!isLoading" />

    <!-- Main Content -->
    <SidebarInset class="flex-1">
      <header
        class="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear"
      >
        <div class="flex items-center justify-between w-full px-2 sm:px-4">
          <div class="flex items-center gap-2 min-w-0">
            <div class="flex items-center shrink-0">
              <SidebarTrigger class="-ml-1" />
              <Separator orientation="vertical" class="mx-2 h-4 hidden sm:block" />
            </div>
            <Breadcrumb class="min-w-0">
              <BreadcrumbList class="flex-wrap items-center">
                <BreadcrumbItem class="shrink-0">
                  <RouterLink
                    :to="{ name: 'dashboard' }"
                    class="transition-colors hover:text-foreground"
                  >
                    Dashboard
                  </RouterLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator class="shrink-0" />
                <BreadcrumbItem class="min-w-0">
                  <BreadcrumbPage class="truncate">{{
                    route.meta.title || 'Current Page'
                  }}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div class="flex items-center gap-2 shrink-0 ml-4">
            <!-- Removed NotificationPopover and Dev Settings Button -->
          </div>
        </div>
      </header>

      <div class="h-full overflow-auto">
        <!-- Show loading spinner while loading -->
        <div v-if="isLoading" class="flex justify-center items-center min-h-screen">
          <div
            class="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"
          ></div>
        </div>

        <!-- Page Content -->
        <div v-else class="px-2 lg:px-4 py-2 lg:py-4">
          <RouterView />
        </div>
      </div>
    </SidebarInset>
  </SidebarProvider>
</template>
