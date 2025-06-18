import axiosInstance from '@/lib/axiosInstance'

export const bookingCalendarKeys = {
  all: ['bookings', 'calendar'],
  list: (filters) => ['bookings', 'calendar', 'list', filters],
}

export const bookingCalendarService = {
  async getCalendarEvents(start, end) {
    const response = await axiosInstance.get('/api/admin/bookings/calendar', {
      params: {
        start,
        end,
      },
    })
    return response.data.events
  },
}
