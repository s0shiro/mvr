<script setup>
// Import reusable UI components (assuming shadcn-vue or similar setup)
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'

const faq = [
  {
    question: 'What is Marinduque Vehicle Rental (MVR) System?',
    answer:
      'MVR is a web-based platform that digitizes and streamlines the entire vehicle rental process in Marinduque. It enables customers to browse, book, and pay for vehicles online, while providing staff and managers with tools for efficient booking management, payment processing, and business reporting.',
  },
  {
    question: 'How do I book a vehicle?',
    answer:
      'Simply register for an account, browse available vehicles, select your preferred vehicle, and complete the booking form with your desired dates. The system will guide you through payment of the security deposit and confirm your reservation.',
  },
  {
    question: 'What payment methods are supported?',
    answer:
      'You can pay securely via GCash, bank transfer, or cash. Digital receipts are issued for all payments.',
  },
  {
    question: 'Can I request a driver?',
    answer:
      'Yes, you can request a driver during the booking process. The system will show available drivers and update your booking accordingly.',
  },
  {
    question: 'How do I modify or cancel my booking?',
    answer:
      'Log in to your account, go to your bookings, and use the modify or cancel options. Refunds are processed according to our cancellation policy.',
  },
  {
    question: 'How is my security deposit handled?',
    answer:
      'Your deposit is securely held and fully refunded after the vehicle is returned in good condition. Any deductions for damages or late returns are transparently documented.',
  },
]

const openFaq = ref([0])
const toggleFaq = (idx) => {
  if (openFaq.value.includes(idx)) {
    openFaq.value = openFaq.value.filter((i) => i !== idx)
  } else {
    openFaq.value.push(idx)
  }
}

// Navigation items
const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Our Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' },
]
</script>

