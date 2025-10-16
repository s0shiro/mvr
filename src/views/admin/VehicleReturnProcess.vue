<template>
  <div class="container max-w-5xl">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div class="space-y-2">
        <Button variant="ghost" size="sm" class="w-fit px-2 text-sm" @click="handleBack">
          ← Back to Vehicle Returns
        </Button>
        <div>
          <h1 class="text-3xl font-bold">Process Vehicle Return</h1>
          <p class="text-sm text-muted-foreground">Booking #{{ bookingId }}</p>
        </div>
      </div>
      <div class="flex items-center gap-3" v-if="booking">
        <Badge :variant="getReturnStatusVariant(booking.vehicle_return?.status)">
          {{ getReturnStatusLabel(booking.vehicle_return?.status) }}
        </Badge>
        <Badge :variant="getDepositStatusVariant(booking.vehicle_return?.deposit_status)">
          Deposit: {{ getDepositStatusLabel(booking.vehicle_return?.deposit_status) }}
        </Badge>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-72">
      <Loading text="Loading booking details..." />
    </div>

    <div v-else-if="error" class="text-center text-red-600">
      {{ errorMessage }}
    </div>

    <div v-else-if="!booking" class="text-center text-muted-foreground">
      Booking not found or no longer available for return processing.
    </div>

    <div v-else class="space-y-8">
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div class="md:col-span-2 lg:col-span-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm dark:shadow-gray-900/20">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <Car class="w-5 h-5 text-primary" /> Vehicle
          </h2>
          <div class="space-y-1 text-sm">
            <div class="font-medium text-gray-900 dark:text-gray-100">{{ booking.vehicle?.name || 'Vehicle' }}</div>
            <div class="text-muted-foreground">
              {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
            </div>
            <div class="text-muted-foreground">Plate: {{ booking.vehicle?.plate_number || 'N/A' }}</div>
          </div>
        </div>
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm dark:shadow-gray-900/20">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock class="w-5 h-5 text-primary" /> Schedule
          </h2>
          <div class="space-y-2 text-sm">
            <div>
              <div class="text-muted-foreground">Start</div>
              <div class="font-medium">{{ formatDate(booking.start_date) }}</div>
            </div>
            <div>
              <div class="text-muted-foreground">Due End</div>
              <div class="font-medium">{{ formatDate(booking.end_date) }}</div>
            </div>
            <div v-if="booking.vehicle_return?.returned_at">
              <div class="text-muted-foreground">Actual Return</div>
              <div class="font-medium">{{ formatScheduleDate(booking.vehicle_return.returned_at) }}</div>
            </div>
          </div>
        </div>
        <div v-if="booking.vehicle_release" class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm dark:shadow-gray-900/20">
          <h2 class="text-lg font-semibold mb-3 flex items-center gap-2">
            <FileText class="w-5 h-5 text-primary" /> Release Notes
          </h2>
          <div class="space-y-3 text-sm">
            <div>
              <div class="text-muted-foreground">Released At</div>
              <div class="font-medium">{{ formatScheduleDate(booking.vehicle_release.released_at) }}</div>
            </div>
            <div>
              <div class="text-muted-foreground">Condition Notes</div>
              <div class="font-medium text-gray-900 dark:text-gray-100">
                {{ booking.vehicle_release.condition_notes || '—' }}
              </div>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <div class="text-muted-foreground">Odometer</div>
                <div class="font-medium">{{ booking.vehicle_release.odometer ?? '—' }}</div>
              </div>
              <div>
                <div class="text-muted-foreground">Fuel Level</div>
                <div class="font-medium">{{ booking.vehicle_release.fuel_level || '—' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="isCustomerSubmitted" class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-6 shadow-sm dark:shadow-gray-900/20">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Clock class="w-5 h-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div class="flex-1 space-y-4">
            <div>
              <h3 class="font-semibold text-blue-900 dark:text-blue-100 text-lg">Customer Submission</h3>
              <p class="text-sm text-blue-700 dark:text-blue-300">
                Submitted on {{ formatDate(booking.vehicle_return?.customer_submitted_at) }}
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div v-if="customerImages?.length" class="space-y-3">
                <Label class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Camera class="w-4 h-4" /> Customer Photos
                </Label>
                <div class="grid grid-cols-2 gap-2">
                  <img
                    v-for="(img, i) in customerImages"
                    :key="i"
                    :src="img"
                    class="w-full h-24 object-cover rounded-lg border border-blue-200 dark:border-blue-700 cursor-pointer"
                    @click="openImageModal(img)"
                  />
                </div>
              </div>
              <div class="space-y-3">
                <div v-if="booking.vehicle_return?.customer_condition_notes" class="space-y-2">
                  <Label class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <FileText class="w-4 h-4" /> Customer Notes
                  </Label>
                  <div class="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-200">
                    {{ booking.vehicle_return.customer_condition_notes }}
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-3">
                  <div v-if="booking.vehicle_return?.odometer" class="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                    <Label class="text-xs font-semibold text-blue-900 dark:text-blue-100">Odometer</Label>
                    <p class="text-sm text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.odometer }}</p>
                  </div>
                  <div v-if="booking.vehicle_return?.fuel_level" class="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                    <Label class="text-xs font-semibold text-blue-900 dark:text-blue-100">Fuel Level</Label>
                    <p class="text-sm text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.fuel_level }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="pt-4 border-t border-blue-200 dark:border-blue-700">
              <Label class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-3">
                <CreditCard class="w-4 h-4" /> Refund Information
              </Label>
              <div
                v-if="hasCustomerRefundMethod"
                class="bg-white/70 dark:bg-gray-800/70 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2"
              >
                <div class="flex items-center justify-between text-sm">
                  <span class="font-medium text-blue-900 dark:text-blue-100">Method:</span>
                  <span class="text-blue-800 dark:text-blue-200 capitalize">
                    {{ booking.vehicle_return.customer_refund_method.replace('_', ' ') }}
                  </span>
                </div>
                <template v-if="hasCustomerRefundAccountInfo">
                  <template v-if="booking.vehicle_return.customer_refund_method === 'gcash'">
                    <div class="flex justify-between text-sm">
                      <span class="font-medium text-blue-900 dark:text-blue-100">GCash:</span>
                      <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_account_number }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="font-medium text-blue-900 dark:text-blue-100">Name:</span>
                      <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_account_name }}</span>
                    </div>
                  </template>
                  <template v-else-if="booking.vehicle_return.customer_refund_method === 'bank_transfer'">
                    <div class="flex justify-between text-sm">
                      <span class="font-medium text-blue-900 dark:text-blue-100">Bank:</span>
                      <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_bank_name }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="font-medium text-blue-900 dark:text-blue-100">Account:</span>
                      <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_account_number }}</span>
                    </div>
                    <div class="flex justify-between text-sm">
                      <span class="font-medium text-blue-900 dark:text-blue-100">Name:</span>
                      <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_account_name }}</span>
                    </div>
                  </template>
                </template>
                <div
                  v-else
                  class="rounded-lg border border-dashed border-blue-200 dark:border-blue-700 bg-white/60 dark:bg-gray-900/60 px-3 py-2 text-sm text-blue-800 dark:text-blue-200"
                >
                  Customer has not provided refund account details yet.
                </div>
                <div
                  v-if="booking.vehicle_return.customer_refund_notes"
                  class="pt-2 border-t border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-200"
                >
                  {{ booking.vehicle_return.customer_refund_notes }}
                </div>
              </div>
              <div
                v-else
                class="bg-white/70 dark:bg-gray-800/70 border border-dashed border-blue-200 dark:border-blue-700 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200"
              >
                Customer has not submitted refund details yet.
              </div>
            </div>
          </div>
        </div>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-gray-900/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Car class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Condition</h3>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Return Date &amp; Time</Label>
              <Input
                v-model="form.returned_at"
                type="datetime-local"
              
                class="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Odometer Reading</Label>
              <Input
                v-model="form.odometer"
                type="number"
                min="0"
                placeholder="Final odometer reading"
                :disabled="isCustomerSubmitted && booking.vehicle_return?.odometer"
                class="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Level</Label>
              <Select
                v-model="fuelSelectValue"
                :disabled="isFuelLevelLocked"
              >
                <SelectTrigger
                  :disabled="isFuelLevelLocked"
                  class="h-10 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                >
                  <SelectValue placeholder="Select fuel level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="three_quarters">3/4</SelectItem>
                    <SelectItem value="half">Half</SelectItem>
                    <SelectItem value="quarter">1/4</SelectItem>
                    <SelectItem value="empty">Empty</SelectItem>
                    <SelectItem value="custom">Custom (manual entry)</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                v-if="fuelSelectValue === 'custom'"
                v-model="customFuelLevel"
                placeholder="Enter fuel level (e.g. 3/8, 40%)"
                :disabled="isFuelLevelLocked"
                class="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          <div class="space-y-3" v-if="!isCustomerSubmitted">
            <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Camera class="w-4 h-4" /> Return Photos
            </Label>
            <div
              class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-900 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 relative min-h-[140px]"
              @dragover.prevent="isDragging = true"
              @dragleave.prevent="isDragging = false"
              @drop.prevent="handleDrop"
              :class="{ 'border-primary bg-primary/10 dark:bg-primary/20': isDragging }"
            >
              <input
                ref="fileInput"
                type="file"
                multiple
                class="absolute inset-0 opacity-0 cursor-pointer"
                @change="handleFileChange"
                @click.stop
              />
              <div v-if="!form.images.length && !isDragging" class="flex flex-col items-center text-center">
                <Camera class="w-8 h-8 text-gray-400 dark:text-gray-500 mb-2" />
                <span class="text-gray-600 dark:text-gray-400 font-medium">Upload vehicle photos</span>
                <span class="text-gray-500 dark:text-gray-500 text-sm mt-1">Drag & drop or click to select</span>
              </div>
              <div v-if="isDragging" class="flex flex-col items-center">
                <CheckCircle class="w-8 h-8 text-primary mb-2" />
                <span class="text-primary font-semibold">Drop files to upload</span>
              </div>
              <div v-if="form.images.length" class="flex flex-wrap gap-3 mt-2 justify-center">
                <div v-for="(img, i) in form.images" :key="i" class="relative group">
                  <img :src="img" class="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm" />
                  <button
                    type="button"
                    @click="form.images.splice(i, 1)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="space-y-2">
            <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <FileText class="w-4 h-4" /> Condition Notes
            </Label>
            <Textarea
              v-model="form.condition_notes"
              placeholder="Admin assessment of vehicle condition, damages, or additional notes..."
              rows="3"
              class="resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-gray-900/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <Calculator class="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Additional Fees</h3>
          </div>

          <div
            v-if="calculatedLateFee > 0"
            class="mb-4 bg-red-50/80 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p class="text-sm font-medium text-red-700 dark:text-red-300">Auto-calculated late fee</p>
                <p class="text-2xl font-semibold text-red-600 dark:text-red-400">₱{{ formatCurrency(calculatedLateFee) }}</p>
              </div>
              <div v-if="lateFeeSummary" class="text-sm text-red-600 dark:text-red-300">
                {{ lateFeeSummary }} late
              </div>
            </div>
            <p class="text-xs text-red-600/80 dark:text-red-300/80 mt-2">
              Adjust if further assessment is required.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-red-700 dark:text-red-400">Late Fee (₱)</Label>
              <Input
                v-model.number="form.late_fee"
                type="number"
                min="0"
                placeholder="0"
                class="h-10 border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-red-700 dark:text-red-400">Damage Fee (₱)</Label>
              <Input
                v-model.number="form.damage_fee"
                type="number"
                min="0"
                placeholder="0"
                class="h-10 border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-red-700 dark:text-red-400">Cleaning Fee (₱)</Label>
              <Input
                v-model.number="form.cleaning_fee"
                type="number"
                min="0"
                placeholder="0"
                class="h-10 border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div class="space-y-2">
              <Label class="text-sm font-medium text-red-700 dark:text-red-400">Fuel Refill Fee (₱)</Label>
              <div class="h-10 flex items-center justify-between rounded-lg border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 px-3">
                <span class="font-semibold text-red-600 dark:text-red-400">₱{{ formatCurrency(calculatedFuelFee) }}</span>
                <span class="text-xs text-muted-foreground dark:text-gray-400">auto</span>
              </div>
            </div>
          </div>

          <div
            v-if="fuelFeeDetails"
            class="mt-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-sm space-y-2"
          >
            <p class="font-semibold text-amber-900 dark:text-amber-100">Fuel fee breakdown</p>
            <p class="text-amber-900 dark:text-amber-100">
              Capacity: {{ formatNumber(fuelFeeDetails.capacity, 1) }} L · Returned level:
              {{ fuelFeeDetails.rawLevel || '—' }}
            </p>
            <template v-if="fuelFeeDetails.missingFraction > 0">
              <p class="text-amber-900 dark:text-amber-100">
                Shortage: {{ formatNumber(fuelFeeDetails.missingPercent, 1) }}%
                ({{ formatNumber(fuelFeeDetails.missingLiters, 2) }} L)
              </p>
              <p class="text-amber-900 dark:text-amber-100">
                Rate: ₱{{ formatCurrency(fuelFeeDetails.penalty) }} per liter → Fee:
                ₱{{ formatCurrency(fuelFeeDetails.fee) }}
              </p>
            </template>
            <p v-else class="text-amber-900 dark:text-amber-100">No fuel shortage detected. Full tank confirmed.</p>
          </div>

          <div
            v-if="lateFeeDetails"
            class="mt-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 rounded-lg p-4"
          >
            <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-3">Late Fee Breakdown</p>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
              <div class="flex flex-col">
                <span class="text-muted-foreground">Assessed Late Fee</span>
                <span class="font-medium text-slate-900 dark:text-slate-100">₱{{ formatCurrency(lateFeeDetails.amount) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-muted-foreground">Total Minutes Late</span>
                <span class="font-medium text-slate-900 dark:text-slate-100">{{ formatNumber(lateFeeDetails.late_minutes_total, 1) }} mins</span>
              </div>
              <div class="flex flex-col">
                <span class="text-muted-foreground">Days Late</span>
                <span class="font-medium text-slate-900 dark:text-slate-100">{{ formatNumber(lateFeeDetails.late_days) }}</span>
              </div>
              <div class="flex flex-col">
                <span class="text-muted-foreground">Hours Late</span>
                <span class="font-medium text-slate-900 dark:text-slate-100">{{ formatNumber(lateFeeDetails.late_hours) }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-gray-900/20">
          <div class="flex items-center gap-3 mb-4">
            <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <CreditCard class="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Deposit Refund</h3>
          </div>

          <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div class="space-y-1">
                <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Original Deposit</p>
                <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">₱{{ formatCurrency(booking.vehicle?.deposit || 0) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-red-600 dark:text-red-400">Total Fees</p>
                <p class="text-2xl font-bold text-red-600 dark:text-red-400">-₱{{ formatCurrency(totalFees) }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium text-green-600 dark:text-green-400">Refund Amount</p>
                <p class="text-2xl font-bold text-green-600 dark:text-green-400">₱{{ formatCurrency(calculatedRefundAmount) }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-4">
            <div class="space-y-2">
              <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Deposit Status</Label>
              <select
                v-model="form.deposit_status"
                class="w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-primary focus:ring-1 focus:ring-primary"
              >
                <option value="pending">⏳ Pending Refund</option>
                <option value="refunded">✅ Refunded</option>
                <option value="withheld">⚠️ Withheld</option>
              </select>
            </div>

            <div v-if="form.deposit_status === 'refunded'" class="space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <Label class="text-sm font-medium text-green-700 dark:text-green-400">Refund Amount (₱)</Label>
                  <Input
                    v-model.number="form.deposit_refund_amount"
                    @update:modelValue="handleDepositAmountUpdate"
                    type="number"
                    min="0"
                    :max="booking.vehicle?.deposit || 0"
                    :placeholder="calculatedRefundAmount.toString()"
                    class="h-10 border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div class="space-y-2">
                  <Label class="text-sm font-medium text-green-700 dark:text-green-400">Refund Method</Label>
                  <select
                    v-model="form.refund_method"
                    class="w-full h-10 rounded-lg border border-green-200 dark:border-green-800 bg-white dark:bg-gray-900 px-3 py-2 text-gray-900 dark:text-gray-100 focus:border-green-400 dark:focus:border-green-600"
                  >
                    <option value="">Select method</option>
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="gcash">GCash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div class="space-y-2">
                <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <FileText class="w-4 h-4" /> Refund Notes
                </Label>
                <Textarea
                  v-model="form.deposit_refund_notes"
                  placeholder="Notes about the refund transaction..."
                  rows="2"
                  class="resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
                />
              </div>

              <div class="space-y-3">
                <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Camera class="w-4 h-4" /> Refund Proof Photos
                </Label>
                <div
                  class="border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-green-50 dark:bg-green-950 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-200 relative min-h-[140px]"
                  @dragover.prevent="isRefundDragging = true"
                  @dragleave.prevent="isRefundDragging = false"
                  @drop.prevent="handleRefundDrop"
                  :class="{ 'border-green-400 dark:border-green-500 bg-green-100 dark:bg-green-900': isRefundDragging }"
                >
                  <input
                    ref="refundFileInput"
                    type="file"
                    multiple
                    accept="image/*"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="handleRefundFileChange"
                    @click.stop
                  />
                  <div v-if="!form.deposit_refund_proof.length && !isRefundDragging" class="flex flex-col items-center text-center">
                    <Camera class="w-8 h-8 text-green-400 dark:text-green-600 mb-2" />
                    <span class="text-green-700 dark:text-green-300 font-medium">Upload refund proof</span>
                    <span class="text-green-600 dark:text-green-400 text-sm mt-1">Receipt, transfer confirmation, etc.</span>
                  </div>
                  <div v-if="isRefundDragging" class="flex flex-col items-center">
                    <CheckCircle class="w-8 h-8 text-green-500 dark:text-green-400 mb-2" />
                    <span class="text-green-700 dark:text-green-300 font-semibold">Drop proof files</span>
                  </div>
                  <div v-if="form.deposit_refund_proof.length" class="flex flex-wrap gap-3 mt-2 justify-center">
                    <div v-for="(img, i) in form.deposit_refund_proof" :key="i" class="relative group">
                      <img
                        :src="img"
                        class="w-20 h-20 object-cover rounded-lg border-2 border-green-200 dark:border-green-700 shadow-sm cursor-pointer"
                        @click="openImageModal(img)"
                      />
                      <button
                        type="button"
                        @click="form.deposit_refund_proof.splice(i, 1)"
                        class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else-if="form.deposit_status === 'withheld'" class="space-y-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle class="w-4 h-4" /> Reason for Withholding
                </Label>
                <Textarea
                  v-model="form.deposit_refund_notes"
                  placeholder="Explain why the deposit is being withheld..."
                  rows="3"
                  class="resize-none border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <Button type="button" variant="outline" @click="handleBack" class="h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
            Cancel
          </Button>
          <Button type="submit" :disabled="isPending" class="h-10 min-w-[160px] bg-primary hover:bg-primary/90 text-white">
            <Loader2 v-if="isPending" class="w-4 h-4 animate-spin mr-2" />
            {{ isPending ? 'Processing...' : 'Submit Return' }}
          </Button>
        </div>
      </form>
    </div>

    <Dialog :open="imageModalOpen" @update:open="imageModalOpen = $event">
      <DialogContent class="max-w-4xl w-full max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Camera class="w-5 h-5" /> Vehicle Photo
          </DialogTitle>
        </DialogHeader>
        <div class="flex justify-center items-center min-h-[60vh]">
          <img :src="selectedImage" class="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAdminVehicleReturn, useReturnVehicle } from '@/services/admin/vehicle-return-service'
import { useQueryClient } from '@tanstack/vue-query'
import Loading from '@/components/features/Loading.vue'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Car, Calculator, CreditCard, Camera, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-vue-next'
import { formatDateTimeUTC } from '@/lib/utils'

const route = useRoute()
const router = useRouter()
const bookingId = route.params.id

const { data, error, isLoading } = useAdminVehicleReturn(bookingId)
const booking = computed(() => data.value)
const queryClient = useQueryClient()

const form = ref({
  odometer: '',
  fuel_level: '',
  condition_notes: '',
  images: [],
  returned_at: '',
  late_fee: 0,
  damage_fee: 0,
  cleaning_fee: 0,
  deposit_status: 'pending',
  deposit_refund_amount: 0,
  deposit_refund_notes: '',
  deposit_refund_proof: [],
  refund_method: '',
})

const hasManualDepositAmount = ref(false)

const fuelSelectValue = ref('')
const customFuelLevel = ref('')
const presetFuelValueMap = {
  full: 'Full',
  three_quarters: '3/4',
  half: 'Half',
  quarter: '1/4',
  empty: 'Empty',
}

const isDragging = ref(false)
const isRefundDragging = ref(false)
const fileInput = ref(null)
const refundFileInput = ref(null)
const imageModalOpen = ref(false)
const selectedImage = ref('')

const { mutate: returnVehicle, isPending } = useReturnVehicle()

const isCustomerSubmitted = computed(() => booking.value?.vehicle_return?.status === 'customer_submitted')
const isFuelLevelLocked = computed(
  () => isCustomerSubmitted.value && !!booking.value?.vehicle_return?.fuel_level,
)
const customerImages = computed(() => booking.value?.vehicle_return?.customer_images || [])

const hasCustomerRefundMethod = computed(() => !!booking.value?.vehicle_return?.customer_refund_method)

const hasCustomerRefundAccountInfo = computed(() => {
  const vehicleReturn = booking.value?.vehicle_return
  if (!vehicleReturn?.customer_refund_method) return false

  if (vehicleReturn.customer_refund_method === 'gcash') {
    return Boolean(vehicleReturn.customer_account_number && vehicleReturn.customer_account_name)
  }

  if (vehicleReturn.customer_refund_method === 'bank_transfer') {
    return Boolean(
      vehicleReturn.customer_bank_name &&
        vehicleReturn.customer_account_number &&
        vehicleReturn.customer_account_name,
    )
  }

  return true
})

const calculatedLateFee = computed(() => {
  const fee = booking.value?.calculated_late_fee
  const parsed = fee !== undefined && fee !== null ? Number(fee) : 0
  return Number.isFinite(parsed) ? parsed : 0
})

const lateFeeDetails = computed(() => booking.value?.late_fee_details ?? null)

const lateFeeSummary = computed(() => {
  const details = lateFeeDetails.value
  if (!details || !details.late_minutes_total) return ''

  const segments = []
  if (details.late_days) segments.push(`${details.late_days} day${details.late_days === 1 ? '' : 's'}`)
  if (details.late_hours) segments.push(`${details.late_hours} hour${details.late_hours === 1 ? '' : 's'}`)
  if (details.half_hour_applied) segments.push('30+ minutes')
  return segments.join(', ')
})

watch(fuelSelectValue, (value) => {
  if (!value) {
    form.value.fuel_level = ''
    customFuelLevel.value = ''
    return
  }

  if (value === 'custom') {
    form.value.fuel_level = customFuelLevel.value
    return
  }

  customFuelLevel.value = ''
  form.value.fuel_level = presetFuelValueMap[value] ?? ''
})

watch(customFuelLevel, (value) => {
  if (fuelSelectValue.value === 'custom') {
    form.value.fuel_level = value
  }
})

function getFuelLevelFraction(raw) {
  if (!raw) return 1
  const normalized = raw.toString().trim().toLowerCase()
  if (!normalized) return 1

  const cleaned = normalized
    .replace(/tank|level|fuel/g, '')
    .replace(/-/g, ' ')
    .trim()

  const map = {
    empty: 0,
    '0': 0,
    '0%': 0,
    quarter: 0.25,
    'a quarter': 0.25,
    'one quarter': 0.25,
    '1/4': 0.25,
    '25%': 0.25,
    half: 0.5,
    'a half': 0.5,
    'one half': 0.5,
    '1/2': 0.5,
    '50%': 0.5,
    'three quarters': 0.75,
    'three quarter': 0.75,
    'three fourths': 0.75,
    'three fourth': 0.75,
    '3/4': 0.75,
    '75%': 0.75,
    full: 1,
    '1': 1,
    '100%': 1,
  }

  if (map[cleaned] !== undefined) {
    return map[cleaned]
  }

  const fractionMatch = cleaned.match(/^(\d+)\s*\/\s*(\d+)$/)
  if (fractionMatch) {
    const numerator = Number(fractionMatch[1])
    const denominator = Number(fractionMatch[2])
    if (denominator > 0) {
      return Math.min(1, Math.max(0, numerator / denominator))
    }
  }

  if (/^\d+(\.\d+)?%$/.test(cleaned)) {
    const percent = Number(cleaned.replace('%', ''))
    return Math.min(1, Math.max(0, percent / 100))
  }

  const numeric = Number(cleaned)
  if (!Number.isNaN(numeric)) {
    let value = numeric
    if (value > 1) {
      value = value > 100 ? 1 : value / 100
    }
    return Math.min(1, Math.max(0, value))
  }

  return 1
}

function computeFuelFee(level, vehicle) {
  if (!vehicle) return 0
  const capacity = Number(vehicle.fuel_capacity || 0)
  const penalty = Number(vehicle.gasoline_late_fee_per_liter || 0)
  if (capacity <= 0 || penalty <= 0) return 0

  const fraction = getFuelLevelFraction(level)
  const missingFraction = Math.max(0, 1 - fraction)
  if (missingFraction <= 0) return 0

  const missingLiters = capacity * missingFraction
  return Number((missingLiters * penalty).toFixed(2))
}

const calculatedFuelFee = computed(() => computeFuelFee(form.value.fuel_level, booking.value?.vehicle))

const fuelFeeDetails = computed(() => {
  const vehicle = booking.value?.vehicle
  if (!vehicle) return null

  const capacity = Number(vehicle.fuel_capacity || 0)
  const penalty = Number(vehicle.gasoline_late_fee_per_liter || 0)
  if (capacity <= 0 || penalty <= 0) return null

  const rawLevel = form.value.fuel_level
  const fraction = getFuelLevelFraction(rawLevel)
  const missingFraction = Math.max(0, 1 - fraction)
  const missingLiters = capacity * missingFraction
  const fee = computeFuelFee(rawLevel, vehicle)

  return {
    rawLevel,
    capacity,
    penalty,
    fraction,
    missingFraction,
    missingLiters,
    missingPercent: missingFraction * 100,
    fee,
  }
})

const totalFees = computed(() => {
  const { late_fee = 0, damage_fee = 0, cleaning_fee = 0 } = form.value
  return Number(late_fee || 0) + Number(damage_fee || 0) + Number(cleaning_fee || 0) + calculatedFuelFee.value
})

const calculatedRefundAmount = computed(() => {
  const depositAmount = Number(booking.value?.vehicle?.deposit || 0)
  return Math.max(0, depositAmount - totalFees.value)
})

const currentDateTimeLocal = computed(() => formatDateTimeLocal(new Date()))

watch(
  () => form.value.deposit_status,
  (status) => {
    if (status !== 'refunded') {
      hasManualDepositAmount.value = false
      return
    }

    if (
      !hasManualDepositAmount.value &&
      form.value.deposit_refund_amount !== calculatedRefundAmount.value
    ) {
      form.value.deposit_refund_amount = calculatedRefundAmount.value
    }
  },
)

watch(calculatedRefundAmount, (value) => {
  if (
    form.value.deposit_status === 'refunded' &&
    !hasManualDepositAmount.value &&
    form.value.deposit_refund_amount !== value
  ) {
    form.value.deposit_refund_amount = value
  }
})

watch(
  booking,
  (val) => {
    if (val) initializeForm(val)
  },
  { immediate: true },
)

function syncFuelSelection(rawFuelLevel) {
  const raw = rawFuelLevel ?? ''
  const stringValue = raw.toString()
  const normalized = stringValue.trim().toLowerCase()
  const cleaned = normalized.replace(/tank|level|fuel/g, '').replace(/-/g, ' ').trim()

  if (!normalized) {
    fuelSelectValue.value = ''
    customFuelLevel.value = ''
    form.value.fuel_level = ''
    return
  }

  const matchGroups = [
    { value: 'full', keys: ['full', '1', '1.0', '100%'] },
    {
      value: 'three_quarters',
      keys: ['3/4', '0.75', '75%', 'three quarters', 'three quarter', 'three fourths', 'three fourth'],
    },
    { value: 'half', keys: ['half', '1/2', '0.5', '50%', 'one half', 'a half'] },
    { value: 'quarter', keys: ['1/4', '0.25', '25%', 'quarter', 'one quarter', 'a quarter'] },
    { value: 'empty', keys: ['empty', '0', '0%'] },
  ]

  for (const group of matchGroups) {
    if (group.keys.includes(cleaned) || group.keys.includes(normalized)) {
      fuelSelectValue.value = group.value
      customFuelLevel.value = ''
      form.value.fuel_level = presetFuelValueMap[group.value]
      return
    }
  }

  fuelSelectValue.value = 'custom'
  customFuelLevel.value = stringValue
  form.value.fuel_level = stringValue
}

function initializeForm(bookingData) {
  const vehicleReturn = bookingData.vehicle_return
  const parsedExistingLateFee = vehicleReturn?.late_fee !== undefined && vehicleReturn?.late_fee !== null
    ? Number(vehicleReturn.late_fee)
    : NaN
  const damageFee = vehicleReturn?.damage_fee ? Number(vehicleReturn.damage_fee) : 0
  const cleaningFee = vehicleReturn?.cleaning_fee ? Number(vehicleReturn.cleaning_fee) : 0
  const autoLateFee = Number.isFinite(calculatedLateFee.value) ? calculatedLateFee.value : 0
  const appliedLateFee = Number.isFinite(parsedExistingLateFee) && parsedExistingLateFee > 0
    ? parsedExistingLateFee
    : autoLateFee
  const depositAmount = Number(bookingData.vehicle?.deposit || 0)
  const storedFuelFee = vehicleReturn?.fuel_fee !== undefined && vehicleReturn?.fuel_fee !== null
    ? Number(vehicleReturn.fuel_fee)
    : computeFuelFee(vehicleReturn?.fuel_level, bookingData.vehicle)
  const defaultTotalFees = appliedLateFee + damageFee + cleaningFee + storedFuelFee
  const defaultRefundAmount = Math.max(0, depositAmount - defaultTotalFees)
  const returnedAtInput = vehicleReturn?.returned_at
    ? formatDateTimeLocal(vehicleReturn.returned_at)
    : formatDateTimeLocal(new Date())

  form.value = {
    odometer: vehicleReturn?.odometer ?? '',
    fuel_level: vehicleReturn?.fuel_level ?? '',
    condition_notes: vehicleReturn?.condition_notes || '',
    images: [],
    returned_at: returnedAtInput,
    late_fee: appliedLateFee,
    damage_fee: damageFee,
    cleaning_fee: cleaningFee,
    deposit_status: vehicleReturn?.deposit_status || 'pending',
    deposit_refund_amount: vehicleReturn?.deposit_refund_amount ? Number(vehicleReturn.deposit_refund_amount) : defaultRefundAmount,
    deposit_refund_notes: vehicleReturn?.deposit_refund_notes || '',
    deposit_refund_proof: Array.isArray(vehicleReturn?.deposit_refund_proof) ? [...vehicleReturn.deposit_refund_proof] : [],
    refund_method: vehicleReturn?.refund_method || '',
  }

  syncFuelSelection(vehicleReturn?.fuel_level)

  hasManualDepositAmount.value = Boolean(
    vehicleReturn?.deposit_status === 'refunded' && vehicleReturn?.deposit_refund_amount !== undefined && vehicleReturn?.deposit_refund_amount !== null,
  )
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return formatDateTimeUTC(dateStr)
}

function formatScheduleDate(dateStr) {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatCurrency(amount) {
  const value = Number(amount || 0)
  return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatNumber(value, decimals = 0) {
  const num = Number(value ?? 0)
  if (!Number.isFinite(num)) return '—'
  return decimals > 0 ? num.toFixed(decimals) : `${num}`
}

function formatDateTimeLocal(value) {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60000)
  return local.toISOString().slice(0, 16)
}

function openImageModal(imageSrc) {
  selectedImage.value = imageSrc
  imageModalOpen.value = true
}

function processFiles(files) {
  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )
  Promise.all(readers).then((images) => {
    form.value.images = [...form.value.images, ...images]
  })
}

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files)
  processFiles(files)
}

function processRefundFiles(files) {
  const readers = files.map(
    (file) =>
      new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target.result)
        reader.readAsDataURL(file)
      }),
  )
  Promise.all(readers).then((images) => {
    form.value.deposit_refund_proof = [...form.value.deposit_refund_proof, ...images]
  })
}

