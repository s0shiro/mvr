<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
    <!-- Header Section -->
    <div class="flex flex-col space-y-6">
      <!-- Page Title -->
      <div class="flex items-center justify-between">
        <h1 class="text-2xl sm:text-3xl font-bold flex items-center gap-3">
          <ClipboardList class="w-7 h-7 text-primary" />
          My Bookings
        </h1>
      </div>

      <!-- Controls Section -->
      <div class="bg-card border rounded-lg p-4 sm:p-6 shadow-sm">
        <div class="flex flex-col xl:flex-row gap-6 xl:items-end xl:justify-between">
          <!-- Sorting and Filtering Controls -->
          <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-end flex-1">
            <!-- Sorting Controls -->
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div class="flex flex-col gap-2 min-w-0">
                <Label for="sort-by" class="text-sm font-medium text-muted-foreground">Sort by:</Label>
                <select
                  id="sort-by"
                  v-model="sortBy"
                  class="flex h-10 w-full sm:w-48 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="created_at">Booking Date</option>
                  <option value="start_date">Rental Start Date</option>
                  <option value="end_date">Rental End Date</option>
                  <option value="total_price">Amount</option>
                </select>
              </div>

              <div class="flex flex-col gap-2">
                <Label class="text-sm font-medium text-muted-foreground">Order:</Label>
                <div class="flex items-center gap-0 border rounded-md overflow-hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    :class="['px-4 py-2 rounded-none border-r h-10', sortOrder === 'desc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']"
                    @click="sortOrder = 'desc'"
                  >
                    <TrendingDown class="w-4 h-4 mr-2" />
                    Desc
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    :class="['px-4 py-2 rounded-none h-10', sortOrder === 'asc' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted']"
                    @click="sortOrder = 'asc'"
                  >
                    <TrendingUp class="w-4 h-4 mr-2" />
                    Asc
                  </Button>
                </div>
              </div>
            </div>

            <!-- Status Filter -->
            <div class="flex flex-col gap-2 flex-1 min-w-0">
              <Label class="text-sm font-medium text-muted-foreground">Filter by Status:</Label>
              <Tabs v-model="statusFilter" class="w-full">
                <TabsList class="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-10">
                  <TabsTrigger value="" class="text-xs sm:text-sm">All</TabsTrigger>
                  <TabsTrigger value="pending" class="text-xs sm:text-sm">Pending</TabsTrigger>
                  <TabsTrigger value="confirmed" class="text-xs sm:text-sm">Confirmed</TabsTrigger>
                  <TabsTrigger value="for_release" class="text-xs sm:text-sm">For Release</TabsTrigger>
                  <TabsTrigger value="released" class="text-xs sm:text-sm">Released</TabsTrigger>
                  <TabsTrigger value="cancelled" class="text-xs sm:text-sm">Canceled</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>

          <!-- Action Buttons -->
          <div v-if="bookings.length > 0" class="flex items-center justify-end">
            <Button
              variant="outline"
              size="sm"
              @click="toggleAllCards"
              class="flex items-center gap-2 h-10 px-4"
            >
              <Minimize2 v-if="!globalMinimized" class="w-4 h-4" />
              <Maximize2 v-else class="w-4 h-4" />
              {{ globalMinimized ? 'Expand All' : 'Minimize All' }}
            </Button>
          </div>
        </div>
      </div>
    </div>
    <!-- Main Content -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <Loading text="Loading your bookings..." />
    </div>
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-600 font-medium">{{ error.message }}</div>
    </div>
    <div v-else>
      <!-- Empty State -->
      <div
        v-if="!bookings.length"
        class="text-center py-16"
      >
        <div class="w-16 h-16 mx-auto mb-6 opacity-50">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-muted-foreground">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14,2 14,8 20,8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10,9 9,9 8,9"></polyline>
          </svg>
        </div>
        <h3 class="text-xl font-semibold text-foreground mb-2">
          {{ statusFilter ? `No ${formatStatusText(statusFilter)} bookings` : 'No bookings yet' }}
        </h3>
        <p class="text-muted-foreground max-w-md mx-auto mb-6">
          {{ statusFilter
            ? `You don't have any bookings with ${formatStatusText(statusFilter)} status.`
            : 'Start your journey by browsing our available vehicles and creating your first booking.'
          }}
        </p>
        <Button as-child variant="default" size="lg">
          <RouterLink to="/vehicles" class="flex items-center gap-2">
            <Car class="w-4 h-4" />
            Browse Vehicles
          </RouterLink>
        </Button>
      </div>

      <!-- Bookings List -->
                <!-- Bookings List -->
          <div v-else class="space-y-6">
            <template v-for="booking in bookings" :key="booking.id">
              <Card
                :class="[
                  'border transition-all duration-300 hover:shadow-lg overflow-hidden',
                  booking.status === 'cancelled'
                    ? 'border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 relative'
                    : 'border-border bg-card hover:shadow-md'
                ]"
              >
          <CardHeader class="flex flex-row items-center justify-between gap-4">
            <div :class="booking.status === 'cancelled' ? 'line-through text-muted-foreground' : ''" class="flex-1">
              <CardTitle 
                :class="[
                  'text-lg font-semibold',
                  booking.status === 'cancelled' ? 'text-muted-foreground' : ''
                ]"
              >{{
                booking.vehicle?.name || 'Vehicle'
              }}</CardTitle>
              <CardDescription 
                :class="booking.status === 'cancelled' ? 'text-muted-foreground/70' : ''"
              >
                <span class="font-medium">{{ booking.vehicle?.brand }}</span>
                <span v-if="booking.vehicle"
                  >• {{ booking.vehicle.model }} ({{ booking.vehicle.year }})</span
                >
              </CardDescription>
              <!-- Minimized view - show key info in header -->
              <div v-if="isCardMinimized(booking.id)" class="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <div class="flex items-center gap-1">
                  <CalendarDays class="w-3 h-3 text-muted-foreground" />
                  <span>{{ formatDate(booking.start_date) }} - {{ formatDate(booking.end_date) }}</span>
                </div>
                <div class="flex items-center gap-1">
                  <Receipt class="w-3 h-3 text-muted-foreground" />
                  <span class="font-medium text-primary">₱{{ Number(booking.total_price).toLocaleString() }}</span>
                </div>
                <div v-if="booking.payment" class="flex items-center gap-1">
                  <CreditCard class="w-3 h-3 text-muted-foreground" />
                  <Badge
                    v-if="booking.payment.status === 'approved'"
                    variant="available"
                    class="text-xs"
                    >Paid</Badge
                  >
                  <Badge
                    v-else-if="booking.payment.status === 'pending'"
                    variant="maintenance"
                    class="text-xs"
                    >Pending</Badge
                  >
                  <Badge
                    v-else-if="booking.payment.status === 'rejected'"
                    variant="destructive"
                    class="text-xs"
                    >Rejected</Badge
                  >
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <Badge :variant="getStatusVariant(booking.status)">{{ booking.status === 'cancelled' ? 'Canceled' : booking.status }}</Badge>
              <Button
                variant="ghost"
                size="sm"
                @click="toggleCardMinimized(booking.id)"
                class="h-8 w-8 p-0 minimize-button"
              >
                <ChevronDown v-if="!isCardMinimized(booking.id)" class="w-4 h-4" />
                <ChevronUp v-else class="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent 
            v-if="!isCardMinimized(booking.id)"
            class="flex flex-col md:flex-row gap-6 items-center md:items-start card-content-transition"
          >
            <div 
              v-if="booking.vehicle?.primary_image_url" 
              class="relative group"
            >
              <img
                :src="booking.vehicle.primary_image_url"
                alt="Vehicle"
                :class="[
                  'w-40 h-28 object-cover rounded-xl shadow-md border-2 transition-all duration-300',
                  booking.status === 'cancelled' 
                    ? 'grayscale opacity-70 border-red-200 dark:border-red-700/50' 
                    : 'border-border group-hover:shadow-lg'
                ]"
              />
              <div 
                v-if="booking.status === 'cancelled'"
                class="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl backdrop-blur-[1px]"
              >
                <div class="bg-red-600/90 dark:bg-red-700/90 text-white px-3 py-1 rounded-lg shadow-lg border border-red-400 dark:border-red-500">
                  <span class="font-bold text-sm tracking-wide">CANCELED</span>
                </div>
              </div>
            </div>
            <div 
              :class="[
                'flex-1 space-y-4',
                booking.status === 'cancelled' ? 'text-muted-foreground/70' : ''
              ]"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex items-center gap-2">
                    <CalendarDays class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Rental Period:</span>
                    <span class="font-medium"
                      >{{ formatDate(booking.start_date) }} -
                      {{ formatDate(booking.end_date) }}</span
                    >
                  </div>
                  <div class="flex items-center gap-2">
                    <Receipt class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Total Price:</span>
                    <span class="font-medium text-primary"
                      >₱{{ Number(booking.total_price).toLocaleString() }}</span
                    >
                    <template v-if="requiresDeposit(booking)">
                      <ShieldCheck class="w-4 h-4 text-muted-foreground" />
                      <span class="font-semibold text-sm text-muted-foreground">
                        Security Deposit:</span
                      >
                      <span class="font-medium text-primary"
                        >₱{{ Number(booking.vehicle.deposit).toLocaleString() }}</span
                      >
                    </template>
                  </div>
                  <div v-if="booking.pickup_type === 'delivery'" class="flex items-center gap-2">
                    <Truck class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Delivery:</span>
                    <span class="font-medium">{{ booking.delivery_location }}</span>
                    <span class="text-sm text-muted-foreground">(₱{{ booking.delivery_fee }})</span>
                  </div>
                  <div
                    v-if="booking.pickup_type === 'delivery'"
                    class="text-sm text-muted-foreground mt-1 ml-6"
                  >
                    <span class="font-medium">Delivery Details:</span>
                    <p class="mt-1">{{ booking.delivery_details }}</p>
                  </div>
                  <div v-if="booking.payment" class="flex items-center gap-2">
                    <CreditCard class="w-4 h-4 text-muted-foreground" />
                    <span class="font-semibold text-sm text-muted-foreground">Payment Method:</span>
                    <span class="font-medium">{{ booking.payment.method }}</span>
                    <Badge
                      v-if="booking.payment.status === 'approved'"
                      variant="available"
                      class="ml-2"
                      >Paid</Badge
                    >
                    <Badge
                      v-else-if="booking.payment.status === 'pending'"
                      variant="maintenance"
                      class="ml-2"
                      >Pending</Badge
                    >
                    <Badge
                      v-else-if="booking.payment.status === 'rejected'"
                      variant="destructive"
                      class="ml-2"
                      >Rejected</Badge
                    >
                  </div>
                </div>

                <div
                  v-if="booking.notes"
                  class="text-sm text-muted-foreground bg-muted p-3 rounded-lg"
                >
                  <span class="font-semibold block mb-1 flex items-center gap-2">
                    <AlertCircle class="w-4 h-4" /> Notes
                  </span>
                  {{ booking.notes }}
                </div>

                <div
                  v-if="booking.status === 'cancelled'"
                  class="space-y-3"
                >
                  <!-- Cancellation Notice -->
                  <div class="bg-gradient-to-r from-red-100 to-red-50 dark:from-red-950/60 dark:to-red-900/40 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 p-4 rounded-xl shadow-sm">
                    <div class="flex items-start gap-3">
                      <div class="flex-shrink-0 w-10 h-10 bg-red-200 dark:bg-red-800/50 rounded-full flex items-center justify-center">
                        <X class="w-5 h-5 text-red-600 dark:text-red-400" />
                      </div>
                      <div class="flex-1">
                        <h4 class="font-semibold text-red-900 dark:text-red-100 mb-1">Booking Canceled</h4>
                        <p class="text-red-700 dark:text-red-300 text-sm leading-relaxed">
                          This booking has been canceled.
                          <span v-if="booking.cancellation_reason" class="block mt-1">
                            <strong>Reason:</strong> {{ booking.cancellation_reason }}
                          </span>
                          <span v-if="booking.cancelled_at" class="block mt-1 text-red-600 dark:text-red-400 text-xs">
                            Canceled on {{ formatDate(booking.cancelled_at) }}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Refund Status -->
                  <div 
                    v-if="booking.refund_status" 
                    class="rounded-xl border shadow-sm overflow-hidden"
                    :class="getRefundStatusClasses(booking.refund_status)"
                  >
                    <div class="p-4">
                      <div class="flex items-center gap-3 mb-3">
                        <div class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center"
                             :class="getRefundStatusIconBg(booking.refund_status)">
                          <component :is="getRefundStatusIcon(booking.refund_status)" class="w-5 h-5" 
                                     :class="getRefundStatusIconColor(booking.refund_status)" />
                        </div>
                        <div class="flex-1">
                          <h4 class="font-semibold text-lg" :class="getRefundStatusTextColor(booking.refund_status)">
                            {{ getRefundStatusText(booking.refund_status) }}
                          </h4>
                        </div>
                      </div>
                      
                      <!-- Refund Amount Display -->
                      <div v-if="booking.refund_amount && booking.refund_status === 'processed'" 
                           class="mb-3 p-3 rounded-lg border bg-white/60 dark:bg-white/5 border-green-200 dark:border-green-700/50">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium text-green-800 dark:text-green-200">Refund Amount:</span>
                          <span class="text-xl font-bold text-green-700 dark:text-green-300">₱{{ Number(booking.refund_amount).toLocaleString() }}</span>
                        </div>
                      </div>
                      
                      <!-- Processing Details -->
                      <div v-if="booking.refund_processed_at" class="space-y-2 text-sm">
                        <p class="opacity-75">
                          <strong>Processed:</strong> {{ formatDate(booking.refund_processed_at) }}
                        </p>
                        <p v-if="booking.refund_notes" class="opacity-75 italic bg-white/30 dark:bg-black/20 p-2 rounded border border-white/40 dark:border-white/10">
                          "{{ booking.refund_notes }}"
                        </p>
                      </div>
                      
                      <!-- Refund Proof View Button -->
                      <div v-if="booking.refund_proof && booking.refund_status === 'processed'" class="mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          class="w-full text-xs bg-white/50 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border-green-300 dark:border-green-700 text-green-800 dark:text-green-200 hover:text-green-900 dark:hover:text-green-100"
                          @click="openRefundProofDialog(booking)"
                        >
                          <ImageIcon class="w-3 h-3 mr-1" />
                          View Refund Proof
                        </Button>
                      </div>
                      
                      <!-- Expected Refund Timeline for Pending -->
                      <div v-if="booking.refund_status === 'pending'" class="mt-3 text-xs opacity-75 bg-white/30 dark:bg-black/20 p-2 rounded border border-white/40 dark:border-white/10">
                        <p class="flex items-center gap-1">
                          <Clock class="w-3 h-3" />
                          Refunds are typically processed within 3-5 business days
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex gap-2 mb-4">
                <div v-if="booking.status === 'cancelled'" class="text-sm text-muted-foreground italic">
                  No actions available for canceled bookings
                </div>
                <template v-else-if="!['cancelled', 'completed', 'released', 'pending_return'].includes(booking.status)">
                  <Button
                    v-if="shouldShowDepositButton(booking)"
                    variant="outline"
                    @click="openPaymentDialog(booking.id, 'deposit')"
                  >
                    <ShieldCheck class="w-4 h-4 mr-2" />
                    Pay Security Deposit
                  </Button>

                  <Button
                    v-if="shouldShowRentalButton(booking)"
                    variant="outline"
                    @click="openPaymentDialog(booking.id, 'rental')"
                  >
                    <CreditCard class="w-4 h-4 mr-2" />
                    Pay Rental Fee
                  </Button>

                  <Button
                    variant="destructive"
                    @click="openCancelDialog(booking)"
                    v-if="shouldShowCancelButton(booking)"
                  >
                    <Ban class="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>

                  <Button
                    v-if="shouldShowEditButton(booking)"
                    variant="outline"
                    @click="openEditDialog(booking)"
                  >
                    <Edit2 class="w-4 h-4 mr-2" />
                    Edit Booking
                  </Button>
                </template>
                
                <template v-else-if="booking.status === 'released'">
                  <Button
                    v-if="!booking.vehicle_return"
                    variant="default"
                    @click="openReturnDialog(booking)"
                    class="bg-blue-600 hover:bg-blue-700"
                  >
                    <RotateCcw class="w-4 h-4 mr-2" />
                    Submit Vehicle Return
                  </Button>
                  <Badge 
                    v-else-if="booking.vehicle_return.status === 'customer_submitted'" 
                    variant="secondary"
                  >
                    Return Submitted - Pending Review
                  </Badge>
                </template>
                
                <template v-else-if="booking.status === 'pending_return'">
                  <Badge variant="secondary">
                    Return Submitted - Admin Review
                  </Badge>
                  <!-- <div class="text-xs text-muted-foreground">
                    Submitted: {{ formatDate(booking.vehicle_return?.customer_submitted_at) }}
                  </div> -->
                </template>
                
                <Button
                  v-if="booking.status === 'confirmed' || booking.status === 'active'"
                  variant="outline"
                  @click="openContractDialog(booking)"
                >
                  <Car class="w-4 h-4 mr-2" />
                  View Contract
                </Button>
              </div>

              <div
                :class="[
                  'space-y-4 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-1/2 before:h-full',
                  booking.status === 'cancelled' 
                    ? 'before:bg-red-200 opacity-60' 
                    : 'before:bg-border'
                ]"
              >
                <template v-for="payment in getDisplayPayments(booking)" :key="payment.id">
                  <div class="relative pl-8">
                    <!-- Timeline dot -->
                    <div
                      :class="[
                        'absolute left-0 top-0 flex items-center justify-center w-8 h-8 rounded-full border-2',
                        booking.status === 'cancelled'
                          ? 'bg-red-50 border-red-200'
                          : 'bg-background border-border'
                      ]"
                    >
                      <ShieldCheck
                        v-if="payment.type === 'deposit'"
                        :class="[
                          'w-4 h-4',
                          booking.status === 'cancelled' ? 'text-red-400' : 'text-foreground'
                        ]"
                      />
                      <Receipt 
                        v-else 
                        :class="[
                          'w-4 h-4',
                          booking.status === 'cancelled' ? 'text-red-400' : 'text-foreground'
                        ]"
                      />
                    </div>
                    <!-- Content -->
                    <div 
                      :class="[
                        'rounded-lg border p-4 shadow-sm',
                        booking.status === 'cancelled' 
                          ? 'bg-red-50/50 border-red-200' 
                          : 'bg-card'
                      ]"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <div class="font-semibold">
                          {{ payment.type === 'deposit' ? 'Security Deposit' : 'Rental Payment' }}
                        </div>
                        <Badge :variant="getStatusVariant(payment.status)">
                          {{ payment.status === 'cancelled' ? 'Canceled' : payment.status }}
                        </Badge>
                      </div>
                      <div class="space-y-2 text-sm">
                        <div class="flex justify-between">
                          <span class="text-muted-foreground">Method</span>
                          <span class="font-medium">{{ payment.method }}</span>
                        </div>
                        <div v-if="payment.method !== 'cash'" class="flex justify-between">  <!-- Hide for cash -->
                          <span class="text-muted-foreground">Reference #</span>
                          <span class="font-medium">{{ payment.reference_number }}</span>
                        </div>
                        <div class="flex justify-between text-xs text-muted-foreground">
                          <span>Submitted</span>
                          <span>{{ new Date(payment.created_at).toLocaleString() }}</span>
                        </div>
                        <div v-if="payment.proof_image && payment.method !== 'cash'" class="mt-3">  <!-- Optional for cash -->
                          <Button
                            variant="outline"
                            class="w-full"
                            @click="openPaymentProofDialog(payment)"
                          >
                            <ImageIcon class="w-4 h-4 mr-2" />
                            View Payment Proof
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </CardContent>
        </Card>
            </template>
        <PaymentDialog
          v-if="paymentDialogBookingId"
          :bookingId="paymentDialogBookingId"
          v-model:open="paymentDialogOpen"
          :onClose="closePaymentDialog"
          :type="paymentDialogType"
          @paid="
            () => {
              closePaymentDialog()
              toast.success('Payment submitted!')
              data.refetch && data.refetch()
            }
          "
        />
        <EditBookingDialog
          v-if="editDialogOpen"
          :booking="editBooking"
          :open="editDialogOpen"
          @update:open="editDialogOpen = $event"
          @updated="() => refetch()"
        />
        <CustomerReturnDialog
          v-if="returnDialogOpen"
          :booking="selectedReturnBooking"
          :open="returnDialogOpen"
          @update:open="returnDialogOpen = $event"
          @submitted="onReturnSubmitted"
        />
        <PaymentProofDialog
          v-if="selectedPaymentProof"
          v-model:open="paymentProofDialogOpen"
          :image-url="selectedPaymentProof?.proof_image"
          :payment-date="selectedPaymentProof?.created_at"
        />

        <!-- Refund Proof Dialog -->
        <Dialog v-model:open="refundProofDialogOpen">
          <DialogContent class="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle class="flex items-center gap-2">
                <CheckCircle class="w-5 h-5 text-green-600" />
                Refund Processing Proof
              </DialogTitle>
              <DialogDescription>
                Official proof that your refund has been processed by our admin team.
              </DialogDescription>
            </DialogHeader>
            <div v-if="selectedRefundProof" class="space-y-4">
              <!-- Refund Details Summary -->
              <div class="bg-green-50 border border-green-200 rounded-lg p-4">
                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="font-medium text-green-800">Refund Amount</p>
                    <p class="text-xl font-bold text-green-700">₱{{ Number(selectedRefundProof.refund_amount).toLocaleString() }}</p>
                  </div>
                  <div>
                    <p class="font-medium text-green-800">Processed Date</p>
                    <p class="text-green-700">{{ formatDate(selectedRefundProof.refund_processed_at) }}</p>
                  </div>
                </div>
                <div v-if="selectedRefundProof.refund_notes" class="mt-3 pt-3 border-t border-green-200">
                  <p class="font-medium text-green-800 text-sm">Admin Notes</p>
                  <p class="text-green-700 text-sm italic">"{{ selectedRefundProof.refund_notes }}"</p>
                </div>
              </div>
              
              <!-- Proof Image -->
              <div class="text-center">
                <img 
                  v-if="isImageFile(selectedRefundProof.refund_proof)"
                  :src="selectedRefundProof.refund_proof" 
                  alt="Refund processing proof"
                  class="max-w-full h-auto rounded-lg shadow-lg mx-auto border"
                />
                <div v-else class="p-8 border-2 border-dashed border-muted-foreground rounded-lg">
                  <FileText class="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p class="text-muted-foreground mb-4">PDF document - Click below to view</p>
                  <Button @click="window.open(selectedRefundProof.refund_proof, '_blank')" variant="outline">
                    <FileText class="w-4 h-4 mr-2" />
                    Open Document
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <div v-if="contractDialogOpen">
          <div class="modal-overlay" @click="closeContractDialog"></div>
          <div class="modal-content">
            <button class="modal-close" @click="closeContractDialog">&times;</button>
            <ContractPrint :booking="selectedBooking" />
          </div>
        </div>
      </div>
    </div>

    <!-- Cancellation Reason Dialog -->
    <Dialog v-model:open="cancelDialog.open">
      <DialogContent class="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-yellow-600" />
            Cancel Booking
          </DialogTitle>
          <DialogDescription>
            Please provide a reason for canceling this booking and your refund account details if eligible for a refund.
          </DialogDescription>
        </DialogHeader>

        <div v-if="cancelDialog.booking" class="space-y-4">
          <!-- Booking Summary -->
          <div class="bg-muted/30 rounded-lg p-3 text-sm">
            <p class="font-medium">{{ cancelDialog.booking.vehicle?.name }}</p>
            <p class="text-muted-foreground">{{ formatDateRange(cancelDialog.booking.start_date, cancelDialog.booking.end_date) }}</p>
          </div>

          <!-- Refund Eligibility Notice -->
          <div v-if="hasApprovedPayments(cancelDialog.booking)" class="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p class="text-sm text-blue-800">
              <strong>Refund Information:</strong> You have approved payments for this booking. Please provide your refund account details below for potential refund processing.
            </p>
          </div>

          <!-- Cancellation Form -->
          <form @submit.prevent="handleCancelBooking" class="space-y-4">
            <div class="space-y-2">
              <Label for="cancellation-reason">Reason for Cancellation</Label>
              <Textarea
                id="cancellation-reason"
                v-model="cancelForm.reason"
                placeholder="Please explain why you're canceling this booking..."
                rows="3"
                class="resize-none"
                required
              />
            </div>

            <!-- Refund Account Information (only if has approved payments) -->
            <div v-if="hasApprovedPayments(cancelDialog.booking)" class="border border-border rounded-lg p-4 space-y-3">
              <h3 class="font-semibold text-foreground">Refund Account Details</h3>
              
              <div class="flex flex-col gap-2">
                <Label>Preferred Refund Method *</Label>
                <select 
                  v-model="cancelForm.refund_method" 
                  required
                  class="w-full rounded-md border border-input bg-background px-3 py-2 text-foreground"
                >
                  <option value="">Select refund method</option>
                  <option value="gcash">GCash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash Pickup</option>
                </select>
              </div>
              
              <!-- GCash Details -->
              <div v-if="cancelForm.refund_method === 'gcash'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div class="flex flex-col gap-2">
                  <Label>GCash Number *</Label>
                  <Input 
                    v-model="cancelForm.account_number" 
                    type="tel" 
                    placeholder="09XXXXXXXXX"
                    required
                  />
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input 
                    v-model="cancelForm.account_name" 
                    placeholder="Full name as registered"
                    required
                  />
                </div>
              </div>
              
              <!-- Bank Transfer Details -->
              <div v-if="cancelForm.refund_method === 'bank_transfer'" class="space-y-3">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div class="flex flex-col gap-2">
                    <Label>Bank Name *</Label>
                    <Input 
                      v-model="cancelForm.bank_name" 
                      placeholder="e.g. BDO, BPI, Metrobank"
                      required
                    />
                  </div>
                  <div class="flex flex-col gap-2">
                    <Label>Account Number *</Label>
                    <Input 
                      v-model="cancelForm.account_number" 
                      placeholder="Bank account number"
                      required
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-2">
                  <Label>Account Holder Name *</Label>
                  <Input 
                    v-model="cancelForm.account_name" 
                    placeholder="Full name as registered in bank"
                    required
                  />
                </div>
              </div>
              
              <!-- Additional Notes -->
              <div class="flex flex-col gap-2">
                <Label>{{ cancelForm.refund_method === 'cash' ? 'Pickup Instructions' : 'Additional Notes' }} (optional)</Label>
                <Textarea 
                  v-model="cancelForm.refund_notes" 
                  :placeholder="cancelForm.refund_method === 'cash' ? 'Specify pickup location or special instructions...' : 'Any special instructions for the refund process...'"
                  rows="2"
                />
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex justify-end gap-3 pt-2">
              <Button type="button" variant="outline" @click="cancelDialog.open = false">
                Keep Booking
              </Button>
              <Button 
                type="submit" 
                variant="destructive"
                :disabled="!cancelForm.reason.trim() || cancelForm.processing"
              >
                <Loader2 v-if="cancelForm.processing" class="w-4 h-4 mr-2 animate-spin" />
                <Ban v-else class="w-4 h-4 mr-2" />
                {{ cancelForm.processing ? 'Canceling...' : 'Cancel Booking' }}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup>
