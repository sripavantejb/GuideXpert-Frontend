import { useState, useMemo } from 'react';

const DATA = [
  {
    cat: 'student', catLabel: 'Student', feat: 'Landing page',
    desc: 'Hero, problem statement, certification benefits, FAQs, testimonials, legacy section',
    status: 'active', priority: 'med',
    pipeline: ['Visitor lands on page', 'CTA click → 3-step registration form', 'UTM params captured and stored'],
    improve: ['A/B test hero copy and CTA text', 'Add live social-proof counters (students placed, colleges predicted)', 'Improve mobile LCP — reduce hero image size', 'Add exit-intent email capture overlay', 'Add schema markup for SEO'],
  },
  {
    cat: 'student', catLabel: 'Student', feat: '3-step registration',
    desc: 'Step 1: name/phone/occupation → Step 2: OTP via MSG91 → Step 3: demo slot booking',
    status: 'active', priority: 'high',
    pipeline: ['User fills name + phone', 'MSG91 OTP send API called', 'OTP entered → verified → DB record created', 'Slot selected → booking confirmed', 'WhatsApp confirmation message sent'],
    improve: ['Auto-detect country code from phone number', 'Inline OTP field to reduce steps from 3→2', 'Add Google one-tap sign-in shortcut', 'Progress bar between steps', 'Show estimated time to complete (< 2 min)', 'Retry UI for OTP failures'],
  },
  {
    cat: 'student', catLabel: 'Student', feat: 'OTP authentication',
    desc: 'SMS via MSG91, 5-min expiry, QA bypass codes hardcoded for 3 phones, resend timer',
    status: 'active', priority: 'high',
    pipeline: ['Phone submitted → MSG91 API call', 'OTP hashed + stored with expiry timestamp', 'User enters OTP → server verifies hash', 'Match → JWT issued; Fail → error shown', 'OTP record deleted on success'],
    improve: ['Remove hardcoded QA bypass phones from production build (security risk)', 'Add per-IP rate limiting to prevent abuse', 'WhatsApp OTP as fallback when SMS fails', 'Add TOTP/authenticator option for counsellors', 'Log all OTP attempts for audit'],
  },
  {
    cat: 'student', catLabel: 'Student', feat: 'Demo slot booking',
    desc: 'Dynamic slot availability (Sat 7PM, Sun 3PM etc.), date picker, capacity check, IST timezone',
    status: 'active', priority: 'med',
    pipeline: ['OTP verified → slot list fetched from SlotConfig', 'User picks date + time', 'Availability check → slot reserved in DB', 'WhatsApp confirmation sent via Gupshup'],
    improve: ['Add .ics calendar invite on confirmation email', 'Show remaining seats per slot', 'Slot waitlist for full sessions', 'Self-serve reschedule option (no admin needed)', 'Auto-detect timezone for non-IST users'],
  },
  {
    cat: 'student', catLabel: 'Student', feat: 'Meeting eligibility check',
    desc: 'Time-window gate: allows meeting link access 5 min before slot start to end of slot',
    status: 'active', priority: 'low',
    pipeline: ["User clicks 'Join meeting'", 'Server checks current time vs slot window', 'In window: meeting link revealed + attendance recorded', "Out of window: countdown timer or 'session ended' shown"],
    improve: ['Render live countdown timer before window opens', 'Handle daylight saving edge cases for IST', 'Make grace period configurable (currently hardcoded 5 min)', 'Log failed access attempts for ops visibility'],
  },
  {
    cat: 'student', catLabel: 'Student', feat: 'Student workspace',
    desc: 'Central dashboard: tool cards, test hub, progress overview, exam predictor, quick-access nav',
    status: 'active', priority: 'med',
    pipeline: ['Login → JWT validated', 'Dashboard fetches user progress + tool access', 'Tool cards rendered based on eligibility', 'User navigates to tool → result saved to profile'],
    improve: ['Personalized tool recommendations based on exam type', "'Next action' nudge card based on last activity", 'Recent activity feed', 'Gamification: badges for tool usage milestones', 'Onboarding tour for first-time users'],
  },
  {
    cat: 'tools', catLabel: 'Predictive', feat: 'Rank predictor',
    desc: 'Score → percentile → rank for JEE, NEET, KEAM, MHTCET, TNEA, WBJEE. Public and counsellor versions',
    status: 'active', priority: 'med',
    pipeline: ['User enters score + selects exam', 'Server runs prediction algorithm', 'Percentile and rank range returned', 'Result displayed + lead capture triggered (if public)'],
    improve: ['Show confidence interval / rank range band', 'Historical accuracy disclaimer', 'Compare predicted rank across multiple exams', 'Save prediction history for logged-in users', 'Share-as-image feature for social sharing'],
  },
  {
    cat: 'tools', catLabel: 'Predictive', feat: 'College predictor',
    desc: 'Exam + rank + category → college list via NW Predictors/EarlyWave API; 5+ entrance exams',
    status: 'active', priority: 'high',
    pipeline: ['Input: rank + exam + category', 'NW Predictors API call made', 'Response filtered and sorted', 'College list displayed with predicted admission chance'],
    improve: ['Cache API responses (TTL 24h) to reduce latency and cost', 'Add filter by state / branch / fees / gender quota', 'Show cutoff trends for last 3 years', 'PDF export of shortlist', 'Graceful fallback to internal dataset when API is down'],
  },
  {
    cat: 'tools', catLabel: 'Predictive', feat: 'Branch predictor',
    desc: 'Predicts branch allocation based on rank; helps understand branch vs college trade-offs',
    status: 'active', priority: 'med',
    pipeline: ['Rank input → branch model lookup', 'Sorted branch-probability list returned', 'Branch recommendation displayed with likelihood'],
    improve: ['Multi-college branch comparison in one view', 'Integrate output with college predictor', 'Trend chart for branch cutoffs year over year', 'Add salary/placement data per branch'],
  },
  {
    cat: 'tools', catLabel: 'Predictive', feat: 'College comparison',
    desc: 'Compare 2+ colleges on fees, placements, rankings, facilities side-by-side',
    status: 'active', priority: 'med',
    pipeline: ['User selects 2+ colleges', 'College data fetched', 'Rendered as comparison table', 'User can add/remove colleges dynamically'],
    improve: ['Shareable comparison URL (query params)', 'Save comparisons to profile', 'Radar/spider chart for visual multi-dimension comparison', 'More data points: hostel, location map, gender ratio'],
  },
  {
    cat: 'tools', catLabel: 'Predictive', feat: 'College fit test',
    desc: 'Multi-question assessment mapping student preferences to college characteristics',
    status: 'active', priority: 'low',
    pipeline: ['Student answers preference questions', 'Scoring algorithm maps answers to college attributes', 'Matched college list shown with fit %'],
    improve: ['Replace rule-based scoring with ML matching model', 'Show fit score percentage with explanation', 'Tie into college predictor output for rank validation'],
  },
  {
    cat: 'tools', catLabel: 'Predictive', feat: 'Deadline manager',
    desc: 'Track application deadlines by exam/college; automated reminder system',
    status: 'active', priority: 'med',
    pipeline: ['Student adds or selects deadline', 'Stored in user profile', 'Reminder jobs created (D-7, D-1)', 'WhatsApp/email reminder sent at trigger time'],
    improve: ['Pre-populate common exam deadlines automatically', 'Google Calendar and Apple Calendar sync', 'Push notification support', 'Categorize: exam vs college vs document deadlines'],
  },
  {
    cat: 'iit', catLabel: 'IIT counselling', feat: 'IIT registration flow',
    desc: 'Phone verify + 3-part form: AI learning interest, career guidance preference, group session booking',
    status: 'active', priority: 'high',
    pipeline: ['Phone OTP verify → IitFirstFormSubmission', 'Career preference form → IitSecondFormSubmission', 'Group session slot selection', 'Booking confirmed → WhatsApp confirmation'],
    improve: ['Save progress at each step (resume from drop-off)', 'Reduce form questions with smart defaults', 'Capture parent detail at this stage', 'Attach UTM to submission for full attribution'],
  },
  {
    cat: 'iit', catLabel: 'IIT counselling', feat: 'Group session booking',
    desc: 'Slots: Wed 6PM, Sat 6PM, Sun 11AM; attendance tracking; eligibility time-gate',
    status: 'active', priority: 'high',
    pipeline: ['Slot selection → IitSlotConfig lookup', 'DB reservation created', 'WhatsApp reminder sent D-1 and H-1', 'Join window opens → IitMeetAttendance recorded'],
    improve: ['Show session capacity and remaining seats', 'Self-serve slot change (no admin needed)', 'Multi-step reminder sequence (D-3, D-1, H-1)', 'Record sessions for replay by absentees', 'Post-session NPS survey'],
  },
  {
    cat: 'iit', catLabel: 'IIT counselling', feat: 'Hindi sessions',
    desc: 'Separate flow for Hindi-language group counselling; independent attendance model',
    status: 'active', priority: 'low',
    pipeline: ['Language flag set at registration', 'Routed to IitMeetHindiAttendance flow', 'Separate slot config for Hindi slots', 'Admin views separate Hindi attendance report'],
    improve: ['Auto-detect preferred language from phone region', 'Add Telugu and Tamil session tracks', 'Unified cross-language analytics dashboard', 'Bilingual confirmation messages'],
  },
  {
    cat: 'iit', catLabel: 'IIT counselling', feat: 'Lead activity tracking',
    desc: 'Full lead journey log, assignment history, UTM influencer tracking, lead status pipeline',
    status: 'active', priority: 'high',
    pipeline: ['Every user action → IitCounsellingLeadActivity event', 'Assignment recorded in LeadAssignmentHistory', 'Admin funnel chart updated', 'UTM links tracked via IitCounsellingUtmSavedLink'],
    improve: ['ML-based lead scoring model', 'Auto-prioritize high-intent leads for BDA', 'Timeline view per lead in admin', 'CRM export (HubSpot/Zoho format)', 'Stale lead auto re-engagement via WhatsApp'],
  },
  {
    cat: 'iit', catLabel: 'IIT counselling', feat: 'AI reminder calls (OSVI)',
    desc: 'Outbound voice calls for abandoned leads and pre-session reminders; call logs tracked',
    status: 'active', priority: 'med',
    pipeline: ['Cron identifies abandoned/no-show leads', 'OSVI API called with lead phone + script', 'Call placed → outcome webhook received', 'AiCallReminder + AiCallReminderActivity updated'],
    improve: ['Dynamic call script per lead pipeline stage', 'Post-call transcript analysis', 'A/B test different call scripts', 'Smart timing — avoid peak hours / DND', 'SMS fallback if call unanswered 3 times'],
  },
  {
    cat: 'oneon', catLabel: '1-on-1', feat: 'Session booking',
    desc: '3-section form: student details + parent info + session preferences; slot reservation',
    status: 'active', priority: 'med',
    pipeline: ['Student fills 3-section form', 'Mentor slot availability checked', 'Slot reserved → OneOnOneCounselingLead created', 'WhatsApp confirmation via Gupshup template sent'],
    improve: ['Real-time slot availability preview before form submit', 'Allow rescheduling self-serve', 'Send separate SMS to parent number', 'Payment gateway for premium sessions', 'Post-session feedback form'],
  },
  {
    cat: 'oneon', catLabel: '1-on-1', feat: 'Mentor slot management',
    desc: 'IITian mentors create/edit availability slots; OneOnOneCounselor model',
    status: 'active', priority: 'med',
    pipeline: ['Mentor logs in → creates/edits GuidanceSlot', 'Slot visible in student booking flow', 'Booking event → mentor notified via WhatsApp', 'Session complete → available for new booking'],
    improve: ['Recurring slot templates (e.g. every Saturday 3PM)', 'Buffer time config between sessions', 'Google Calendar two-way sync', 'Mentor availability analytics for admin'],
  },
  {
    cat: 'oneon', catLabel: '1-on-1', feat: 'Mentor dashboard / portal',
    desc: 'Full CRM for IITian mentors: bookings, upcoming sessions, student profiles, profile management',
    status: 'active', priority: 'low',
    pipeline: ['Mentor login → JWT validated', 'Dashboard fetches upcoming bookings', 'Session detail view → mentor adds notes', 'Profile updates saved → visible to students'],
    improve: ['Session notes and outcome field', 'Student history across all sessions', 'Mentor performance metrics (attendance %, satisfaction score)', 'Push alert for new bookings'],
  },
  {
    cat: 'webinar', catLabel: 'Webinar', feat: 'Video player & dashboard',
    desc: 'Stream webinar sessions, session library, watch time tracking, personal learning hub',
    status: 'active', priority: 'high',
    pipeline: ['OTP login → JWT issued', 'Dashboard loads session list from DB', 'Video play → progress events fired', 'WebinarProgress model updated in real-time'],
    improve: ['Playback speed control (0.75x – 2x)', 'Chapter/timestamp markers in video', 'Mobile-responsive player with fullscreen', 'Offline download for premium users', 'Resume from last position on re-open'],
  },
  {
    cat: 'webinar', catLabel: 'Webinar', feat: 'In-session assessments',
    desc: '5 quiz modules (WebinarAssessment1–5) with grading; gated by watch progress',
    status: 'active', priority: 'med',
    pipeline: ['Module watch % threshold met → assessment unlocked', 'Student submits answers', 'Server auto-grades → score stored', 'Pass → next module unlocked; Fail → retry allowed'],
    improve: ['Question randomization across attempts', 'Detailed per-question feedback on wrong answers', 'Leaderboard for cohort', 'Time-boxed assessments with countdown', 'Anti-tab-switch detection'],
  },
  {
    cat: 'webinar', catLabel: 'Webinar', feat: 'Progress & streaks',
    desc: 'Watch time, completion %, per-session progress, daily login/watch streaks, smart suggestions',
    status: 'active', priority: 'low',
    pipeline: ['Watch event → progress model updated', 'Streak counter incremented on daily watch', 'Smart suggestion card refreshed', 'Admin can view cohort-level completion rates'],
    improve: ['Streak freeze feature (1 per week)', 'Weekly learning goal setting', 'WhatsApp nudge on streak break', 'Badge awards at milestones (25%, 50%, 100%)'],
  },
  {
    cat: 'webinar', catLabel: 'Webinar', feat: 'Certificates',
    desc: 'PDF certificate on completion; public lookup by GX ID or mobile; jsPDF render',
    status: 'active', priority: 'low',
    pipeline: ['All modules completed → WebinarCertificate record created', 'PDF generated via jsPDF', 'Public URL available at /certificate/:id', 'Admin can bulk download certificates as ZIP'],
    improve: ['LinkedIn share button (Open Graph metadata)', 'QR code for instant verification', 'Certificate template customization in admin', 'Expiry and renewal system for annual recertification'],
  },
  {
    cat: 'webinar', catLabel: 'Webinar', feat: 'Doubt resolution & notes',
    desc: 'Post questions, community answers; in-session note-taking; PDFs and links per session',
    status: 'active', priority: 'med',
    pipeline: ['Student submits doubt → stored in DB', 'Admin or mentor answers → student notified', 'Notes saved locally per session', 'Resources (PDFs/links) attached per module by admin'],
    improve: ['AI auto-answer from knowledge base for common doubts', 'Upvote/downvote system for answers', 'Searchable doubt archive across sessions', 'Markdown support in notes editor'],
  },
  {
    cat: 'training', catLabel: 'Training', feat: 'Counsellor training program',
    desc: 'Multi-module training with progression, attendance tracking, training meet registration',
    status: 'active', priority: 'high',
    pipeline: ['Register → training meet slot booked', 'Attend meet → TrainingAttendance captured', 'Module marked complete → next module unlocked', 'Progress dashboard updated'],
    improve: ['Add async video-based training (not only live meets)', 'Module completion certificate per module', 'Trainer feedback on attendance quality', 'Training content versioning'],
  },
  {
    cat: 'training', catLabel: 'Training', feat: 'Assessment system (1–5)',
    desc: '5 graded assessments; Assessment 3 gated on training completion; 15–20 questions each',
    status: 'active', priority: 'high',
    pipeline: ['Eligibility check → assessment unlocked', 'Student submits answers', 'Auto-grade → AssessmentSubmission stored', 'Score emailed/WhatsApped to student', 'Admin sees all scores in dashboard'],
    improve: ['Partial credit scoring', 'Reattempt with cooldown (24h) and different question set', 'Per-topic score breakdown', 'Flag suspicious submissions (tab-switch, fast completion)'],
  },
  {
    cat: 'training', catLabel: 'Training', feat: 'Career DNA assessment',
    desc: 'Multi-question personality/aptitude survey; results used in counsellor-student matching',
    status: 'active', priority: 'low',
    pipeline: ['Survey submitted → CareerDnaSubmission stored', 'Scoring model generates trait profile', 'Profile used in counsellor dashboard for student matching'],
    improve: ['Add psychometric validation', 'Visualize results as radar chart to user', 'Retake allowed after 6 months', 'Use traits in ML-based counsellor-student matching'],
  },
  {
    cat: 'training', catLabel: 'Training', feat: 'Training feedback form',
    desc: 'Post-training survey: email, occupation, education, experience. Gates poster activation',
    status: 'active', priority: 'med',
    pipeline: ['Training attendance confirmed → feedback form shown', 'Submitted → TrainingFormSubmission stored', 'Google Sheets row appended via service account', 'Feedback validates poster activation eligibility'],
    improve: ['Add structured NPS question (0–10)', 'Sentiment analysis on free-text responses', 'Auto follow-up for NPS < 7', 'Multi-language form (Hindi, Telugu)'],
  },
  {
    cat: 'portal', catLabel: 'Counsellor portal', feat: 'Students management',
    desc: 'View enrolled students, track progress, admissions tracking, college referral pipeline',
    status: 'active', priority: 'high',
    pipeline: ['Counsellor login → student list fetched', 'Select student → activity timeline shown', 'Update referral status or admission outcome', 'Data synced to admin view'],
    improve: ['Bulk message all students in one action', 'Filter by exam / location / status', 'Student engagement score (last active, sessions attended)', 'Alert on at-risk students (inactive 7+ days)'],
  },
  {
    cat: 'portal', catLabel: 'Counsellor portal', feat: 'Marketing tools & posters',
    desc: 'Canvas poster editor (7+ templates), campaign link generator, UTM tracking, PDF/PNG export',
    status: 'active', priority: 'med',
    pipeline: ['Pick template → customize text and photo', 'Download PDF/PNG via html2canvas + jsPDF', 'Share link with UTM params', 'Download event tracked in PosterDownload model'],
    improve: ['WhatsApp direct share from editor', 'Dynamic name-on-poster personalisation', 'Analytics on which templates drive most leads', 'Auto-resize for Instagram vs WhatsApp dimensions'],
  },
  {
    cat: 'portal', catLabel: 'Counsellor portal', feat: 'Announcements feed',
    desc: 'Admin-published internal notifications; read/unread tracking per counsellor',
    status: 'active', priority: 'low',
    pipeline: ['Admin creates announcement → Announcement model', 'Counsellor portal fetches unread on login', 'AnnouncementRead record created on view', 'Unread count badge shown in nav'],
    improve: ['Push notification (PWA) on new announcement', 'Rich media: images, links, attachments', 'Priority / urgent tag', 'Schedule future announcements', 'Segment by counsellor region or tier'],
  },
  {
    cat: 'admin', catLabel: 'Admin', feat: 'Leads CRM',
    desc: 'Full lead DB: 7 pipeline stages, search/filter, funnel analytics, CSV export',
    status: 'active', priority: 'high',
    pipeline: ['Lead created on registration event', 'Status auto-updates on each action (OTP verify, slot book, attend, assess, activate)', 'Admin views/filters by status, date, UTM', 'Assign to BDA → BDA sees in their queue', 'Export to CSV for reporting'],
    improve: ['ML-based lead scoring', 'Duplicate detection and merge', 'Bulk status update UI', 'CRM export in HubSpot/Zoho format', 'Predictive churn alert (likely to drop off)'],
  },
  {
    cat: 'admin', catLabel: 'Admin', feat: 'Analytics dashboard',
    desc: 'KPIs, funnel conversion rates, stage drop-off charts, UTM cohort analysis',
    status: 'active', priority: 'high',
    pipeline: ['Events logged throughout platform on each user action', 'Dashboard API aggregates on request', 'Charts rendered via Recharts', 'Admin can filter by date and counsellor'],
    improve: ['Date range picker with presets (last 7d, 30d, custom)', 'Real-time updates via Server-Sent Events', 'Export dashboard as PDF report', 'Revenue tracking once payments added', 'Goal vs actual tracking per KPI'],
  },
  {
    cat: 'admin', catLabel: 'Admin', feat: 'BDA / calling team',
    desc: 'BDA profiles, language-based auto-assign, calling data dashboard, performance metrics',
    status: 'active', priority: 'high',
    pipeline: ['Lead enters unassigned pool', 'Language detected → BDA auto-assigned', 'BDA views lead in their queue → calls', 'CRM form updated with outcome', 'Call log stored → analytics updated'],
    improve: ['Predictive dialer integration (auto-dial next lead)', 'Callback scheduling from BDA dashboard', 'Call recording + auto-transcript', 'BDA performance leaderboard', 'SLA alert: lead uncontacted for 24h → escalate'],
  },
  {
    cat: 'admin', catLabel: 'Admin', feat: 'Influencer tracking',
    desc: 'UTM-tracked registration links, performance metrics per influencer, poster analytics',
    status: 'active', priority: 'med',
    pipeline: ['Admin creates UTM link → InfluencerLink stored', 'Influencer shares → traffic lands with UTM', 'Lead registration tagged with UTM source', 'Dashboard aggregates clicks → registrations → conversions'],
    improve: ['Cost-per-lead tracking per influencer', 'Payout calculator based on conversion', 'Time-series performance chart', 'Link expiry date', 'Commission statement PDF for influencer'],
  },
  {
    cat: 'admin', catLabel: 'Admin', feat: 'Bulk export',
    desc: 'Leads, assessments, attendance → CSV/Excel; bulk certificate download as ZIP',
    status: 'active', priority: 'low',
    pipeline: ['Admin sets filters → export triggered', 'Server queries DB → builds CSV/ZIP', 'File streamed as download response'],
    improve: ['Async job for large exports → download link emailed', 'Scheduled exports (daily report to email)', 'Column selector UI', 'Audit log of all exports'],
  },
  {
    cat: 'wa', catLabel: 'WhatsApp ops', feat: 'Campaign messaging',
    desc: 'Gupshup template campaigns, batch send, delivery/read status, DLR webhooks, retry on failure',
    status: 'active', priority: 'high',
    pipeline: ['Admin selects template + target audience', 'Cron or manual trigger → batch built', 'Gupshup API called per message', 'DLR webhook updates delivery status', 'Failed messages → retry group → retry job'],
    improve: ['Send-time optimization (best open-rate hour per user)', 'Template A/B testing with split audience', 'Per-campaign analytics (delivery %, read %, reply %)', 'Opt-out management (STOP keyword → unsubscribe)', 'Rate-limit awareness to avoid Gupshup 429 throttle'],
  },
  {
    cat: 'wa', catLabel: 'WhatsApp ops', feat: 'Inbound chatbot',
    desc: 'Menu-driven replies, 24h session context, RAG knowledge search, LLM response, language detection',
    status: 'active', priority: 'high',
    pipeline: ['Inbound WhatsApp → Gupshup webhook', 'Session lookup in WhatsAppBotState', 'Language detected (franc) → translated to EN', 'Knowledge base vector + keyword search', 'LLM generates response → translated back', 'Reply sent via Gupshup outbound API'],
    improve: ['Human handoff with full context preservation to BDA', 'Structured escalation menu', 'Response quality feedback (thumbs up/down)', 'Multi-turn memory beyond 24h for returning users'],
  },
  {
    cat: 'wa', catLabel: 'WhatsApp ops', feat: 'Ops monitoring',
    desc: 'Message logs, failure tracking, retry groups, manual recovery, cron status, webhook events',
    status: 'active', priority: 'med',
    pipeline: ['Every message event → WhatsAppMessageEvent logged', 'Failed delivery → failure record created', 'Retry group assembled → retry cron runs', 'Admin views ops dashboard → manual recovery if needed'],
    improve: ['Real-time ops dashboard with live message throughput', 'Alerting on failure rate spike (Slack webhook)', 'Auto-pause campaign on error threshold (>20% failure)', 'Daily ops health summary email to admin'],
  },
  {
    cat: 'ai', catLabel: 'AI / Chatbot', feat: 'Knowledge assistant (RAG)',
    desc: 'RAG-based QA on IIT/career topics; hybrid keyword + vector search; KnowledgeChunk model',
    status: 'active', priority: 'high',
    pipeline: ['User query received', 'Query embedded via OpenAI embeddings API', 'Vector + keyword hybrid search on KnowledgeChunk', 'Top-N chunks selected and ranked', 'Injected into LLM prompt → response generated'],
    improve: ['Add cross-encoder re-ranking for better chunk selection', 'Auto-refresh KB from new blog posts published', 'Citations in responses (source chunk reference)', 'Confidence score threshold — low confidence → human escalation', 'Admin UI to add/edit/delete KB documents'],
  },
  {
    cat: 'ai', catLabel: 'AI / Chatbot', feat: 'Multilingual support',
    desc: 'Auto-detect language (franc), translate to English, LLM processes, translate response back',
    status: 'active', priority: 'med',
    pipeline: ['Message received → franc language detection', 'If non-English: OpenAI/NVIDIA translate to EN', 'LLM processes English query', 'Response translated back to detected language', 'Final response sent to user'],
    improve: ['Use dedicated translation API (DeepL or Google Translate) for accuracy', 'Cache translations for common queries', 'Expand: Tamil, Bengali, Marathi support', 'Language confidence threshold — low confidence → ask user to clarify'],
  },
  {
    cat: 'ai', catLabel: 'AI / Chatbot', feat: 'IIT counselling LLM expert',
    desc: 'JoSAA, CSAB, seat allocation guidance; branch vs college trade-off analysis; rank-aware',
    status: 'active', priority: 'high',
    pipeline: ['Student query → IIT-specific system prompt loaded', 'Student rank + preferences injected as context', 'RAG retrieves JoSAA/CSAB specific chunks', 'LLM generates personalised counselling response'],
    improve: ['Structured JoSAA round-wise simulation tool', 'Fact-check responses against live cutoff data', 'Add voice interface for accessibility', 'Conversation memory across sessions', 'Post-conversation satisfaction rating'],
  },
  {
    cat: 'int', catLabel: 'Integration', feat: 'MSG91 SMS (OTP)',
    desc: 'SMS OTP delivery for all auth flows; 5-min expiry; resend support',
    status: 'active', priority: 'med',
    pipeline: ['Server requests OTP send via MSG91 REST API', 'OTP generated, hashed, stored with expiry', 'SMS delivered to user\'s phone', 'User enters OTP → server verifies → JWT issued', 'OTP record deleted'],
    improve: ['WhatsApp OTP as fallback when SMS fails', 'Monitor delivery rate dashboard', 'Alert on MSG91 downtime', 'Support international numbers', 'Rate limit OTP requests per phone number'],
  },
  {
    cat: 'int', catLabel: 'Integration', feat: 'Gupshup WhatsApp',
    desc: 'Outbound/inbound messaging, chatbot, templates, DLR webhooks — all WA comms run through Gupshup',
    status: 'active', priority: 'high',
    pipeline: ['Server calls Gupshup REST API with template + params', 'Gupshup delivers to WhatsApp', 'Delivery receipt (DLR) webhook fires back', 'WhatsAppMessageEvent updated with status', 'Inbound replies routed to chatbot webhook'],
    improve: ['Failover to secondary WhatsApp provider', 'Monitor API quota and alert at 80% usage', 'Rate limiting to avoid 429 errors', 'Migrate to WhatsApp Cloud API direct (cost saving)', 'Webhook signature validation (security)'],
  },
  {
    cat: 'int', catLabel: 'Integration', feat: 'OSVI AI voice calls',
    desc: 'Outbound reminder/reactivation calls; call logs, outcome tagging, IIT-specific records',
    status: 'active', priority: 'med',
    pipeline: ['Cron identifies target leads (abandoned, no-show)', 'OSVI API called with phone + script ID', 'Voice call placed → outcome captured via webhook', 'AiCallReminder + AiCallReminderActivity updated', 'Failed/no-answer → retry queue or BDA escalation'],
    improve: ['Dynamic call script per lead pipeline stage', 'Post-call transcript analysis', 'A/B test call scripts', 'Avoid DND hours — schedule calls 10AM–7PM only', 'SMS fallback after 3 unanswered calls'],
  },
  {
    cat: 'int', catLabel: 'Integration', feat: 'Google Sheets sync',
    desc: 'Real-time form response sync via service account; training feedback + assessment data pushed',
    status: 'active', priority: 'low',
    pipeline: ['Form submitted → saved to MongoDB', 'Google Sheets API called → row appended', 'Ops team views and acts on sheet data'],
    improve: ['Retry with exponential backoff on Sheets API failure', 'Move to BigQuery for scale and SQL queries', 'Column mapping config (avoid hardcoded column indices)', 'Bidirectional sync — sheet edits update DB'],
  },
  {
    cat: 'int', catLabel: 'Integration', feat: 'NW Predictors / EarlyWave',
    desc: 'College predictor data API for 5+ entrance exams; used in student and counsellor tools',
    status: 'active', priority: 'high',
    pipeline: ['Tool receives rank + exam + category input', 'NW Predictors REST API called', 'JSON response validated and parsed', 'Filtered/sorted college list rendered'],
    improve: ['Cache responses with 24h TTL to reduce API costs', 'Internal fallback dataset when API is down', 'Response schema validation — catch breaking changes early', 'Track API latency + error rate in admin'],
  },
  {
    cat: 'int', catLabel: 'Integration', feat: 'Google OAuth2',
    desc: 'Planned: counsellor sign-up via Google account to reduce onboarding friction',
    status: 'planned', priority: 'high',
    pipeline: ["User clicks 'Sign in with Google'", 'OAuth2 flow → Google returns ID token', 'Server validates token → creates/links account', 'JWT issued → session started'],
    improve: ['Implement immediately — highest friction reducer for counsellor onboarding', 'Extend to student workspace and BDA portal', 'Merge with phone OTP: link Google account to existing phone-verified account', 'Add Apple Sign-In for iOS users'],
  },
];

