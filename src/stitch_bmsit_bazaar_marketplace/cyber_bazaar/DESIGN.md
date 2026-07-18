---
name: Cyber-Bazaar
colors:
  surface: '#131315'
  surface-dim: '#131315'
  surface-bright: '#39393b'
  surface-container-lowest: '#0e0e10'
  surface-container-low: '#1c1b1d'
  surface-container: '#201f22'
  surface-container-high: '#2a2a2c'
  surface-container-highest: '#353437'
  on-surface: '#e5e1e4'
  on-surface-variant: '#d1c6ab'
  inverse-surface: '#e5e1e4'
  inverse-on-surface: '#313032'
  outline: '#9a9078'
  outline-variant: '#4d4632'
  surface-tint: '#eec200'
  primary: '#ffecb9'
  on-primary: '#3c2f00'
  primary-container: '#facc15'
  on-primary-container: '#6c5700'
  inverse-primary: '#735c00'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#c7f5ff'
  on-tertiary: '#00363e'
  tertiary-container: '#33e4ff'
  on-tertiary-container: '#006270'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe083'
  primary-fixed-dim: '#eec200'
  on-primary-fixed: '#231b00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#a0efff'
  tertiary-fixed-dim: '#15daf4'
  on-tertiary-fixed: '#001f25'
  on-tertiary-fixed-variant: '#004e59'
  background: '#131315'
  on-background: '#e5e1e4'
  surface-variant: '#353437'
  surface-base: '#18181b'
  border-low-light: rgba(255, 255, 255, 0.05)
  neon-yellow-glow: rgba(250, 204, 21, 0.4)
  background-accent: '#1e1b4b'
typography:
  display-lg:
    fontFamily: Syne
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Syne
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-lg-mobile:
    fontFamily: Syne
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Syne
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Outfit
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Outfit
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Outfit
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system for this exclusive student marketplace is built on a "Premium Tech" aesthetic, blending ultra-sleek dark mode elements with high-energy cyberpunk accents. It targets a tech-savvy student demographic, evoking a sense of exclusivity, speed, and futuristic commerce.

The visual style is a hybrid of **Minimalism** and **Glassmorphism**, featuring pitch-dark surfaces contrasted by vibrant, glowing interactive elements. The interface uses high-quality geometric typography and subtle atmospheric effects (like background orbs) to create depth without clutter. The vibe is sophisticated yet energetic, moving away from traditional academic layouts toward a high-end streetwear or gaming marketplace feel.

## Colors
The palette is anchored by "Pitch-Dark Charcoal" for the primary background, ensuring absolute contrast for the accent colors. 

- **Primary (Neon Cyberpunk Yellow):** Reserved for core Actions, CTAs, and active navigation states. It should feel like it's "glowing" against the dark background.
- **Secondary (Emerald Green):** Used exclusively for "Live" status indicators, price drops, and success states.
- **Surface Strategy:** Surfaces use a deep charcoal/grey with 60% opacity and a heavy backdrop blur (`backdrop-blur-xl`) to create a frosted glass effect that reveals subtle background gradients.
- **Borders:** Extremely subtle white borders at 5% opacity define the structure of glass containers.

## Typography
The typography system relies on a high-contrast pairing: 
- **Headlines:** Uses "Syne" for an avant-garde, geometric feel. Extra-bold weights and tight letter-spacing are used for large display text to emphasize the "exclusive" nature of the marketplace.
- **Body & UI:** Uses "Outfit" for its clean, circular terminals and excellent legibility. It provides a technical, contemporary feel that complements the glassmorphic UI.
- **Labels:** Small labels and metadata should use uppercase with slight tracking (letter-spacing) to maintain a systematic, data-driven appearance.

## Layout & Spacing
The layout follows a **fluid grid system** with 12 columns for desktop and 4 columns for mobile. 

- **Grid:** Use a 24px gutter to allow the glassmorphic cards breathing room. 
- **Rhythm:** An 8px base unit drives all padding and margin decisions. 
- **Background Orbs:** Position 2-3 large, low-opacity blurred radial gradients (in dark indigo or muted gold) behind the main content area to provide a sense of atmospheric depth. These should remain fixed during scroll.
- **Margins:** Mobile layouts should use 16px side margins, while desktop utilizes wider 40px margins to feel more expansive and premium.

## Elevation & Depth
Depth is not communicated through traditional drop shadows but through **optical layering and translucency**.

1.  **Level 0 (Background):** Solid #09090b with subtle radial gradients.
2.  **Level 1 (Cards/Panels):** #18181b at 60% opacity + 24px backdrop-blur + 1px border (#ffffff 5%).
3.  **Level 2 (Modals/Popovers):** #1c1c21 at 80% opacity + 40px backdrop-blur + 1px border (#ffffff 10%).
4.  **Interaction Glow:** Focused elements or active CTAs utilize a `0px 0px 20px` outer glow using the Neon Yellow primary color at 30% opacity.

## Shapes
The shape language is "Soft-Sharp." While the background containers are strictly geometric, interactive elements use a subtle 0.25rem (4px) radius to maintain a professional, tech-oriented look without feeling overly aggressive.

- **Primary Containers:** 4px radius (`rounded-sm`).
- **Media/Images:** Can utilize slightly larger 8px radius (`rounded-lg`) to distinguish content from the UI framework.
- **CTAs:** Consistent 4px radius; avoid pill-shapes to stay within the cyberpunk/tech aesthetic.

## Components
- **Buttons:** Primary buttons use a solid Neon Yellow background with black Syne-bold text. They should feature a subtle outer glow on hover. Secondary buttons use a transparent background with a 1px white/10 border.
- **Chips/Badges:** Small, rectangular badges with a high-contrast background (e.g., Emerald Green for "Live") and 12px Outfit-bold text.
- **Input Fields:** Darker than the surface (#09090b), with a 1px border that brightens to Neon Yellow on focus. The cursor should also be themed yellow.
- **Cards:** The hallmark of the design. Use the glassmorphism variables (60% opacity + blur). Product images inside cards should have a "de-saturated" filter that returns to full color on hover.
- **Live Status Indicator:** A small Emerald Green dot with a "ping" animation (scaling outward) to indicate real-time listings.
- **Lists:** Clean rows separated by 1px borders at 5% opacity. No alternating row colors; use hover-state brightness shifts instead.