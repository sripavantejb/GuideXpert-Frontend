function ConversionItem({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 portal-card transition-all duration-300 hover:portal-card-hover hover:border-primary-blue-200">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold text-primary-navy tabular-nums">{value.toFixed(1)}%</p>
      <p className="mt-1 text-xs text-gray-500">{helper}</p>
      <div className="mt-3 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary-navy transition-all duration-700 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  );
}

export default function ConversionStats({ metrics }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 lg:p-6 portal-card">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-700">
        Conversion Analytics
      </h2>
      <p className="mt-1 text-sm text-gray-500">
        Stage-to-stage conversion rates across the lead journey.
      </p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ConversionItem
          label="OTP Verification Rate"
          value={metrics.otpVerificationRate}
          helper="OTP Verified / Total Leads"
        />
        <ConversionItem
          label="Slot Booking Rate"
          value={metrics.slotBookingRate}
          helper="Slot Booked / OTP Verified"
        />
        <ConversionItem
          label="Demo Attendance Rate"
          value={metrics.demoAttendanceRate}
          helper="Demo Attended / Slot Booked"
        />
        <ConversionItem
          label="Training Form Conversion Rate"
          value={metrics.trainingFormConversionRate}
          helper="Training Form Filled / Demo Attended"
        />
      </div>
    </section>
  );
}
