import React, { useState, useEffect } from 'react'

// ================= ROLLING ODOMETER / DIGIT REEL TICKER =================
// 20 items: 0..9 then 0..9 for seamless vertical reel spinning
const DIGIT_REEL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

export function SingleDigitReel({ digit, delay = 0 }) {
  const [target, setTarget] = useState(0)

  useEffect(() => {
    // Delay rolling so on initial page mount it starts at 0 and rolls up to 10 + digit
    const timer = setTimeout(() => {
      setTarget(10 + Number(digit))
    }, 40 + delay)
    return () => clearTimeout(timer)
  }, [digit, delay])

  return (
    <span
      className="inline-block relative overflow-hidden text-center select-none tabular-nums"
      style={{
        height: '1.25em',
        width: '1ch',
        verticalAlign: 'middle'
      }}
    >
      <span
        className="block will-change-transform"
        style={{
          transform: `translateY(-${target * 5}%)`,
          transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {DIGIT_REEL.map((num, i) => (
          <span
            key={i}
            className="flex items-center justify-center font-black"
            style={{ height: '1.25em', lineHeight: '1.25em' }}
          >
            {num}
          </span>
        ))}
      </span>
    </span>
  )
}

export function RollNumberTicker({
  value,
  prefix = '',
  suffix = '',
  formatLocale = true,
  className = ''
}) {
  let numStr = ''
  if (typeof value === 'number') {
    numStr = formatLocale ? Math.abs(value).toLocaleString('id-ID') : String(Math.abs(value))
  } else {
    // String value (e.g. "39.9" or "19.500.000")
    const str = String(value ?? 0)
    if (formatLocale && /^\d+$/.test(str)) {
      numStr = parseInt(str, 10).toLocaleString('id-ID')
    } else {
      numStr = str
    }
  }

  const isNeg = typeof value === 'number' && value < 0
  const finalPrefix = isNeg ? `-${prefix}` : prefix

  const chars = numStr.split('')
  let digitCount = 0

  return (
    <span className={`inline-flex items-center tracking-tight tabular-nums ${className}`}>
      {finalPrefix && (
        <span
          className="select-none font-black inline-flex items-center justify-center"
          style={{ height: '1.25em' }}
        >
          {finalPrefix}
        </span>
      )}
      {chars.map((char, idx) => {
        const isDigit = /\d/.test(char)
        if (isDigit) {
          const digit = parseInt(char, 10)
          const delay = digitCount * 40
          digitCount++
          const keyFromRight = `d-${chars.length - 1 - idx}`
          return (
            <SingleDigitReel
              key={keyFromRight}
              digit={digit}
              delay={delay}
            />
          )
        }
        return (
          <span
            key={`sep-${idx}`}
            className="select-none font-black inline-flex items-center justify-center text-center"
            style={{ height: '1.25em' }}
          >
            {char}
          </span>
        )
      })}
      {suffix && (
        <span
          className="select-none font-black inline-flex items-center justify-center"
          style={{ height: '1.25em' }}
        >
          {suffix}
        </span>
      )}
    </span>
  )
}

export default RollNumberTicker
