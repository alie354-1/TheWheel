# HTML to Deck Conversion - Rendering Fix Plan

## 1. Executive Summary

### 1.1. Problem Overview
The current HTML to Deck Converter (`HtmlToDeckConverter.ts`) suffers from significant rendering issues when converting HTML content into deck slides. Imported slides often display incorrectly, with content being cut off, elements overlapping, incorrect spacing, and a general mismatch between the intended HTML layout and the final slide representation. This is primarily due to inaccuracies in component dimension calculation (especially text), flawed positioning logic, and issues related to content scaling in the preview.

### 1.2. Impact Assessment
These rendering inaccuracies severely degrade the user experience of the HTML import feature, making it unreliable and frustrating. Users cannot trust that their HTML content will be faithfully represented, leading to manual rework and a loss of confidence in the Deck Builder's capabilities. This directly impacts the usability of a key feature intended to streamline deck creation from existing web content.

### 1.3. Solution Approach
This plan outlines a multi-phase approach to systematically address the root causes of the rendering problems. The core strategy involves:
1.  **Improving Measurement:** Implementing robust, dynamic measurement of HTML elements, especially text, to get accurate dimensions.
2.  **Refining Layout Logic:** Enhancing the algorithms for positioning components on a slide, managing overflow, and splitting content across multiple slides.
3.  **Stabilizing Preview Rendering:** Addressing issues related to CSS scaling and viewport management to ensure consistent display.
4.  **Optimizing HTML Processing:** Improving the sanitization and parsing of input HTML to better preserve structure and styling.

### 1.4. Success Metrics
-   **Visual Fidelity:** >90% reduction in content cutoff and overlap issues for common HTML structures.
-   **Layout Accuracy:** Consistent and predictable spacing and alignment of converted components.
-   **User Satisfaction:** Positive feedback from users on the reliability and accuracy of the HTML import feature.
-   **Reduced Rework:** Significant decrease in the need for manual adjustments to imported slides.
-   **Performance:** Conversion process remains performant, not introducing significant delays.

## 2. Root Cause Analysis

Based on code review of `HtmlToDeckConverter.ts`, `PreviewSlide.tsx`, and `preview.css`, the primary root causes are:

### 2.1. Text Measurement Inaccuracies
-   **Static Approximations:** The converter uses fixed values like `LINE_HEIGHT_PX = 20` and `AVG_CHAR_WIDTH = 8` to estimate text block dimensions. Actual browser rendering of text varies greatly based on font family, size, weight, letter spacing, and specific characters.
-   **`getTextForMeasurement` Limitations:** While `getTextForMeasurement` extracts text content, it doesn't account for the rich HTML styling within text blocks (e.g., bold, italics, spans with different styles) that affect final rendered dimensions.
-   **Impact:** Leads to grossly incorrect height and width calculations for text components, causing overlaps, cutoffs, and poor slide density.

### 2.2. Component Positioning and Layout Failures
-   **Cumulative Y-Position Errors:** The `currentYPosition.y` is incremented based on the (often incorrect) calculated height of the previous component. Errors accumulate, leading to components being placed off-slide.
-   **Insufficient Overflow Handling:** The check `currentYPosition.y + result.component.layout.height > slideHeight - DEFAULT_SLIDE_PADDING` is too simplistic. It doesn't account for margins, internal padding of components, or the possibility that a single large component might exceed slide height.
-   **Depth-Limited Recursion:** The `processNodesRecursive` function has a depth limit (`depth < 3` or `depth < 2` in some cases) which might prematurely stop processing nested HTML structures, leading to lost content or incomplete conversion of complex elements.
-   **`consumedChildNodes` Logic:** The flag `consumedChildNodes` determines if child nodes of an element are processed separately. Incorrectly setting this can lead to either redundant processing or missed content.
-   **DIV Element Ambiguity:** `div` elements are handled with complex heuristics (checking for layout classes, significant children, textual content). This can misinterpret the role of a `div`, sometimes treating structural `divs` as text or vice-versa, or incorrectly creating `customHtml` blocks.

