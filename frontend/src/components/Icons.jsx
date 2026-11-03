function IconBase({ children, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export function PlantIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 21v-8" />
      <path d="M12 13c0-3.6-2.7-6-6.5-6C5.6 10.6 8 13 12 13Z" />
      <path d="M12 13c0-3.6 2.7-6 6.5-6C18.4 10.6 16 13 12 13Z" />
      <path d="M12 9.5C12 6 14.2 3.5 17 3c.2 3.4-1.8 6-5 6.5Z" />
    </IconBase>
  )
}

export function PestIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3 5 6v5c0 4.4 2.9 8.2 7 9.5 4.1-1.3 7-5.1 7-9.5V6l-7-3Z" />
      <path d="m9.3 12 1.9 1.9L15 10.1" />
    </IconBase>
  )
}

export function WaterIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3s5.5 5.6 5.5 10a5.5 5.5 0 0 1-11 0C6.5 8.6 12 3 12 3Z" />
      <path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5" />
    </IconBase>
  )
}

export function NutritionIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 21V11" />
      <path d="M12 11c0-3 2.2-5.5 5-6 .2 3.4-1.8 6-5 6Z" />
      <path d="M12 11c0-2.6-1.9-4.7-4.5-5.2C7.3 8.7 9 11 12 11Z" />
      <path d="M8 21h8" />
    </IconBase>
  )
}

export function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </IconBase>
  )
}

export function RequestIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 4h14v14l-4 3v-3H5Z" />
      <path d="M9 9h6M9 13h4" />
    </IconBase>
  )
}

export function AdviceIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M12 3.5 4.5 7v5c0 4 2.6 7.4 6.4 8.5.6-.2 1.2-.5 1.7-.8" />
      <path d="M14.5 12.5 20 18l-1.8 1.8-4.6-4.6" />
      <path d="m17.6 15.5 2.9-2.9a1.3 1.3 0 0 0-1.8-1.8l-2.9 2.9" />
    </IconBase>
  )
}

export function ArrowIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h13" />
      <path d="m13 6 6 6-6 6" />
    </IconBase>
  )
}

export function CheckIcon(props) {
  return (
    <IconBase {...props}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </IconBase>
  )
}

export function LockIcon(props) {
  return (
    <IconBase {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </IconBase>
  )
}