import { computed, ref, reactive, watch } from 'vue'
import { useMyBookings } from '@/services/booking-service'
import { useQueryClient } from '@tanstack/vue-query'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getStatusVariant } from '@/lib/utils'
import PaymentDialog from '@/components/features/bookings/PaymentDialog.vue'
import EditBookingDialog from '@/components/features/bookings/EditBookingDialog.vue'
import CustomerReturnDialog from '@/components/features/vehicle-return/CustomerReturnDialog.vue'
import PaymentProofDialog from '@/components/features/bookings/PaymentProofDialog.vue'
import ContractPrint from '@/components/features/ContractPrint.vue'
import { useCancelBooking } from '@/services/booking-service'
import { toast } from 'vue-sonner'
import Loading from '@/components/features/Loading.vue'
import {
  CalendarDays,
  CreditCard,
  ClipboardList,
  AlertCircle,
  Car,
  Receipt,
  ShieldCheck,
  Ban,
  RotateCcw,
  Edit2,
  Image as ImageIcon,
  Truck,
  X,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  FileText,
  TrendingUp,
  TrendingDown,
} from 'lucide-vue-next'
import { RouterLink } from 'vue-router'

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function formatDateRange(startDate, endDate) {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const startFormatted = start.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  const endFormatted = end.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
  return `${startFormatted} - ${endFormatted}`
}

