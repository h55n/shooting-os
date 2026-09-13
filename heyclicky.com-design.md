---
version: alpha
name: Heyclicky
description: A playful, light-on-dark-accent landing page with macOS nostalgia, roomy composition, and soft skeuomorphic UI cues.
colors:
  primary: "#000000"
  secondary: "#626262"
  tertiary: "#0F7FFF"
  neutral: "#F5F5F5"
  surface: "#FFFFFF"
  on-surface: "#000000"
  accent: "#FEEA3D"
  error: "#D92D20"
typography:
  headline-display:
    fontFamily: Inter
    fontSize: 56px
    fontWeight: 500
    lineHeight: 61.6px
    letterSpacing: -1.68px
  headline-lg:
    fontFamily: Inter
    fontSize: 47px
    fontWeight: 500
    lineHeight: 56px
    letterSpacing: -1.08px
  headline-md:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: 500
    lineHeight: 48px
  headline-sm:
    fontFamily: Inter
    fontSize: 33px
    fontWeight: 500
    lineHeight: 40px
  body-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: 500
    lineHeight: 42px
    letterSpacing: -0.84px
  body-md:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 500
    lineHeight: 28px
  body-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 500
    lineHeight: 24px
  label-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 500
    lineHeight: 28px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 500
    lineHeight: 20px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 16px
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 12px
  xl: 18px
  full: 9999px
spacing:
  xs: 2px
  sm: 10px
  md: 18px
  lg: 28px
  xl: 70px
  base: 16px
  gutter: 24px
  margin: 32px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "11px 20px"
    size: "116px"
    height: "40px"
  button-secondary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: "11px 20px"
    size: "116px"
    height: "40px"
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.tertiary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.none}"
    padding: "0px"
  card:
    backgroundColor: "{colors.neutral}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.sm}"
    padding: "8px 4px 4px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-md}"
    rounded: "{rounded.full}"
    padding: "6px 10px"
---

# Heyclicky

## Overview
Heyclicky feels like a cheerful indie product landing page built for curiosity rather than enterprise polish. The tone is playful, nostalgic, and slightly chaotic in a controlled way: lots of floating media, generous white space, and a central CTA cluster that keeps the page from feeling busy. The audience appears to be Mac users and early adopters who enjoy personality, humor, and a handmade visual identity.

## Colors
- **Primary (#000000):** The core ink color used for the logo, headline text, and strong UI contrast. It gives the page its crisp editorial backbone.
- **Secondary (#626262):** A softer gray for subdued chrome, metadata, and secondary borders so the interface doesn’t feel overly heavy.
- **Tertiary (#0F7FFF):** A vivid link blue used for tertiary actions and navigational emphasis. It reads as interactive and familiar without competing with the hero.
- **Neutral (#F5F5F5):** The main canvas tone. This light gray-white background supports the floating desktop-art direction and keeps the collage feeling airy.
- **Surface (#FFFFFF):** Reserved for pure white controls, highlights, and small UI pieces where separation from the neutral background matters.
- **On-surface (#000000):** Primary readable text on light backgrounds, especially for labels, body copy, and iconography.
- **Accent (#FEEA3D):** A bright yellow accent that can be used sparingly for playful highlights, stickers, or notification-like moments.
- **Error (#D92D20):** A utility red for destructive states or warnings; it is not prominent in the screenshot but keeps the system functional.

## Typography
Inter is the defining typeface, giving the page a clean modern base while still feeling friendly and current. Headlines are set in medium weight with tight negative letter spacing, especially the display size, which helps the brand name land with confidence and compactness. Body and label styles also use medium weight, which preserves a cohesive, slightly bold voice instead of a delicate editorial one.

The largest text treatment is `headline-display` for the hero wordmark, while smaller heading levels provide a clear hierarchy for supporting content. `body-lg` is used for the short tagline and carries the same tight spacing seen in the source. Labels and buttons lean on `label-lg` and `label-md`, with no obvious uppercase convention; the system relies more on weight, size, and contrast than on caps-lock styling.

## Layout & Spacing
The layout is a loose, center-weighted composition on a broad canvas, not a strict card grid. The hero content sits in the middle, with media tiles and doodle-like objects orbiting around it to create motion and personality. Spacing feels intentionally sparse overall, but the interface uses small, consistent internal gaps to keep floating elements legible.

The spacing scale should stay rhythmic and simple, anchored by `xs` 2px for micro-adjustments, `sm` 10px and `md` 18px for component breathing room, and `lg` 28px plus `xl` 70px for section-level separation. Cards and media windows use compact padding rather than thick gutters, which preserves the desktop-collage look. Large empty areas are part of the layout system and should be protected rather than filled.

## Elevation & Depth
Depth is subtle and mostly created through soft shadows, borders, and window-like chrome rather than dramatic stacking. The page uses a light, almost flat base, then lifts individual media cards with gentle shadows and thin outlines to mimic draggable desktop windows. The result feels tactile but not heavy.

Buttons and cards can use inset highlights and soft shadowing to suggest a glossy, slightly skeuomorphic Mac aesthetic. Avoid large blurred shadows that would make the interface feel too modern or too corporate; the goal is buoyant separation, not floating glassmorphism. Flat areas are acceptable when the object is intentionally decorative or textual.

## Shapes
The shape language is rounded and friendly, but not excessively pillowy everywhere. Cards and media containers use soft corners, while CTAs are fully pill-shaped to signal action and match the playful system. The overall feel is soft-tech, with enough curvature to feel approachable and enough restraint to keep the layout tidy.

Use `rounded.sm` for media cards, `rounded.md` for inputs, and `rounded.full` for primary and secondary buttons. Large radius values should stay concentrated in interactive elements so the brand feels ergonomic rather than bubbly.

## Components
Buttons are the clearest expression of the brand. `button-primary` should feel like a tactile call-to-action: pill-shaped, compact, medium-weight Inter, and visually energized by contrast. In the source, the primary CTA is strongly emphasized through a glossy treatment and deep tonal separation, so preserve that energetic, clickable presence. `button-secondary` should remain equally compact and pill-shaped but visually calmer than the primary action. `button-tertiary` should be minimal and link-like, used for low-priority actions and inline navigation.

Cards should resemble lightweight floating windows rather than traditional product tiles. Use `card` for media wrappers, thumbnails, and desktop-style panels; keep their borders subtle and their padding tight so the content feels framed, not boxed in. If a card contains video or image content, let the media dominate and use chrome only as a supporting edge.

Inputs should be understated and functional, with clear text contrast and modest rounded corners. They should not feel like bulky form fields; instead, they should align with the page’s lightweight, desktop-native mood. Chips, tags, and small status pills should use simple outlines or quiet fills, with `chip` staying visually secondary to CTAs.

Navigation and utility text should stay minimal and low friction. Any supporting links should use the tertiary blue only when they need to be discovered as actions. Icons and small decorative marks should be crisp and monochrome unless they are intentionally playful accent objects.

## Do's and Don'ts
- Do keep the hero centered and let decorative media float around it with lots of breathing room.
- Do use Inter medium weights for most text so the tone stays confident and cohesive.
- Do preserve pill-shaped primary actions and compact padding for a tactile desktop feel.
- Do use soft shadows and thin outlines to suggest macOS-style windows and depth.
- Don't introduce sharp, angular corners on key controls or cards.
- Don't overload the palette with extra hues; keep black, light neutral, and selective blue/yellow accents dominant.
- Don't make buttons tall or oversized; the source prefers compact, crisp CTAs.
- Don't replace the airy collage layout with a dense grid or heavy container system.
