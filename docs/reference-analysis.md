# Visible reference analysis

The reference was inspected in-browser at 1440 × 900 and 390 × 844 before implementation. No proprietary source, code, or assets were inspected or reused.

## Structure and hierarchy

- The landing page is dominated by one oversized, black-line photo-booth drawing.
- A tall sign, display window, curtains, control panel, and small handwritten annotations establish the physical-booth metaphor.
- Entering the booth replaces the content of its central “screen” rather than navigating to conventional pages.
- Frame arrows and a black-and-white/color toggle appear before the camera/upload selection.
- Camera denial is a plain, centered recovery screen. Upload mode presents four numbered picture slots.

## Visual language

- Background: warm near-white paper.
- Ink: nearly black blue-gray.
- Accent: restrained dark navy in controls; the recreation adds muted rust, cream, pink, and sage for an original identity.
- Borders: 2–8 px black outlines with slight curvature and inconsistent geometry.
- Typography: clean neutral sans serif for controls; casual handwritten lettering for annotations.
- Illustrations: minimal fills, rounded line caps, long imperfect curves, and very little shading.

## Motion and interaction

- Landing-to-booth transition is approximately one second.
- Controls swap inside the booth screen with little ornamental motion.
- Buttons are large outlined rectangles with immediate pressed feedback.
- The recreation keeps interface feedback under 300 ms and reserves longer movement for the one-time booth/printing moments.
- Reduced-motion mode removes travel and wobble while preserving fades and state feedback.

## Responsive observations

- The reference scales its booth but still overflows horizontally at 390 px.
- The recreation keeps the same “physical object” idea but stacks content, reduces type, uses safe-area padding, and prevents horizontal overflow from 320 px upward.

## Implementation checklist

- [x] Original brand, copy, SVG illustration, icons, and palette
- [x] Landing and method selection
- [x] Camera privacy gate and designed camera error recovery
- [x] Mirrored live preview with non-mirrored capture
- [x] Four-photo 3–2–1 sequence, flash, feedback, and progress
- [x] Four-image uploader with validation, replacement, removal, and reorder
- [x] Five Canvas-backed filters
- [x] Six frames and live strip preview
- [x] Footer, date, and brand controls
- [x] Animated printer with optional synthesized sound
- [x] PNG/JPEG strip exports and individual-photo exports
- [x] Web Share API with clipboard fallback
- [x] Scissors guides plus keyboard/touch buttons
- [x] Responsive, focus-visible, reduced-motion, and ARIA behavior
- [x] Unit and Playwright coverage