function formatStatusText(status) {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'for_release':
      return 'for release'
    case 'released':
      return 'released'
    case 'cancelled':
      return 'cancelled'
    default:
      return status
  }
}

function getRefundStatusClasses(status) {
  switch (status) {
    case 'pending':
      return 'bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/40 dark:to-yellow-900/20 border-yellow-300 dark:border-yellow-700'
    case 'processed':
      return 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/40 dark:to-green-900/20 border-green-300 dark:border-green-700'
    case 'failed':
      return 'bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/40 dark:to-red-900/20 border-red-300 dark:border-red-700'
    default:
      return 'bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950/40 dark:to-gray-900/20 border-gray-300 dark:border-gray-700'
  }
}

function getRefundStatusIconBg(status) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-200 dark:bg-yellow-800/50'
    case 'processed':
      return 'bg-green-200 dark:bg-green-800/50'
    case 'failed':
      return 'bg-red-200 dark:bg-red-800/50'
    default:
      return 'bg-gray-200 dark:bg-gray-800/50'
  }
}

function getRefundStatusIconColor(status) {
  switch (status) {
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'processed':
      return 'text-green-600 dark:text-green-400'
    case 'failed':
      return 'text-red-600 dark:text-red-400'
    default:
      return 'text-gray-600 dark:text-gray-400'
  }
}

