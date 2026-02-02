import { mockInterpreterRate, mockAppointment } from '../utils/test-utils'

function calculateLineItem(
  appointment: ReturnType<typeof mockAppointment>,
  rate: typeof mockInterpreterRate
) {
  const isCertifiedAppt = appointment.isCertified ?? false

  let hourlyRate = parseFloat(rate.certifiedHourlyRate)
  if (!isCertifiedAppt && rate.qualifiedHourlyRate) {
    hourlyRate = parseFloat(rate.qualifiedHourlyRate)
  }

  const minimumHours = parseFloat(rate.minimumHours || '2')

  let serviceHours = minimumHours
  if (appointment.actualDurationMinutes) {
    serviceHours = Math.max(appointment.actualDurationMinutes / 60, minimumHours)
  }

  const serviceAmount = serviceHours * hourlyRate

  let mileage = 0
  let mileageRate = 0
  let mileageAmount = 0

  if (appointment.mileageApproved && appointment.actualMiles) {
    mileage = parseFloat(appointment.actualMiles)
    mileageRate = parseFloat(rate.mileageRate || '0')
    mileageAmount = mileage * mileageRate
  }

  let adjustmentType: string | null = null
  let adjustmentAmount = 0

  if (appointment.status === 'No Show') {
    adjustmentType = 'no_show'
    if (isCertifiedAppt) {
      adjustmentAmount = parseFloat(rate.certifiedNoShowFee || '0')
    } else {
      adjustmentAmount = parseFloat(rate.qualifiedNoShowFee || '0')
    }
  } else if (appointment.status === 'Late CX') {
    adjustmentType = 'late_cancel'
    if (isCertifiedAppt) {
      adjustmentAmount = parseFloat(rate.certifiedLateCancelFee || '0')
    } else {
      adjustmentAmount = parseFloat(rate.qualifiedLateCancelFee || '0')
    }
    mileage = 0
    mileageRate = 0
    mileageAmount = 0
  }

  let lineTotal: number
  if (adjustmentType === 'no_show') {
    lineTotal = adjustmentAmount + mileageAmount
  } else if (adjustmentType === 'late_cancel') {
    lineTotal = adjustmentAmount
  } else {
    lineTotal = serviceAmount + mileageAmount
  }

  return {
    serviceHours,
    hourlyRate,
    serviceAmount,
    mileage,
    mileageRate,
    mileageAmount,
    adjustmentType,
    adjustmentAmount,
    lineTotal,
  }
}

describe('Payout Calculations', () => {
  describe('Normal Completed Appointments', () => {
    it('should calculate certified appointment correctly', () => {
      const appointment = mockAppointment({
        status: 'Completed',
        isCertified: true,
        actualDurationMinutes: 180,
        actualMiles: '25',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.hourlyRate).toBe(55)
      expect(result.serviceHours).toBe(3)
      expect(result.serviceAmount).toBe(165)
      expect(result.mileage).toBe(25)
      expect(result.mileageAmount).toBeCloseTo(16.75, 2)
      expect(result.adjustmentType).toBeNull()
      expect(result.lineTotal).toBeCloseTo(181.75, 2)
    })

    it('should calculate qualified appointment correctly', () => {
      const appointment = mockAppointment({
        status: 'Completed',
        isCertified: false,
        actualDurationMinutes: 180,
        actualMiles: '25',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.hourlyRate).toBe(30)
      expect(result.serviceAmount).toBe(90)
      expect(result.lineTotal).toBeCloseTo(106.75, 2)
    })

    it('should enforce minimum hours', () => {
      const appointment = mockAppointment({
        status: 'Completed',
        isCertified: true,
        actualDurationMinutes: 60,
        actualMiles: '10',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.serviceHours).toBe(2)
      expect(result.serviceAmount).toBe(110)
    })

    it('should not include mileage when not approved', () => {
      const appointment = mockAppointment({
        status: 'Completed',
        isCertified: true,
        actualDurationMinutes: 120,
        actualMiles: '30',
        mileageApproved: false,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.mileage).toBe(0)
      expect(result.mileageAmount).toBe(0)
      expect(result.lineTotal).toBe(110)
    })
  })

  describe('No Show Appointments', () => {
    it('should calculate certified no show with mileage', () => {
      const appointment = mockAppointment({
        status: 'No Show',
        isCertified: true,
        actualMiles: '30',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.adjustmentType).toBe('no_show')
      expect(result.adjustmentAmount).toBe(120)
      expect(result.mileage).toBe(30)
      expect(result.mileageAmount).toBeCloseTo(20.10, 2)
      expect(result.lineTotal).toBeCloseTo(140.10, 2)
    })

    it('should calculate qualified no show with mileage', () => {
      const appointment = mockAppointment({
        status: 'No Show',
        isCertified: false,
        actualMiles: '30',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.adjustmentType).toBe('no_show')
      expect(result.adjustmentAmount).toBe(80)
      expect(result.lineTotal).toBeCloseTo(100.10, 2)
    })
  })

  describe('Late Cancel Appointments', () => {
    it('should calculate certified late cancel without mileage', () => {
      const appointment = mockAppointment({
        status: 'Late CX',
        isCertified: true,
        actualMiles: '30',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.adjustmentType).toBe('late_cancel')
      expect(result.adjustmentAmount).toBe(120)
      expect(result.mileage).toBe(0)
      expect(result.mileageAmount).toBe(0)
      expect(result.lineTotal).toBe(120)
    })

    it('should calculate qualified late cancel without mileage', () => {
      const appointment = mockAppointment({
        status: 'Late CX',
        isCertified: false,
        actualMiles: '30',
        mileageApproved: true,
      })

      const result = calculateLineItem(appointment, mockInterpreterRate)

      expect(result.adjustmentType).toBe('late_cancel')
      expect(result.adjustmentAmount).toBe(80)
      expect(result.mileage).toBe(0)
      expect(result.lineTotal).toBe(80)
    })
  })
})