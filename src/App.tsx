import { useState, useRef } from 'react'
import './App.css'

type Screen = 'signin' | 'disclosure' | 'demographics' | 'questionnaire' | 'confirmation'
type UserType = 'new' | 'returning' | null

function App() {
  // ─── Navigation ───────────────────────────────────────────────
  const [screen, setScreen] = useState<Screen>('signin')
  const [userType, setUserType] = useState<UserType>(null)

  // ─── Screen 1: Sign-in ────────────────────────────────────────
  const [cardNumber, setCardNumber] = useState('')
  const [firstName, setFirstName] = useState('')
  const [preferNotName, setPreferNotName] = useState(false)

  // ─── Screen 2: 42 CFR Disclosure / Signature ──────────────────
  const [signed, setSigned] = useState(false)
  const [isDrawing, setIsDrawing] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ─── Screen 3A: Demographics (collected ONCE at enrollment) ───
  const [address, setAddress] = useState('')
  const [preferNotAddress, setPreferNotAddress] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [phone, setPhone] = useState('')
  const [preferNotPhone, setPreferNotPhone] = useState(false)
  const [householdSize, setHouseholdSize] = useState('')
  const [categoricalElig, setCategoricalElig] = useState<string[]>([])
  const [incomeAmount, setIncomeAmount] = useState('')
  const [incomePeriod, setIncomePeriod] = useState('')
  const [householdCrisis, setHouseholdCrisis] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [gender, setGender] = useState('')
  const [race, setRace] = useState<string[]>([])
  const [ethnicity, setEthnicity] = useState('')
  const [insurance, setInsurance] = useState('')
  const [indicators, setIndicators] = useState<string[]>([])

  // ─── Screen 3B: Visit Questions (every visit) ─────────────────
  const [services, setServices] = useState<string[]>([])
  const [unhoused, setUnhoused] = useState('')
  const [opioidUser, setOpioidUser] = useState('')
  const [stimulantUser, setStimulantUser] = useState('')
  const [referredToMAT, setReferredToMAT] = useState('')
  const [onMAT, setOnMAT] = useState('')
  const [overdoseWitnessed, setOverdoseWitnessed] = useState('')
  const [personSurvived, setPersonSurvived] = useState('')
  const [narcanGiven, setNarcanGiven] = useState('')

  // ─── Confirmation ─────────────────────────────────────────────
  const [issuedCard] = useState(`HC-${Math.floor(100000 + Math.random() * 900000)}`)

  // ─── Helpers ──────────────────────────────────────────────────
  const toggleItem = (
    list: string[],
    setList: (v: string[]) => void,
    value: string
  ) => {
    setList(list.includes(value) ? list.filter(x => x !== value) : [...list, value])
  }

  // ─── Signature Canvas ─────────────────────────────────────────
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

  const resetAll = () => {
    setScreen('signin')
    setCardNumber('')
    setFirstName('')
    setPreferNotName(false)
    setUserType(null)
    setSigned(false)
    clearSignature()
    setServices([])
    setUnhoused('')
    setOpioidUser('')
    setStimulantUser('')
    setReferredToMAT('')
    setOnMAT('')
    setOverdoseWitnessed('')
    setPersonSurvived('')
    setNarcanGiven('')
  }

  // ─── Reusable Radio Group ─────────────────────────────────────
  const RadioGroup = ({
    name,
    options,
    value,
    onChange,
  }: {
    name: string
    options: string[]
    value: string
    onChange: (v: string) => void
  }) => (
    <div className="radio-row">
      {options.map(o => (
        <label key={o} className={`radio-item ${value === o ? 'selected' : ''}`}>
          <input
            type="radio"
            name={name}
            checked={value === o}
            onChange={() => onChange(o)}
          />
          {o}
        </label>
      ))}
    </div>
  )

  const YNP = ({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) => (
    <RadioGroup name={name} options={['Yes', 'No', 'Prefer not to say']} value={value} onChange={onChange} />
  )

  // ─── Progress indicator ───────────────────────────────────────
  const steps = userType === 'returning'
    ? ['Check-In', 'Visit', 'Done']
    : ['Welcome', 'Consent', 'Info', 'Visit', 'Done']

  const currentStep = userType === 'returning'
    ? { signin: 0, questionnaire: 1, confirmation: 2 }[screen] ?? 0
    : { signin: 0, disclosure: 1, demographics: 2, questionnaire: 3, confirmation: 4 }[screen] ?? 0

  // ═══════════════════════════════════════════════════════════════
  //  RENDER
  // ═══════════════════════════════════════════════════════════════
  return (
    <div className="app">

      {/* ── SCREEN 1: SIGN-IN ─────────────────────────────────── */}
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
                onClick={() => { setUserType('returning'); setScreen('questionnaire') }}
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

      {/* ── SCREEN 2: 42 CFR DISCLOSURE ───────────────────────── */}
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
                {!signed && <p className="signature-prompt">✍️ Sign here</p>}
              </div>
              {signed && (
                <button className="btn-clear" onClick={clearSignature}>
                  Clear signature
                </button>
              )}
              <p className="consent-date">Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => setScreen('signin')}>Back</button>
              <button
                className="btn btn-primary"
                onClick={() => setScreen('demographics')}
                disabled={!signed}
              >
                I Understand &amp; Agree
              </button>
            </div>
            {!signed && <p className="sign-reminder">Please sign above to continue</p>}
          </div>
        </div>
      )}

      {/* ── SCREEN 3A: DEMOGRAPHICS (new participants, once) ──── */}
      {screen === 'demographics' && (
        <div className="screen demographics-screen">
          <div className="header">
            <div className="org-badge">MANO</div>
            <h1 className="app-title">MANO</h1>
          </div>

          <div className="card">
            <h2 className="card-title">Enrollment Information</h2>
            <p className="card-desc">
              This information is collected once at enrollment. Fields marked
              <span className="voluntary"> voluntary</span> are never required.
            </p>

            {/* ── TEPAP Section ── */}
            <div className="form-section">
              <div className="form-section-title">TEPAP Eligibility</div>

              <div className="field-group">
                <label className="field-label">Address <span className="req">*</span></label>
                <input
                  className="input"
                  type="text"
                  placeholder="Street address"
                  value={address}
                  disabled={preferNotAddress}
                  onChange={e => setAddress(e.target.value)}
                />
                <label className="prefer-not">
                  <input
                    type="checkbox"
                    checked={preferNotAddress}
                    onChange={e => {
                      setPreferNotAddress(e.target.checked)
                      if (e.target.checked) setAddress('')
                    }}
                  />
                  Prefer not to say / Unhoused
                </label>
              </div>

              <div className="field-group">
                <label className="field-label">Zip Code</label>
                <input
                  className="input input-sm"
                  type="text"
                  placeholder="79901"
                  maxLength={5}
                  value={zipCode}
                  onChange={e => setZipCode(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Phone / Email <span className="voluntary">voluntary</span></label>
                <input
                  className="input"
                  type="text"
                  placeholder="Phone number or email"
                  value={phone}
                  disabled={preferNotPhone}
                  onChange={e => setPhone(e.target.value)}
                />
                <label className="prefer-not">
                  <input
                    type="checkbox"
                    checked={preferNotPhone}
                    onChange={e => {
                      setPreferNotPhone(e.target.checked)
                      if (e.target.checked) setPhone('')
                    }}
                  />
                  Prefer not to provide
                </label>
              </div>

              <div className="field-group">
                <label className="field-label"># of family members in household</label>
                <input
                  className="input input-sm"
                  type="number"
                  min={1}
                  placeholder="e.g. 1"
                  value={householdSize}
                  onChange={e => setHouseholdSize(e.target.value)}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Categorical Eligibility (check all that apply)</label>
                <div className="checkbox-grid">
                  {['SNAP', 'TANF', 'SSI', 'NSLP', 'Medicaid'].map(opt => (
                    <label key={opt} className={`checkbox-item ${categoricalElig.includes(opt) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={categoricalElig.includes(opt)}
                        onChange={() => toggleItem(categoricalElig, setCategoricalElig, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Annual Gross Family Income</label>
                <div className="income-row">
                  <input
                    className="input input-sm"
                    type="text"
                    placeholder="Amount"
                    value={incomeAmount}
                    onChange={e => setIncomeAmount(e.target.value)}
                  />
                  <div className="radio-row income-period">
                    {['Yearly', 'Monthly', 'Weekly'].map(p => (
                      <label key={p} className={`radio-item ${incomePeriod === p ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name="incomePeriod"
                          checked={incomePeriod === p}
                          onChange={() => setIncomePeriod(p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Household Crisis?</label>
                <RadioGroup
                  name="householdCrisis"
                  options={['Yes', 'No']}
                  value={householdCrisis}
                  onChange={setHouseholdCrisis}
                />
              </div>
            </div>

            {/* ── Demographics Section ── */}
            <div className="form-section">
              <div className="form-section-title">
                Demographics <span className="voluntary">— all voluntary</span>
              </div>

              <div className="field-group">
                <label className="field-label">Age Group <span className="voluntary">voluntary</span></label>
                <RadioGroup
                  name="ageGroup"
                  options={['Under 17', '18–24', '25–44', '45–64', '65+', 'Prefer not to say']}
                  value={ageGroup}
                  onChange={setAgeGroup}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Gender <span className="voluntary">voluntary</span></label>
                <RadioGroup
                  name="gender"
                  options={['Male', 'Female', 'Other', 'Prefer not to identify']}
                  value={gender}
                  onChange={setGender}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Race (select all that apply) <span className="voluntary">voluntary</span></label>
                <div className="checkbox-grid">
                  {[
                    'White',
                    'Black / African American',
                    'American Indian / Alaska Native',
                    'Native Hawaiian / Pacific Islander',
                    'Asian',
                    'More than one race',
                    'Unknown / Prefer not to say',
                  ].map(opt => (
                    <label key={opt} className={`checkbox-item ${race.includes(opt) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={race.includes(opt)}
                        onChange={() => toggleItem(race, setRace, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">Ethnicity <span className="voluntary">voluntary</span></label>
                <RadioGroup
                  name="ethnicity"
                  options={['Hispanic / Latino', 'Non-Hispanic', 'Unknown / Prefer not to say']}
                  value={ethnicity}
                  onChange={setEthnicity}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Insurance <span className="voluntary">voluntary</span></label>
                <RadioGroup
                  name="insurance"
                  options={['Private', 'Medicaid', 'Medicare', 'Uninsured', 'Prefer not to say']}
                  value={insurance}
                  onChange={setInsurance}
                />
              </div>

              <div className="field-group">
                <label className="field-label">Other Indicators (check all that apply) <span className="voluntary">voluntary</span></label>
                <div className="checkbox-grid">
                  {[
                    'Criminal justice involvement',
                    'Rural / remote area',
                    'Pregnant / postpartum',
                    'Tribal member',
                    'Young adult (25 or under)',
                  ].map(opt => (
                    <label key={opt} className={`checkbox-item ${indicators.includes(opt) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={indicators.includes(opt)}
                        onChange={() => toggleItem(indicators, setIndicators, opt)}
                      />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => setScreen('disclosure')}>Back</button>
              <button className="btn btn-primary" onClick={() => setScreen('questionnaire')}>
                Continue to Visit Info →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SCREEN 3B: VISIT QUESTIONS (every visit) ──────────── */}
      {screen === 'questionnaire' && (
        <div className="screen questionnaire-screen">
          <div className="header">
            <div className="org-badge">MANO</div>
            <h1 className="app-title">MANO</h1>
          </div>

          <div className="card">
            <h2 className="card-title">Today's Visit</h2>
            <p className="card-desc voluntary-note">
              ⭐ Questions marked <span className="voluntary">voluntary</span> are never required.
              Answer only what you are comfortable with.
            </p>

            {/* ── Services ── */}
            <div className="form-section">
              <div className="form-section-title">Services Today</div>
              <div className="field-group">
                <label className="field-label">Services received today <span className="req">*</span></label>
                <div className="checkbox-grid">
                  {['Shower', 'TEPAP Food', 'Narcan / Naloxone', 'Clothing', 'Mail Pickup', 'Referral'].map(s => (
                    <label key={s} className={`checkbox-item ${services.includes(s) ? 'checked' : ''}`}>
                      <input
                        type="checkbox"
                        checked={services.includes(s)}
                        onChange={() => toggleItem(services, setServices, s)}
                      />
                      {s}
                    </label>
                  ))}
                </div>
              </div>

              <div className="field-group">
                <label className="field-label">
                  Are you currently in an unhoused situation?
                  <span className="voluntary"> voluntary</span>
                </label>
                <YNP name="unhoused" value={unhoused} onChange={setUnhoused} />
              </div>
            </div>

            {/* ── Substance Use (42 CFR Part 2) ── */}
            <div className="form-section cfr-section">
              <div className="form-section-title">
                Substance Use
                <span className="cfr-badge">42 CFR Part 2 Protected</span>
              </div>
              <p className="cfr-note">
                Your answers are protected under federal law. This information cannot
                be shared without your written consent.
              </p>

              <div className="field-group">
                <label className="field-label">
                  Are you an opioid user?
                  <span className="voluntary"> voluntary</span>
                </label>
                <YNP name="opioidUser" value={opioidUser} onChange={setOpioidUser} />
              </div>

              <div className="field-group">
                <label className="field-label">
                  Are you a stimulant user?
                  <span className="voluntary"> voluntary</span>
                </label>
                <YNP name="stimulantUser" value={stimulantUser} onChange={setStimulantUser} />
              </div>

              <div className="field-group">
                <label className="field-label">
                  Have you been referred to MAT (Medication Assisted Treatment)?
                  <span className="voluntary"> voluntary</span>
                </label>
                <YNP name="referredToMAT" value={referredToMAT} onChange={setReferredToMAT} />
              </div>

              <div className="field-group">
                <label className="field-label">
                  Are you currently on MAT?
                  <span className="voluntary"> voluntary</span>
                </label>
                <YNP name="onMAT" value={onMAT} onChange={setOnMAT} />
              </div>
            </div>

            {/* ── Overdose ── */}
            <div className="form-section">
              <div className="form-section-title">Overdose Response</div>

              <div className="field-group">
                <label className="field-label">
                  Did you witness an overdose today?
                  <span className="voluntary"> voluntary</span>
                </label>
                <YNP name="overdoseWitnessed" value={overdoseWitnessed} onChange={setOverdoseWitnessed} />
              </div>

              {overdoseWitnessed === 'Yes' && (
                <>
                  <div className="field-group follow-up">
                    <label className="field-label">Did the person survive?</label>
                    <RadioGroup
                      name="personSurvived"
                      options={['Yes', 'No', 'Unknown']}
                      value={personSurvived}
                      onChange={setPersonSurvived}
                    />
                  </div>
                  <div className="field-group follow-up">
                    <label className="field-label">Was Narcan (naloxone) given?</label>
                    <YNP name="narcanGiven" value={narcanGiven} onChange={setNarcanGiven} />
                  </div>
                </>
              )}
            </div>

            <div className="btn-row">
              <button className="btn btn-ghost" onClick={() => {
                if (userType === 'returning') setScreen('signin')
                else setScreen('demographics')
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

      {/* ── SCREEN 4: CONFIRMATION ────────────────────────────── */}
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
            {userType === 'new' && (
              <div className="card-number-issued">
                <span className="card-label">Your Card Number</span>
                <span className="card-value">{issuedCard}</span>
                <span className="card-instruction">
                  Write this down or receive a physical card from staff.
                </span>
              </div>
            )}
            <button className="btn btn-primary" onClick={resetAll}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App