function getRefundStatusTextColor(status) {
  switch (status) {
    case 'pending':
      return 'text-yellow-800 dark:text-yellow-200'
    case 'processed':
      return 'text-green-800 dark:text-green-200'
    case 'failed':
      return 'text-red-800 dark:text-red-200'
    default:
      return 'text-gray-800 dark:text-gray-200'
  }
}

function getRefundStatusIcon(status) {
  switch (status) {
    case 'pending':
      return Clock
    case 'processed':
      return CheckCircle
    case 'failed':
      return AlertTriangle
    default:
      return Clock
  }
}

function getRefundStatusText(status) {
  switch (status) {
    case 'pending':
      return 'Refund Pending'
    case 'processed':
      return 'Refund Processed'
    case 'failed':
      return 'Refund Failed'
    default:
      return 'No Payment Found'
  }
}

const queryClient = useQueryClient()

// Sorting controls
const sortBy = ref('created_at')
const sortOrder = ref('desc')

// Status filter
const statusFilter = ref('')

const { data, error, isLoading, refetch } = useMyBookings(sortBy, sortOrder, statusFilter)
const bookings = computed(() => data.value || [])

// Card minimization state
const minimizedCards = ref(new Set())
const globalMinimized = ref(false)

// Toggle individual card
function toggleCardMinimized(bookingId) {
  const newSet = new Set(minimizedCards.value)
  if (newSet.has(bookingId)) {
    newSet.delete(bookingId)
  } else {
    newSet.add(bookingId)
  }
  minimizedCards.value = newSet
}

