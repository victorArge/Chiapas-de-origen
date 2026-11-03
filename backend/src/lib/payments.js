export function serializePayment(payment) {
  return {
    id: payment.id,
    reference: payment.reference,
    amountMxn: payment.amountMxn,
    currency: payment.currency,
    status: payment.status,
    type: payment.type,
    failureReason: payment.failureReason,
    confirmedAt: payment.confirmedAt,
    createdAt: payment.createdAt,
    updatedAt: payment.updatedAt,
  }
}
