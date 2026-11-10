/**
 * GAGE PUBLIC WEBSITE CONFIGURATION
 * Form submissions require a provider. Create a form at https://formspree.io/
 * and paste its publicly shareable HTTPS endpoint below.
 * Example: formEndpoint: 'https://formspree.io/f/abcdefgh'
 *
 * Leave blank for a mailto fallback: users must review and SEND their email.
 * Do not add API secrets or private tokens to this static public file.
 */
window.GAGE_CONFIG = {
  formEndpoint: '',
  contactEmail: 'andrew_mombay@brown.edu',
  // Parent-reviewed authentic captures only. See MEDIA-HANDOFF.md.
  // Reviewed SolidWorks captures and a native viewport recording.
  media: {
    gallery: [
      {
        reviewed: true,
        src: 'assets/media/gage-industrial-robot-arm.png',
        title: 'Industrial robotic arm',
        alt: 'Isometric SolidWorks view of a blue and graphite robot arm with stepped joint covers and a silver two-finger gripper.',
        caption: 'Five-part robot arm in a fixed display pose, with shaped links, stepped joint covers and a tapered gripper. Captured in SolidWorks.',
        width: 1600,
        height: 1200
      },
      {
        reviewed: true,
        src: 'assets/media/thermal-development-benchmark.png',
        title: 'Thermal plate development benchmark',
        alt: 'Actual SOLIDWORKS thermal plate plot with a blue-to-red Kelvin legend and the Educational Product watermark.',
        caption: 'Native thermal plate benchmark, 293.15–373.15 K. Captured from our SOLIDWORKS development build.',
        width: 1214,
        height: 643
      },
      {
        reviewed: true,
        src: 'assets/media/ordinate-drawing-example.png',
        title: 'A4 ordinate drawing example',
        alt: 'Actual exported A4 plate drawing with ordinate dimensions from zero to 200 mm, title block, and Educational Product watermark.',
        caption: 'A4 plate export with a 200 mm ordinate dimension.',
        width: 993,
        height: 1404
      },
      {
        "reviewed": true,
        "src": "assets/media/gage-native-plate.png",
        "title": "Native plate inspection",
        "alt": "Actual SOLIDWORKS viewport capture showing the full rectangular plate, its thickness and four through-holes.",
        "caption": "100×60×5 mm plate with four 8 mm through-holes, captured from the native SOLIDWORKS viewport.",
        "width": 1280,
        "height": 960
      }
    ],
    demo: {
      "reviewed": true,
      "src": "assets/media/gage-demo.mp4",
      "poster": "assets/media/poster.jpg",
      "captions": "assets/media/gage-demo.en.vtt",
      "transcript": "assets/media/gage-demo-transcript.txt",
      "title": "Native CAD model inspection",
      "caption": "100×60×5 mm plate, four 8 mm holes. Camera animation captured from SolidWorks after prepared-spec build. No chat conversion filmed.",
      "width": 1280,
      "height": 960
    }
  }
};