const CAT_COLORS = {
  student: { bg: '#E6F1FB', text: '#0C447C' },
  tools:   { bg: '#EEEDFE', text: '#3C3489' },
  iit:     { bg: '#E1F5EE', text: '#085041' },
  oneon:   { bg: '#FAECE7', text: '#712B13' },
  webinar: { bg: '#FAEEDA', text: '#633806' },
  training:{ bg: '#FBEAF0', text: '#72243E' },
  portal:  { bg: '#EAF3DE', text: '#27500A' },
  admin:   { bg: '#F1EFE8', text: '#444441' },
  wa:      { bg: '#E1F5EE', text: '#085041' },
  ai:      { bg: '#EEEDFE', text: '#3C3489' },
  int:     { bg: '#E6F1FB', text: '#185FA5' },
};

const PRIORITY_STYLES = {
  high: { bg: '#FCEBEB', text: '#A32D2D', label: 'High priority' },
  med:  { bg: '#FAEEDA', text: '#633806', label: 'Medium' },
  low:  { bg: '#EAF3DE', text: '#27500A', label: 'Low' },
};

const STATUS_STYLES = {
  active:  { bg: '#EAF3DE', text: '#27500A', label: 'Active' },
  planned: { bg: '#FAEEDA', text: '#633806', label: 'Planned' },
  wip:     { bg: '#E6F1FB', text: '#0C447C', label: 'WIP' },
};

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'student', label: 'Student' },
  { key: 'tools', label: 'Predictive' },
  { key: 'iit', label: 'IIT' },
  { key: 'oneon', label: '1-on-1' },
  { key: 'webinar', label: 'Webinar' },
  { key: 'training', label: 'Training' },
  { key: 'portal', label: 'Counsellor' },
  { key: 'admin', label: 'Admin' },
  { key: 'ai', label: 'AI' },
  { key: 'wa', label: 'WhatsApp' },
  { key: 'int', label: 'Integrations' },
];

