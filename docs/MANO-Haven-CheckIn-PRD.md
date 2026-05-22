# MANO — Haven Check-In Product Requirements Document

**CONFIDENTIAL**

| | |
|---|---|
| **Version** | v0.2 — MVP Development |
| **Date** | May 2026 |
| **Developer** | Andres F. Chavez — Anonymous Haven LLC |
| **Organization** | Recovery Alliance El Paso — Proyecto Centro Salvavida |
| **Address** | 800 Montana Ave, El Paso, TX |
| **Tech Stack** | React PWA • Vite • Supabase • Midnight Blockchain • Vercel |
| **Repository** | github.com/AC1706-67/haven-check-in |
| **Live URL** | haven-check-in.vercel.app |

---

## 1. Executive Summary

MANO (Haven Check-In) is a zero-knowledge anonymous check-in system designed for the Overdose Drop-In Center (ODC) operated by Recovery Alliance El Paso at Proyecto Centro Salvavida. The system enables staff to collect required program data — TEPAP eligibility, 42 CFR Part 2 substance use records, and overdose response data — without ever exposing participant personally identifiable information (PII).

The core thesis is simple: participants at an ODC are among the most vulnerable and criminalized populations in any city. Requiring them to identify themselves to access life-saving services creates a barrier that costs lives. MANO removes that barrier while still satisfying every funder reporting requirement.

Built on the Midnight blockchain using zero-knowledge proofs (ZKP), MANO ensures that even if the system is breached, participant identities cannot be extracted. The blockchain layer is completely invisible to staff and participants — they interact with a simple, trauma-informed web interface on a kiosk tablet.

MANO also serves as the data backbone for Naloxone Hub Distribution tracking across Region 10. The system tracks naloxone inventory, distribution to partner organizations, and individual-level Narcan pickups — giving Recovery Alliance real-time visibility into where naloxone is going, how much is available, and which organizations are actively distributing. This module operates separately from participant check-in and is designed for org-facing staff use.

---

## 2. Problem Statement

### 2.1 The Population

The ODC serves approximately 15,000 contacts per year. The vast majority are unhoused individuals experiencing active substance use disorder. Many have outstanding warrants, immigration concerns, or prior trauma from law enforcement or healthcare institutions that makes identification feel threatening or dangerous.

### 2.2 The Current Pain Points

1. Staff re-ask the same demographic questions every visit — different staff members do not have access to prior answers, creating a degrading and repetitive experience for participants.
2. Paper sign-in sheets expose participant names to anyone who walks by the front desk.
3. Digital systems that require names or IDs create a deterrent — people leave rather than identify themselves.
4. Funder reporting requirements (TEPAP, 42 CFR Part 2, overdose data) still must be met regardless of privacy concerns.
5. No portable credential exists — participants cannot prove program participation for housing, employment, or reentry applications.

---

## 3. Goals & Success Metrics

### 3.1 Primary Goals

1. Allow ODC staff to record required funder data without collecting participant names or government IDs.
2. Eliminate the re-asking of demographic questions on repeat visits.
3. Create a participant check-in experience that takes under 2 minutes for returning participants.
4. Generate a verifiable, participant-controlled attendance credential on the Midnight blockchain.

### 3.2 Success Metrics

1. Zero PII stored in plaintext in any database.
2. Returning participant check-in completed in under 90 seconds.
3. All TEPAP and Sheet 2 required fields captured.
4. Director and funder can export aggregate reports without accessing individual records.

---

## 4. Users

### 4.1 Staff (Primary Operator)

1. ODC outreach staff and agency representatives.
2. Operate the kiosk tablet at the front desk.
3. Fill out the session header (date, rep name, org) before participants begin.
4. Hand off the tablet to each participant for self-check-in.

### 4.2 Participants

1. ODC visitors — primarily unhoused adults with active substance use disorder.
2. ~50% have no smartphone. The physical card is their only credential.
3. May have limited literacy or English proficiency.
4. The interface must be simple, non-judgmental, and fast.

### 4.3 Director / Executive Director

1. Needs aggregate reporting for funder compliance.
2. May request new fields or questions over time — schema is designed to accommodate this without breaking existing data.
3. Does not access individual participant records.

