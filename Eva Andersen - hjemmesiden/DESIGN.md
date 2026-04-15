# Design System Document: The Serene Editorial

## 1. Overview & Creative North Star
**Creative North Star: The Digital Sanctuary**
This design system moves away from the aggressive "optimization-first" look of standard SaaS landing pages. Instead, it adopts a high-end editorial approach—think of a premium wellness publication or a luxury Nordic spa. We prioritize the user's mental state: calm, focused, and respected. 

To achieve this, we break the "template" look through **Intentional Negative Space** and **Asymmetrical Balance**. We do not center everything; we use generous, sweeping margins and offset typography to create a sense of rhythm and breathing room. The goal is to make the user feel like they are "entering" a space rather than just scrolling a page.

---

## 2. Colors & Tonal Depth
The palette is rooted in a Nordic landscape: mossy greens, weathered stone, and warm linen. 

### The "No-Line" Rule
**Explicit Instruction:** Designers are prohibited from using 1px solid borders for sectioning. Boundaries between content sections must be defined solely through background color shifts. For example, a section using `surface-container-low` should sit directly against a `surface` background. This creates a "soft edge" that feels organic and high-end.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers—like stacked sheets of fine, heavy-weight paper.
*   **Base:** `surface` (#fbf9f6) for the primary background.
*   **Elevation 1:** `surface-container-low` (#f5f3f0) for large structural areas.
*   **Elevation 2:** `surface-container` (#efeeeb) for grouping related content.
*   **Elevation 3:** `surface-container-highest` (#e4e2df) for small, high-emphasis interactive cards.

### The "Glass & Signature" Rule
*   **Glassmorphism:** For floating navigation bars or modal overlays, use `surface` at 80% opacity with a `24px` backdrop-blur. This ensures the Nordic greens and sands bleed through, maintaining a cohesive "atmosphere."
*   **Signature Gradients:** For primary CTAs or the Hero background, use a subtle linear gradient from `primary` (#516351) to `primary-container` (#90a38e) at a 135-degree angle. This adds "visual soul" and depth that prevents the design from feeling flat or "cheap."

---

## 3. Typography: The Editorial Voice
Our typography pairing is a dialogue between tradition and modernity.

*   **The Authority (Serif):** `Noto Serif` is used for all Display and Headline levels. It conveys wisdom, experience, and the "High-End" promise. 
    *   *Styling Note:* Use `tight` letter spacing for `display-lg` to create a custom, logotype feel.
*   **The Clarity (Sans-Serif):** `Manrope` is used for Body and Label text. It is modern, highly legible, and neutral, providing a soft landing for the eye after the character-rich headings.

**Hierarchy Intent:**
*   **Display LG (3.5rem):** Use for "Hero" statements only.
*   **Headline MD (1.75rem):** Use for section headers, often paired with a `label-md` "kicker" text above it in all caps to denote the category.
*   **Body LG (1rem):** Our standard for readability. Use a generous `line-height` of 1.6 to ensure the 40+ demographic finds the content effortless to consume.

---

## 4. Elevation & Depth
We eschew traditional "drop shadows" in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking" the surface-container tiers. Place a `surface-container-lowest` card on a `surface-container-low` section to create a soft, natural lift without needing a shadow.
*   **Ambient Shadows:** When a "floating" effect is mandatory (e.g., a floating registration button), use an extra-diffused shadow: `0px 20px 40px rgba(27, 28, 26, 0.05)`. Notice the color is a tinted version of `on-surface`, not pure black.
*   **The Ghost Border:** If a container needs a perimeter for accessibility, use the `outline-variant` token (#c3c8c0) at **15% opacity**. It should be barely perceptible—a "whisper" of a line.

---

## 5. Components

### Buttons
*   **Primary:** Uses the `primary` (#516351) fill with `on-primary` (#ffffff) text. Shape: `xl` (0.75rem) roundedness. No shadow; use a subtle scale-up interaction (1.02x) on hover.
*   **Tertiary:** Text-only with a `label-md` style. Use a 1px underline that sits 4px below the text, utilizing the `primary-fixed-dim` color.

### Cards & Content Lists
*   **Rule:** Forbid the use of divider lines. 
*   **Alternative:** Use vertical whitespace (32px, 48px, or 64px) from our spacing scale to separate ideas. For lists, use a `surface-container-low` background on hover to indicate interactivity.

### Input Fields
*   **Style:** Minimalist "Underline" style or a very soft `surface-container-highest` fill.
*   **Focus State:** Transition the bottom border from `outline-variant` to `primary`. Avoid heavy "glow" effects.

### Signature Patterning
In place of human imagery, use **Abstract Geometry**. Create patterns using the `outline-variant` and `primary-fixed` colors—think thin, overlapping circles or soft, undulating "topographic" lines that mimic the flow of nature.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical layouts. For example, place a headline on the left and the body copy shifted to the right-center.
*   **Do** use `primary-fixed-dim` (#b8ccb6) as a background for high-importance callouts to provide a "serene pop" of color.
*   **Do** ensure all interactive elements have a minimum touch target of 44px, respecting the ergonomic needs of our 40+ audience.

### Don't
*   **Don't** use pure black (#000000). Use `on-surface` (#1b1c1a) for all text to maintain a sophisticated, soft-contrast look.
*   **Don't** use "Default" card shadows. If it looks like a standard UI kit, it has failed the "High-End" requirement.
*   **Don't** crowd the interface. If a section feels "busy," increase the vertical padding by 50%.