<template>
  <main class="min-h-screen bg-background text-foreground font-sans">
    <!-- Navigation -->
    <nav
      class="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <img src="@/assets/mvr-logo.png" alt="MVR Logo" class="h-10 w-auto" />
          </div>

          <!-- Navigation Links -->
          <div class="hidden md:flex md:items-center md:space-x-8">
            <a
              v-for="item in navItems"
              :key="item.href"
              :href="item.href"
              class="text-muted-foreground hover:text-foreground transition-colors px-3 py-2 text-sm font-medium"
            >
              {{ item.label }}
            </a>
          </div>

          <!-- Contact Us Button -->
          <div class="flex items-center">
            <Button
              class="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 py-2"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Add pt-16 to the first section to account for fixed nav -->
    <!-- Hero Section -->
    <section id="home" class="pt-32 pb-24 text-center relative">
      <div class="max-w-3xl mx-auto">
        <h1 class="text-4xl md:text-6xl font-bold mb-4">
          Marinduque Vehicle Rental System<br />
          <span class="text-primary">Digitize Your Ride</span>
        </h1>
        <p class="text-lg md:text-xl text-muted-foreground mb-8">
          Book, pay, and manage your vehicle rentals online. MVR streamlines the entire rental
          lifecycle—from browsing to return—empowering customers and staff with automation,
          transparency, and real-time insights.
        </p>
        <div class="flex justify-center gap-4 mb-8">
          <RouterLink to="/login">
            <Button
              class="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-full font-semibold shadow-lg"
              >Get Started</Button
            >
          </RouterLink>
          <Button
            variant="outline"
            class="border-primary text-primary hover:bg-primary/10 px-6 py-3 rounded-full font-semibold"
            >See How It Works</Button
          >
        </div>
        <div class="text-sm text-muted-foreground">Trusted by local businesses and travelers</div>
        <div class="flex justify-center gap-6 mt-6 opacity-80">
          <!-- Partner logos -->
          <img src="https://github.com/shadcn.png" alt="Partner" class="w-10 h-10 rounded-full" />
          <img src="https://github.com/shadcn.png" alt="Partner" class="w-10 h-10 rounded-full" />
          <img src="https://github.com/shadcn.png" alt="Partner" class="w-10 h-10 rounded-full" />
          <img src="https://github.com/shadcn.png" alt="Partner" class="w-10 h-10 rounded-full" />
        </div>
      </div>
    </section>

    <!-- Features/Dashboard Preview Section -->
    <section id="platform" class="py-20 bg-card text-card-foreground text-center">
      <h2 class="text-3xl md:text-5xl font-bold mb-4">
        All-in-One <span class="text-primary">Vehicle Rental Hub</span>
      </h2>
      <p class="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
        Manage bookings, payments, contracts, and reporting in one place. MVR automates manual tasks
        and provides real-time business insights for staff and managers.
      </p>
      <div
        class="max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border border-border bg-popover"
      >
        <div class="h-64 md:h-96 flex items-center justify-center text-muted-foreground">
          <!-- Placeholder for dashboard image -->
          <span class="text-2xl">[Rental Dashboard Preview]</span>
        </div>
      </div>
    </section>

    <!-- Growth & Impact Section -->
    <section id="features" class="py-20 bg-background text-foreground">
      <div class="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h3 class="text-2xl md:text-4xl font-bold mb-4">
            Why Choose <span class="text-primary">MVR?</span>
          </h3>
          <p class="text-muted-foreground mb-8">
            From manual logs to digital convenience—MVR helps you save time, reduce errors, and
            deliver a seamless rental experience for both customers and staff.
          </p>
          <div class="space-y-4">
            <div class="bg-card rounded-xl p-4 flex items-center gap-4">
              <img src="https://github.com/shadcn.png" alt="Icon" class="w-12 h-12 rounded-full" />
              <div>
                <div class="font-semibold text-card-foreground">Automated Bookings</div>
                <div class="text-muted-foreground text-sm">
                  No more paper logs—book and confirm rentals online.
                </div>
              </div>
            </div>
            <div class="bg-card rounded-xl p-4 flex items-center gap-4">
              <img src="https://github.com/shadcn.png" alt="Icon" class="w-12 h-12 rounded-full" />
              <div>
                <div class="font-semibold text-card-foreground">Integrated Payments</div>
                <div class="text-muted-foreground text-sm">
                  Pay securely via GCash, bank, or cash. Digital receipts included.
                </div>
              </div>
            </div>
            <div class="bg-card rounded-xl p-4 flex items-center gap-4">
              <img src="https://github.com/shadcn.png" alt="Icon" class="w-12 h-12 rounded-full" />
              <div>
                <div class="font-semibold text-card-foreground">Smart Reporting</div>
                <div class="text-muted-foreground text-sm">
                  Track earnings, deposits, and business growth in real time.
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-4">
          <div class="bg-card rounded-xl p-6 shadow-lg">
            <div class="flex items-center gap-3 mb-2">
              <img src="https://github.com/shadcn.png" alt="Avatar" class="w-8 h-8 rounded-full" />
              <span class="font-semibold text-card-foreground">Maria Santos</span>
              <span class="text-xs text-muted-foreground">Customer</span>
            </div>
            <div class="text-muted-foreground text-sm">
              "Booking a van for my family trip was so easy! I loved the instant confirmation and
              digital contract."
            </div>
          </div>
          <div class="bg-card rounded-xl p-6 shadow-lg">
            <div class="flex items-center gap-3 mb-2">
              <img src="https://github.com/shadcn.png" alt="Avatar" class="w-8 h-8 rounded-full" />
              <span class="font-semibold text-card-foreground">Juan Dela Cruz</span>
              <span class="text-xs text-muted-foreground">Business Owner</span>
            </div>
            <div class="text-muted-foreground text-sm">
              "MVR made it simple to manage all our vehicles and track payments. The reporting tools
              are a game changer."
            </div>
          </div>
          <div class="bg-card rounded-xl p-6 shadow-lg">
            <div class="flex items-center gap-3 mb-2">
              <img src="https://github.com/shadcn.png" alt="Avatar" class="w-8 h-8 rounded-full" />
              <span class="font-semibold text-card-foreground">Ana Reyes</span>
              <span class="text-xs text-muted-foreground">Staff</span>
            </div>
            <div class="text-muted-foreground text-sm">
              "No more manual errors! The system keeps everything organized and easy to access."
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-20 bg-card">
      <div class="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
        <div class="bg-popover rounded-xl p-6 shadow-lg flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <img src="https://github.com/shadcn.png" alt="Avatar" class="w-8 h-8 rounded-full" />
            <span class="font-semibold text-popover-foreground">Elena Ramos</span>
            <span class="text-xs text-muted-foreground">Tourist, Manila</span>
          </div>
          <div class="text-muted-foreground text-sm mt-2">
            The online booking was fast and convenient. I received my contract and payment receipt
            instantly!
          </div>
          <div class="flex gap-1 mt-2">
            <span v-for="i in 5" :key="i" class="text-primary">★</span>
          </div>
        </div>
        <div class="bg-popover rounded-xl p-6 shadow-lg flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <img src="https://github.com/shadcn.png" alt="Avatar" class="w-8 h-8 rounded-full" />
            <span class="font-semibold text-popover-foreground">Rico Villanueva</span>
            <span class="text-xs text-muted-foreground">Manager, MVR</span>
          </div>
          <div class="text-muted-foreground text-sm mt-2">
            Managing bookings and payments is now effortless. The reporting dashboard helps us stay
            on top of business performance.
          </div>
          <div class="flex gap-1 mt-2">
            <span v-for="i in 5" :key="i" class="text-primary">★</span>
          </div>
        </div>
        <div class="bg-popover rounded-xl p-6 shadow-lg flex flex-col gap-2">
          <div class="flex items-center gap-3">
            <img src="https://github.com/shadcn.png" alt="Avatar" class="w-8 h-8 rounded-full" />
            <span class="font-semibold text-popover-foreground">Liza Cruz</span>
            <span class="text-xs text-muted-foreground">Customer</span>
          </div>
          <div class="text-muted-foreground text-sm mt-2">
            I was able to modify my booking and get a refund easily. The process was transparent and
            quick.
          </div>
          <div class="flex gap-1 mt-2">
            <span v-for="i in 5" :key="i" class="text-primary">★</span>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section id="faq" class="py-20 bg-background">
      <div class="max-w-3xl mx-auto">
        <h3 class="text-3xl md:text-4xl font-bold text-center mb-10">
          Your Questions? <span class="text-primary">Answered</span>
        </h3>
        <div class="space-y-4">
          <div v-for="(item, idx) in faq" :key="item.question" class="bg-card rounded-xl">
            <button
              @click="toggleFaq(idx)"
              class="w-full flex justify-between items-center px-6 py-4 text-left focus:outline-none"
            >
              <span class="font-semibold text-card-foreground">{{ item.question }}</span>
              <span class="text-primary">{{ openFaq.includes(idx) ? '−' : '+' }}</span>
            </button>
            <div v-if="openFaq.includes(idx)" class="px-6 pb-4 text-muted-foreground text-sm">
              {{ item.answer }}
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="py-20 bg-card">
      <div class="max-w-5xl mx-auto px-4">
        <h2 class="text-3xl md:text-4xl font-bold text-center mb-10">
          Get in <span class="text-primary">Touch</span>
        </h2>
        <div class="grid md:grid-cols-2 gap-12">
          <!-- Contact Information -->
          <div class="space-y-8">
            <div>
              <h3 class="text-xl font-semibold mb-4 text-card-foreground">Contact Information</h3>
              <div class="space-y-4">
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 mt-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-5 h-5"
                    >
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-card-foreground">Phone Lines</p>
                    <p class="text-muted-foreground">+63 919 876 7755</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 mt-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-5 h-5"
                    >
                      <path
                        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                      />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-card-foreground">WhatsApp</p>
                    <p class="text-muted-foreground">+63 917 877 2017</p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 mt-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-5 h-5"
                    >
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                      />
                      <path d="m22 6-10 7L2 6" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-card-foreground">Email</p>
                    <a
                      href="mailto:marinduquevehiclerental@gmail.com"
                      class="text-primary hover:text-primary/90"
                    >
                      marinduquevehiclerental@gmail.com
                    </a>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 mt-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-5 h-5"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-card-foreground">Location</p>
                    <p class="text-muted-foreground">
                      Unit 2, DM1 Apartments, Purok Azucena Brgy. Bantad, Boac, 4900 Marinduque
                    </p>
                  </div>
                </div>
                <div class="flex items-start gap-3">
                  <div class="w-5 h-5 mt-1 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="w-5 h-5"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-card-foreground">Facebook</p>
                    <a
                      href="https://www.facebook.com/marinduquevehiclerental"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="text-primary hover:text-primary/90"
                    >
                      facebook.com/marinduquevehiclerental
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-10 bg-background border-t border-border text-center">
      <div class="flex justify-center gap-6 mb-4">
        <a href="#" class="text-muted-foreground hover:text-foreground"
          ><i class="fab fa-facebook-f"></i
        ></a>
        <a href="#" class="text-muted-foreground hover:text-foreground"
          ><i class="fab fa-linkedin-in"></i
        ></a>
        <a href="#" class="text-muted-foreground hover:text-foreground"
          ><i class="fab fa-instagram"></i
        ></a>
        <a href="#" class="text-muted-foreground hover:text-foreground"
          ><i class="fab fa-x-twitter"></i
        ></a>
      </div>
      <div class="text-muted-foreground text-sm mb-2">
        Empowering businesses with smart rental solutions—secure, reliable, and built for growth.
      </div>
      <div class="flex justify-center gap-4 text-xs text-muted-foreground">
        <a href="#" class="hover:text-foreground">Privacy Policy</a>
        <span>|</span>
        <a href="#" class="hover:text-foreground">Terms of Service</a>
      </div>
      <div class="mt-2 text-xs text-muted-foreground">© 2024 MVR. All rights reserved</div>
    </footer>
  </main>
</template>