### 2.3. Preview Scaling and CSS Issues
-   **`transform: scale()` Clipping:** In `PreviewSlide.tsx` and `preview.css`, the `.preview-slide-content` is scaled using `transform: scale(${zoomLevel})`. If the parent container (`.preview-slide-wrapper`) doesn't perfectly manage the scaled dimensions or if `overflow: hidden` is not applied correctly at the right level, content can be clipped.
-   **Absolute Positioning vs. Scaling:** The interaction between absolutely positioned `VisualComponentRenderer` instances within a scaled parent can be complex. The `transform-origin: top left` is crucial but might not solve all issues if component layouts are calculated based on unscaled dimensions.
-   **CSS Specificity and Conflicts:** Styles from `preview.css` might conflict with or be overridden by inline styles applied by `PreviewSlide.tsx` or styles inherent to the `VisualComponentRenderer` and its sub-components. The `!important` usage for spans in `preview.css` is a symptom of potential underlying conflicts.
-   **`preview-slide-content` Styling:** The `display: flex` properties on `.preview-slide-content` might be irrelevant or conflicting if all child components are absolutely positioned by `VisualComponentRenderer`.

### 2.4. HTML Processing and Sanitization
-   **`getCleanedInnerHTML` and `getCleanedTextContent`:** These functions attempt to strip unwanted tags and clean content. However, they might:
    -   Remove elements or attributes that are crucial for layout (e.g., specific classes on spans, inline styles that define dimensions or display properties).
    -   Alter the HTML structure in ways that change how it would naturally render, leading to dimension calculation errors.
    -   The replacement of `<font>` tags is specific and might not cover all legacy or unusual HTML styling methods.
-   **`isSignificantNode` Logic:** The criteria for a "significant node" (e.g., text length > 2) might discard small but visually important elements or text snippets.

## 3. Technical Implementation Plan

This plan is divided into phases to allow for iterative improvements and testing.

### Phase 1: Foundational Measurement and Layout Fixes (Critical - Target: Week 1-2)

**Goal:** Achieve significantly more accurate component dimensioning and basic vertical layout, reducing major overlaps and content cutoffs.

**Tasks:**

1.  **Implement Dynamic Text Measurement Utility:**
    *   **File:** `src/deck-builder/utils/dom-measurement.ts` (new)
    *   **Function:** `measureHtmlString(htmlString: string, maxWidth: number, baseStyles?: Partial<CSSStyleDeclaration>): { width: number, height: number, lines: number }`
    *   **Method:**
        *   Create an off-screen, temporary `div` element.
        *   Append it to `document.body` (or a dedicated, hidden container).
        *   Set its `innerHTML` to the `htmlString` to be measured.
        *   Apply `maxWidth` and any relevant `baseStyles` (e.g., font family, size from theme or parent element).
        *   Use `getBoundingClientRect()` or `offsetHeight`/`offsetWidth` to get accurate dimensions.
        *   Consider using `getComputedStyle()` to understand line-height and estimate line count if needed.
        *   Remove the temporary `div` after measurement.
    *   **Integration:** Replace existing text height/width estimations in `HtmlToDeckConverter.ts` with calls to this utility.

