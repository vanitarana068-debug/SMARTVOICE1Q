# SPEC

GOAL:    the viewer recognises the five things the app does and lands on "Simplify Your Billing".
OUTPUT:  HyperFrames, 1920 x 1080, 30 fps
TIME:    28.6 s x 30 = 858 frames. Silent (no music source available).

LOOK:    the person's reference, reproduced: deep navy/blue grounds with a soft lit glow behind the
         product, one colour world per panel:
           S1 hero   ground #050a24 → #0b1650, glow #1d3fd6 at 0.55, accent gradient #3b82f6 → #8b5cf6
           S2 create ground #040b33 → #0a1a6b, glow #2346e8 at 0.6, accent #3b82f6, stamp green #22c55e
           S3 track  ground #031414 → #062a2a, glow #10b981 at 0.35, accent #34d399
           S4 remind ground #0c0a33 → #1e1a6e, glow #7c3aed at 0.45, accent #a78bfa
           S5 paid   ground #021a18 → #053b36, glow #10b981 at 0.45, accent #34d399
         ink #ffffff for titles; body #dbe4ff at 0.86.
         Display: Poppins 700, titles 92 px (8.5% of height), tracking -0.02em, 2 lines, line 1 white,
         line 2 in the panel accent. Body: Inter 400/500, subtitle 40 px, list items 34 px, UI text ≥ 26 px
         where it is meant to be read (KPI values 40 px, table rows 26-28 px).
         Medium: product UI on light cards (white #ffffff, border #e6ebf5, radius 20 px) inside device
         frames (laptop: 14 px charcoal bezel #1b1f2a; phone: 18 px bezel, radius 56 px) — light UI on a
         dark ground is the reference's contrast. Card shadow: 0 40 80 px -20 rgba(0,0,0,0.6).
         App icon: rounded square 30% radius, gradient #38bdf8 → #6366f1 → #8b5cf6, white document + pen.

OBJECTS: laptop with dashboard (sidebar, 3 KPI cards, revenue line chart, 4-row invoice table with
         Paid / Pending / Overdue chips), phone with Create Invoice form, paper invoice with SENT stamp,
         paper plane, Payment Status card, phone with Reminder notification, bar chart with arrow and
         ₹ coin. Status colours: Paid #16a34a on #dcfce7, Pending #c2410c on #ffedd5, Overdue #dc2626 on #fee2e2.

MOTION:  enter expo.out / power4.out; move power2.inOut; exit power3.in; stamp back.out(2.2).
         Titles: per-word blur 6px→0 + opacity, 0.13 s, 0.067 s apart, no translate; landed titles hold still.
         Lists: items 0.08 s apart, check marks draw (stroke) 0.25 s. Numbers count up 0.9 s power2.out.
         Devices arrive 0.7 s expo.out from 140-220 px with horizontal motion blur peaking 10 px.
         Exits 40-50% shorter than entrances.

SHOTS:
  0.0-7.0   S1 hero. Icon springs in, title words blur in, subtitle, 4 feature icons stagger, CTA pill.
            Laptop slides from the right; KPIs count up, chart line draws, table rows and chips arrive.
            Phone rises in front; form fields fill; cursor clicks "Create Invoice" at 5.9 s.
            → ZOOM THROUGH THE BUTTON: the button grows past the frame (6.45-7.0), its blue becomes S2's ground.
  7.0-11.6  S2 create. Title, subtitle, checklist ticks. Invoice swings in tilted -6°, lines populate,
            total counts to ₹12,500, SENT stamp slams (9.6), paper plane flies off on an arc.
            → WHIP: content smears left (11.35-11.6).
  11.6-16.4 S3 track. Content lands from the right sharp. Legend with coloured icons, Payment Status card,
            rows stagger, refresh icon turns once ("Real-time updates"), pill. Overdue chip pulses once.
            → IRIS FROM THE OVERDUE CHIP: S4 opens as a circle from the chip (16.05-16.4).
  16.05-21.0 S4 remind. Title, checklist, phone rises, notification slides down, message lines arrive,
            cursor presses Send Reminder (19.4), paper-plane badge launches, pill with clock.
            → COLOUR FLOOD: ground floods emerald (20.6-21.0).
  21.0-25.4 S5 paid. Emerald recedes, title, checklist, bars grow left→right, arrow draws, ₹ coin pops, pill.
            → DIP CUT: frame darkens 40% for 3 frames, hard cut.
  25.4-28.6 END. App icon lands, "Smart Invoice & Follow-Up App" wipes in, "Simplify Your Billing →"
            button, cursor clicks it at 26.6, hold to 28.6.

BANNED:  floating/pulsing idle loops on titles; titles that move after landing; everything fading in at
         once; every element sliding up; the logo docked in a corner; crossfades between worlds;
         tilting the dashboard in 3D (only the paper invoice tilts, as in the reference).
QA:      1.5 (hero title readable), 5.9 (click), 6.8 (zoom-through mid), 9.8 (stamp), 11.45 (whip),
         14.5 (status table), 16.2 (iris mid), 19.5 (send), 20.8 (flood), 23.8 (chart), 27.0 (end card).