// Toggle all cards
function toggleAllCards() {
  globalMinimized.value = !globalMinimized.value
  if (globalMinimized.value) {
    // Minimize all cards
    minimizedCards.value = new Set(bookings.value.map(b => b.id))
  } else {
    // Maximize all cards
    minimizedCards.value = new Set()
  }
}

function isCardMinimized(bookingId) {
  return minimizedCards.value.has(bookingId)
}

// Dialog state per booking and type
const paymentDialogBookingId = ref(null)
const paymentDialogType = ref('deposit')
const paymentDialogOpen = ref(false)

// Payment proof dialog state
const paymentProofDialogOpen = ref(false)
const selectedPaymentProof = ref(null)

// Refund proof dialog state
const refundProofDialogOpen = ref(false)
const selectedRefundProof = ref(null)

// Contract dialog state
const contractDialogOpen = ref(false)
const selectedBooking = ref(null)

// Return dialog state
const returnDialogOpen = ref(false)
const selectedReturnBooking = ref(null)

function openPaymentDialog(bookingId, type = 'deposit') {
  paymentDialogBookingId.value = bookingId
  paymentDialogType.value = type
  paymentDialogOpen.value = true
  // DEBUG: Log which type is being passed
  console.log('Opening PaymentDialog for', bookingId, 'type:', type)
}
function closePaymentDialog() {
  paymentDialogOpen.value = false
  paymentDialogBookingId.value = null
  paymentDialogType.value = 'deposit'
}

