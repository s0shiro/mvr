<template>
  <Dialog :open="open" @update:open="$emit('update:open', $event)">
    <DialogContent class="max-w-4xl w-full max-h-[95vh] overflow-hidden flex flex-col">
      <DialogHeader class="flex-shrink-0 pb-4">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
            <Car class="w-6 h-6 text-primary" />
          </div>
          <div>
            <DialogTitle class="text-xl text-gray-900 dark:text-gray-100">Process Vehicle Return</DialogTitle>
            <DialogDescription class="mt-1 text-gray-600 dark:text-gray-400">
              {{ isCustomerSubmitted 
                ? 'Review customer submission and complete the return process.' 
                : 'Record vehicle condition and process the return.' 
              }}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>
      <div class="flex-1 overflow-y-auto pr-2">
        <!-- Customer Submitted Section -->
        <div v-if="isCustomerSubmitted" class="mb-6">
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl p-5 shadow-sm dark:shadow-gray-900/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Clock class="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 class="font-semibold text-blue-900 dark:text-blue-100 text-lg">Customer Submission</h3>
                <p class="text-sm text-blue-700 dark:text-blue-300">Submitted on {{ formatDate(booking.vehicle_return?.customer_submitted_at) }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Customer Images -->
              <div v-if="customerImages?.length" class="space-y-3">
                <Label class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <Camera class="w-4 h-4" />
                  Customer Photos
                </Label>
                <div class="grid grid-cols-2 gap-2">
                  <img
                    v-for="(img, i) in customerImages"
                    :key="i"
                    :src="img"
                    class="w-full h-20 object-cover rounded-lg border-2 border-blue-200 dark:border-blue-700 cursor-pointer hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
                    @click="openImageModal(img)"
                  />
                </div>
              </div>
              
              <!-- Customer Details -->
              <div class="space-y-3">
                <div v-if="booking.vehicle_return?.customer_condition_notes" class="space-y-2">
                  <Label class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    <FileText class="w-4 h-4" />
                    Customer Notes
                  </Label>
                  <div class="bg-white/70 dark:bg-gray-800/70 p-3 rounded-lg border border-blue-200 dark:border-blue-700 text-sm text-blue-800 dark:text-blue-200 shadow-sm">
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
            
            <!-- Customer Refund Info -->
            <div v-if="booking.vehicle_return?.customer_refund_method" class="mt-4 pt-4 border-t border-blue-200 dark:border-blue-700">
              <Label class="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2 mb-3">
                <CreditCard class="w-4 h-4" />
                Refund Information
              </Label>
              <div class="bg-white/70 dark:bg-gray-800/70 border border-blue-200 dark:border-blue-700 rounded-lg p-4 space-y-2 shadow-sm">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-blue-900 dark:text-blue-100">Method:</span>
                  <span class="text-sm text-blue-800 dark:text-blue-200 capitalize">{{ booking.vehicle_return.customer_refund_method.replace('_', ' ') }}</span>
                </div>
                
                <div v-if="booking.vehicle_return.customer_refund_method === 'gcash'" class="space-y-1">
                  <div class="flex justify-between text-sm">
                    <span class="font-medium text-blue-900 dark:text-blue-100">GCash:</span>
                    <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_account_number }}</span>
                  </div>
                  <div class="flex justify-between text-sm">
                    <span class="font-medium text-blue-900 dark:text-blue-100">Name:</span>
                    <span class="text-blue-800 dark:text-blue-200">{{ booking.vehicle_return.customer_account_name }}</span>
                  </div>
                </div>
                
                <div v-if="booking.vehicle_return.customer_refund_method === 'bank_transfer'" class="space-y-1">
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
                </div>
                
                <div v-if="booking.vehicle_return.customer_refund_notes" class="pt-2 border-t border-blue-200 dark:border-blue-700">
                  <span class="text-sm font-medium text-blue-900 dark:text-blue-100">Notes:</span>
                  <p class="text-sm text-blue-800 dark:text-blue-200 mt-1">{{ booking.vehicle_return.customer_refund_notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Vehicle Condition Section -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-gray-900/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Car class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Vehicle Condition</h3>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Odometer Reading</Label>
                <Input 
                  v-model="form.odometer" 
                  type="number" 
                  min="0" 
                  placeholder="Final odometer reading"
                  :disabled="isCustomerSubmitted && booking.vehicle_return?.odometer"
                  class="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              
              <div class="space-y-2">
                <Label class="text-sm font-medium text-gray-700 dark:text-gray-300">Fuel Level</Label>
                <Input 
                  v-model="form.fuel_level" 
                  placeholder="e.g. Full, 3/4, Half"
                  :disabled="isCustomerSubmitted && booking.vehicle_return?.fuel_level"
                  class="h-10 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
            
            <div v-if="!isCustomerSubmitted" class="space-y-3">
              <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <Camera class="w-4 h-4" />
                Return Photos
              </Label>
              <div
                class="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-gray-50 dark:bg-gray-900 hover:border-primary hover:bg-primary/5 dark:hover:bg-primary/10 transition-all duration-200 relative min-h-[120px]"
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
                  <div
                    v-for="(img, i) in form.images"
                    :key="i"
                    class="relative group"
                  >
                    <img
                      :src="img"
                      class="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                    />
                    <button
                      type="button"
                      @click="form.images.splice(i, 1)"
                      class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="space-y-2">
              <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FileText class="w-4 h-4" />
                Condition Notes
              </Label>
              <Textarea
                v-model="form.condition_notes"
                placeholder="Admin assessment of vehicle condition, damages, or additional notes..."
                rows="3"
                class="resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          </div>          <!-- Fees Section -->
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
                You can adjust this amount if further assessment is needed.
              </p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-2">
                <Label class="text-sm font-medium text-red-700 dark:text-red-400">Late Fee (₱)</Label>
                <Input 
                  v-model.number="form.late_fee" 
                  type="number" 
                  min="0" 
                  placeholder="0"
                  class="h-10 border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-medium text-red-700 dark:text-red-400">Damage Fee (₱)</Label>
                <Input 
                  v-model.number="form.damage_fee" 
                  type="number" 
                  min="0" 
                  placeholder="0"
                  class="h-10 border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div class="space-y-2">
                <Label class="text-sm font-medium text-red-700 dark:text-red-400">Cleaning Fee (₱)</Label>
                <Input 
                  v-model.number="form.cleaning_fee" 
                  type="number" 
                  min="0" 
                  placeholder="0"
                  class="h-10 border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
            </div>
          </div>
          
          <!-- Deposit Refund Section -->
          <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm dark:shadow-gray-900/20">
            <div class="flex items-center gap-3 mb-4">
              <div class="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CreditCard class="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Security Deposit Refund</h3>
            </div>
            
            <!-- Summary Card -->
            <div class="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-5 mb-6">
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div class="space-y-1">
                  <p class="text-sm font-medium text-gray-600 dark:text-gray-400">Original Deposit</p>
                  <p class="text-2xl font-bold text-gray-900 dark:text-gray-100">₱{{ booking.vehicle?.deposit || 0 }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-red-600 dark:text-red-400">Total Fees</p>
                  <p class="text-2xl font-bold text-red-600 dark:text-red-400">-₱{{ totalFees }}</p>
                </div>
                <div class="space-y-1">
                  <p class="text-sm font-medium text-green-600 dark:text-green-400">Refund Amount</p>
                  <p class="text-2xl font-bold text-green-600 dark:text-green-400">₱{{ calculatedRefundAmount }}</p>
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
                      type="number" 
                      min="0" 
                      :max="booking.vehicle?.deposit || 0"
                      :placeholder="calculatedRefundAmount.toString()"
                      class="h-10 border-green-200 dark:border-green-800 focus:border-green-400 dark:focus:border-green-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
                    <FileText class="w-4 h-4" />
                    Refund Notes
                  </Label>
                  <Textarea
                    v-model="form.deposit_refund_notes"
                    placeholder="Notes about the refund transaction..."
                    rows="2"
                    class="resize-none bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div class="space-y-3">
                  <Label class="text-sm font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                    <Camera class="w-4 h-4" />
                    Refund Proof Photos
                  </Label>
                  <div
                    class="border-2 border-dashed border-green-300 dark:border-green-700 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer bg-green-50 dark:bg-green-950 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-100 dark:hover:bg-green-900 transition-all duration-200 relative min-h-[120px]"
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
                      <div
                        v-for="(img, i) in form.deposit_refund_proof"
                        :key="i"
                        class="relative group"
                      >
                        <img
                          :src="img"
                          class="w-20 h-20 object-cover rounded-lg border-2 border-green-200 dark:border-green-700 shadow-sm cursor-pointer"
                          @click="openImageModal(img)"
                        />
                        <button
                          type="button"
                          @click="form.deposit_refund_proof.splice(i, 1)"
                          class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
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
                    <AlertCircle class="w-4 h-4" />
                    Reason for Withholding
                  </Label>
                  <Textarea
                    v-model="form.deposit_refund_notes"
                    placeholder="Explain why the deposit is being withheld..."
                    rows="3"
                    class="resize-none border-red-200 dark:border-red-800 focus:border-red-400 dark:focus:border-red-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <DialogFooter class="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 px-6 py-4 mt-6">
        <Button type="button" variant="outline" @click="$emit('update:open', false)" class="h-10 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
          Cancel
        </Button>
        <Button 
          type="submit" 
          :disabled="isSubmitting"
          @click="handleSubmit"
          class="h-10 min-w-[140px] bg-primary hover:bg-primary/90 text-white"
        >
          <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin mr-2" />
          {{ isSubmitting ? 'Processing...' : (isCustomerSubmitted ? 'Complete Return' : 'Submit Return') }}
        </Button>
      </DialogFooter>
    </DialogContent>
    
    <!-- Image Modal -->
    <Dialog :open="imageModalOpen" @update:open="imageModalOpen = $event">
      <DialogContent class="max-w-5xl w-full max-h-[90vh] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <Camera class="w-5 h-5" />
            Vehicle Photo
          </DialogTitle>
        </DialogHeader>
        <div class="flex justify-center items-center min-h-[60vh]">
          <img :src="selectedImage" class="max-w-full max-h-full object-contain rounded-lg shadow-lg" />
        </div>
      </DialogContent>
    </Dialog>
  </Dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useReturnVehicle } from '@/services/admin/vehicle-return-service'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Car, Calculator, CreditCard, Camera, FileText, AlertCircle, CheckCircle, Clock } from 'lucide-vue-next'

const props = defineProps({
  booking: Object,
  open: Boolean,
})
const emit = defineEmits(['update:open', 'returned'])

const form = ref({
  odometer: '',
  fuel_level: '',
  condition_notes: '',
  images: [],
  late_fee: 0,
  damage_fee: 0,
  cleaning_fee: 0,
  // Deposit refund fields
  deposit_status: 'pending',
  deposit_refund_amount: 0,
  deposit_refund_notes: '',
  deposit_refund_proof: [],
  refund_method: '',
})

const isDragging = ref(false)
const isRefundDragging = ref(false)
const fileInput = ref(null)
const refundFileInput = ref(null)
const imageModalOpen = ref(false)
const selectedImage = ref('')
const isSubmitting = ref(false)

const isCustomerSubmitted = computed(() => {
  return props.booking?.vehicle_return?.status === 'customer_submitted'
})

const customerImages = computed(() => {
  return props.booking?.vehicle_return?.customer_images || []
})

const calculatedLateFee = computed(() => {
  const fee = props.booking?.calculated_late_fee
  const parsed = fee !== undefined && fee !== null ? Number(fee) : 0
  return Number.isFinite(parsed) ? parsed : 0
})

const lateFeeDetails = computed(() => props.booking?.late_fee_details ?? null)

const lateFeeSummary = computed(() => {
  const details = lateFeeDetails.value
  if (!details || !details.late_minutes_total) return ''

  const segments = []
  if (details.late_days) {
    segments.push(`${details.late_days} day${details.late_days === 1 ? '' : 's'}`)
  }
  if (details.late_hours) {
    segments.push(`${details.late_hours} hour${details.late_hours === 1 ? '' : 's'}`)
  }
  if (details.half_hour_applied) {
    segments.push('30+ minutes')
  }

  return segments.join(', ')
})

const totalFees = computed(() => {
  const { late_fee = 0, damage_fee = 0, cleaning_fee = 0 } = form.value
  return Number(late_fee || 0) + Number(damage_fee || 0) + Number(cleaning_fee || 0)
})

const calculatedRefundAmount = computed(() => {
  const depositAmount = Number(props.booking?.vehicle?.deposit || 0)
  return Math.max(0, depositAmount - totalFees.value)
})

// Auto-update refund amount when fees change and status is refunded
watch([totalFees, () => form.value.deposit_status], () => {
  if (form.value.deposit_status === 'refunded' && !form.value.deposit_refund_amount) {
    form.value.deposit_refund_amount = calculatedRefundAmount.value
  }
})

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatCurrency(amount) {
  const value = Number(amount || 0)
  return value.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function openImageModal(imageSrc) {
  selectedImage.value = imageSrc
  imageModalOpen.value = true
}

function initializeForm() {
  if (!props.booking) return

  const vehicleReturn = props.booking.vehicle_return
  const existingLateFee = vehicleReturn?.late_fee
  const parsedExistingLateFee = existingLateFee !== undefined && existingLateFee !== null ? Number(existingLateFee) : null
  const autoLateFee = calculatedLateFee.value

  form.value = {
    odometer: vehicleReturn?.odometer ?? '',
    fuel_level: vehicleReturn?.fuel_level ?? '',
    condition_notes: '',
    images: [],
    late_fee: Number.isFinite(parsedExistingLateFee) ? parsedExistingLateFee : autoLateFee,
    damage_fee: vehicleReturn?.damage_fee ? Number(vehicleReturn.damage_fee) : 0,
    cleaning_fee: vehicleReturn?.cleaning_fee ? Number(vehicleReturn.cleaning_fee) : 0,
    // Deposit refund fields
    deposit_status: vehicleReturn?.deposit_status || 'pending',
    deposit_refund_amount: vehicleReturn?.deposit_refund_amount ? Number(vehicleReturn.deposit_refund_amount) : 0,
    deposit_refund_notes: vehicleReturn?.deposit_refund_notes || '',
    deposit_refund_proof: Array.isArray(vehicleReturn?.deposit_refund_proof) ? [...vehicleReturn.deposit_refund_proof] : [],
    refund_method: vehicleReturn?.refund_method || '',
  }
}

watch(
  () => props.open,
  (val) => {
    if (val) {
      initializeForm()
    }
  },
)

watch(
  () => props.booking,
  () => {
    if (props.open) {
      initializeForm()
    }
  },
)

const { mutate: returnVehicle } = useReturnVehicle()

function handleDrop(e) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processFiles(files)
}

function handleFileChange(e) {
  const files = Array.from(e.target.files)
  processFiles(files)
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

function handleRefundDrop(e) {
  isRefundDragging.value = false
  const files = Array.from(e.dataTransfer.files)
  processRefundFiles(files)
}

function handleRefundFileChange(e) {
  const files = Array.from(e.target.files)
  processRefundFiles(files)
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

function handleSubmit() {
  if (!props.booking) return
  
  isSubmitting.value = true
  
  returnVehicle(
    { bookingId: props.booking.id, ...form.value },
    {
      onSuccess: () => {
        isSubmitting.value = false
        emit('update:open', false)
        emit('returned')
      },
      onError: () => {
        isSubmitting.value = false
      },
    },
  )
}
</script>
