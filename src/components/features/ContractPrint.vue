<template>
  <div class="contract-print">
    <button v-if="showPrintButton" @click="printContract" class="print-btn">Print</button>
    <div class="contract-content">
      <!-- logo here then center the logo-->
      <div class="logo-section">
        <img src="/mvr-logo.png" alt="Marinduque Vehicle Rental Logo" class="contract-logo" />
      </div>
      <!-- Center the contract title -->
      <h1 class="contract-title">CONTRACT OF LEASE</h1>
      <div class="contract-no-line">
        <b>VEHICLE CONTRACT NO.</b> <span class="underline"><!--{{ contractNo }}--></span>
      </div>
      <div class="section-title left"><b>KNOW ALL MEN BY THESE PRESENTS:</b></div>
      <div class="contract-body">
        <p class="indent">
          This Contract of Lease is made and executed this <b>{{ contractDay }}</b> day of
          <b>{{ contractMonth }}</b
          >, <b>{{ contractYear }}</b
          >, at
          <b
            >Boac Bypass Road Corner
            <u>Tabi-Lupac Rd., Brgy Tabi, Boac, Marinduque Philippines</u></b
          >
          by and between:
        </p>
        <p class="indent mt-1em">
          <b>JEAN CARISIOSA WORTH</b> of legal age, Filipino and resident of
          <u><b>PUROK AZUCENA BRGY. BANTAD BOAC, MARINDUQUE</b></u> Philippines, hereinafter
          referred to as the <b>"LESSOR"</b>.
        </p>
        <div class="and-section center bold mt-05em">-and-</div>
        <p class="indent">
          <b>{{ lesseeName }}</b
          >, a Filipino citizen of legal age, a resident of
          <u
            ><b>{{ lesseeAddress }}</b></u
          >, Philippines hereinafter referred to as the <b>“LESSEE”</b>.
        </p>
      </div>
      <h2 class="section-title center"><b>WITNESSETH THAT:</b></h2>
      <div class="contract-body">
        <p class="indent">
          <b>WHEREAS</b>, the <b>LESSOR</b> is the lawful and absolute owner of the vehicle,
          {{ vehicleDetails }} hereinafter referred to as the <b>LEASED VEHICLE</b>;
          <b>CAR/MOTOR</b>
        </p>
        <p class="indent mt-1em">
          <b>WHEREAS</b>, the <b>LESSEE</b> desires to lease the vehicle and the <b>LESSOR</b> is
          willing to lease the same to the <b>LESSEE</b>, subject to the terms and conditions
          hereinafter specified;
        </p>
        <p class="indent mt-1em">
          <b>NOW THEREFORE</b>, for and in consideration of the foregoing and covenants and
          agreements hereinafter set forth, the <b>LESSOR</b> agrees and consents to lease the
          aforementioned vehicle and <b>LESSEE</b> hereby accepts the same by way of lease subject
          to the following terms and conditions:
        </p>
        <div class="contract-clauses pl-2em">
          <div>
            <div class="clause-item mt-1em">
              1. <b>PURPOSE OF LEASE</b> – The <b>LESSEE</b> agrees and undertakes to use, drive and
              devote the <b>LEASED VEHICLE</b> exclusively for personal purposes only as allowed by
              law, and for no other purpose without the written consent of the <b>LESSOR</b>.
              <b>THE LESSEE</b> likewise agrees and undertakes to abide by the Vehicle Rules
              stipulated in this contract. Any violation or misrepresentation on the part of the
              <b>LESSEE</b> affecting the use of the leased vehicle and violation of the Vehicle
              Rules shall be a ground for the cancellation or termination of this Contract; or
              otherwise, the <b>LESSOR</b> may opt to increase rent on account thereof.
            </div>
          </div>
          <div>
            <div class="clause-item mt-1em">
              2. <b>LEASE PERIOD</b> – The term of this lease shall be for the period of
              {{ leasePeriod }} commencing on {{ leaseStart }}. Prior to expiration of this lease,
              both the <b>LESSEE</b> and the <b>LESSOR</b> shall notify each other of their
              intention to renew or terminate this contract.
            </div>
          </div>
          <div style="page-break-before: always; margin-top: 4em">
            <div class="clause-item mt-1em">
              3. <b>RENTAL</b> – The <b>LESSEE</b> shall pay the <b>LESSOR</b> a daily rental amount
              of <b>{{ dailyRate }}</b> (<b>{{ dailyRateWords }}</b
              >), Philippine Currency.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              4. <b>SECURITY DEPOSIT</b> – The <b>LESSEE</b> shall pay the <b>LESSOR</b> the sum
              equivalent to <b>{{ securityDeposit }}</b> (<b>{{ securityDepositWords }}</b
              >), Philippine Currency. Said security deposit is non-interest bearing and shall
              remain intact for the entire duration of this lease. Likewise, said deposit shall
              cover unpaid fees or damages incurred at the <b>LEASED VEHICLE</b>, at the end of the
              lease. Furthermore, said deposit shall be for any other charges due for any all/
              damages / losses that may be caused to and or may occur at the <b>LEASED VEHICLE</b>.
              If no outstanding bills are found within <b>ONE (1) WEEK</b>, such deposit will be
              returned. If for any reason the bill of any utility was delayed for more than
              <b>ONE (1) WEEK</b>, the <b>LESSEE</b> warrants that he will pay the bill with no
              further question.
            </div>
          </div>

          <div style="list-style: none; padding: 0; margin: 0">
            <table
              style="width: 100%; margin-top: 2em; margin-left: 3em; border-collapse: collapse"
            >
              <thead>
                <tr>
                  <th style="text-align: left; text-decoration: underline; font-weight: bold">
                    PAYMENT DATE
                  </th>
                  <th style="text-align: left; text-decoration: underline; font-weight: bold">
                    PERIOD COVERED
                  </th>
                  <th style="text-align: left; text-decoration: underline; font-weight: bold">
                    AMOUNT DUE
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ leaseStart }}</td>
                  <td>Security Deposit</td>
                  <td>PHP {{ securityDeposit }}</td>
                </tr>
                <tr>
                  <td>{{ leaseStart }}</td>
                  <td>Rental Amount</td>
                  <td>PHP {{ rentalAmount }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <div class="clause-item mt-1em">
              5. <b>THIRD PARTY LIABILITY</b> – The <b>LESSEE</b> during their occupancy of the
              leased vehicle shall hold the <b>LESSOR</b> free and harmless from any damage or
              liability or responsibility to any person or property arising out of or as consequence
              of the use of the leased vehicle by the <b>LESSEE</b>, their agents, employees,
              domestic help and guests. When such damage or liability is caused by fortuitous events
              such as acts of <b>GOD</b>, such as typhoons, earthquakes, etc. which are beyond the
              control of the <b>LESSEE</b>, the latter shall not be liable to the <b>LESSOR</b>.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              6. <b>SUBLEASE / TRANSFER OF RIGHTS</b> – The <b>LESSEE</b> shall not assign or
              transfer rights in this contract without the prior written consent of the
              <b>LESSOR</b> and no right or interest shall be conferred or vested upon anyone other
              than the <b>LESSEE</b> without such written consent. The <b>LESSEE</b>, shall be
              solidarily liable to the <b>LESSOR</b> for any and all acts and obligations of its
              co-residents/staff/guests in violation of the terms of this contract.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              7. <b>INSPECTION OF VEHICLE</b> – The <b>LESSOR</b> shall maintain the
              <b>LEASED</b> vehicle in good and tenantable condition and for such purpose of the
              <b>LESSOR</b> reserves the right at reasonable times and with prior notice to enter
              and inspect the vehicle and to make the necessary repairs thereof. The
              <b>LESSEE</b> likewise agrees to cooperate with the <b>LESSOR</b>
              in the keeping the vehicle in good and tenantable condition.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              8. <b>TERMINATION CLAUSE</b> – In the event the <b>LESSEE</b> decides to pre-terminate
              this <b>Contract of Lease</b>, the <b>LESSEE</b> should give the <b>LESSOR</b> at
              least <b>SIXTY (60)</b> days written notice in advance of such intention. Thus, the
              security deposit and unused rentals shall be forfeited in favor of the
              <b>LESSOR</b> as liquidated damages. Upon receipt of such notice, the
              <b>LESSOR</b> may show the <b>Leased</b> vehicle to prospective tenants at reasonable
              hours with prior notice and approval from the <b>LESSEE</b>.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em" style="page-break-before: always; margin-top: 4em">
              9. <b>RETURN OF VEHICLE</b> – Upon termination of this contract for any reason
              whatsoever, the <b>LESSE</b> shall immediately return possession of the vehicle
              thereof to the <b>LESSOR</b>, upon the latter's request, unless this
              <b>Contract of Lease</b> is extended. <b>TWENTY FOUR (24)</b> hours prior to the
              return of the vehicle, the <b>LESSOR</b> may affix a "<b>FOR RENT</b>" sign on the
              vehicle, and may show the vehicle to prospective tenants at reasonable hours with
              prior notice and approval from the <b>LESSE</b>. In the event that the vehicle has not
              been returned by the end of the <b>TWENTY FOUR (24)</b> hour window, the
              <b>LESSE</b> shall be subject to additional charges equivalent to the
              <b>HOURLY RATE</b> of {{ hourlyRate }}, based on the <b>DAILY RATE</b> of
              {{ dailyRate }} agreed upon in this contract until the return of the vehicle to the
              <b>LESSOR</b>.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              10. <b>PENAL PROVISON</b> – Any violation of the terms provided for in this Contract
              on the part of the <b>LESSOR</b>/<b>MANAGER</b> or <b>LESSEE</b> shall be sufficient
              grounds for the termination of this <b>CONTRACT OF LEASE</b>, by the aggrieved party.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              11. <b>NON-WAIVER</b> – The failure of the <b>LESSORS</b> to insist upon the strict
              performance of any of the terms and conditions herein contained shall not be construed
              as a waiver or relinquishment of any such right or remedy belonging to the
              <b>LESSORS</b>. No such waiver thereof shall be deemed to have been made, unless in
              writing and duly signed by the <b>LESSEOR</b>.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              12. <b>SEVERABILITY CLAUSE</b> – If any provision under this <b>CONTRACT</b> to be
              declared invalid, illegal or unenforceable in any respect by a court of competent
              jurisdiction, the validity, legality or enforceability of the remaining provisions
              shall not in any manner be affected or impaired.
            </div>
          </div>

          <div>
            <div class="clause-item mt-1em">
              13. <b>COMPLETE AGREEMENT</b> – This <b>CONTRACT</b> constitutes and embodies the
              entire and complete agreement between the <b>PARTIES</b> herein superseding any prior
              understanding and/or agreement among the parties, and no other terms and conditions,
              verbal or otherwise, not expressly included or provisions agreed upon, unless the same
              is stipulated in writing, signed by both <b>PARTIES</b>, and duty notarized.
            </div>
          </div>

          <p class="indent mt-1em">
            IN WITNESS THEREOF, the parties hereto have signed these presents on the date and the
            place first above mentioned or written.
          </p>
        </div>

        <div
          class="signatures"
          style="margin-top: 2em; display: flex; justify-content: space-between"
        >
          <div class="signature-block" style="flex: 1; text-align: center; margin: 0 2em">
            <div class="underline" style="width: 200px; margin: 0 auto"></div>
            <div>JEAN CARISIOSA WORTH</div>
            <div>(LESSOR)</div>
          </div>
          <div class="signature-block" style="flex: 1; text-align: center; margin: 0 2em">
            <div class="underline" style="width: 200px; margin: 0 auto"></div>
            <div>{{ lesseeName }}</div>
            <div>(LESSEE)</div>
          </div>
        </div>

        <div style="margin-top: 2em; text-align: center">
          <div>SIGNED IN THE PRESESENSE OF:</div>
          <div class="underline" style="width: 200px; margin: 1em auto"></div>
          <div class="underline" style="width: 200px; margin: 1em auto"></div>
        </div>

        <div class="vehicle-stub" style="margin-top: 3em; page-break-before: always">
          <div style="text-align: left">
            <img
              src="/mvr-logo.png"
              alt="Marinduque Vehicle Rental Logo"
              class="contract-logo"
              style="margin: 0"
            />
          </div>
          <h3 style="text-align: left; margin-bottom: 1em">
            VEHICLE STUB No. _______<!--{{ contractNo }}-->
          </h3>
          <table style="width: 100%; border-collapse: collapse; border: 1px solid black">
            <tbody>
              <tr>
                <td style="border: 1px solid black; padding: 8px; width: 40%">VEHICLE RENTED</td>
                <td style="border: 1px solid black; padding: 8px">{{ vehicleDetails }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px">START DATE AND TIME OF RENTAL</td>
                <td style="border: 1px solid black; padding: 8px">{{ leaseStart }}</td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px">END DATE AND TIME OF RENTAL</td>
                <td style="border: 1px solid black; padding: 8px"></td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px">
                  VEHICLE MUST BE RETURNED BY: (DATE/TIME)
                </td>
                <td style="border: 1px solid black; padding: 8px"></td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px">
                  VEHICLE RETURNED ON (DATE/TIME)
                </td>
                <td style="border: 1px solid black; padding: 8px"></td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px">
                  VEHICLE RETURNED BY: (NAME AND SIGNATURE)
                </td>
                <td style="border: 1px solid black; padding: 8px"></td>
              </tr>
              <tr>
                <td style="border: 1px solid black; padding: 8px">
                  VEHICLE RECEIVED BY: (NAME AND SIGNATURE)
                </td>
                <td style="border: 1px solid black; padding: 8px"></td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: center; margin-top: 1em; font-style: italic">
            Please take a screenshot of this stub.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useRoute } from 'vue-router'
import { useBookingSummaryDetails } from '@/services/useBookingSummaryDetails'

const props = defineProps({
  booking: {
    type: Object,
    default: null,
  },
  showPrintButton: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute()
const bookingId = computed(
  () => props.booking?.id || route.params.bookingId || route.query.bookingId,
)
const { data: summary, isLoading, isError } = useBookingSummaryDetails(bookingId.value)

// Fallbacks for demo/preview
const contractNo = computed(() => (bookingId.value ? `MVR-${bookingId.value}` : '2025-001'))
const contractDay = computed(() => summary.value?.executed_at?.split('/')[0] || '25')
const contractMonth = computed(() => {
  const m = summary.value?.executed_at?.split('/')[1]
  return m ? new Date(2000, parseInt(m) - 1, 1).toLocaleString('default', { month: 'long' }) : 'May'
})
const contractYear = computed(() => summary.value?.executed_at?.split('/')[2] || '2025')
const lesseeName = computed(() => summary.value?.customer_name || 'JUAN DELA CRUZ')
const lesseeAddress = computed(
  () => summary.value?.customer_address || '123 Main St, Boac, Marinduque',
)
const vehicleDetails = computed(() =>
  summary.value?.vehicle
    ? `${summary.value.vehicle.brand} ${summary.value.vehicle.name} ${summary.value.vehicle.year}, Model: ${summary.value.vehicle.model}`
    : 'Toyota Vios 2022, Plate ABC-1234',
)
const leasePeriod = computed(() => summary.value?.period?.toUpperCase() || '7 DAYS')
const leaseStart = computed(() => summary.value?.executed_at || 'May 25, 2025')
const rentalAmount = computed(() =>
  summary.value?.rental_amount
    ? Number(summary.value.rental_amount).toLocaleString(undefined, { minimumFractionDigits: 2 })
    : '2,000.00',
)
const rentalAmountWords = computed(() => summary.value?.rental_amount_words || 'TWO THOUSAND PESOS')

const securityDeposit = computed(() =>
  summary.value?.security_deposit
    ? Number(summary.value.security_deposit).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : '5,000',
)
const securityDepositWords = computed(
  () => summary.value?.security_deposit_words || 'FIVE THOUSAND PESOS',
)

const hourlyRate = computed(() =>
  summary.value?.hourly_rate
    ? Number(summary.value.hourly_rate).toLocaleString(undefined, { minimumFractionDigits: 2 })
    : '',
)
const dailyRate = computed(() =>
  summary.value?.daily_rate
    ? Number(summary.value.daily_rate).toLocaleString(undefined, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    : '',
)
const dailyRateWords = computed(() => summary.value?.daily_rate_words || 'FIVE THOUSAND PESOS')

function printContract() {
  const printContent = document.querySelector('.contract-print').innerHTML
  const style = `
    <style>
      @page { size: A4; margin: 0; }
      @media print {
        body { margin: 0; padding: 0; }
        .print-btn { display: none !important; }
      }
      .contract-print { max-width: 850px; min-width: 793px; min-height: 1122px; margin: 0 auto; background: transparent; color: #222; padding: 2.5rem 2.2rem; border-radius: 8px; box-shadow: none; }
      .contract-content { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.5; text-align: left; }
      .logo-section { text-align: center; margin-bottom: 1rem; }
      .contract-logo { max-width: 120px; margin: 0 auto; }
      .contract-title { text-align: center; font-size: 1.5em; margin: 0.5em 0 0.2em 0; font-weight: bold; }
      .contract-no-line { font-weight: bold; margin-bottom: 0.5em; }
      .underline { display: inline-block; min-width: 80px; border-bottom: 1px solid #222; margin: 0 2px 2px 2px; padding: 0 0.5em; height: 1.2em; vertical-align: bottom; }
      .section-title.left { text-align: left; font-size: 1.1em; font-weight: bold; margin: 1em 0 0.5em 0; }
      .contract-body { margin-bottom: 1em; font-size: 1em; text-align: left; text-indent: 0; }
      .uppercase { text-transform: uppercase; font-weight: bold; }
      .indent { text-indent: 2em; }
      .mt-1em { margin-top: 1em; }
      .mt-05em { margin-top: 0.5em; }
      .center { text-align: center; }
      .bold { font-weight: bold; }
      .pl-2em { padding-left: 2em; }
      .clause-item { margin-left: 1.5em; text-indent: -1.5em; }
    </style>
  `
  const win = window.open('', '', 'width=900,height=1200')
  win.document.write(
    `<!DOCTYPE html><html><head><title>Contract of Lease</title>${style}</head><body><div class='contract-print'>${printContent}</div><script>window.onload = function() { window.print(); window.close(); }<\/script></body></html>`,
  )
  win.document.close()
}
</script>

<style scoped>
.contract-print {
  max-width: 850px;
  min-width: 793px;
  min-height: 1122px;
  margin: 0 auto;
  background: transparent;
  color: #222;
  padding: 2.5rem 2.2rem;
  border-radius: 8px;
  box-shadow: none;
}
.contract-content {
  font-family: 'Times New Roman', Times, serif;
  font-size: 12pt;
  line-height: 1.5;
  text-align: left;
}
.logo-section {
  text-align: center;
  margin-bottom: 1rem;
}
.contract-logo {
  max-width: 120px;
  margin: 0 auto;
}
.contract-title {
  text-align: center;
  font-size: 1.5em;
  margin: 0.5em 0 0.2em 0;
  font-weight: bold;
}
.contract-no-line {
  font-weight: bold;
  margin-bottom: 0.5em;
}
.underline {
  display: inline-block;
  min-width: 80px;
  border-bottom: 1px solid #222;
  margin: 0 2px 2px 2px;
  padding: 0 0.5em;
  height: 1.2em;
  vertical-align: bottom;
}
.section-title.left {
  text-align: left;
  font-size: 1.1em;
  font-weight: bold;
  margin: 1em 0 0.5em 0;
}
.contract-body {
  margin-bottom: 1em;
  font-size: 1em;
  text-align: left;
  text-indent: 0;
}
.uppercase {
  text-transform: uppercase;
  font-weight: bold;
}
.indent {
  text-indent: 2em;
}
.mt-1em {
  margin-top: 1em;
}
.mt-05em {
  margin-top: 0.5em;
}
.center {
  text-align: center;
}
.bold {
  font-weight: bold;
}
.pl-2em {
  padding-left: 2em;
}
.clause-item {
  margin-left: 1.5em;
  text-indent: -1.5em;
}
.print-btn {
  display: inline-block;
  margin-bottom: 1.5em;
  padding: 0.5em 1.2em;
  font-size: 1em;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.no-print {
  display: none;
}
@media print {
  .print-btn {
    display: none !important;
  }
}
</style>