function openContractDialog(booking) {
  selectedBooking.value = booking
  contractDialogOpen.value = true
}

function closeContractDialog() {
  contractDialogOpen.value = false
}

function openReturnDialog(booking) {
  selectedReturnBooking.value = booking
  returnDialogOpen.value = true
}

function onReturnSubmitted() {
  returnDialogOpen.value = false
  selectedReturnBooking.value = null
  toast.success('Vehicle return submitted successfully!')
  refetch()
}

// Edit dialog state
const editDialogOpen = ref(false)
const editBooking = ref(null)

function openEditDialog(booking) {
  editBooking.value = booking
  editDialogOpen.value = true
}

function shouldShowEditButton(booking) {
  // Only allow editing if booking is pending and more than 24h away
  if (!booking || booking.status !== 'pending') return false
  const now = new Date()
  const start = new Date(booking.start_date)
  const timeUntilStart = start.getTime() - now.getTime()
  console.log('Time until start:', timeUntilStart / (60 * 60 * 1000), 'hours')
  return timeUntilStart > 24 * 60 * 60 * 1000
}

function shouldShowCancelButton(booking) {
  // Allow cancellation for bookings that haven't been released yet
  if (!booking || ['cancelled', 'completed', 'released', 'pending_return'].includes(booking.status)) return false
  const now = new Date()
  const start = new Date(booking.start_date)
  const timeUntilStart = start.getTime() - now.getTime()
  console.log('Cancel button - Time until start:', timeUntilStart / (60 * 60 * 1000), 'hours')
  return timeUntilStart > 0 // Can cancel as long as the booking hasn't started yet
}

