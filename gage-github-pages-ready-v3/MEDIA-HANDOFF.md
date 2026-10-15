# Authentic media handoff

## Final status: parent_browser_review_passed

Parent completed desktop full playback, visible English captions and Space
restart/pause checks. Desktop max-height is 504px at a 720px viewport; contain
preserves framing. Mobile 390px had no DOM overflow (375/375) and a 337×252.75px
contained video. Viewport reset to 1280×720 verified. Final screenshots remain
parent-owned. Earlier pending statuses below are superseded; source/media frozen.
All media bytes and hashes unchanged. No publication or broad qualification claim.

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

## Current status: video temporarily disabled

Parent browser QA found the model's right edge clipped at approximately 4.7 seconds.
`config.js` sets demo `reviewed: false`; the existing loader creates no player or
video requests. All three approved gallery images remain enabled. The 30-second
playback, keyboard controls and captions loaded successfully in parent QA, but
framing failed. Capture/camera drift is suspected; no native diagnosis is claimed.
A newly reviewed capture is required before re-enabling. Current media bytes,
hashes and initial review metadata are retained unchanged as historical evidence.
No publication is authorized. Earlier approval/enable records below are superseded
by this status.

## Enabled approved package

The parent approved these real assets and six encoded frames across the whole clip.
`config.js` now enables the existing native player and three gallery images.
No media content was changed during integration; delivered SHA-256 hashes are tested.

- **Native CAD model inspection** — 100×60×5 mm plate, four 8 mm holes.
  Camera animation captured from SolidWorks after prepared-spec build. No chat conversion filmed.
- `assets/media/gage-demo.mp4`: 1280×960, 30 seconds. 120 actual native SaveBMP
  captures at 4 fps, repeated for 24 fps playback. Not a window recording;
  no generated geometry, interpolated imagery or filmed chat conversion.
- `poster.jpg`, `gage-demo.en.vtt`, `gage-demo-transcript.txt`: supplied approved
  poster, English captions and transcript. Academic software and absence of an
  assigned physical material are disclosed in the transcript.
- `gage-native-plate.png`: unaltered full native viewport capture added to gallery.
- Existing thermal benchmark and A4 ordinate drawing remain unchanged, with
  educational watermarks, full frames and the thermal legend retained.

Parent verified before/after 100×60×5 mm dimensions, four Ø8 through-holes at
X ±35 mm / Y ±20 mm, net volume and unchanged geometry. That bounded evidence
is independent of website tests and does not establish advanced solver qualification.

## Provenance

- `assets/media/native-demo-provenance.json`: sanitized parent-supplied capture
  metadata and hashes; no private host paths or process IDs.
- `assets/media/provenance.json`: gallery hashes and package status.
- `media-review/native-turntable.reviewed.json`: completed handoff metadata.
- `media-review/native-turntable.schema.json`: metadata contract; capture date is
  a date, preserving the supplied precision rather than inventing a timestamp.
- `media-review/native-turntable.pending.json`: historical request, retained unchanged.

Playback repeats actual frames; it does not synthesize intermediate camera images.
The parent retained full model framing. The plate image has no added watermark;
academic software context is explicitly provided in the transcript.

## Behavior and remaining browser QA

Images and video use `object-fit: contain`. Original-size image links remain available.
The existing player requires loaded metadata, poster, valid VTT and transcript before
revealing the demo. It has native controls, starts muted, never autoplays or loops,
and uses metadata-only video preload. No remote embed or tracking was added.

Parent: inspect playback, poster, captions/timing, transcript link, keyboard controls,
full-frame display and desktop/mobile layout at http://127.0.0.1:8765/.
Existing desktop/mobile QA preceded this video integration. No new browser automation
was performed by the website helper. Fresh Gage panel screenshots remain pending.

## Offline checks

```powershell
node --test tests/site.test.cjs
python -m unittest discover -s tests -p "test_*.py" -v
node --check script.js
node --check config.js
```

No publication, push, deployment, submissions, installs or native CAD actions.
