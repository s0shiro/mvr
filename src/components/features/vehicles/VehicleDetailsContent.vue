<template>
  <div>
    <template v-if="isAdminOrManager">
      <div class="space-y-8">
        <div class="grid lg:grid-cols-[2fr_1.2fr] gap-6">
          <Card class="bg-card border border-border">
            <CardHeader class="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div class="space-y-1">
                <CardTitle class="text-3xl font-bold leading-tight">{{ vehicle.name }}</CardTitle>
                <p class="text-sm text-muted-foreground">Plate: {{ vehicle.plate_number }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ vehicle.brand }} • {{ vehicle.model }} • {{ vehicle.year }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <Badge
                  :variant="badgeVariant"
                  class="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide"
                >
                  {{ vehicle.status }}
                </Badge>
                <RouterLink :to="{ name: 'vehicle-edit', params: { id: vehicle.id } }">
                  <Button variant="outline" size="sm" class="gap-2">
                    <SquarePen class="w-4 h-4" />
                    Edit Vehicle
                  </Button>
                </RouterLink>
              </div>
            </CardHeader>
            <CardContent>
              <dl class="grid sm:grid-cols-2 gap-4 text-sm">
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Type</dt>
                  <dd class="text-foreground font-medium">{{ vehicle.type }}</dd>
                </div>
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Brand</dt>
                  <dd class="text-foreground font-medium">{{ vehicle.brand }}</dd>
                </div>
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Model</dt>
                  <dd class="text-foreground font-medium">{{ vehicle.model }}</dd>
                </div>
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Year</dt>
                  <dd class="text-foreground font-medium">{{ vehicle.year }}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <Card class="bg-card border border-border">
            <CardHeader>
              <CardTitle>Financial Overview</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Daily Rate</dt>
                  <dd class="text-lg font-semibold text-primary">
                    ₱{{ formatCurrency(vehicle.rental_rate) }}/day
                  </dd>
                </div>
                <div v-if="canRequestDriver && vehicle.rental_rate_with_driver" class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">
                    Daily Rate (w/ Driver)
                  </dt>
                  <dd class="text-lg font-semibold text-primary">
                    ₱{{ formatCurrency(vehicle.rental_rate_with_driver) }}/day
                  </dd>
                </div>
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Deposit</dt>
                  <dd class="text-lg font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.deposit) }}
                  </dd>
                </div>
                <div class="flex flex-col gap-1">
                  <dt class="text-muted-foreground uppercase tracking-wide text-xs">Capacity</dt>
                  <dd class="text-lg font-semibold text-foreground">
                    {{ vehicle.capacity }} person(s)
                  </dd>
                </div>
              </dl>
              <div class="border-t border-border/60 pt-4">
                <h4 class="text-sm font-semibold text-foreground mb-3">Penalties & Fees</h4>
                <dl class="grid sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                  <div class="flex flex-col gap-0.5">
                    <dt class="text-muted-foreground uppercase tracking-wide text-xs">
                      Fee per Kilometer
                    </dt>
                    <dd class="text-foreground font-medium">
                      ₱{{ formatCurrency(vehicle.fee_per_kilometer) }}
                    </dd>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <dt class="text-muted-foreground uppercase tracking-wide text-xs">
                      Late Fee per Hour
                    </dt>
                    <dd class="text-foreground font-medium">
                      ₱{{ formatCurrency(vehicle.late_fee_per_hour) }}
                    </dd>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <dt class="text-muted-foreground uppercase tracking-wide text-xs">
                      Late Fee per Day
                    </dt>
                    <dd class="text-foreground font-medium">
                      ₱{{ formatCurrency(vehicle.late_fee_per_day) }}
                    </dd>
                  </div>
                  <div class="flex flex-col gap-0.5">
                    <dt class="text-muted-foreground uppercase tracking-wide text-xs">
                      Fuel Penalty per Liter
                    </dt>
                    <dd class="text-foreground font-medium">
                      ₱{{ formatCurrency(vehicle.gasoline_late_fee_per_liter) }}
                    </dd>
                  </div>
                </dl>
              </div>
            </CardContent>
          </Card>
        </div>

        <div class="grid lg:grid-cols-[2fr_1.2fr] gap-6">
          <Card class="bg-card border border-border">
            <CardHeader>
              <CardTitle>Media Gallery</CardTitle>
            </CardHeader>
            <CardContent class="space-y-4">
              <div
                class="rounded-2xl overflow-hidden shadow bg-muted flex items-center justify-center min-h-[240px] max-h-[400px] relative"
              >
                <img
                  v-if="mainImage"
                  :src="mainImage"
                  :alt="vehicle.name"
                  class="object-cover w-full h-full min-h-[240px] max-h-[400px] bg-card"
                />
                <div
                  v-else
                  class="flex flex-col items-center justify-center w-full h-full text-muted-foreground min-h-[240px] max-h-[400px]"
                >
                  <span class="text-4xl">🚗</span>
                  <span class="mt-2">No image available</span>
                </div>
              </div>
              <div v-if="hasMultipleImages" class="flex gap-2 overflow-x-auto">
                <img
                  v-for="image in vehicle.images"
                  :key="image.id"
                  :src="image.image_url || image.url"
                  :alt="vehicle.name"
                  class="h-16 w-28 object-cover rounded-lg cursor-pointer border-2 border-transparent hover:border-primary focus:border-primary transition-all duration-200 bg-muted min-w-[7rem] max-w-[7rem] shadow-sm"
                  :class="{ 'ring-2 ring-primary': mainImage === (image.image_url || image.url) }"
                  @click="selectImage(image.image_url || image.url)"
                  tabindex="0"
                />
              </div>
            </CardContent>
          </Card>

          <Card class="bg-card border border-border">
            <CardHeader>
              <CardTitle>Operational Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl class="space-y-3 text-sm">
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Fuel Capacity</dt>
                  <dd class="font-medium">
                    {{ vehicle.fuel_capacity ? vehicle.fuel_capacity + ' L' : 'N/A' }}
                  </dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Fuel Type</dt>
                  <dd class="font-medium">{{ vehicle.fuel_type || 'N/A' }}</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Color</dt>
                  <dd class="font-medium">{{ vehicle.color || 'N/A' }}</dd>
                </div>
                <div class="flex items-center justify-between">
                  <dt class="text-muted-foreground">Status</dt>
                  <dd class="font-medium capitalize">{{ vehicle.status }}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>

        <Card class="bg-card border border-border">
          <CardHeader>
            <CardTitle>Policies & Notes</CardTitle>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <h4 class="text-sm font-semibold text-foreground mb-2">Description</h4>
              <p class="text-sm text-muted-foreground leading-relaxed">
                {{ vehicle.description || 'No description available for this vehicle.' }}
              </p>
            </div>
            <div>
              <h4 class="text-sm font-semibold text-foreground mb-2">Rental Policies</h4>
              <ul class="list-disc pl-5 text-sm text-muted-foreground space-y-1.5">
                <li>
                  Standard deposit: ₱{{ formatCurrency(vehicle.deposit) }} (refundable upon
                  inspection and full tank return)
                </li>
                <li>Hourly late return fee: ₱{{ formatCurrency(vehicle.late_fee_per_hour) }}</li>
                <li>Daily late return fee: ₱{{ formatCurrency(vehicle.late_fee_per_day) }}</li>
                <li>
                  Fuel shortage penalty: ₱{{ formatCurrency(vehicle.gasoline_late_fee_per_liter) }}
                  per liter
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <template v-else>
      <div class="space-y-10">
        <div class="grid gap-8 lg:grid-cols-[3fr_2fr]">
          <Card class="overflow-hidden border border-border bg-card shadow-md">
            <div class="relative">
              <div
                class="aspect-video bg-muted flex items-center justify-center min-h-[260px] max-h-[440px] relative"
              >
                <img
                  v-if="mainImage"
                  :src="mainImage"
                  :alt="vehicle.name"
                  class="object-cover w-full h-full min-h-[260px] max-h-[440px]"
                />
                <div
                  v-else
                  class="flex flex-col items-center justify-center w-full h-full text-muted-foreground"
                >
                  <span class="text-5xl">🚗</span>
                  <span class="mt-3 text-sm">No image available</span>
                </div>
                <div
                  class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-6 text-white"
                >
                  <div class="flex items-center gap-3">
                    <h1 class="text-3xl font-semibold leading-tight">{{ vehicle.name }}</h1>
                    <Badge
                      :variant="badgeVariant"
                      class="bg-white/90 text-primary px-4 py-1 text-xs font-semibold uppercase tracking-wide"
                    >
                      {{ vehicle.status }}
                    </Badge>
                  </div>
                  <p class="mt-2 text-sm text-white/80">
                    {{ vehicle.brand }} • {{ vehicle.model }} • {{ vehicle.year }}
                  </p>
                </div>
              </div>
              <div
                v-if="hasMultipleImages"
                class="flex gap-2 overflow-x-auto border-t border-border bg-card p-4"
              >
                <img
                  v-for="image in vehicle.images"
                  :key="image.id"
                  :src="image.image_url || image.url"
                  :alt="vehicle.name"
                  class="h-16 w-28 min-w-[7rem] max-w-[7rem] rounded-lg border-2 border-transparent bg-muted object-cover shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary focus:border-primary"
                  :class="{ 'ring-2 ring-primary': mainImage === (image.image_url || image.url) }"
                  @click="selectImage(image.image_url || image.url)"
                  tabindex="0"
                />
              </div>
            </div>
          </Card>

          <div class="space-y-6">
            <Card class="border border-border bg-card shadow-md">
              <CardHeader class="pb-4">
                <CardTitle class="text-2xl">Plan Your Ride</CardTitle>
                <p class="text-sm text-muted-foreground">
                  Essentials to help you book with confidence
                </p>
              </CardHeader>
              <CardContent class="space-y-6">
                <div class="grid gap-3 sm:grid-cols-2">
                  <div class="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
                    <Users class="h-5 w-5 text-primary" />
                    <div>
                      <p class="text-xs uppercase tracking-wide text-muted-foreground">Capacity</p>
                      <p class="text-base font-semibold text-foreground">
                        {{ vehicle.capacity }} people
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
                    <CarFront class="h-5 w-5 text-primary" />
                    <div>
                      <p class="text-xs uppercase tracking-wide text-muted-foreground">Type</p>
                      <p class="text-base font-semibold text-foreground capitalize">
                        {{ vehicle.type }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
                    <Fuel class="h-5 w-5 text-primary" />
                    <div>
                      <p class="text-xs uppercase tracking-wide text-muted-foreground">Fuel</p>
                      <p class="text-base font-semibold text-foreground">
                        {{ vehicle.fuel_type || 'Not specified' }}
                      </p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3 rounded-lg bg-muted/60 px-3 py-2">
                    <Palette class="h-5 w-5 text-primary" />
                    <div>
                      <p class="text-xs uppercase tracking-wide text-muted-foreground">Color</p>
                      <p class="text-base font-semibold text-foreground">
                        {{ vehicle.color || 'Not specified' }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="rounded-xl border border-dashed border-primary/40 bg-primary/5 px-4 py-4">
                  <p class="text-xs uppercase tracking-wide text-primary">Daily Rate</p>
                  <p class="text-2xl font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.rental_rate) }}
                    <span class="text-sm font-normal text-muted-foreground">per day</span>
                  </p>
                  <p
                    v-if="canRequestDriver && vehicle.rental_rate_with_driver"
                    class="mt-2 text-sm text-muted-foreground"
                  >
                    Add a professional driver for ₱{{ formatCurrency(vehicle.rental_rate_with_driver) }} per day.
                  </p>
                  <div class="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                    <Star class="h-4 w-4 text-primary" />
                    <span>
                      Rated {{ averageRating }} by {{ feedbackList.length }} happy renter{{
                        feedbackList.length === 1 ? '' : 's'
                      }}
                    </span>
                  </div>
                </div>

                <div class="flex flex-col gap-3">
                  <button
                    v-if="vehicle.status !== 'maintenance'"
                    class="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-lg font-semibold text-primary-foreground shadow-lg transition-all hover:from-primary/90 hover:to-primary/80 disabled:cursor-not-allowed disabled:opacity-60"
                    @click.prevent="handleBook"
                    :disabled="bookDisabled"
                  >
                    Book Now
                    <ArrowRight class="h-5 w-5" />
                  </button>
                  <div v-else class="rounded-xl border border-dashed border-border bg-muted px-4 py-3 text-center">
                    <p class="text-sm font-semibold text-muted-foreground">Currently under maintenance</p>
                    <p class="text-xs text-muted-foreground/80">Check back soon for availability.</p>
                  </div>
                  <p class="text-center text-xs text-muted-foreground">
                    You won’t be charged until the reservation is confirmed.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card class="border border-border bg-card shadow-md">
              <CardHeader class="pb-4">
                <CardTitle>Important Fees</CardTitle>
                <p class="text-sm text-muted-foreground">Transparent rates for a smooth trip</p>
              </CardHeader>
              <CardContent class="space-y-3">
                <div class="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard class="h-4 w-4 text-primary" />
                    Security deposit
                  </div>
                  <span class="text-sm font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.deposit) }}
                  </span>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gauge class="h-4 w-4 text-primary" />
                    Extra kilometer fee
                  </div>
                  <span class="text-sm font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.fee_per_kilometer) }}/km
                  </span>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock class="h-4 w-4 text-primary" />
                    Late return (per hour)
                  </div>
                  <span class="text-sm font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.late_fee_per_hour) }}
                  </span>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarClock class="h-4 w-4 text-primary" />
                    Late return (per day)
                  </div>
                  <span class="text-sm font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.late_fee_per_day) }}
                  </span>
                </div>
                <div class="flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2">
                  <div class="flex items-center gap-2 text-sm text-muted-foreground">
                    <Fuel class="h-4 w-4 text-primary" />
                    Fuel refill penalty
                  </div>
                  <span class="text-sm font-semibold text-foreground">
                    ₱{{ formatCurrency(vehicle.gasoline_late_fee_per_liter) }}/L
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div class="grid gap-8 md:grid-cols-2">
          <Card class="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>About This Vehicle</CardTitle>
            </CardHeader>
            <CardContent>
              <p class="text-sm leading-relaxed text-muted-foreground">
                {{ vehicle.description || 'The owner has not provided additional details yet.' }}
              </p>
            </CardContent>
          </Card>

          <Card class="border border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle>Quick Specs</CardTitle>
            </CardHeader>
            <CardContent class="grid gap-3">
              <div class="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <CarFront class="h-5 w-5 text-primary" />
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted-foreground">Brand & Model</p>
                  <p class="text-sm font-semibold text-foreground">
                    {{ vehicle.brand }} {{ vehicle.model }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <Users class="h-5 w-5 text-primary" />
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted-foreground">Seats</p>
                  <p class="text-sm font-semibold text-foreground">{{ vehicle.capacity }} passengers</p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <Fuel class="h-5 w-5 text-primary" />
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted-foreground">Fuel Capacity</p>
                  <p class="text-sm font-semibold text-foreground">
                    {{ vehicle.fuel_capacity ? `${vehicle.fuel_capacity} L` : 'Not specified' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/40 px-4 py-3">
                <Palette class="h-5 w-5 text-primary" />
                <div>
                  <p class="text-xs uppercase tracking-wide text-muted-foreground">Color</p>
                  <p class="text-sm font-semibold text-foreground">{{ vehicle.color || 'Not specified' }}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card class="border border-border bg-card shadow-sm">
          <CardHeader>
            <CardTitle>Before You Book</CardTitle>
          </CardHeader>
          <CardContent class="space-y-3 text-sm text-muted-foreground">
            <p class="font-medium text-foreground">Please prepare the following:</p>
            <ul class="grid gap-2 md:grid-cols-2">
              <li class="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <CreditCard class="h-4 w-4 text-primary" />
                <span>Refundable deposit of ₱{{ formatCurrency(vehicle.deposit) }}</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <User2 class="h-4 w-4 text-primary" />
                <span>Two valid government-issued IDs</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <MessageCircle class="h-4 w-4 text-primary" />
                <span>Signed rental agreement upon pickup</span>
              </li>
              <li class="flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
                <CalendarClock class="h-4 w-4 text-primary" />
                <span>Return with full tank to avoid fuel penalties</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </template>

    <section class="mt-10">
      <Card class="bg-card border border-border">
        <CardHeader>
          <CardTitle class="flex items-center gap-2 text-xl">
            <Star class="text-yellow-400 w-6 h-6" />
            Customer Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="flex items-center gap-2 mb-4">
            <span class="flex items-center">
              <Star
                v-for="n in 5"
                :key="n"
                :class="n <= roundedAverage ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                class="w-5 h-5"
              />
            </span>
            <span class="text-lg font-semibold">{{ averageRating }}</span>
            <span class="text-muted-foreground text-sm"
              >({{ feedbackList.length }} review{{ feedbackList.length === 1 ? '' : 's' }})</span
            >
          </div>
          <div v-if="feedbackLoading" class="text-muted-foreground text-sm flex items-center gap-2">
            <span class="animate-spin w-4 h-4 border-b-2 border-primary rounded-full"></span>
            Loading feedback...
          </div>
          <div v-else-if="feedbackList.length === 0" class="text-muted-foreground text-sm">
            No feedback yet for this vehicle.
          </div>
          <div v-else class="space-y-4 mt-2">
            <div
              v-for="fb in feedbackList"
              :key="fb.id"
              class="bg-muted/60 rounded-xl p-4 sm:p-5 border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div class="flex flex-wrap items-start justify-between gap-4">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <UserCircle class="w-7 h-7" />
                  </div>
                  <div class="space-y-1">
                    <p class="font-semibold text-sm sm:text-base text-foreground">
                      {{ fb.user?.name || 'Customer' }}
                    </p>
                    <div class="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarClock class="w-4 h-4" />
                      <span>
                        {{
                          new Date(fb.created_at).toLocaleDateString('en-PH', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        }}
                      </span>
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-1 bg-background/70 px-3 py-1.5 rounded-full border border-border/60">
                  <Star
                    v-for="n in 5"
                    :key="n"
                    :class="n <= fb.rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
                    class="w-4 h-4"
                  />
                  <span class="text-xs font-semibold text-muted-foreground ml-1"
                    >{{ typeof fb.rating === 'number' ? fb.rating.toFixed(1) : fb.rating || '—' }}</span
                  >
                </div>
              </div>
              <div class="mt-3 text-sm sm:text-base text-foreground leading-relaxed border-t border-border/50 pt-3">
                <div class="flex items-start gap-2">
                  <MessageCircle class="w-5 h-5 mt-0.5 text-muted-foreground" />
                  <p class="flex-1">{{ fb.comment || 'No comment provided.' }}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup>
import { computed, toRefs } from 'vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  ArrowRight,
  CalendarClock,
  CarFront,
  CreditCard,
  Fuel,
  Gauge,
  MessageCircle,
  Palette,
  SquarePen,
  Star,
  User2,
  UserCircle,
  Users,
} from 'lucide-vue-next'

const props = defineProps({
  vehicle: { type: Object, required: true },
  badgeVariant: { type: String, required: true },
  canRequestDriver: { type: Boolean, default: false },
  isAdminOrManager: { type: Boolean, default: false },
  mainImage: { type: String, default: null },
  feedbackList: { type: Array, default: () => [] },
  feedbackLoading: { type: Boolean, default: false },
  averageRating: { type: [String, Number], default: 0 },
  formatCurrency: { type: Function, required: true },
  bookDisabled: { type: Boolean, default: false },
})

const emit = defineEmits(['select-image', 'book'])

const propRefs = toRefs(props)
const {
  vehicle,
  badgeVariant,
  canRequestDriver,
  isAdminOrManager,
  mainImage,
  feedbackList,
  feedbackLoading,
  averageRating,
  bookDisabled,
} = propRefs
const formatCurrency = props.formatCurrency

const roundedAverage = computed(() => Math.round(Number(averageRating.value ?? 0)))

const hasMultipleImages = computed(() => {
  const images = vehicle.value?.images
  return Array.isArray(images) && images.length > 1
})

const selectImage = (url) => {
  emit('select-image', url)
}

const handleBook = () => {
  emit('book')
}
</script>