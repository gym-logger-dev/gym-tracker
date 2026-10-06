# Obligations register (R1–R10)

Copied from the development plan (sources opened 2 October 2026). security-compliance re-verifies volatile items at every phase gate and records the date checked.

| # | Obligation | Source | Control | Phase | Last verified |
|---|---|---|---|---|---|
| R1 | Privacy Act 1988 applies regardless of the small business exemption (health service provider holding health information) | https://www.oaic.gov.au/privacy/your-privacy-rights/health-information/what-is-a-health-service-provider | Treat the app as an APP entity; APP 1 privacy policy in-app and on the web | P2 | 2026-10-02 |
| R2 | Express, informed, specific consent before collecting health information (APP 3) | https://www.oaic.gov.au/privacy/australian-privacy-principles/australian-privacy-principles-guidelines/chapter-b-key-concepts | Separate opt-in before first body scan; withdrawable; scan data deletable on its own | P4 | 2026-10-02 |
| R3 | Collection notice (APP 5), purpose limitation (APP 6), access and correction (APP 12, 13) | OAIC APP Guidelines | Notice at sign-up; in-app export (JSON/CSV) and edit | P2 | 2026-10-02 |
| R4 | Cross-border disclosure (APP 8) | OAIC APP Guidelines | Database in Sydney; disclose Anthropic and Strava (US) as overseas recipients; user-initiated, opt-in | P2 | 2026-10-02 |
| R5 | Notifiable Data Breaches scheme | https://www.oaic.gov.au/privacy/notifiable-data-breaches/quick-reference-guide-for-responding-to-data-breaches | Breach runbook: assess within 30 days; notify individuals and OAIC as soon as practicable; access logs 12 months | P2 | 2026-10-02 |
| R6 | Statutory tort for serious invasions of privacy (from 10 June 2025) | https://www.oaic.gov.au/privacy/your-privacy-rights/more-privacy-rights/statutory-tort-for-serious-invasions-of-privacy | Data minimisation; no sharing beyond R4; no identifier-collecting analytics | P2 | 2026-10-02 |
| R7 | TGA software-as-medical-device: stay within the general health/wellness exclusion | https://www.tga.gov.au/resources/guidance/understanding-general-health-or-wellness-software-exclusion | Wellness-only claims; no diagnosis, disease thresholds or clinical use | P1–P5 | 2026-10-02 |
| R8 | Australian Consumer Law: no misleading claims | Competition and Consumer Act 2010, Sch. 2 | No promised outcomes; recommendations labelled as estimates | P5 | 2026-10-02 |
| R9 | Apple: in-app account deletion (5.1.1(v)); consent before sharing personal data with third-party AI (5.1.2(i)); HealthKit rules (5.1.3) | https://developer.apple.com/app-store/review/guidelines/ | Delete-account purges server data; explicit AI-sharing consent; privacy label | P5 | 2026-10-02 |
| R10 | Google Play: Data safety form, Health apps declaration, Health Connect permissions | https://support.google.com/googleplay/android-developer/answer/14738291?hl=en | Complete forms; request only Health Connect types used | P5 | 2026-10-02 |

Third-party terms that constrain design:
- Strava API (agreement effective 1 June 2026; developer program update 1 June 2026): data shown only to the athlete who provided it; Strava data must not be used in AI prompts or models; Standard tier up to 10 athletes. https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428
- Anthropic: Claude Free/Pro/Max sign-ins may not be used inside third-party apps; the app integrates via a remote MCP connector the user adds in Claude. https://claude.com/docs/connectors/custom/remote-mcp
