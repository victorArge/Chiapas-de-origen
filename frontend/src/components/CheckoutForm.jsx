import { useState } from 'react'

function CheckoutForm({
  card,
  errors,
  processing,
  onChange,
  onSubmit,
  onReject,
  submitLabel,
  processingLabel,
}) {
  const [showCvv, setShowCvv] = useState(false)
  const handleChange = (event) => {
    const { name, value } = event.target

    let nextValue = value
    if (name === 'cardNumber') {
      nextValue = value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ')
    }
    if (name === 'expiry') {
      nextValue = value.replace(/\D/g, '').slice(0, 4).replace(/(\d{2})(?=\d)/, '$1/')
    }
    if (name === 'cvv') {
      nextValue = value.replace(/\D/g, '').slice(0, 4)
    }

    onChange(name, nextValue)
  }

  return (
    <form
      className="form checkout-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
      noValidate
    >
      <label className="field" htmlFor="checkout-holder">
        <span>Titular de la tarjeta</span>
        <input
          id="checkout-holder"
          name="holderName"
          value={card.holderName}
          onChange={handleChange}
          autoComplete="cc-name"
          placeholder="Juan Pérez"
          required
          aria-invalid={Boolean(errors.holderName) || undefined}
          aria-describedby={errors.holderName ? 'checkout-holder-error' : undefined}
        />
        {errors.holderName && (
          <p className="field-error" id="checkout-holder-error">
            {errors.holderName}
          </p>
        )}
      </label>

      <label className="field" htmlFor="checkout-card-number">
        <span>Número de tarjeta</span>
        <input
          id="checkout-card-number"
          name="cardNumber"
          value={card.cardNumber}
          onChange={handleChange}
          inputMode="numeric"
          autoComplete="cc-number"
          placeholder="4242 4242 4242 4242"
          required
          aria-invalid={Boolean(errors.cardNumber) || undefined}
          aria-describedby={errors.cardNumber ? 'checkout-card-number-error' : undefined}
        />
        {errors.cardNumber && (
          <p className="field-error" id="checkout-card-number-error">
            {errors.cardNumber}
          </p>
        )}
      </label>

      <div className="field-grid">
        <label className="field" htmlFor="checkout-expiry">
          <span>Fecha de vencimiento</span>
        <input
          id="checkout-expiry"
          name="expiry"
          value={card.expiry}
          onChange={handleChange}
          inputMode="numeric"
          autoComplete="cc-exp"
          placeholder="MM/AA"
          required
          aria-invalid={Boolean(errors.expiry) || undefined}
          aria-describedby={errors.expiry ? 'checkout-expiry-error' : undefined}
        />
          {errors.expiry && (
            <p className="field-error" id="checkout-expiry-error">
              {errors.expiry}
            </p>
          )}
        </label>

        <label className="field" htmlFor="checkout-cvv">
          <span>CVV</span>
        <input
          id="checkout-cvv"
          name="cvv"
          value={card.cvv}
          onChange={handleChange}
          inputMode="numeric"
          autoComplete="cc-csc"
          placeholder="123"
          required
          type={showCvv ? 'text' : 'password'}
          aria-invalid={Boolean(errors.cvv) || undefined}
          aria-describedby={errors.cvv ? 'checkout-cvv-error' : undefined}
        />
          {errors.cvv && (
            <p className="field-error" id="checkout-cvv-error">
              {errors.cvv}
            </p>
          )}
        </label>
      </div>

      <button className="btn btn-primary btn-block" type="submit" disabled={processing}>
        {processing ? processingLabel : submitLabel}
      </button>

      {onReject && (
        <button className="btn btn-outline btn-block" type="button" onClick={onReject} disabled={processing}>
          Rechazar pago simulado
        </button>
      )}

      <button
        className="btn btn-outline btn-block"
        type="button"
        onClick={() => setShowCvv((current) => !current)}
        disabled={processing}
      >
        {showCvv ? 'Ocultar CVV' : 'Mostrar CVV'}
      </button>
    </form>
  )
}

export default CheckoutForm
