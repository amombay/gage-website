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
      {"reviewed": true, "src": "assets/media/gage-factory-motion-studio-poster.png", "video": "assets/media/gage-factory-pick-inspect-place-studio.mp4", "title": "Robot pick, inspect and place", "alt": "Rendered CAD view of the yellow robot holding a green workpiece over the inspection nest between two conveyors.", "caption": "Follow the workpiece through pickup, inspection and placement. This CAD replay uses all 281 poses checked in SolidWorks and hides the guards and cabinet for visibility.", "width": 1600, "height": 900},
      {
        reviewed: true,
        src: 'assets/media/gage-factory-inspection-line.png',
        title: 'Robotic pallet inspection cell',
        alt: 'SolidWorks assembly with a yellow robot, parallel gripper, twin roller stations, inspection fixture, and partial guarding.',
        caption: 'A fixed-pose factory layout with two roller stations, a pallet fixture, and a new robot and gripper. Station placement persisted on reopen, with zero solid interferences in the saved pose.',
        width: 1920,
        height: 1440
      },
      {"reviewed": true, "src": "assets/media/gage-factory-assembly-exploded.png", "pdf": "assets/media/gage-factory-assembly-bom.pdf", "title": "Factory assembly exploded view", "alt": "Three exploded illustrations showing the robot and gripper, both conveyor stations, and the guarding, inspection fixture, and controls with numbered callouts.", "caption": "44 part callouts match the 38 verified BOM items. The three panels use geometry and placements from the saved SolidWorks assembly, with offsets to show individual parts.", "width": 2600, "height": 3060},
      {"reviewed": true, "src": "assets/media/gage-factory-assembly-bom.png", "pdf": "assets/media/gage-factory-assembly-bom.pdf", "title": "Factory assembly bill of materials", "alt": "Two-column parts-only bill of materials for the robotic pallet inspection cell, with part names, configurations, and quantities.", "caption": "38 BOM rows account for 44 part instances. Quantities match both the SolidWorks component tree and the flat occurrence list.", "width": 2400, "height": 1697},
      {"reviewed": true, "src": "assets/media/gage-inspection-cell-drawing.png", "title": "Inspection cell layout drawing", "alt": "A3 drawing with front, top, and isometric views of the factory inspection cell.", "caption": "SolidWorks A3 layout drawing at 1:50. The saved drawing passed its reopen check.", "width": 1786, "height": 1263},
      {"reviewed": true, "src": "assets/media/gage-gripper-jaw-drawing.png", "title": "Gripper jaw drawing", "alt": "A4 drawing with front, top, right, and isometric views of the left jaw.", "caption": "SolidWorks A4 reference drawing for the left gripper jaw at 1:2. The saved drawing passed its reopen check.", "width": 893, "height": 1263},
      {"reviewed": true, "src": "assets/media/gage-gripper-jaw-stress.png", "title": "100 N gripper jaw study", "alt": "SolidWorks von Mises stress plot showing a distributed load and fixed mount on the gripper jaw.", "caption": "Linear static AISI 1020 jaw study with a fixed mounting face and a 100 N distributed load. Peak stress was about 1.21 MPa on the 3 mm mesh.", "width": 1600, "height": 1000},
      {
        reviewed: true,
        src: 'assets/media/gage-roller-cassette.png',
        title: 'Roller conveyor cassette',
        alt: 'Five silver rollers seated in a blue conveyor frame, with exposed axle journals and rail mounting bores.',
        caption: 'A 440 mm factory transfer module with five machined rollers, integral axle journals, and a bored mounting frame. SolidWorks reported zero interference in the saved pose.',
        width: 1600,
        height: 1200
      },
      {
        reviewed: true,
        src: 'assets/media/gage-pallet-inspection-nest.png',
        title: 'Pallet inspection nest',
        alt: 'Blue SolidWorks fixture plate with three round seating pads, two locating shoulders, and four mounting bores.',
        caption: 'Factory tooling for a 160 × 140 mm pallet. Three raised pads establish the seating plane and two shoulders locate the pallet edges. Captured in SolidWorks.',
        width: 1600,
        height: 1200
      },
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
