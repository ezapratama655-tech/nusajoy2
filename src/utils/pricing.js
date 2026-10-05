export function calculateBookingCosts(booking, guests = 1) {
  const unitPrice = Number(booking.price ?? booking.pricePerPerson ?? booking.pricePerDay ?? booking.startingPrice ?? 0);
  const baseCost = Math.max(0, Number.isFinite(unitPrice) ? unitPrice : 0) * guests;
  const suppliedFund = Number(booking.conservationFund);
  const conservationFund = booking.type === 'guide' ? 0 : booking.type === 'trip' && Number.isFinite(suppliedFund) && suppliedFund >= 0
    ? suppliedFund : Math.round(baseCost * 0.025);
  return { baseCost, conservationFund, serviceFee: 0, totalAmount: baseCost + conservationFund };
}
