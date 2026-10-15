# Local website QA record

## Final V2 parent browser QA — passed

Parent confirmed the cache-busted desktop player at 1280×720: computed max-height
504px and object-fit contain. The full 30-second clip played to ended; English
captions were visible, and Space restarted/paused playback successfully.
At the 390px mobile viewport, DOM clientWidth and scrollWidth were both 375px
(no horizontal overflow); video measured 337×252.75px with contain. Parent reset
the viewport to 1280×720 and verified the reset. Final screenshots are parent-pending.

Public provenance status: parent_browser_review_passed. All five delivered media
hashes remain unchanged. Focused frozen scope: 13 Node + 11 Python checks (24 total).
These observations cover this local website/player and this bounded prepared-spec
native inspection clip, not a full accessibility audit or advanced solver qualification.
Earlier browser-pending/disabled notes below are historical and superseded.
No publication. Media, config, CSS and player code are frozen after this review.

## Current status: V2 enabled locally for parent browser QA

Parent approved the replacement V2 files after screening all 120 native frames
with a 48 px boundary and visually reviewing 12 encoded samples across 30 seconds.
Recenter/zoom margin was applied per frame; parent reports no clipping and unchanged
before/after geometry and part hash. This is parent capture evidence, not an
independent website engineering qualification.

Video and poster hashes were checked against the delivered public provenance,
and reviewed metadata updated. Captions/transcript and all three gallery images
remain unchanged. Demo reviewed:true enables the existing player locally.
Parent browser playback/framing/caption/keyboard QA is still pending for V2.
Prior clipping/disabled records below refer to the superseded clip. No publication.

## Current status: video disabled after parent browser QA

Parent found the native model's right edge clipped near 4.7 seconds. Playback
for 30 seconds, keyboard controls and caption loading worked. Demo config is
now reviewed:false; all three approved gallery images remain enabled.
Current assets, hashes and original review metadata remain unchanged as history.
Replacement capture and fresh review are required before re-enabling. Earlier
video enablement notes below are superseded. No publication.

Recorded 2026-10-14 (America/New_York), from the parent's actual browser QA
handoff. Preview: `http://127.0.0.1:8765/`. This is a local development record,
not a deployment or a native engineering qualification report.

## Parent-observed browser checks

- Desktop hero and authentic-image gallery inspected: visually good.
- Mobile viewport set to 390px: reported DOM `clientWidth = 375` and
  `scrollWidth = 375`, with no horizontal overflow.
- Mobile navigation expanded; choosing the gallery link closed it correctly.
- Parent reset the viewport after checking.
- The mobile screenshot had unusual capture scaling. It is **not** retained or
  presented as a QA/marketing artifact.
- Parent subsequently saved and reviewed actual browser captures:
  [gallery-desktop.jpg](review/gallery-desktop.jpg) and
  [beta-desktop.jpg](review/beta-desktop.jpg). These are website QA artifacts,
  not CAD qualification evidence. No form was submitted.
- Parent closed the owned preview tab to free RAM. The local server remains
  available; helpers did not reopen or control the browser.

These observations precede the small ARIA relationship correction below.
Website helpers did not perform browser or desktop control.

## Source and offline checks

- Workflow buttons now identify the live preview they update via `aria-controls`;
  its existing polite live announcement remains intact.
- Local links, IDs, label/ARIA targets, heading/main structure and image dimensions
  checked; keyboard menu behavior and media gating tested offline.
- Gallery uses full frames with `object-fit: contain`. Both actual images retain
  educational watermarks and the thermal legend. Captions remain concise;
  preview limits are explained near preview status.
- Authentic media dimensions and hashes are recorded in
  `assets/media/provenance.json`. Thermal BMPâ†’PNG pixels matched; the drawing
  PNG was copied byte-for-byte.
- Latest offline run: **13 JavaScript behavior tests + 9 Python static checks
  passed**, with `node --check` passing for `script.js` and `config.js`.

## Approved media integration — 2026-10-15

Parent approved the 30-second native viewport camera animation and plate capture.
The approved files are enabled through existing config; no media content was edited.
120 actual native captures at 4 fps are repeated for 24 fps playback, not interpolated.
The clip shows prepared-spec model inspection, not chat conversion or a window recording.
The software is an academic build, disclosed in the supplied transcript.
Native geometry evidence is parent supplied, separate from website checks.

## Still pending

- Parent browser QA of the newly enabled video: playback, caption timing, transcript
  link, poster, full model framing, keyboard controls and responsive layout.
- Fresh panel screenshots and broader screen-reader/zoom/forced-colors checks.
- Advanced native qualification remains pending; this is not a solver qualification.

The static server stays available. No publication, form submission, CAD action,
or SolidWorksAI source edit accompanies this record.
