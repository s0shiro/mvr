<script setup>
import { ref, onMounted, watch } from 'vue'
import { Calendar } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { format, parseISO } from 'date-fns'

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
        const status = info.event.extendedProps.status
        const statusIcon =
          {
            confirmed: '✓',
            pending: '⏳',
            cancelled: '✕',
            completed: '✅',
            maintenance: '🔧',
            available: '📅',
          }[status] || '•'

        return {
          html: `
            <div class="event-content">
              <div class="event-header">
                <span class="status-icon">${statusIcon}</span>
                <span class="event-title">${info.event.title}</span>
              </div>
              <div class="event-details">
                <span class="vehicle-info">${info.event.extendedProps.vehicle?.brand || ''} ${info.event.extendedProps.vehicle?.model || ''}</span>
              </div>
              <div class="event-time">
                ${format(new Date(info.event.start), 'HH:mm')}
              </div>
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
          <div class="tooltip-content">
            <div class="tooltip-header">
              <h4 class="tooltip-title">${info.event.title}</h4>
              <span class="tooltip-status status-${info.event.extendedProps.status}">${info.event.extendedProps.status}</span>
            </div>
            <div class="tooltip-body">
              <div class="info-row">
                <span class="info-label">🚗 Vehicle</span>
                <span class="info-value">${info.event.extendedProps.vehicle.brand} ${info.event.extendedProps.vehicle.model}</span>
              </div>
              <div class="info-row">
                <span class="info-label">👤 Customer</span>
                <span class="info-value">${info.event.extendedProps.customer.name}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 Start</span>
                <span class="info-value">${format(new Date(info.event.start), 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div class="info-row">
                <span class="info-label">📅 End</span>
                <span class="info-value">${format(new Date(info.event.end), 'MMM dd, yyyy HH:mm')}</span>
              </div>
            </div>
          </div>
        ` // Handle tooltip display with better positioning
        info.el.title = '' // Remove default tooltip

        const hideTooltip = () => {
          if (tooltip.parentNode) {
            tooltip.style.opacity = '0'
            tooltip.style.transform = 'translateY(-4px)'
            setTimeout(() => {
              if (tooltip.parentNode) {
                tooltip.parentNode.removeChild(tooltip)
              }
            }, 200)
          }
        }

        info.el.addEventListener('mouseenter', (e) => {
          document.body.appendChild(tooltip)
          const rect = info.el.getBoundingClientRect()
          const tooltipRect = tooltip.getBoundingClientRect()

          // Better positioning logic
          let top = rect.bottom + 8
          let left = rect.left

          // Adjust if tooltip would go off screen
          if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 16
          }
          if (top + tooltipRect.height > window.innerHeight) {
            top = rect.top - tooltipRect.height - 8
          }

          tooltip.style.position = 'fixed'
          tooltip.style.top = `${top}px`
          tooltip.style.left = `${left}px`
          tooltip.style.display = 'block'
          tooltip.style.opacity = '0'
          tooltip.style.transform = 'translateY(-4px)'

          // Animate in
          requestAnimationFrame(() => {
            tooltip.style.transition = 'all 0.2s ease-out'
            tooltip.style.opacity = '1'
            tooltip.style.transform = 'translateY(0)'
          })
        })
        info.el.addEventListener('mouseleave', hideTooltip)
        info.el.addEventListener('click', hideTooltip)
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
  border-radius: 12px;
  overflow: hidden;
}

/* Enhanced Calendar theme integration */
.fc {
  background-color: var(--color-background);
  color: var(--color-foreground);
  font-family: inherit;
  border-radius: 12px;
}

.fc .fc-toolbar {
  color: var(--color-foreground);
  margin-bottom: 1.5rem;
  padding: 0 1rem;
}

