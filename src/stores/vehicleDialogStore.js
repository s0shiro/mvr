import { defineStore } from 'pinia'

export const useVehicleDialogStore = defineStore('vehicleDialog', {
  state: () => ({
    editOpen: false,
    editVehicle: null,
    addOpen: false,
  }),
  actions: {
    openEdit(vehicle) {
      // Always reset state before opening
      this.editOpen = false
      this.editVehicle = null
      setTimeout(() => {
        this.editVehicle = vehicle
        this.editOpen = true
      }, 0)
    },
    closeEdit() {
      this.editOpen = false
      this.editVehicle = null
    },
    openAdd() {
      this.addOpen = true
    },
    closeAdd() {
      this.addOpen = false
    },
  },
})