---

## 5. Application Flow

### 5.1 New Participant Flow

| Screen | Title | Purpose |
|--------|-------|---------|
| Screen 1 | Welcome / Sign-In | Entry point. New participant clicks Begin Enrollment. |
| Screen 2 | 42 CFR Part 2 Disclosure | Federal confidentiality notice. Participant signs via touchscreen. |
| Screen 3A | Enrollment Information | TEPAP eligibility fields + demographics. Collected once, never re-asked. |
| Screen 3B | Today's Visit | Per-visit fields: services, substance use, overdose response. |
| Screen 4 | Confirmation | Check-in complete. Card number issued. ZK credential created. |

### 5.2 Returning Participant Flow

| Screen | Title | Purpose |
|--------|-------|---------|
| Screen 1 | Welcome / Sign-In | Returning participant enters their card number. |
| Screen 3B | Today's Visit | Per-visit fields only. Demographics pre-filled from enrollment. |
| Screen 4 | Confirmation | Check-in complete. ZK credential updated. |

### 5.3 Naloxone Hub — Org Enrollment Flow (Staff Only)

Org enrollment is a one-time staff-facing process, not performed on the participant kiosk. Recovery Alliance staff registers each partner organization in the admin panel before any NX- cards are issued.

| Screen | Title | Purpose |
|--------|-------|---------|
| Step 1 | Org Registration | Staff enters org name, address, primary contact, region, and naloxone distribution agreement status. |
| Step 2 | Rep Card Issuance | Staff issues one or more NX- cards linked to the org. Each card is assigned to a named rep. |
| Step 3 | Card Delivery | Physical NX- card delivered to the org rep. Card number is their credential for all future pickups. |

### 5.4 Naloxone Hub — Rep Pickup Flow (Kiosk)

Once enrolled, org reps use the same kiosk as ODC participants. The NX- prefix on their card automatically routes them to the naloxone distribution screen. The entire pickup takes under 60 seconds.

| Screen | Title | Purpose |
|--------|-------|---------|
| Screen 1 | Welcome / Sign-In | Rep enters NX- card number. System detects prefix and routes to naloxone flow. |
| Screen NX-A | Org Confirmation | Org name and rep name auto-populate from card. Rep confirms identity. |
| Screen NX-B | Pickup Details | Rep selects kit type (nasal spray, injectable) and enters quantity picked up today. |
| Screen NX-C | Confirmation | Pickup logged. Inventory decremented. Printable receipt available for org records. |

### 5.5 Card Prefix Routing — How One Kiosk Serves Everyone

The welcome screen is identical for every user. The card number prefix is the only routing signal.

| Card Prefix | Credential Type | Routed To |
|-------------|----------------|-----------|
| HC-xxxxxx | ODC Participant | Check-in flow — disclosure, demographics, visit questions |
| NX-xxxxxx | Naloxone Hub Org Rep | Naloxone pickup flow — org confirmation, pickup details |
| VOL-xxxxxx | Volunteer (Phase 3) | Volunteer hour logging screen |
| PSS-xxxxxx | Peer Support Specialist (Phase 3) | Service record screen |
| CPO-xxxxxx | Community Partner Org (Phase 4) | Interagency scan-in — timestamped visit log only. No forms, no PHI, no PII. |

---

## 6. Data Model

### 6.1 Design Principles

