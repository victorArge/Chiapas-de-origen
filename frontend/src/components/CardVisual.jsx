function CardVisual({ holderName, cardNumber, expiry }) {
  const digits = (cardNumber || '').replace(/\D/g, '')
  const groups = digits.match(/.{1,4}/g) || []
  const numberDisplay = groups.length
    ? `${'•••• '.repeat(Math.max(0, groups.length - 1))}${groups[groups.length - 1]}`
    : '•••• •••• ••• •••'

  return (
    <div className="card-visual">
      <div className="card-visual-top">
        <span className="card-visual-brand">Chiapas de origen</span>
        <span className="card-visual-chip" aria-hidden="true" />
      </div>
      <div className="card-visual-number">{numberDisplay}</div>
      <div className="card-visual-bottom">
        <div className="card-visual-field">
          <span className="card-visual-label">Titular</span>
          <strong>{holderName.trim() || 'SU NOMBRE'}</strong>
        </div>
        <div className="card-visual-field">
          <span className="card-visual-label">Vence</span>
          <strong>{expiry || 'MM/AA'}</strong>
        </div>
        <div className="card-visual-field">
          <span className="card-visual-label">CVV</span>
          <strong>•••</strong>
        </div>
      </div>
    </div>
  )
}

export default CardVisual