// Helper functions to check payment status
function getLatestPaymentOfType(booking, type) {
  return (
    booking.payments?.find((p) => p.type === type && p.status === 'pending') ||
    booking.payments
      ?.filter((p) => p.type === type)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
  )
}

function requiresDeposit(booking) {
  const type = booking?.vehicle?.type
  if (!type) return false
  const normalizedType = type.toLowerCase()
  if (normalizedType === 'motorcycle') {
    return true
  }
  return normalizedType === 'car' && !booking?.driver_requested
}

function shouldShowDepositButton(booking) {
  if (!requiresDeposit(booking)) return false
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  return !latestDeposit || latestDeposit.status === 'rejected'
}

function shouldShowRentalButton(booking) {
  const latestDeposit = getLatestPaymentOfType(booking, 'deposit')
  const latestRental = getLatestPaymentOfType(booking, 'rental')
  if (!requiresDeposit(booking)) {
    return !latestRental || latestRental.status === 'rejected'
  }
  return (
    latestDeposit?.status === 'approved' && (!latestRental || latestRental.status === 'rejected')
  )
}

const cancelBooking = useCancelBooking()

function openPaymentProofDialog(payment) {
  selectedPaymentProof.value = payment
  paymentProofDialogOpen.value = true
}

function openRefundProofDialog(booking) {
  selectedRefundProof.value = booking
  refundProofDialogOpen.value = true
}

