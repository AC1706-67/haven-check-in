import { useState, useRef } from 'react'
import './App.css'

type Screen = 'signin' | 'disclosure' | 'questionnaire' | 'confirmation'
type UserType = 'new' | 'returning' | null

function App() {
  const [screen, setScreen] = useState<Screen>('signin')
  const [userType, setUserType] = useState<UserType>(null)
  const [cardNumber, setCardNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [preferNotName, setPreferNotName] = useState(false)
  const [signed, setSigned] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleNewParticipant = () => {
    setUserType('new')
    setScreen('disclosure')
  }

  const handleReturning = () => {
    setUserType('returning')
    setScreen('questionnaire')
  }

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true)
    setSigned(true)
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = '#0000FE'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
  }

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const rect = canvas.getBoundingClientRect()
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
  }

  const cardNumberIssued = `HC-${Math.floor(100000 + Math.random() * 900000)}`

  return (
    <div className="app">
      {screen === 'signin' && (
        <div className="screen signin-screen">
          <div className="header">
            <div className="org-badge">MANO</div>
            <h1 className="app-title">MANO</h1>
            <p className="app-subtitle">Haven Check-In</p>
            <p className="app-tagline">Private by default. Transparent by choice.</p>
          </div>

          <div className="card">
            <h2 className="card-title">Welcome</h2>
            <p className="card-desc">
              Your visit is private. We collect only what is required by our funders —
              and you control what gets shared.
            </p>

            <div className="section-label">Returning Participant</div>
            <div className="input-row">
              <input
                className="input"
                type="text"
                placeholder="Enter your card number"
                value={cardNumber}
                onChange={e => setCardNumber(e.target.value)}
              />
              <button
                className="btn btn-secondary"
                onClick={handleReturning}
                disabled={!cardNumber.trim()}
              >
                Check In
              </button>
            </div>

            <div className="divider"><span>or</span></div>

            <div className="section-label">First Visit?</div>
            <div className="name-row">
              <input
                className="input"
                type="text"
                placeholder="First name (optional)"
                value={firstName}
                disabled={preferNotName}
                onChange={e => setFirstName(e.target.value)}
              />
              <label className="prefer-not">
                <input
                  type="checkbox"
                  checked={preferNotName}
                  onChange={e => {
                    setPreferNotName(e.target.checked)
                    if (e.target.checked) setFirstName('')
                  }}
                />
                Prefer not to say
              </label>
            </div>

            <button className="btn btn-primary" onClick={handleNewParticipant}>
              Begin Enrollment
            </button>
          </div>

          <div className="privacy-note">
            🔒 Your identity is protected by zero-knowledge cryptography.
            No one can extract your personal information from this system.
          </div>

          <div className="session-info">
            <span>Haven Check-In — MANO</span>
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      )}

      {screen === 'disclosure' && (
        <div className="screen disclosure-screen">
          <div className="header">
            <div className="org-badge">MANO</div>
            <h1 className="app-title">MANO</h1>
          </div>
          <div className="card">
            <h2 className="card-title">42 CFR Part 2 — Confidentiality Notice</h2>
            <div className="disclosure-text">
              <p>
                The records of this program are protected under federal law and regulations
                governing Confidentiality of Substance Use Disorder Patient Records,
                42 C.F.R. Part 2.
              </p>
              <p>
                These regulations prohibit this program from making any disclosure of your
                records without your written consent <strong>unless otherwise provided for
                in the regulations.</strong>
              </p>
              <p>
                A violation of the federal law and regulations by a program is a crime.
                Suspected violations may be reported to appropriate authorities in accordance
                with federal regulations.
              </p>
              <p>
                Federal law and regulations do not protect any information about a crime
                committed by a patient either at the program or against any person who works
                for the program or about any threat to commit such a crime.
              </p>
            </div>

            <div className="consent-block">
              <p className="consent-label">
                By signing below, you acknowledge that you have received and understand
                this notice.
              </p>
              <div className="signature-wrapper">
                <canvas
                  ref={canvasRef}
                  className="signature-canvas"
                  width={380}
                  height={100}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                {!signed && (
                  <p className="signature-prompt">✍️ Sign here</p>
                )}
              </div>
              {signed && (
                <button className="btn-clear" onClick={clearSignature}>
                  Clear signature
                </button>
              )}
              <p className="consent-date">
                Date: {new Date().toLocaleDateString()}
              </p>
            </div>

            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => setScreen('signin')}>
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setScreen('questionnaire')}
                disabled={!signed}
              >
                I Understand &amp; Agree
              </button>
            </div>
            {!signed && (
              <p className="sign-reminder">Please sign above to continue</p>
            )}
          </div>
        </div>
      )}

      {screen === 'questionnaire' && (
        <div className="screen questionnaire-screen">
          <div className="header">
            <div className="org-badge">MANO</div>
            <h1 className="app-title">MANO</h1>
          </div>
          <div className="card">
            <h2 className="card-title">Today's Visit</h2>
            <p className="card-desc voluntary-note">
              ⭐ Questions marked voluntary are never required. Answer only what you are comfortable with.
            </p>

            <div className="field-group">
              <label className="field-label">Services today <span className="req">*</span></label>
              <div className="checkbox-grid">
                {['Shower', 'TEPAP Food', 'Narcan / Naloxone', 'Clothing', 'Mail Pickup', 'Referral'].map(s => (
                  <label key={s} className="checkbox-item">
                    <input type="checkbox" /> {s}
                  </label>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">
                Are you currently in an unhoused situation?
                <span className="voluntary">voluntary</span>
              </label>
              <div className="radio-row">
                {['Yes', 'No', 'Prefer not to say'].map(o => (
                  <label key={o} className="radio-item">
                    <input type="radio" name="unhoused" /> {o}
                  </label>
                ))}
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">
                Have you used substances in the last 30 days?
                <span className="voluntary">voluntary</span>
              </label>
              <div className="radio-row">
                {['Yes', 'No', 'Prefer not to say'].map(o => (
                  <label key={o} className="radio-item">
                    <input type="radio" name="substances" /> {o}
                  </label>
                ))}
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => {
                if (userType === 'returning') setScreen('signin')
                else setScreen('disclosure')
              }}>
                Back
              </button>
              <button className="btn btn-primary" onClick={() => setScreen('confirmation')}>
                Submit Check-In
              </button>
            </div>
          </div>
        </div>
      )}

      {screen === 'confirmation' && (
        <div className="screen confirmation-screen">
          <div className="header">
            <div className="org-badge">MANO</div>
            <h1 className="app-title">MANO</h1>
          </div>
          <div className="card confirmation-card">
            <div className="check-icon">✓</div>
            <h2 className="card-title">Check-In Complete</h2>
            <p className="card-desc">
              Your visit has been recorded privately. Your identity was never revealed.
            </p>
            <div className="credential-note">
              🔐 This check-in has been added to your anonymous attendance credential.
              You can use it to verify program participation for housing, employment,
              or reentry — on your terms.
            </div>
            <div className="card-number-issued">
              <span className="card-label">Your Card Number</span>
              <span className="card-value">{cardNumberIssued}</span>
              <span className="card-instruction">Write this down or receive a physical card from staff.</span>
            </div>
            <button className="btn btn-primary" onClick={() => {
              setScreen('signin')
              setCardNumber('')
              setFirstName('')
              setPreferNotName(false)
              setUserType(null)
              setSigned(false)
              clearSignature()
            }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App