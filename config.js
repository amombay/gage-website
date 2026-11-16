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
  // Public gallery: reviewed assets from the factory project.
  media: {
    gallery: [
      {"reviewed": true, "src": "assets/media/gage-factory-one-shot-poster.png", "video": "assets/media/gage-factory-one-shot-loop.mp4", "revision": "20261116-timed-handoffs", "title": "Factory cycle: convey, pick, inspect and place", "alt": "A gray carrier brings a green workpiece into the cell as the yellow robot approaches.", "caption": "Each carrier stops for pickup or placement and rolls away after the gripper clears. The robot returns directly to the infeed and waits above the next carrier. Transfers and return timing are animated over the CAD replay.", "width": 1600, "height": 900},
      {"reviewed": true, "src": "assets/media/gage-roller-conveyor-transfer-poster.png", "video": "assets/media/gage-roller-conveyor-transfer.mp4", "title": "Roller conveyor transfer", "alt": "Five polished rollers guide a gray carrier with a green workpiece across a blue conveyor cassette.", "caption": "A close-up of the infeed and outfeed cassettes from the factory cell. Each shot illustrates 270 mm of carrier travel with synchronized roller rotation.", "width": 1600, "height": 900},
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
    ],
    demo: null
  }
};