1. Stable fields (demographics, TEPAP eligibility) are collected once at enrollment and never re-asked.
2. Per-visit fields (services, substance use, overdose) are collected every visit.
3. PII fields (DOB, SSN, driver's license) are ZKP-protected — cryptographic commitment only, never plaintext.
4. An additional_responses JSONB column absorbs any new fields added by the director without requiring schema migration.

### 6.2 Supabase Tables (hc_ prefix)

1. **hc_participants** — Anonymous ID, card number, ZK credential hash. No names.
   - on_chain_hash, wallet_address (blockchain columns)
2. **hc_demographics** — Stable enrollment fields linked to participant. Age group, gender, race, ethnicity, insurance, indicators.
3. **hc_sessions** — Date, agency rep, org_id. One session per operating day.
4. **hc_visits** — Per-visit fields. Consent record, signature image (encrypted), timestamp, services, substance use, overdose data, additional_responses JSONB.

### 6.3 Naloxone Hub Distribution Tables

The Naloxone Hub module operates as a separate org-facing layer within the same Supabase instance.

1. **hc_naloxone_orgs** — Partner organizations registered to receive and distribute naloxone. Name, address, contact, region, active status.
2. **hc_naloxone_inventory** — Current naloxone stock levels. Quantity on hand, unit type, last restocked date, location. Decremented automatically on pickup.
3. **hc_naloxone_pickups** — Individual pickup events. Org ID, quantity, pickup date, staff rep, additional_responses JSONB.
4. Individual Narcan received at the ODC is also captured in hc_visits via the Narcan / Naloxone service checkbox.

---

## 7. Privacy Architecture

### 7.1 Zero-Knowledge Proof Layer (Midnight Blockchain)

The Midnight blockchain layer uses Compact circuit language to create ZK proofs. The participant's identity commitment is stored on-chain as a sealed ledger field.

- **Hidden (sealed):** Participant identity, secret key, biometric hash.
- **Disclosed (public):** Attendance date, milestone count (with consent), enrollment status.
- **Selective disclosure:** Participant consents → milestone count shared with employer or housing provider.

### 7.2 42 CFR Part 2 Compliance

All substance use fields are labeled and treated as 42 CFR Part 2 protected. The disclosure screen collects e-signature consent before any substance use questions are displayed.

### 7.3 TEPAP Fields

TEPAP eligibility fields (address, income, household size, categorical eligibility) are required for food assistance program reporting. The income field includes a "No income / Prefer not to say" option to reduce stigma for unhoused participants. All TEPAP fields are collected once at enrollment.

---

## 8. Feature Status

| Feature | Status | Phase |
|---------|--------|-------|
| Welcome / Sign-In screen | ✅ Complete | MVP |
| 42 CFR Part 2 disclosure + e-signature | ✅ Complete | MVP |
| Demographics / TEPAP enrollment screen | ✅ Complete | MVP |
| Visit questions (substance use, overdose, services) | ✅ Complete | MVP |
| Confirmation + card number issuance | ✅ Complete | MVP |
| No income / Prefer not to say option | ✅ Complete | MVP |
| Trauma-informed voluntary field labeling | ✅ Complete | MVP |
| Supabase backend — data persistence | 🔄 In Progress | MVP |
| Staff session header | 📋 Planned | MVP |
| Physical card system (unique number + photo) | 📋 Planned | Phase 1 |
| WebAuthn fingerprint authentication | 📋 Planned | Phase 2 |
| Participant self-custody ZK wallet | 📋 Planned | Phase 3 |
| Naloxone Hub Distribution module | 📋 Planned | Phase 2 |
| Volunteer hour tracking (ZK credential) | 📋 Planned | Phase 3 |
| Aggregate reporting / export | 📋 Planned | MVP |

---

## 9. Technical Stack

1. **Frontend:** React Web PWA (Vite) — deployed to Vercel
   - React Web PWA chosen over React Native because Midnight SDK is TypeScript/Node.js web-based.
2. **Backend:** Supabase — shared instance (vitwypicporqpeefwsjs), hc_ table prefix
3. **Blockchain:** Midnight Network (Preprod) — Compact circuit language, TypeScript SDK
4. **Auth (Phase 2):** WebAuthn fingerprint — no passwords, no usernames
5. **Kiosk:** Android tablet, Chrome fullscreen/kiosk mode
6. **Dev environment:** Windows + WSL2 + Kiro IDE (VS Code-based)
7. **Version control:** GitHub (AC1706-67/haven-check-in), main branch

---

## 10. Future Phases

### Phase 1 — Physical Card System

Unique card number + photo credential for unhoused participants with no smartphone. Card number links to anonymous participant record in Supabase. ~50% of the ODC population has no smartphone — this is a critical accessibility requirement.

### Phase 2 — WebAuthn Fingerprint

Biometric authentication replaces card swipe. No password, no username — fingerprint hash is the credential. Fingerprint never leaves the device; only the hash is stored.

### Phase 3 — Participant Self-Custody Wallet

Participant claims their ZK credential and it moves with them. Three-wallet architecture: admin wallet → Recovery Alliance custodial wallet → participant self-custody wallet. Participants can then present verifiable proof of program participation for housing, employment, or reentry — without revealing their identity.

---

## 11. Open Questions

1. **TEPAP reporting:** Does the food bank require individual record submission, aggregate counts, or only audit-ready records on file?
2. **Session header:** What fields does Recovery Alliance require at the top of each session (agency rep name, supervisor, site)?
3. **Card issuance:** Who prints and issues physical cards? What is the workflow if a participant loses their card?
4. **Director access:** What level of aggregate reporting does the executive director need, and in what format (PDF, Excel, dashboard)?

---

## 12. Long-Term Vision — Regional Recovery Ecosystem

MANO is not just a check-in system. It is the infrastructure layer for a verifiable, privacy-preserving recovery ecosystem across the El Paso region — and a replicable model for any community in the country.

### 12.1 The Core Problem MANO Solves at Scale

Across the recovery ecosystem — ODCs, peer support organizations, faith-based recovery programs, federally qualified health centers, compassionate care initiatives, and recovery services coalitions — the same problem repeats itself. People do meaningful work. Organizations provide critical services. But none of it is verifiable.

MANO fixes this by giving everyone in the ecosystem a zero-knowledge credential — verifiable proof of what they do, controlled entirely by them, shareable on their terms, and backed by an immutable blockchain record that cannot be altered or forged.

### 12.2 The Universal Credential

In Phase 3, MANO issues Midnight blockchain credentials to every participant in the ecosystem:

1. **ODC Participants** — Anonymous attendance credential.
2. **Org Representatives** — Organizational credential for naloxone pickup, service verification, and coalition participation.
3. **Volunteers** — Verifiable hour logs.
4. **Recovery Coaches & Peer Support Specialists** — Credential of service that travels with them across organizations.
5. **Faith-Based Programs** — Participation credential for members who want to document their recovery journey.
6. **Advocacy Organizations** — Verifiable participation in regional coalitions and campaigns.

### 12.3 The NFC Tap — One Gesture, Any Door

In Phase 3, every enrolled person carries their credential in a Midnight mobile wallet. A single NFC tap against any MANO kiosk in the region routes them to the right screen automatically.

| Who taps | Credential type | Routed to |
|----------|----------------|-----------|
| ODC participant | HC- anonymous credential | Check-in flow |
| Org rep (FQHC, peer org, etc.) | NX- org credential | Naloxone distribution screen |
| Volunteer | VOL- volunteer credential | Hour logging screen |
| Peer support specialist | PSS- specialist credential | Service record screen |
| AA / NA / faith-based member | REC- recovery credential | Participation log screen |

For participants without a smartphone — the majority of the ODC population — the physical card with a printed number remains the credential.

### 12.4 The Naloxone Distribution Network

The Naloxone Hub module gives Recovery Alliance real-time visibility into naloxone supply and distribution across Region 10.

1. Regional dashboard shows inventory levels, distribution velocity, and org-level pickup history.
2. Gaps in distribution are surfaced automatically.
3. Individual-level Narcan received at the ODC is tracked separately through the participant visit record.
4. All distribution data is verifiable and immutable.

### 12.5 The Funding Story

MANO can answer questions that no current peer recovery platform can answer cleanly:

1. How many unique individuals did we serve this quarter — without exposing who they are?
2. How many of those individuals were unhoused, uninsured, opioid users, or in a household crisis — without storing their names?
3. How much naloxone did we distribute, to which organizations, and how does that map to overdose response data?
4. How many volunteers contributed hours, and what is the total economic value?
5. Can a participant prove they completed 90 days of program participation for a housing application — without us having to write a letter?

The answer to all of these is yes — and the proof is on the blockchain.

### 12.6 Replicability

MANO is built on open standards — React, Supabase, and the Midnight blockchain. The architecture is designed to be white-labeled and deployed by any ODC, peer recovery organization, or recovery coalition in the country.

The vision is a national network of MANO kiosks — one ZK credential that follows a person in recovery from El Paso to Houston to Chicago, proving their journey without ever exposing their identity.

---

*MANO — Haven Check-In — Anonymous Haven LLC — Confidential*
