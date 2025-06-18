<script setup>
import { ref, onMounted, watch } from 'vue'
import { Calendar } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

const calendarEl = ref(null)
const calendar = ref(null)

const props = defineProps({
  events: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['dateRangeChange', 'eventClick'])

onMounted(() => {
  if (calendarEl.value) {
    calendar.value = new Calendar(calendarEl.value, {
      plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
      initialView: 'dayGridMonth',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay',
      },
      events: props.events,
      eventClick: (info) => {
        emit('eventClick', info.event)
      },
      datesSet: (dateInfo) => {
        emit('dateRangeChange', {
          start: dateInfo.start.toISOString(),
          end: dateInfo.end.toISOString(),
        })
      },
      eventContent: (info) => {
        return {
          html: `
            <div class="p-1">
              <div class="font-semibold">${info.event.title}</div>
              <div class="text-xs opacity-75">Status: ${info.event.extendedProps.status}</div>
            </div>
          `,
        }
      },
      eventDidMount: (info) => {
        // Apply color from the event data
        const eventColor =
          info.event.extendedProps?.color || info.event.backgroundColor || info.event.color
        if (eventColor) {
          info.el.style.backgroundColor = eventColor
          info.el.style.borderColor = eventColor
        }

        // Create and setup tooltip
        const tooltip = document.createElement('div')
        tooltip.classList.add('calendar-tooltip')
        tooltip.innerHTML = `
          <div class="space-y-2">
            <div class="font-semibold text-base">${info.event.title}</div>
            <div class="space-y-1 text-sm">
              <div class="grid grid-cols-[100px_1fr] gap-2">
                <span class="text-muted-foreground">Vehicle:</span>
                <span>${info.event.extendedProps.vehicle.brand} ${info.event.extendedProps.vehicle.model}</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] gap-2">
                <span class="text-muted-foreground">Customer:</span>
                <span>${info.event.extendedProps.customer.name}</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] gap-2">
                <span class="text-muted-foreground">Status:</span>
                <span class="capitalize">${info.event.extendedProps.status}</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] gap-2">
                <span class="text-muted-foreground">From:</span>
                <span>${new Date(info.event.start).toLocaleString()}</span>
              </div>
              <div class="grid grid-cols-[100px_1fr] gap-2">
                <span class="text-muted-foreground">To:</span>
                <span>${new Date(info.event.end).toLocaleString()}</span>
              </div>
            </div>
          </div>
        `

        // Handle tooltip display
        info.el.title = '' // Remove default tooltip
        info.el.addEventListener('mouseenter', () => {
          document.body.appendChild(tooltip)
          const rect = info.el.getBoundingClientRect()
          tooltip.style.position = 'fixed'
          tooltip.style.top = `${rect.bottom + 5}px`
          tooltip.style.left = `${rect.left}px`
          tooltip.style.display = 'block'
        })
        info.el.addEventListener('mouseleave', () => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip)
          }
        })
      },
    })

    calendar.value.render()
  }
})

// Watch for events changes
watch(
  () => props.events,
  (newEvents) => {
    if (calendar.value && newEvents) {
      calendar.value.removeAllEvents()
      calendar.value.addEventSource(newEvents)
    }
  },
)

// Method to update events
const updateEvents = (newEvents) => {
  if (calendar.value) {
    calendar.value.removeAllEvents()
    calendar.value.addEventSource(newEvents)
  }
}

defineExpose({
  updateEvents,
})
</script>

<template>
  <div class="w-full h-full">
    <div ref="calendarEl" class="calendar-container"></div>
  </div>
</template>

<style>
.calendar-container {
  width: 100%;
  height: 100%;
  min-height: 700px;
}

/* Calendar theme integration */
.fc {
  background-color: var(--color-background);
  color: var(--color-foreground);
}

.fc .fc-toolbar {
  color: var(--color-foreground);
}

.fc .fc-toolbar-title {
  color: var(--color-foreground);
}

.fc .fc-button {
  background-color: var(--color-secondary) !important;
  border-color: var(--color-border) !important;
  color: var(--color-secondary-foreground) !important;
}

.fc .fc-button:hover {
  background-color: var(--color-muted) !important;
  border-color: var(--color-border) !important;
}

.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
}

.fc-theme-standard td,
.fc-theme-standard th,
.fc-theme-standard .fc-scrollgrid {
  border-color: var(--color-border) !important;
}

.fc .fc-day-today {
  background-color: var(--color-muted) !important;
}

.fc .fc-col-header-cell-cushion,
.fc .fc-daygrid-day-number {
  color: var(--color-foreground);
}

/* Calendar event styles */
.fc-event {
  cursor: pointer;
  padding: 2px 4px;
  color: var(--color-card-foreground) !important;
}

.fc-event:hover {
  filter: brightness(0.9);
}

.fc-event .fc-event-title,
.fc-event .fc-event-time {
  color: inherit;
}

.calendar-tooltip {
  display: none;
  background-color: var(--color-popover);
  color: var(--color-popover-foreground);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  max-width: 300px;
  padding: 0.75rem;
}

.calendar-tooltip div {
  margin: 2px 0;
}

/* Loading state styles */
.fc-event.is-loading {
  opacity: 0.7;
}

/* Status colors from your theme */
.fc-event[data-status='available'] {
  background-color: var(--color-status-available) !important;
  border-color: var(--color-status-available) !important;
  color: var(--color-status-available-foreground) !important;
}

.fc-event[data-status='rented'] {
  background-color: var(--color-status-rented) !important;
  border-color: var(--color-status-rented) !important;
  color: var(--color-status-rented-foreground) !important;
}

.fc-event[data-status='maintenance'] {
  background-color: var(--color-status-maintenance) !important;
  border-color: var(--color-status-maintenance) !important;
  color: var(--color-status-maintenance-foreground) !important;
}
</style>
