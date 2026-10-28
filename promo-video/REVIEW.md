# Review

## Creative calls

- The person's 5-panel image is the storyboard: one scene per panel in its order, then an end card.
  Copy, numbers, colours and layout follow the image. No alternative storylines were pitched: the
  request was "this exactly, but moving".
- Transitions, each caused by something on screen (5 kinds):
  hero → create: zoom through the phone's Create Invoice button after the cursor clicks it ·
  create → track: whip left · track → remind: iris from the Overdue chip ·
  remind → paid: emerald colour flood after "Reminder sent" · paid → end: dip cut.
- Dates normalised: the source image's phone and invoice read "2008" / "2036" (image artefacts); both
  use 10 / 30 Aug 2026 here.
- Added one state the image only implies: after the cursor presses Send Reminder, the button turns
  green and reads "Reminder sent".
- The laptop, phone and invoice are the person's marketing mockup (sample data such as ABC Traders),
  not the live SmartInvoice UI, reproduced at their request.

## Measured vs looked at

- `hyperframes check`: passes, no errors.
- Looked at: review beats (12 frames), all 6 cut strips, phone sheet, plus spot frames at the click,
  zoom-through, stamp, iris, flood and end card.
- Fixed in review: phone covered the dashboard's Amount/Status columns (layout rebuilt); a red pulse
  ring showed from the first frame of track (fromTo baseline); KPI counters flashed final values before
  counting; end card too short for its closing line; low contrast on small deltas and invoice meta;
  end-card cursor covering "Billing".
- Not checked: sound — there is none (see below).

## Warnings kept on purpose

- `film_silent` / `audio_none`: no music source is signed in on this machine
  (`hyperframes usage` → unsupported_auth). Ships silent. Add a bed later with `/media-use`
  (`bgm`) or drop an `<audio id="music">` into index.html.
- `text_below_floor`: small UI text inside the laptop dashboard, phone form and invoice — product
  context, as in the reference; the reading text (titles, lists, pills) is 30-100 px.
- `line_unread` on the status chips: the check reads their pop-in bounce and the Overdue pulse as a
  change; every chip stays on screen 3 s or more.
- `gsap_repeated_fromto_without_baseline`: three separate counter proxies, not one element.

## Weakest shot

The first 0.4 s of create (7.0-7.4 s): the purple orb and tile sit alone while the title arrives.
With more time: bring the invoice card in under the zoom-through so the blue resolves straight onto it.