2.  **Refine `mapElementToVisualComponent` for Accurate Sizing:**
    *   **File:** `src/deck-builder/services/HtmlToDeckConverter.ts`
    *   **Logic:**
        *   For text-based components (h1-h6, p, text-divs, list items, blockquotes):
            *   Use `measureHtmlString` with the `innerHTML` of the element and the component's calculated `layout.width`.
            *   Update `layout.height` and potentially `layout.width` (if text is short and doesn't need full width) based on the measurement.
        *   For `img` components: Attempt to access `naturalWidth`/`naturalHeight`. If not available immediately (e.g., image not loaded), set a placeholder size and consider a mechanism for post-load updates if feasible (complex, may defer). For now, rely on default sizes if natural dimensions are zero.
        *   For `customHtml` blocks: Use `measureHtmlString` on the `element.outerHTML` to get a better estimate of its rendered size. This is still an approximation but better than fixed values.

3.  **Improve Vertical Stacking and Slide Overflow Logic in `processNodesRecursive`:**
    *   **File:** `src/deck-builder/services/HtmlToDeckConverter.ts`
    *   **Logic:**
        *   Before adding a component, check if `currentYPosition.y + measuredComponentHeight + DEFAULT_COMPONENT_SPACING > slideHeight - DEFAULT_SLIDE_PADDING`.
        *   If it overflows:
            *   Trigger `startNewSlideCb()`.
            *   Reset `currentYPosition.y = DEFAULT_SLIDE_PADDING`.
            *   The current component will be the first on the new slide.
        *   Ensure `currentYPosition.y` is updated *after* placing the component.
        *   Add more logging around component placement and slide breaks.

4.  **Basic CSS Review for `.preview-slide-content` and `VisualComponentRenderer`:**
    *   **Files:** `src/deck-builder/preview/styles/preview.css`, `src/deck-builder/components/VisualComponentRenderer.tsx`
    *   **Goal:** Ensure `VisualComponentRenderer` positions elements absolutely within `.preview-slide-content` and that the slide content itself is correctly scaled without internal clipping.
    *   Verify `overflow: hidden` is correctly applied on `.preview-slide-wrapper` to clip the scaled `.preview-slide-content`.
    *   Ensure `.preview-slide-content` itself does not have `overflow: hidden` if its children (visual components) are meant to be absolutely positioned and potentially extend to its calculated (logical) edges.

### Phase 2: Enhanced Layout Engine and HTML Processing (High Priority - Target: Week 3-4)

**Goal:** Handle more complex HTML structures, improve spacing, and make content splitting more intelligent.

**Tasks:**

1.  **Develop a "Layout Box" Model for `processNodesRecursive`:**
    *   Instead of just a `currentYPosition`, manage available width and remaining height within the current slide.
    *   Consider simple column detection for `div` elements with `display: flex` or `grid` if they are not consumed as single components. This is advanced and might be simplified initially.
    *   When a `div` is not converted to a single component (i.e., `consumedChildNodes` is false), `processNodesRecursive` should be called for its children. The context passed to this recursive call should ideally represent the parent `div`'s content box, adjusted for padding/margins if possible.

2.  **Refine `getCleanedInnerHTML` and `isSignificantNode`:**
    *   **Goal:** Preserve more styling and structural information that affects layout, while still removing problematic elements.
    *   Review tags being removed: Are any of them potentially important for layout in some contexts (e.g., styled `span`s, `figure`s)?
    *   `isSignificantNode`: Re-evaluate criteria. Perhaps consider computed styles (if visible) rather than just text length or tag name. This is complex in a non-browser (DOMParser) environment, so might need to rely on heuristics.

3.  **Smarter Content Splitting for Large Components:**
    *   If a single component (e.g., a very long paragraph or a tall image) measured by `measureHtmlString` exceeds `slideHeight - DEFAULT_SLIDE_PADDING`, it needs to be split.
    *   **Text Splitting:** For text components, attempt to split the `innerHTML` content at a suitable point (e.g., end of a sentence or paragraph if possible, or estimate character/line count) to fit the current slide, and carry over the remainder to the next. This requires careful HTML manipulation to maintain validity.
    *   **Image Splitting:** Generally not feasible. Images that are too tall should either be scaled down (if aspect ratio is to be preserved) or trigger a warning/option for the user. For now, they might just overflow or be placed on a new slide if they don't fit the current one entirely.
    *   **`customHtml` Splitting:** Very difficult. Best effort is to place it on a new slide if it doesn't fit.

4.  **Handle CSS `display: none` and `visibility: hidden`:**
    *   Modify `isSignificantNode` and `mapElementToVisualComponent` to check for these styles (using `element.style` or `getComputedStyle` if in a browser-like context, though `DOMParser` doesn't compute styles). If an element is hidden, it should be skipped. This is tricky without a full rendering engine. A simpler heuristic might be to check for inline `style="display:none;"` or `style="visibility:hidden;"`.

### Phase 3: Preview System Overhaul & CSS Stabilization (Medium Priority - Target: Week 5-6)

**Goal:** Ensure the preview rendering is robust, scaling works correctly, and CSS is clean and predictable.

**Tasks:**

1.  **Thorough Review of Scaling and Viewport CSS:**
    *   **Files:** `preview.css`, `PreviewSlide.tsx`, `DeckPreviewer.tsx` (and its parent components).
    *   Ensure the chain of elements from the viewport down to the individual visual components correctly handles dimensions, scaling, and overflow.
    *   `.preview-slide-viewport`: Should center `.preview-slide-wrapper`.
    *   `.preview-slide-wrapper`: Should maintain aspect ratio and `overflow: hidden` is critical here. Its size should be determined by the available space in `.preview-slide-viewport`.
    *   `.preview-slide-content` (root of `PreviewSlide.tsx`): Its dimensions are logical (e.g., 1280x720). `transform: scale()` is applied here. It should *not* have `overflow: hidden` itself, as its children (visual components) are absolutely positioned relative to its logical boundaries.

2.  **Investigate and Resolve Content Clipping:**
    *   Systematically test different zoom levels and viewport sizes.
    *   Use browser developer tools to inspect the box model and transforms at each level.
    *   Ensure that the `VisualComponentLayout` (x, y, width, height) is always relative to the logical, unscaled dimensions of `.preview-slide-content`.

3.  **CSS Cleanup and Simplification:**
    *   Reduce reliance on `!important` by resolving specificity conflicts.
    *   Ensure a clear separation of concerns: structural layout CSS vs. thematic/component-specific styling.
    *   Review styles applied by `section.slideStyle` in `PreviewSlide.tsx` to ensure they don't conflict with the scaling mechanism or component rendering.

### Phase 4: Advanced Enhancements & Robustness (Low Priority - Target: Week 7-8)

**Goal:** Handle edge cases, improve performance, and make the system more resilient.

**Tasks:**

1.  **Support for More Complex HTML/CSS (e.g., floats, basic flex/grid):**
    *   This is a significant undertaking. Initially, focus on block-level layout.
    *   For `div` elements with `display: flex` or `grid`, the converter currently either makes them `customHtml` or processes children. A more advanced approach could try to interpret the flex/grid layout and create multiple `VisualComponent`s positioned accordingly. This is likely out of scope for immediate fixes but a long-term improvement.

2.  **Performance Optimization for Measurement:**
    *   Batch DOM operations for `measureHtmlString` if many elements need measuring.
    *   Cache measurement results for identical HTML content/styles if possible (though dynamic content makes this hard).

3.  **User Feedback for Unconvertible Content:**
    *   If certain complex HTML structures cannot be converted accurately, provide feedback to the user (e.g., "Some advanced layout features were simplified").

4.  **Refine `BLOCK_REGISTRY` and Default Sizes:**
    *   Ensure default sizes in `BLOCK_REGISTRY` (e.g., for images) are sensible.

## 4. Detailed Technical Specifications (Initial Focus on Phase 1)

### 4.1. `dom-measurement.ts` - `measureHtmlString`

```typescript
// src/deck-builder/utils/dom-measurement.ts
const MEASUREMENT_CONTAINER_ID = '__html_measurement_container__';

function getMeasurementContainer(): HTMLElement {
  let container = document.getElementById(MEASUREMENT_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = MEASUREMENT_CONTAINER_ID;
    Object.assign(container.style, {
      position: 'absolute',
      top: '-9999px',
      left: '-9999px',
      visibility: 'hidden',
      pointerEvents: 'none',
      contain: 'strict', // Performance optimization
    });
    document.body.appendChild(container);
  }
  return container;
}

interface HtmlMeasurement {
  width: number;
  height: number;
  // Future: lines, etc.
}

export function measureHtmlString(
  htmlString: string,
  maxWidth: number,
  fontFamily: string = 'Arial', // Sensible default
  fontSize: string = '16px' // Sensible default
): HtmlMeasurement {
  const container = getMeasurementContainer();
  const measureElement = document.createElement('div');

  // Apply base styles for consistent measurement
  Object.assign(measureElement.style, {
    maxWidth: `${maxWidth}px`,
    width: 'auto', // Allow content to determine width up to maxWidth
    fontFamily: fontFamily,
    fontSize: fontSize,
    lineHeight: 'normal', // Or a specific value if consistent
    padding: '0', // Ensure no extra padding affects measurement
    border: 'none',
    boxSizing: 'border-box', // Important for width calculations
    wordBreak: 'break-word', // Common behavior
  });
  
  measureElement.innerHTML = htmlString;
  container.appendChild(measureElement);

  const rect = measureElement.getBoundingClientRect();
  const height = measureElement.offsetHeight; //offsetHeight can be more reliable for block elements
  const width = measureElement.offsetWidth;

  container.removeChild(measureElement);

  return { width, height };
}
```

### 4.2. Modifications to `HtmlToDeckConverter.ts` (Phase 1 Focus)

*   **Import `measureHtmlString`**.
*   **In `mapElementToVisualComponent`:**
    *   **Headings (h1-h6):**
        ```typescript
        // ...
        blockType = 'text';
        const level = parseInt(tagName.substring(1), 10);
        componentData = { text: innerHTML.trim(), variant: 'heading', level };
        
        // Determine initial width (can be refined)
        let headingMaxWidth = Math.min(slideWidth - 2 * DEFAULT_COMPONENT_X, 700);
        // Optional: if text is very short, try to make width smaller
        if (textContent.length < (20 - level * 2)) {
            headingMaxWidth = Math.max(150, textContent.length * (12 + (6-level)*2));
        }
        layout.width = headingMaxWidth;

        const measured = measureHtmlString(innerHTML.trim(), layout.width, theme?.fonts?.heading || 'Arial', `${28 - level * 2}px`); // Example font size
        layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measured.height + TEXT_PADDING_PX); // Add padding
        // layout.width = measured.width; // Or keep maxWidth, depending on desired behavior
        consumedChildNodes = true;
        break;
        ```
    *   **Paragraphs (p, textual divs, default text):**
        ```typescript
        // ...
        blockType = 'text';
        componentData = { text: innerHTML.trim(), variant: 'paragraph' };
        
        let paraMaxWidth = Math.min(slideWidth - 2 * DEFAULT_COMPONENT_X, 700);
        if (textContent.length < 70 && innerHTML.indexOf('<br') === -1) { // Heuristic for short lines
             paraMaxWidth = Math.min(paraMaxWidth, Math.max(150, textContent.length * 9));
        }
        layout.width = paraMaxWidth;

        const measured = measureHtmlString(innerHTML.trim(), layout.width, theme?.fonts?.body || 'Arial', '16px'); // Example font size
        layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measured.height + TEXT_PADDING_PX);
        // layout.width = measured.width; // Or keep maxWidth
        consumedChildNodes = true;
        break;
        ```
    *   **Lists (ul, ol):**
        *   Measure each `li`'s `innerHTML` individually using `measureHtmlString`.
        *   Sum their heights and add spacing for `layout.height`.
        *   `layout.width` can be the `maxWidth` of the longest measured item or a general list width.
    *   **Blockquotes:**
        *   Measure the main quote text and author text separately if present.
        *   Combine heights, add padding/spacing.
    *   **`customHtml`:**
        ```typescript
        // ...
        componentData = { html: element.outerHTML };
        const measuredCustom = measureHtmlString(element.outerHTML, layout.width);
        layout.height = Math.max(40, measuredCustom.height);
        // layout.width = measuredCustom.width; // Potentially adjust width too
        consumedChildNodes = true;
        break;
        ```
*   **In `processNodesRecursive`:**
    *   When calling `mapElementToVisualComponent`, ensure the `slideWidth` (or available width in current context) is passed correctly.
    *   Use the `result.component.layout.height` (which is now more accurate) for the overflow check:
        ```typescript
        if (result.component) {
          const componentHeight = result.component.layout.height; // Use the accurately measured height
          if (currentYPosition.y + componentHeight > slideHeight - DEFAULT_SLIDE_PADDING && componentsForThisPass.length > 0) {
            startNewSlideCb();
            currentYPosition.y = DEFAULT_SLIDE_PADDING; // Reset Y for new slide
          }
          result.component.layout.y = currentYPosition.y;
          
          componentsForThisPass.push(result.component);
          currentYPosition.y += componentHeight + DEFAULT_COMPONENT_SPACING;
        }
        ```
    *   **Loose Text Node Handling:** Also use `measureHtmlString` for loose text nodes.

## 5. Implementation Timeline (High-Level)

*   **Week 1-2:** Phase 1 - Foundational Measurement and Layout Fixes.
    *   Implement `measureHtmlString`.
    *   Integrate into `mapElementToVisualComponent` for major text types.
    *   Basic overflow logic improvements in `processNodesRecursive`.
    *   Initial testing and validation.
*   **Week 3-4:** Phase 2 - Enhanced Layout Engine and HTML Processing.
    *   Refine list, blockquote, customHTML measurement.
    *   Improve `getCleanedInnerHTML` and `isSignificantNode`.
    *   Begin work on smarter content splitting for large text blocks.
*   **Week 5-6:** Phase 3 - Preview System Overhaul & CSS Stabilization.
    *   Address scaling/clipping issues in `preview.css`.
    *   CSS cleanup.
*   **Week 7-8:** Phase 4 - Advanced Enhancements & Robustness.
    *   Further refinements, edge case handling, performance.

## 6. Testing & Validation Plan

*   **Unit Tests:**
    *   For `measureHtmlString` with various HTML snippets and styles.
    *   For `mapElementToVisualComponent` with diverse HTML elements to check correct type mapping and dimension calculation.
    *   For `processNodesRecursive` to verify correct component ordering and slide splitting.
*   **Integration Tests:**
    *   Full `convertHtmlToDeckSections` with sample HTML documents of varying complexity.
    *   Verify the structure of `DeckSection[]` output, component counts, and estimated layouts.
*   **Visual Regression Tests (Crucial):**
    *   Create a set of representative HTML test files.
    *   Automate the process of:
        1.  Converting HTML to `DeckSection[]`.
        2.  Rendering these sections using `DeckPreviewer` or a similar component.
        3.  Taking screenshots of the rendered slides.
        4.  Comparing these screenshots against baseline "correct" renderings.
    *   Tools: Playwright, Puppeteer with an image comparison library (e.g., pixelmatch).
*   **Manual Testing:**
    *   Use a variety of real-world web pages or HTML snippets as input.
    *   Visually inspect the imported slides in the Deck Builder.
    *   Focus on common content patterns (articles, blogs, documentation).
*   **Performance Benchmarks:**
    *   Measure the time taken for `convertHtmlToDeckSections` for different input sizes.
    *   Ensure new measurement logic doesn't introduce unacceptable delays.

This plan provides a structured approach to tackling the HTML conversion rendering issues. Prioritization will be on Phase 1 to deliver the most impactful fixes quickly.
