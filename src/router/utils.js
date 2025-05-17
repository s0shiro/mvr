// Utility to create a dashboard route with DashboardLayout
import DashboardLayout from '@/layouts/DashboardLayout.vue'

export function createDashboardRoute({ path, name, view, meta }) {
  return {
    path,
    component: DashboardLayout,
    children: [
      {
        path: '',
        name,
        component: view,
        meta,
      },
    ],
  }
}
