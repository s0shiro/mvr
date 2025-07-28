<template>
  <div class="mx-auto">
    <h1 class="text-2xl font-bold mb-6">Rental Sales Report</h1>
    <div class="flex flex-wrap gap-4 mb-6 items-end">
      <div class="flex flex-col gap-2 min-w-[160px]">
        <Label>Group By</Label>
        <Select v-model="grouping">
          <SelectTrigger>
            <SelectValue placeholder="Select grouping" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Group By</SelectLabel>
              <SelectItem value="day">Day</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div class="flex flex-col gap-2 min-w-[180px]">
        <Label>From</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="justify-start text-left font-normal" type="button">
              <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
              {{ fromDate ? df.format(fromDate.toDate(getLocalTimeZone())) : 'Select date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar
              @update:model-value="onFromDateChange"
            />
          </PopoverContent>
        </Popover>
      </div>
      <div class="flex flex-col gap-2 min-w-[180px]">
        <Label>To</Label>
        <Popover>
          <PopoverTrigger as-child>
            <Button variant="outline" class="justify-start text-left font-normal" type="button">
              <CalendarIcon class="mr-2 h-4 w-4 text-muted-foreground" />
              {{ toDate ? df.format(toDate.toDate(getLocalTimeZone())) : 'Select date' }}
            </Button>
          </PopoverTrigger>
          <PopoverContent class="w-auto p-0">
            <Calendar
              @update:model-value="onToDateChange"
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading sales..." />
    </div>
    <div v-else-if="error" class="text-center text-red-500 py-8">Failed to load sales data.</div>
    <div v-else>
      <div class="rounded-lg border bg-card p-4 shadow-sm mb-4">
        <canvas ref="chartRef" height="300" aria-label="Sales chart" class="w-full max-w-full" />
        <div class="mt-6">
          <ScrollArea class="w-full max-w-full rounded-md border">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-100 dark:bg-gray-900">
                <tr>
                  <th class="p-3 text-left font-semibold">Period</th>
                  <th class="p-3 text-left font-semibold">Total Revenue</th>
                  <th class="p-3 text-left font-semibold">Deposits</th>
                  <th class="p-3 text-left font-semibold">Rentals</th>
                  <th class="p-3 text-left font-semibold">Approved Payments</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in data" :key="row.date || row.period_start" class="border-t">
                  <td class="p-3">
                    {{ grouping === 'week' ? `${row.period_start} to ${row.period_end}` : row.date }}
                  </td>
                  <td class="p-3 font-semibold text-green-600">₱{{ Number(row.total_sales).toLocaleString() }}</td>
                  <td class="p-3">₱{{ Number(row.deposit_sales || 0).toLocaleString() }}</td>
                  <td class="p-3">₱{{ Number(row.rental_sales || 0).toLocaleString() }}</td>
                  <td class="p-3">{{ row.payment_count || 0 }}</td>
                </tr>
              </tbody>
            </table>
          </ScrollArea>
        </div>
      </div>
    </div>
    <div class="mt-6 flex gap-2">
      <Button variant="secondary" @click="goBack">Back</Button>
      <Button variant="outline" @click="resetFilters">Clear</Button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, watchEffect, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useQuery } from '@tanstack/vue-query'
import { fetchRentalPaymentsSummary } from '@/services/rentalPaymentService'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar as CalendarIcon } from 'lucide-vue-next'
import { DateFormatter, getLocalTimeZone, today as intlToday } from '@internationalized/date'
import Chart from 'chart.js/auto'
import { useDebounce } from '@/stores/useDebounce'
import { ScrollArea } from '@/components/ui/scroll-area'
import Loading from '@/components/features/Loading.vue'

const router = useRouter()
const chartRef = ref(null)
let chartInstance = null

const grouping = ref('day')

// Default toDate: today, fromDate: 7 days before today
const tz = getLocalTimeZone()
const today = intlToday(tz)
const toDate = ref(today)
const fromDate = ref(today.subtract({ days: 6 }))

const df = new DateFormatter('en-US', { dateStyle: 'long' })

const from = computed(() => (fromDate.value ? fromDate.value.toString().slice(0, 10) : ''))
const to = computed(() => (toDate.value ? toDate.value.toString().slice(0, 10) : ''))

function onFromDateChange(val) {
  fromDate.value = val
}
function onToDateChange(val) {
  toDate.value = val
}

const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['rental-payments-summary', grouping, from, to],
  queryFn: () => {
    const params = {}
    if (grouping.value) params.grouping = grouping.value
    if (from.value) params.from = from.value
    if (to.value) params.to = to.value
    return fetchRentalPaymentsSummary(params)
  },
})

const debounceStore = useDebounce()
const debouncedRefetch = debounceStore.debounce(
  () => {
    refetch()
  },
  400,
  'rental-sales-report-refetch',
)

watch([grouping, from, to], () => {
  debouncedRefetch()
})

function goBack() {
  router.back()
}

function resetFilters() {
  grouping.value = 'day'
  toDate.value = today
  fromDate.value = today.subtract({ days: 6 })
}

watchEffect(() => {
  if (data.value && chartRef.value) {
    if (chartInstance) chartInstance.destroy()
    const ctx = chartRef.value.getContext('2d')
    const gradient = ctx.createLinearGradient(0, 0, 0, 300)
    gradient.addColorStop(0, 'rgba(37,99,235,0.25)')
    gradient.addColorStop(1, 'rgba(37,99,235,0.02)')
    const labels = data.value.map((row) =>
      grouping.value === 'week' ? row.period_start + ' to ' + row.period_end : row.date,
    )
    const values = data.value.map((row) => Number(row.total_sales))
    chartInstance = new Chart(chartRef.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Sales',
            data: values,
            borderColor: '#2563eb',
            backgroundColor: gradient,
            fill: true,
            tension: 0.4,
            borderWidth: 3,
            pointRadius: 4,
            pointBackgroundColor: '#2563eb',
            pointBorderColor: '#fff',
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#1d4ed8',
            pointHoverBorderColor: '#fff',
            pointStyle: 'circle',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#18181b',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#2563eb',
            borderWidth: 1,
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              label: (ctx) => `₱${ctx.parsed.y.toLocaleString()}`,
            },
          },
          title: { display: false },
        },
        scales: {
          x: {
            title: {
              font: { weight: 'bold', size: 14 },
            },
            ticks: { color: '#64748b', font: { size: 12 } },
            grid: { color: '#e5e7eb' },
          },
          y: {
            title: {
              font: { weight: 'bold', size: 14 },
            },
            ticks: {
              callback: (v) => `₱${v.toLocaleString()}`,
            },
            grid: { color: '#e5e7eb' },
          },
        },
      },
    })
  }
})

onUnmounted(() => {
  if (chartInstance) chartInstance.destroy()
})
</script>
