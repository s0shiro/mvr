<template>
  <div class="container space-y-6">
    <div class="flex justify-between items-center mb-4">
      <h1 id="vehicle-returns-header" class="text-2xl font-bold">Vehicle Returns</h1>
      <div class="flex items-center gap-2">
        <Button variant="outline" size="sm" @click="startTour" class="gap-1">
          <Clock class="w-4 h-4" />
          Guide
        </Button>
      </div>
    </div>
    <div v-if="isLoading" class="h-[calc(100vh-10rem)] flex items-center justify-center">
      <Loading text="Loading returns..." />
    </div>
    <div v-else-if="error" class="text-center text-red-600">{{ error }}</div>
    <div v-else>
      <div v-if="totalCount === 0" class="text-center text-muted-foreground py-12">
        <p class="text-lg">No vehicles currently due for return.</p>
        <p class="text-sm">All rentals are either active, processed or completed.</p>
      </div>
      <div v-else class="space-y-4">
        <Tabs v-model="activeGroup" class="w-full">
          <TabsList data-tour="returns-tabs-list" class="w-full flex gap-2 overflow-x-auto no-scrollbar py-1 md:py-0 md:grid md:grid-cols-5 h-auto md:h-10">
            <TabsTrigger value="overdue" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-red-50 dark:data-[state=active]:bg-red-950/30 data-[state=active]:border data-[state=active]:border-red-200 dark:data-[state=active]:border-red-800 data-[state=active]:shadow-sm">
              <AlertTriangle class="w-4 h-4 text-red-600" />
              <span class="hidden sm:inline">Overdue</span>
              <Badge variant="destructive" size="sm">{{ groupedBookings.overdue.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dueToday" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-orange-50 dark:data-[state=active]:bg-orange-950/30 data-[state=active]:border data-[state=active]:border-orange-200 dark:data-[state=active]:border-orange-800 data-[state=active]:shadow-sm">
              <Clock class="w-4 h-4 text-orange-600" />
              <span class="hidden sm:inline">Due Today</span>
              <Badge variant="warning" size="sm">{{ groupedBookings.dueToday.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dueThisWeek" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-yellow-50 dark:data-[state=active]:bg-yellow-950/30 data-[state=active]:border data-[state=active]:border-yellow-200 dark:data-[state=active]:border-yellow-800 data-[state=active]:shadow-sm">
              <CalendarDays class="w-4 h-4 text-yellow-600" />
              <span class="hidden sm:inline">This Week</span>
              <Badge variant="secondary" size="sm">{{ groupedBookings.dueThisWeek.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="dueNextWeek" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-blue-50 dark:data-[state=active]:bg-blue-950/30 data-[state=active]:border data-[state=active]:border-blue-200 dark:data-[state=active]:border-blue-800 data-[state=active]:shadow-sm">
              <Calendar class="w-4 h-4 text-blue-600" />
              <span class="hidden sm:inline">Next Week</span>
              <Badge variant="outline" size="sm">{{ groupedBookings.dueNextWeek.length }}</Badge>
            </TabsTrigger>
            <TabsTrigger value="later" class="flex items-center gap-2 shrink-0 min-w-[130px] md:min-w-0 px-3 py-2 md:py-0 rounded-md text-xs md:text-sm justify-center transition-colors data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-gray-800/40 data-[state=active]:border data-[state=active]:border-gray-300 dark:data-[state=active]:border-gray-700 data-[state=active]:shadow-sm">
              <Timer class="w-4 h-4 text-gray-600" />
              <span class="hidden sm:inline">Later</span>
              <Badge variant="outline" size="sm">{{ groupedBookings.later.length }}</Badge>
            </TabsTrigger>
          </TabsList>

          <!-- Overdue -->
          <TabsContent value="overdue">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <AlertTriangle class="w-5 h-5 text-red-600" />
                  <h2 class="text-xl font-semibold">Overdue Returns</h2>
                </div>
                <Badge variant="destructive" class="ml-auto">
                  {{ groupedBookings.overdue.length }} {{ groupedBookings.overdue.length === 1 ? 'vehicle' : 'vehicles' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.overdue.length" class="text-muted-foreground text-center py-6 text-sm">
                No vehicles overdue.
              </div>
              <div v-else class="ring-2 ring-red-200 dark:ring-red-800 rounded-lg p-4 bg-red-50/30 dark:bg-red-950/10">
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.overdue" :key="booking.id" :data-tour="idx===0 ? 'return-card' : null" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">
                              {{ booking.status.replace('_', ' ') }}
                            </Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">
                            {{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                        <div class="absolute top-2 left-2">
                          <Badge variant="destructive" size="sm">OVERDUE</Badge>
                        </div>
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div>
                          <span class="font-medium text-muted-foreground">Customer</span>
                          <div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div>
                        </div>
                        <div>
                          <span class="font-medium text-muted-foreground">Total</span>
                          <div class="font-medium text-primary">₱{{ booking.total_price }}</div>
                        </div>
                        <div class="col-span-2">
                          <span class="font-medium text-muted-foreground">Rental Period</span>
                          <div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div>
                        </div>
                      </div>
                      <div v-if="booking.vehicle_return" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Return Status:</span>
                          <Badge :variant="getReturnStatusVariant(booking.vehicle_return.status)" size="sm">{{ getReturnStatusLabel(booking.vehicle_return.status) }}</Badge>
                        </div>
                        <div v-if="booking.vehicle_return.status === 'customer_submitted'" class="text-xs text-muted-foreground">
                          Customer submitted: {{ formatDate(booking.vehicle_return.customer_submitted_at) }}
                        </div>
                        <div v-if="booking.vehicle_return.deposit_status" class="flex items-center justify-between mt-2">
                          <span class="text-sm font-medium">Deposit:</span>
                          <div class="flex items-center gap-2">
                            <Badge :variant="getDepositStatusVariant(booking.vehicle_return.deposit_status)" size="sm">{{ getDepositStatusLabel(booking.vehicle_return.deposit_status) }}</Badge>
                            <span v-if="booking.vehicle_return.deposit_status === 'refunded'" class="text-sm text-green-600 font-medium">
                              ₱{{ booking.vehicle_return.deposit_refund_amount || 0 }}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_return" :data-tour="idx===0 ? 'return-btn' : null" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-red-600 hover:bg-red-700">
                          <AlertTriangle class="w-4 h-4 mr-2" /> Process Return
                        </Button>
                        <Button v-else-if="booking.vehicle_return.status === 'customer_submitted'" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Clock class="w-4 h-4 mr-2" /> Review Return
                        </Button>
                        <Badge v-else-if="booking.vehicle_return.status === 'completed'" variant="success" class="w-full justify-center py-2">
                          Completed
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Due Today -->
          <TabsContent value="dueToday">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <Clock class="w-5 h-5 text-orange-600" />
                  <h2 class="text-xl font-semibold">Due Today</h2>
                </div>
                <Badge variant="warning" class="ml-auto">
                  {{ groupedBookings.dueToday.length }} {{ groupedBookings.dueToday.length === 1 ? 'vehicle' : 'vehicles' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.dueToday.length" class="text-muted-foreground text-center py-6 text-sm">No vehicles due today.</div>
              <div v-else class="ring-2 ring-orange-200 dark:ring-orange-800 rounded-lg p-4 bg-orange-50/30 dark:bg-orange-950/10">
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.dueToday" :key="booking.id" :data-tour="idx===0 ? 'return-card' : null" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">{{ booking.status.replace('_', ' ') }}</Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div><span class="font-medium text-muted-foreground">Customer</span><div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div></div>
                        <div><span class="font-medium text-muted-foreground">Total</span><div class="font-medium text-primary">₱{{ booking.total_price }}</div></div>
                        <div class="col-span-2"><span class="font-medium text-muted-foreground">Rental Period</span><div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div></div>
                      </div>
                      <div v-if="booking.vehicle_return" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Return Status:</span>
                          <Badge :variant="getReturnStatusVariant(booking.vehicle_return.status)" size="sm">{{ getReturnStatusLabel(booking.vehicle_return.status) }}</Badge>
                        </div>
                        <div v-if="booking.vehicle_return.status === 'customer_submitted'" class="text-xs text-muted-foreground">Customer submitted: {{ formatDate(booking.vehicle_return.customer_submitted_at) }}</div>
                        <div v-if="booking.vehicle_return.deposit_status" class="flex items-center justify-between mt-2">
                          <span class="text-sm font-medium">Deposit:</span>
                          <div class="flex items-center gap-2">
                            <Badge :variant="getDepositStatusVariant(booking.vehicle_return.deposit_status)" size="sm">{{ getDepositStatusLabel(booking.vehicle_return.deposit_status) }}</Badge>
                            <span v-if="booking.vehicle_return.deposit_status === 'refunded'" class="text-sm text-green-600 font-medium">₱{{ booking.vehicle_return.deposit_refund_amount || 0 }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_return" :data-tour="idx===0 ? 'return-btn' : null" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-orange-600 hover:bg-orange-700">
                          <Clock class="w-4 h-4 mr-2" /> Process Return
                        </Button>
                        <Button v-else-if="booking.vehicle_return.status === 'customer_submitted'" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Clock class="w-4 h-4 mr-2" /> Review Return
                        </Button>
                        <Badge v-else-if="booking.vehicle_return.status === 'completed'" variant="success" class="w-full justify-center py-2">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- This Week -->
          <TabsContent value="dueThisWeek">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <CalendarDays class="w-5 h-5 text-yellow-600" />
                  <h2 class="text-xl font-semibold">Due This Week</h2>
                </div>
                <Badge variant="secondary" class="ml-auto">
                  {{ groupedBookings.dueThisWeek.length }} {{ groupedBookings.dueThisWeek.length === 1 ? 'vehicle' : 'vehicles' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.dueThisWeek.length" class="text-muted-foreground text-center py-6 text-sm">No vehicles due this week.</div>
              <div v-else>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.dueThisWeek" :key="booking.id" :data-tour="idx===0 ? 'return-card' : null" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">{{ booking.status.replace('_', ' ') }}</Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div><span class="font-medium text-muted-foreground">Customer</span><div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div></div>
                        <div><span class="font-medium text-muted-foreground">Total</span><div class="font-medium text-primary">₱{{ booking.total_price }}</div></div>
                        <div class="col-span-2"><span class="font-medium text-muted-foreground">Rental Period</span><div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div></div>
                      </div>
                      <div v-if="booking.vehicle_return" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Return Status:</span>
                          <Badge :variant="getReturnStatusVariant(booking.vehicle_return.status)" size="sm">{{ getReturnStatusLabel(booking.vehicle_return.status) }}</Badge>
                        </div>
                        <div v-if="booking.vehicle_return.status === 'customer_submitted'" class="text-xs text-muted-foreground">Customer submitted: {{ formatDate(booking.vehicle_return.customer_submitted_at) }}</div>
                        <div v-if="booking.vehicle_return.deposit_status" class="flex items-center justify-between mt-2">
                          <span class="text-sm font-medium">Deposit:</span>
                          <div class="flex items-center gap-2">
                            <Badge :variant="getDepositStatusVariant(booking.vehicle_return.deposit_status)" size="sm">{{ getDepositStatusLabel(booking.vehicle_return.deposit_status) }}</Badge>
                            <span v-if="booking.vehicle_return.deposit_status === 'refunded'" class="text-sm text-green-600 font-medium">₱{{ booking.vehicle_return.deposit_refund_amount || 0 }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_return" :data-tour="idx===0 ? 'return-btn' : null" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full">
                          <Clock class="w-4 h-4 mr-2" /> Process Return
                        </Button>
                        <Button v-else-if="booking.vehicle_return.status === 'customer_submitted'" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Clock class="w-4 h-4 mr-2" /> Review Return
                        </Button>
                        <Badge v-else-if="booking.vehicle_return.status === 'completed'" variant="success" class="w-full justify-center py-2">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Next Week -->
            <TabsContent value="dueNextWeek">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <Calendar class="w-5 h-5 text-blue-600" />
                  <h2 class="text-xl font-semibold">Due Next Week</h2>
                </div>
                <Badge variant="outline" class="ml-auto">
                  {{ groupedBookings.dueNextWeek.length }} {{ groupedBookings.dueNextWeek.length === 1 ? 'vehicle' : 'vehicles' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.dueNextWeek.length" class="text-muted-foreground text-center py-6 text-sm">No vehicles due next week.</div>
              <div v-else>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.dueNextWeek" :key="booking.id" :data-tour="idx===0 ? 'return-card' : null" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">{{ booking.status.replace('_', ' ') }}</Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div><span class="font-medium text-muted-foreground">Customer</span><div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div></div>
                        <div><span class="font-medium text-muted-foreground">Total</span><div class="font-medium text-primary">₱{{ booking.total_price }}</div></div>
                        <div class="col-span-2"><span class="font-medium text-muted-foreground">Rental Period</span><div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div></div>
                      </div>
                      <div v-if="booking.vehicle_return" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Return Status:</span>
                          <Badge :variant="getReturnStatusVariant(booking.vehicle_return.status)" size="sm">{{ getReturnStatusLabel(booking.vehicle_return.status) }}</Badge>
                        </div>
                        <div v-if="booking.vehicle_return.status === 'customer_submitted'" class="text-xs text-muted-foreground">Customer submitted: {{ formatDate(booking.vehicle_return.customer_submitted_at) }}</div>
                        <div v-if="booking.vehicle_return.deposit_status" class="flex items-center justify-between mt-2">
                          <span class="text-sm font-medium">Deposit:</span>
                          <div class="flex items-center gap-2">
                            <Badge :variant="getDepositStatusVariant(booking.vehicle_return.deposit_status)" size="sm">{{ getDepositStatusLabel(booking.vehicle_return.deposit_status) }}</Badge>
                            <span v-if="booking.vehicle_return.deposit_status === 'refunded'" class="text-sm text-green-600 font-medium">₱{{ booking.vehicle_return.deposit_refund_amount || 0 }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_return" :data-tour="idx===0 ? 'return-btn' : null" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Clock class="w-4 h-4 mr-2" /> Process Return
                        </Button>
                        <Button v-else-if="booking.vehicle_return.status === 'customer_submitted'" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Clock class="w-4 h-4 mr-2" /> Review Return
                        </Button>
                        <Badge v-else-if="booking.vehicle_return.status === 'completed'" variant="success" class="w-full justify-center py-2">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <!-- Later -->
          <TabsContent value="later">
            <div class="space-y-4">
              <div class="flex items-center gap-3 pb-2 border-b">
                <div class="flex items-center gap-2">
                  <Timer class="w-5 h-5 text-gray-600" />
                  <h2 class="text-xl font-semibold">Future Returns</h2>
                </div>
                <Badge variant="outline" class="ml-auto">
                  {{ groupedBookings.later.length }} {{ groupedBookings.later.length === 1 ? 'vehicle' : 'vehicles' }}
                </Badge>
              </div>
              <div v-if="!groupedBookings.later.length" class="text-muted-foreground text-center py-6 text-sm">No future returns scheduled.</div>
              <div v-else>
                <div class="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  <Card v-for="(booking, idx) in groupedBookings.later" :key="booking.id" :data-tour="idx===0 ? 'return-card' : null" class="border border-border bg-card shadow-sm hover:shadow-md transition">
                    <CardHeader class="pb-3">
                      <div class="flex items-center justify-between gap-3">
                        <div class="min-w-0 flex-1">
                          <CardTitle class="text-base font-semibold truncate flex items-center gap-2">
                            {{ booking.vehicle?.name || 'Vehicle' }}
                            <Badge :variant="getStatusVariant(booking.status)" size="sm" class="capitalize">{{ booking.status.replace('_', ' ') }}</Badge>
                          </CardTitle>
                          <CardDescription class="truncate text-xs">{{ booking.vehicle?.brand }} {{ booking.vehicle?.model }} ({{ booking.vehicle?.year }})</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent class="space-y-4">
                      <div v-if="booking.vehicle?.primary_image_url" class="relative overflow-hidden rounded-md">
                        <img :src="booking.vehicle.primary_image_url" alt="Vehicle" class="w-full h-28 md:h-32 object-cover" />
                      </div>
                      <div class="grid grid-cols-2 gap-3 text-xs md:text-sm">
                        <div><span class="font-medium text-muted-foreground">Customer</span><div class="font-medium truncate">{{ booking.user?.name || 'N/A' }}</div></div>
                        <div><span class="font-medium text-muted-foreground">Total</span><div class="font-medium text-primary">₱{{ booking.total_price }}</div></div>
                        <div class="col-span-2"><span class="font-medium text-muted-foreground">Rental Period</span><div class="font-medium">{{ formatDate(booking.start_date) }} → {{ formatDate(booking.end_date) }}</div></div>
                      </div>
                      <div v-if="booking.vehicle_return" class="space-y-2 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                        <div class="flex items-center justify-between">
                          <span class="text-sm font-medium">Return Status:</span>
                          <Badge :variant="getReturnStatusVariant(booking.vehicle_return.status)" size="sm">{{ getReturnStatusLabel(booking.vehicle_return.status) }}</Badge>
                        </div>
                        <div v-if="booking.vehicle_return.status === 'customer_submitted'" class="text-xs text-muted-foreground">Customer submitted: {{ formatDate(booking.vehicle_return.customer_submitted_at) }}</div>
                        <div v-if="booking.vehicle_return.deposit_status" class="flex items-center justify-between mt-2">
                          <span class="text-sm font-medium">Deposit:</span>
                          <div class="flex items-center gap-2">
                            <Badge :variant="getDepositStatusVariant(booking.vehicle_return.deposit_status)" size="sm">{{ getDepositStatusLabel(booking.vehicle_return.deposit_status) }}</Badge>
                            <span v-if="booking.vehicle_return.deposit_status === 'refunded'" class="text-sm text-green-600 font-medium">₱{{ booking.vehicle_return.deposit_refund_amount || 0 }}</span>
                          </div>
                        </div>
                      </div>
                      <div class="flex pt-1">
                        <Button v-if="!booking.vehicle_return" :data-tour="idx===0 ? 'return-btn' : null" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full">
                          <Clock class="w-4 h-4 mr-2" /> Process Return
                        </Button>
                        <Button v-else-if="booking.vehicle_return.status === 'customer_submitted'" variant="default" size="sm" @click="goToReturnPage(booking)" class="w-full bg-blue-600 hover:bg-blue-700">
                          <Clock class="w-4 h-4 mr-2" /> Review Return
                        </Button>
                        <Badge v-else-if="booking.vehicle_return.status === 'completed'" variant="success" class="w-full justify-center py-2">Completed</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAdminVehicleReturns } from '@/services/admin/vehicle-return-service'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { AlertTriangle, Clock, CalendarDays, Calendar, Timer } from 'lucide-vue-next'
import { driver as createDriver } from 'driver.js'
import 'driver.js/dist/driver.css'
import Loading from '@/components/features/Loading.vue'
import { getStatusVariant, formatDateTimeUTC } from '@/lib/utils'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return formatDateTimeUTC(dateStr)
}

const { data, error, isLoading } = useAdminVehicleReturns()
const bookings = computed(() => data.value || [])
const router = useRouter()
const activeGroup = ref('overdue')

const groupedBookings = computed(() => {
  const groups = {
    overdue: [],
    dueToday: [],
    dueThisWeek: [],
    dueNextWeek: [],
    later: []
  }

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfToday = new Date(today)
  endOfToday.setHours(23, 59, 59, 999)

  const endOfThisWeek = new Date(today)
  endOfThisWeek.setDate(today.getDate() + (7 - today.getDay())) // End of current week (Sunday)

  const endOfNextWeek = new Date(endOfThisWeek)
  endOfNextWeek.setDate(endOfThisWeek.getDate() + 7) // End of next week

  bookings.value.forEach(booking => {
    const endDate = new Date(booking.end_date)
    if (endDate < today) {
      groups.overdue.push(booking)
    } else if (endDate >= today && endDate <= endOfToday) {
      groups.dueToday.push(booking)
    } else if (endDate > endOfToday && endDate <= endOfThisWeek) {
      groups.dueThisWeek.push(booking)
    } else if (endDate > endOfThisWeek && endDate <= endOfNextWeek) {
      groups.dueNextWeek.push(booking)
    } else {
      groups.later.push(booking)
    }
  })

  // Sort each group by end_date
  Object.values(groups).forEach(group => {
    group.sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
  })

  return groups
})

function goToReturnPage(booking) {
  router.push({ name: 'admin-vehicle-return-process', params: { id: booking.id } })
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

function startTour() {
  const steps = buildTourSteps()
  if (!steps.length) {
    console.warn('[VehicleReturns Tour] No steps available.')
    return
  }
  const d = createDriver({
    showProgress: true,
    allowClose: true,
    popoverClass: 'text-sm',
    nextBtnText: 'Next',
    prevBtnText: 'Previous',
    doneBtnText: 'Finish',
    closeBtnText: 'Skip',
    steps
  })
  console.debug('[VehicleReturns Tour] Starting; total steps:', steps.length, steps)
  d.drive()
  localStorage.setItem('vehicleReturnsTourSeen', '1')
}

function buildTourSteps() {
  const steps = []
  const header = document.querySelector('#vehicle-returns-header')
  if (header) {
    steps.push({
      element: header,
      popover: {
        title: 'Vehicle Returns',
        description: 'Monitor and process upcoming vehicle returns.'
      }
    })
  }
  const tabs = document.querySelector('[data-tour="returns-tabs-list"]')
  if (tabs) {
    steps.push({
      element: tabs,
      popover: {
        title: 'Filter by Due Date',
        description: 'Switch between Overdue, Today, This Week, Next Week, Later.'
      }
    })
  }
  const card = document.querySelector('[data-tour="return-card"]')
  if (card) {
    steps.push({
      element: card,
      popover: {
        title: 'Return Card',
        description: 'Shows vehicle, customer, price, rental period and status.'
      }
    })
  } else if (header) {
    steps.push({
      element: header,
      popover: {
        title: 'No Return Cards',
        description: 'No returns in this category yet. Cards will appear when returns are due.'
      }
    })
  }
  const buttons = Array.from(document.querySelectorAll('[data-tour="return-btn"]'))
  const visibleBtn = buttons.find(el => el && el.offsetParent !== null)
  if (visibleBtn) {
    steps.push({
      element: visibleBtn,
      popover: {
        title: 'Process / Review',
        description: 'Open the workflow to process or review this return.'
      }
    })
  }
  return steps
}

onMounted(() => {
  if (!localStorage.getItem('vehicleReturnsTourSeen')) {
    setTimeout(() => startTour(), 600)
  }
})

const totalCount = computed(() => Object.values(groupedBookings.value).reduce((s,a)=>s+a.length,0))

function getReturnStatusVariant(status) {
  switch (status) {
    case 'completed': return 'success'
    case 'customer_submitted': return 'warning'
    case 'admin_processing': return 'secondary'
    default: return 'outline'
  }
}
function getReturnStatusLabel(status) {
  switch (status) {
    case 'completed': return 'Completed'
    case 'customer_submitted': return 'Customer Submitted'
    case 'admin_processing': return 'Admin Processing'
    default: return status.replace('_',' ')
  }
}

// NOTE: Inline template-based components removed (runtime-only Vue build).
</script>