function Badge({ bg, text, label }) {
  return (
    <span style={{ background: bg, color: text }} className="inline-block text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
      {label}
    </span>
  );
}

function FeatureCard({ d }) {
  const [open, setOpen] = useState(false);
  const catStyle = CAT_COLORS[d.cat] || CAT_COLORS.admin;
  const priorityStyle = PRIORITY_STYLES[d.priority];
  const statusStyle = STATUS_STYLES[d.status] || STATUS_STYLES.active;

  return (
    <div className="border border-gray-100 rounded-xl bg-white mb-2 overflow-hidden hover:border-gray-200 transition-colors">
      <button
        className="w-full text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="grid items-stretch" style={{ gridTemplateColumns: '160px 1fr 190px 110px' }}>
          <div className="px-3 py-3 flex items-start border-r border-gray-100">
            <Badge bg={catStyle.bg} text={catStyle.text} label={d.catLabel} />
          </div>
          <div className="px-3 py-3 flex flex-col gap-1 border-r border-gray-100">
            <span className="font-medium text-[12.5px] text-gray-900">{d.feat}</span>
            <span className="text-[11.5px] text-gray-400 leading-relaxed line-clamp-2">{d.desc}</span>
          </div>
          <div className="px-3 py-3 flex flex-col gap-1.5 border-r border-gray-100">
            <Badge bg={statusStyle.bg} text={statusStyle.text} label={statusStyle.label} />
            <Badge bg={priorityStyle.bg} text={priorityStyle.text} label={priorityStyle.label} />
          </div>
          <div className="px-3 py-3 flex items-center justify-end gap-1.5 text-gray-400 text-[11px]">
            <span>{open ? 'collapse' : 'expand'}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="p-4 border-r border-gray-100">
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              Details
            </div>
            <p className="text-[12px] text-gray-500 leading-relaxed">{d.desc}</p>
          </div>
          <div className="p-4 border-r border-gray-100">
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Pipeline / flow
            </div>
            <div className="flex flex-col gap-1.5">
              {d.pipeline.map((step, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-[11.5px] text-gray-500 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4">
            <div className="text-[10px] font-medium uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Improvement areas
            </div>
            <div className="flex flex-col gap-1.5">
              {d.improve.map((imp, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  <span className="text-[11.5px] leading-relaxed" style={{ color: '#854F0B' }}>{imp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FeaturesPage() {
  const [activeCat, setActiveCat] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return DATA.filter(d => {
      const catMatch = activeCat === 'all' || d.cat === activeCat;
      const textMatch = !q || [d.feat, d.desc, d.catLabel, ...d.pipeline, ...d.improve].join(' ').toLowerCase().includes(q);
      return catMatch && textMatch;
    });
  }, [activeCat, query]);

  const groups = useMemo(() => {
    const g = {};
    filtered.forEach(d => {
      if (!g[d.cat]) g[d.cat] = { label: d.catLabel, items: [] };
      g[d.cat].items.push(d);
    });
    return g;
  }, [filtered]);

  const stats = useMemo(() => ({
    total: DATA.length,
    active: DATA.filter(d => d.status === 'active').length,
    planned: DATA.filter(d => d.status === 'planned').length,
    high: DATA.filter(d => d.priority === 'high').length,
  }), []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-white border-b border-gray-100 px-8 pt-8 pb-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-medium text-gray-900 tracking-tight">GuideXpert — Feature Audit</h1>
          <p className="mt-1 text-sm text-gray-400 max-w-2xl leading-relaxed">
            Complete breakdown of every feature, its step-by-step pipeline, and actionable improvement areas. Click any row to expand.
          </p>
          <div className="flex gap-3 mt-5 flex-wrap">
            {[
              { num: stats.total, label: 'Total features' },
              { num: 11, label: 'Modules' },
              { num: stats.active, label: 'Active' },
              { num: stats.planned, label: 'Planned' },
              { num: stats.high, label: 'High priority' },
              { num: 74, label: 'DB models' },
              { num: 7, label: 'Integrations' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-lg px-4 py-2 flex flex-col gap-0.5">
                <span className="text-xl font-medium text-gray-900">{s.num}</span>
                <span className="text-[11px] text-gray-400">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white border-b border-gray-100 px-8 py-3 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex gap-3 flex-wrap items-center">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 min-w-[200px] flex-1 max-w-xs">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              className="bg-transparent outline-none text-xs text-gray-700 w-full placeholder-gray-400"
              placeholder="Search features, pipelines, improvements…"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="w-px h-5 bg-gray-200" />
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setActiveCat(f.key)}
                className={`px-3 py-1 text-[11px] font-medium rounded-full border transition-all whitespace-nowrap ${
                  activeCat === f.key
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-transparent text-gray-500 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="ml-auto text-[11px] text-gray-400 whitespace-nowrap">{filtered.length} feature{filtered.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm">No features match your search.</div>
        ) : (
          Object.keys(groups).map(cat => {
            const g = groups[cat];
            const catStyle = CAT_COLORS[cat] || CAT_COLORS.admin;
            return (
              <div key={cat} className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Badge bg={catStyle.bg} text={catStyle.text} label={g.label} />
                  <span className="text-[11px] text-gray-400">{g.items.length} feature{g.items.length !== 1 ? 's' : ''}</span>
                </div>
                <div>
                  {/* Table header */}
                  <div className="grid text-[11px] font-medium text-gray-400 px-0 mb-1" style={{ gridTemplateColumns: '160px 1fr 190px 110px' }}>
                    <div className="px-3">Category</div>
                    <div className="px-3">Feature</div>
                    <div className="px-3">Status</div>
                    <div className="px-3 text-right">Action</div>
                  </div>
                  {g.items.map((d, i) => <FeatureCard key={i} d={d} />)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
