# MANO — Haven Check-In
### Anonymous ZK Attendance Credentials for Peer Recovery Services

**Live App:** https://haven-check-in.vercel.app  
**Built on:** Midnight Blockchain (Preprod Network)  
**Hackathon:** Midnight Hackathon — May 2026  
**Developer:** Andres F. Chavez · Anonymous Haven LLC  

---

## The Problem

Every day, people walk into overdose drop-in centers (ODCs) and are asked the same questions by different staff members — name, date of birth, housing status — over and over again. For people who are unhoused, actively using, or fleeing dangerous situations, this is not just inconvenient. It is a barrier. Many avoid services entirely rather than hand their personal information to yet another institution.

At the same time, organizations running these services need real data. Federal funding, harm reduction grants, and program reporting all require attendance records, demographic snapshots, and service utilization counts. The existing solutions force a false choice: collect PII and expose participants to risk, or skip data collection and lose funding.

MANO breaks that trade-off.

---

## What It Does

MANO is an anonymous check-in system for peer recovery drop-in centers. It allows staff to record program-required attendance data — dates, service counts, milestones — without ever storing participant identity on-chain or in plaintext.

**For participants:** Check in with a physical card. No smartphone required. No name asked after intake. No identity exposed to the blockchain.

**For staff:** A clean kiosk-mode PWA that records visits, tracks services rendered (Narcan, food, shower, clothing), and generates reports — all without seeing PII beyond what was collected once at intake.

**For reporting:** Aggregate data for funders and program evaluators, generated from ZK-verified attendance records, with no ability to trace back to individuals.

The system serves roughly **15,000 contacts per year** at Proyecto Centro Salvavida — a real ODC in El Paso, TX operating under 42 CFR Part 2 confidentiality law.

---

## How It Works — Midnight ZK Architecture

MANO is built on the **Midnight blockchain** using **Compact** (Midnight's ZK circuit language) and the **Midnight TypeScript SDK**.

### Compact Circuits

Six circuits handle the full lifecycle of a participant credential:

| Circuit | Purpose |
|---|---|
| `enroll` | First-time enrollment — stores a sealed cryptographic commitment, never plaintext identity |
| `checkIn` | Proves enrollment without revealing identity; increments attendance counter |
| `verifyMilestone` | Proves a participant has reached X check-ins — usable for employment or housing credentials |
| `revokeEnrollment` | Admin circuit with Circuit Breaker pattern for emergency suspension |

### Privacy Model

| Data | Status |
|---|---|
| Participant identity | **Hidden** — `sealed` ledger field, never readable on-chain |
| Secret key / biometric hash | **Hidden** — witness only, never leaves the local device |
| Attendance date | **Disclosed** — public, required for reporting |
| Milestone count | **Disclosed with consent** — participant controls selective disclosure |
| Enrollment status | **Disclosed** — boolean, no identity attached |

### Key Compact Patterns Used

**Sealed ledger fields** — the `sealed` keyword stores data on-chain with hidden contents. Only ZK proofs can interact with it. No one — not staff, not the organization, not Midnight itself — can read the participant's identity from the chain.

```compact
sealed ledger owner: Bytes<32>;
export ledger checkInDate: Opaque<"string">;
export ledger milestoneCount: Counter;
```

**Disclose requirement** — any witness-derived value stored in the ledger must use `disclose()`. This is a Compact language-level enforcement of the privacy boundary between private witness data and public ledger state.

```compact
owner = disclose(publicKey(localSecretKey(), sequence));
```

**Replay protection** — the sequence counter increments with each session and is included in the hash input, ensuring the same secret key produces a different public key every check-in. This prevents any correlation attack across sessions.

```compact
persistentHash<Vector<3, Bytes<32>>>([pad(32, "mano:checkin:"), sequence, sk])
```

**Circuit Breaker** — an `isPaused` boolean ledger field checked at the start of every circuit allows emergency suspension without destroying participant data.

### Wallet Architecture

MANO uses a three-wallet model designed so neither staff nor participants ever interact with the blockchain directly:

1. **Admin wallet** (Andres / org admin) — deploys contracts, manages configuration
2. **Custodial wallet** (Recovery Alliance) — holds DUST for fees, submits transactions on behalf of participants
3. **Participant self-custody wallet** (Phase 3) — participant eventually claims their own ZK credential and it becomes portable

---

## Tech Stack

- **Blockchain:** Midnight Network (Preprod), Compact circuit language
- **SDK:** Midnight TypeScript SDK
- **Frontend:** React Web PWA, deployed to Vercel
- **Backend:** Supabase (shared instance, `hc_` table prefix)
- **Auth (Phase 2):** WebAuthn fingerprint
- **Dev environment:** Windows + WSL2 + Kiro IDE
- **Kiosk:** Android tablet, Chrome fullscreen mode
- **Proof server:** Local Docker container

---

## Results

- ✅ 6 Compact circuits compiled clean (zero errors)
- ✅ 13/13 tests passing (success + failure cases for every circuit)
- ✅ Live PWA deployed at https://haven-check-in.vercel.app
- ✅ PR open at [Midnight example-bboard repo](https://github.com/midnightntwrk/example-bboard), branch `capstone/andres-chavez`

---

## What's Next

**Phase 1** — Physical card issuance system. ~50% of participants have no smartphone. The card is the credential.  
**Phase 2** — WebAuthn fingerprint authentication, replacing the card for participants who have a device.  
**Phase 3** — Participant self-custody wallet. The ZK credential moves with the person — to a new city, a new provider, a new chapter.  
**Naloxone Hub** — A separate module for regional naloxone distribution tracking, with its own card-scan architecture.  
**Volunteer credentials** — Verifiable ZKP proof of volunteer hours, useful for employment, housing, and reentry applications.

---

## Trade-offs & Honest Reflections

- **~30 second transaction time on Preprod** — acceptable for check-in flows, not for high-frequency interactions. Standalone network used for development.
- **Physical card = Phase 1 trust anchor** — not cryptographically perfect, but it meets participants where they are. Zero phone required.
- **Selective disclosure requires participant consent UX** — the mechanism exists; the UI to support it gracefully is still being built.
- **42 CFR Part 2 + blockchain** — the sealed ledger model satisfies the spirit of the law, but legal review is in progress before production launch.

---

## About

MANO is built by Andres F. Chavez under Anonymous Haven LLC for the recovery community. I work at a peer overdose drop-in center. This is not a demo project. It will serve real people.

*Private by default. Transparent by choice.*
