export default function BrandBanner({
  image,
  title,
  description,
  className = '',
  children,
}) {
  return (
    <section className={`brand-banner ${className}`.trim()}>
      {image ? (
        <img className="brand-banner-img" src={image} alt={title || 'Imagen institucional'} />
      ) : (
        <div className="brand-banner-bg" aria-hidden="true" />
      )}
      <div className="brand-banner-content">
        {title ? <h2 className="brand-banner-title">{title}</h2> : null}
        {description ? <p className="brand-banner-desc">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}