function isImageFile(data) {
  // Check if it's a base64 image
  if (typeof data === 'string' && data.startsWith('data:image/')) {
    return true
  }
  // Fallback for file extensions (legacy)
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(data)
}

function hasApprovedPayments(booking) {
  if (!booking || !booking.payments) return false
  return booking.payments.some(payment => payment.status === 'approved')
}

function getDisplayPayments(booking) {
  if (!booking || !booking.payments) return []
  if (!requiresDeposit(booking)) {
    return booking.payments.filter(payment => payment.type !== 'deposit')
  }
  return booking.payments
}

// Cancellation Dialog
const cancelDialog = ref({
  open: false,
  booking: null
})

const cancelForm = reactive({
  reason: '',
  processing: false,
  // Refund account information
  refund_method: '',
  account_number: '',
  account_name: '',
  bank_name: '',
  refund_notes: ''
})

function openCancelDialog(booking) {
  cancelDialog.value.booking = booking
  cancelDialog.value.open = true
  cancelForm.reason = ''
  cancelForm.processing = false
  // Reset refund fields
  cancelForm.refund_method = ''
  cancelForm.account_number = ''
  cancelForm.account_name = ''
  cancelForm.bank_name = ''
  cancelForm.refund_notes = ''
}

async function handleCancelBooking() {
  if (!cancelForm.reason.trim()) {
    toast.error('Please provide a cancellation reason')
    return
  }

  // Validate refund information if has approved payments
  if (hasApprovedPayments(cancelDialog.value.booking)) {
    if (!cancelForm.refund_method) {
      toast.error('Please select a refund method')
      return
    }

    if (cancelForm.refund_method === 'gcash') {
      if (!cancelForm.account_number || !cancelForm.account_name) {
        toast.error('Please provide your GCash number and account holder name')
        return
      }
    } else if (cancelForm.refund_method === 'bank_transfer') {
      if (!cancelForm.bank_name || !cancelForm.account_number || !cancelForm.account_name) {
        toast.error('Please provide complete bank account details')
        return
      }
    }
  }

  cancelForm.processing = true
  try {
    const payload = {
      bookingId: cancelDialog.value.booking.id,
      cancellation_reason: cancelForm.reason
    }

    // Include refund account information if has approved payments
    if (hasApprovedPayments(cancelDialog.value.booking)) {
      payload.refund_method = cancelForm.refund_method
      payload.account_number = cancelForm.account_number
      payload.account_name = cancelForm.account_name
      payload.bank_name = cancelForm.bank_name
      payload.refund_notes = cancelForm.refund_notes
    }

    await cancelBooking.mutateAsync(payload)
    toast.success('Booking canceled successfully')
    cancelDialog.value.open = false
    
    // Invalidate the my-bookings query to refresh the data
    await queryClient.invalidateQueries({ queryKey: ['my-bookings'] })
    
  } catch (e) {
    toast.error(e.response?.data?.message || 'Cancellation failed')
  } finally {
    cancelForm.processing = false
  }
}
</script>

<style scoped>
/* Enhanced cancelled booking styles */
.cancelled-card {
  position: relative;
}

.cancelled-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 10px,
    rgba(239, 68, 68, 0.03) 10px,
    rgba(239, 68, 68, 0.03) 20px
  );
  pointer-events: none;
  border-radius: inherit;
}

/* Card minimize/maximize transitions */
.card-content-transition {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth hover effects for minimize button */
.minimize-button {
  transition: all 0.2s ease-in-out;
}

.minimize-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
  transform: scale(1.05);
}

/* Enhanced gradient animations */
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.refund-shimmer {
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.2) 50%,
    transparent 100%
  );
  background-size: 1000px 100%;
  animation: shimmer 3s infinite;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
}
.modal-content {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: #fff;
  padding: 2rem;
  border-radius: 8px;
  z-index: 1001;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 2px 16px rgba(0, 0, 0, 0.18);
}
.modal-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #888;
  cursor: pointer;
  z-index: 1002;
}

/* Dark mode enhancements */
@media (prefers-color-scheme: dark) {
  .modal-content {
    background: #1f2937;
    color: #f3f4f6;
  }
  
  .modal-close {
    color: #9ca3af;
  }
}
</style>