function handleRefundDrop(e) {
  isRefundDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processRefundFiles(files)
}

function handleRefundFileChange(e) {
  const files = Array.from(e.target.files)
  processRefundFiles(files)
}

function handleSubmit() {
  if (!booking.value) return
  const currentId = booking.value.id
  const payload = {
    ...form.value,
    returned_at: form.value.returned_at
      ? new Date(form.value.returned_at).toISOString()
      : null,
  }
  returnVehicle(
    { bookingId: currentId, ...payload },
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin', 'vehicle-returns'] })
        queryClient.invalidateQueries({ queryKey: ['admin', 'vehicle-return', currentId] })
        router.push({ name: 'admin-vehicle-returns' })
      },
    },
  )
}

function handleBack() {
  router.push({ name: 'admin-vehicle-returns' })
}

function handleDepositAmountUpdate() {
  if (form.value.deposit_status === 'refunded') {
    hasManualDepositAmount.value = true
  }
}

function getDepositStatusVariant(status) {
  switch (status) {
    case 'refunded':
      return 'success'
    case 'withheld':
      return 'destructive'
    case 'pending':
    default:
      return 'secondary'
  }
}

function getDepositStatusLabel(status) {
  switch (status) {
    case 'refunded':
      return 'Refunded'
    case 'withheld':
      return 'Withheld'
    case 'pending':
    default:
      return 'Pending Refund'
  }
}

function getReturnStatusVariant(status) {
  switch (status) {
    case 'completed':
      return 'success'
    case 'customer_submitted':
      return 'warning'
    case 'admin_processing':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getReturnStatusLabel(status) {
  switch (status) {
    case 'completed':
      return 'Completed'
    case 'customer_submitted':
      return 'Customer Submitted'
    case 'admin_processing':
      return 'Admin Processing'
    default:
      return status ? status.replace('_', ' ') : 'Pending'
  }
}

const errorMessage = computed(() => error.value?.message || 'Unable to load booking details right now.')
</script>