.fc .fc-toolbar-title {
  color: var(--color-foreground);
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.fc .fc-button {
  background-color: var(--color-secondary) !important;
  border-color: var(--color-border) !important;
  color: var(--color-secondary-foreground) !important;
  border-radius: 8px !important;
  padding: 0.5rem 1rem !important;
  font-weight: 500 !important;
  transition: all 0.2s ease !important;
  margin: 0 2px !important;
}

.fc .fc-button:hover {
  background-color: var(--color-muted) !important;
  border-color: var(--color-border) !important;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.fc .fc-button-primary:not(:disabled).fc-button-active,
.fc .fc-button-primary:not(:disabled):active {
  background-color: var(--color-primary) !important;
  border-color: var(--color-primary) !important;
  color: var(--color-primary-foreground) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.fc .fc-button:focus {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.fc-theme-standard td,
.fc-theme-standard th,
.fc-theme-standard .fc-scrollgrid {
  border-color: var(--color-border) !important;
}

.fc .fc-day-today {
  background-color: var(--color-muted) !important;
  position: relative;
}

.fc .fc-day-today::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--color-primary), var(--color-primary) / 0.6);
}

.fc .fc-col-header-cell-cushion,
.fc .fc-daygrid-day-number {
  color: var(--color-foreground);
  font-weight: 500;
  padding: 0.5rem;
}

.fc .fc-col-header-cell {
  background-color: var(--color-muted/0.3);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.fc .fc-daygrid-day-number {
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.fc .fc-daygrid-day:hover .fc-daygrid-day-number {
  color: var(--color-primary);
  transform: scale(1.1);
}

/* Enhanced Calendar event styles */
.fc-event {
  cursor: pointer;
  border-radius: 6px !important;
  border: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  transition: all 0.2s ease !important;
  margin: 1px !important;
  overflow: hidden;
}

.fc-event:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  z-index: 10;
}

.fc-event .fc-event-title,
.fc-event .fc-event-time {
  color: inherit;
}

/* Enhanced event content styling */
.event-content {
  padding: 6px 8px;
  font-size: 0.75rem;
  line-height: 1.2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.event-header {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 2px;
}

.status-icon {
  font-size: 0.7rem;
  opacity: 0.9;
}

.event-title {
  font-weight: 600;
  font-size: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.event-details {
  font-size: 0.65rem;
  opacity: 0.8;
  margin-bottom: 1px;
}

.vehicle-info {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.event-time {
  font-size: 0.6rem;
  opacity: 0.7;
  font-weight: 500;
}

/* Enhanced tooltip styles */
.calendar-tooltip {
  display: none;
  background: var(--color-popover);
  color: var(--color-popover-foreground);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-width: 320px;
  min-width: 280px;
  overflow: hidden;
  backdrop-filter: blur(8px);
}

.tooltip-content {
  padding: 0;
}

.tooltip-header {
  background: var(--color-muted/0.5);
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-title {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: var(--color-foreground);
}

.tooltip-status {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  text-transform: capitalize;
}

.tooltip-body {
  padding: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--color-border/0.3);
}

.info-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 0.875rem;
  color: var(--color-muted-foreground);
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-foreground);
  text-align: right;
}

/* Status-specific tooltip styling */
.status-confirmed {
  background-color: var(--color-status-available);
  color: var(--color-status-available-foreground);
}

.status-pending {
  background-color: #f59e0b;
  color: white;
}

.status-cancelled {
  background-color: #ef4444;
  color: white;
}

.status-completed {
  background-color: #10b981;
  color: white;
}

.status-maintenance {
  background-color: var(--color-status-maintenance);
  color: var(--color-status-maintenance-foreground);
}

/* Loading state styles */
.fc-event.is-loading {
  opacity: 0.7;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.7;
  }
  50% {
    opacity: 0.5;
  }
}

/* Enhanced status colors */
.fc-event[data-status='confirmed'] {
  background: linear-gradient(
    135deg,
    var(--color-status-available),
    var(--color-status-available) / 0.8
  ) !important;
  color: var(--color-status-available-foreground) !important;
}

.fc-event[data-status='pending'] {
  background: linear-gradient(135deg, #f59e0b, #f59e0b/0.8) !important;
  color: white !important;
}

.fc-event[data-status='cancelled'] {
  background: linear-gradient(135deg, #ef4444, #ef4444/0.8) !important;
  color: white !important;
}

.fc-event[data-status='completed'] {
  background: linear-gradient(135deg, #10b981, #10b981/0.8) !important;
  color: white !important;
}

.fc-event[data-status='rented'] {
  background: linear-gradient(
    135deg,
    var(--color-status-rented),
    var(--color-status-rented) / 0.8
  ) !important;
  color: var(--color-status-rented-foreground) !important;
}

.fc-event[data-status='maintenance'] {
  background: linear-gradient(
    135deg,
    var(--color-status-maintenance),
    var(--color-status-maintenance) / 0.8
  ) !important;
  color: var(--color-status-maintenance-foreground) !important;
}

/* Responsive improvements */
@media (max-width: 768px) {
  .calendar-tooltip {
    max-width: 280px;
    min-width: 240px;
  }

  .fc .fc-toolbar {
    flex-direction: column;
    gap: 1rem;
  }

  .fc .fc-toolbar-title {
    font-size: 1.25rem;
  }

  .event-content {
    padding: 4px 6px;
    font-size: 0.7rem;
  }

  .event-title {
    font-size: 0.7rem;
  }

  .event-details {
    font-size: 0.6rem;
  }

  .event-time {
    font-size: 0.55rem;
  }
}
</style>
