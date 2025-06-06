# Plan: HTML to Deck Conversion

This document outlines the plan to implement a feature that allows users to input HTML and convert it into a series of slides and components within the `UnifiedDeckBuilder`.

## 1. Core Goal
To enable users to input HTML and have it automatically converted into a structured deck composed of `DeckSection` (slides) and `VisualComponent` objects compatible with the existing deck builder.

## 2. HTML Parsing and Slide Definition
*   **Input Method:** A new modal will be added to the `UnifiedDeckBuilder.tsx` component. This modal will feature a `<textarea>` for users to paste their HTML content.
*   **Parser:** The browser's built-in `DOMParser` API will be used to parse the input HTML string into a DOM tree.
*   **Slide Breaks:** The `<hr>` (horizontal rule) tag in the input HTML will be used to explicitly denote a slide break. Each occurrence will signify the end of the current slide and the beginning of a new one.
*   **Slide Titles:** The text content of the first heading tag (`<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>`, or `<h6>`) encountered immediately following a slide break (or at the very beginning of the HTML document if no preceding `<hr>` exists) will be extracted and used as the `title` property for the corresponding `DeckSection`.

## 3. HTML Element to `VisualComponent` Mapping
The following mapping rules will be applied to convert HTML elements into `VisualComponent` objects:

*   **Headings (`<h1>` - `<h6>`):**
    *   Mapped to a `VisualComponent` of `type: 'text'`.
    *   The `data` property will be `{ text: element.textContent, variant: 'heading' }`.
*   **Paragraphs (`<p>`):**
    *   Mapped to a `VisualComponent` of `type: 'text'`.
    *   The `data` property will be `{ text: element.innerHTML, variant: 'paragraph' }`. Using `innerHTML` aims to preserve simple inline formatting (e.g., `<strong>`, `<em>`, `<a>`).
*   **Images (`<img>`):**
    *   Mapped to a `VisualComponent` of `type: 'image'`.
    *   The `data` property will be `{ src: element.getAttribute('src'), alt: element.getAttribute('alt') }`.
*   **Unordered Lists (`<ul>`) & Ordered Lists (`<ol>`):**
    *   The entire list structure will be mapped to a single `VisualComponent` of `type: 'list'`.
    *   `data.ordered` will be `true` for `<ol>` elements and `false` for `<ul>` elements.
    *   Each `<li>` child element will be converted into an object within the `data.items` array (e.g., `{ id: generateUniqueId(), text: liElement.innerHTML }`). `innerHTML` is used for list item text to attempt preservation of inline styles.
*   **Code Blocks (`<pre>`, often containing `<code>`):**
    *   Mapped to a `VisualComponent` of `type: 'code'`.
    *   The `data` property will be `{ code: element.textContent }`. Language detection (e.g., from class names like `language-javascript`) can be considered as a future enhancement.
*   **Blockquotes (`<blockquote>`):**
    *   Mapped to a `VisualComponent` of `type: 'quote'`.
    *   The `data` property will be `{ text: mainQuoteText, author: authorText }`. Logic will be implemented to extract the main quote text separately from any author information (e.g., within a `<footer>` or `<cite>` tag).
*   **Tables (`<table>`):**
    *   Mapped to a `VisualComponent` of `type: 'table'`.
    *   The `data` property will be `{ rows: [...] }`, where `rows` is an array of string arrays, populated by parsing `<tr>`, `<th>`, and `<td>` elements.
*   **Fallback (`customHtml` Block Type):**
    *   Any block-level HTML element that is not explicitly mapped by the rules above will be wrapped into a `VisualComponent` of `type: 'customHtml'`.
    *   The `data` property for these components will be `{ html: element.outerHTML }`. This ensures that no content is inadvertently lost and provides a mechanism for rendering complex or unsupported HTML structures.

## 4. Component Data and Layout
*   **Unique IDs:** Each newly created `DeckSection` and `VisualComponent` will be assigned a unique ID, likely using a UUID generation utility (e.g., from `src/deck-builder/utils/uuid.ts`).
*   **Default Data:** The `sampleData` defined in `BLOCK_REGISTRY` (from `src/deck-builder/types/blocks.ts`) will be used as a base for populating the `data` object of new `VisualComponent`s, ensuring all necessary properties are present.
*   **Layout:** For the initial version, `VisualComponent`s will be added to slides using a simple vertical stacking logic or default layout values (position and size) derived from `BLOCK_REGISTRY[blockType].defaultSize` if available. Complex HTML layout replication will not be attempted in the first pass.

## 5. Implementation Steps
*   **Create `HtmlToDeckConverter.ts`:**
    *   This new service/module will reside in `src/deck-builder/services/` (or a similar appropriate location).
    *   It will export a primary function, e.g., `convertHtmlToDeckSections(htmlString: string): DeckSection[]`.
    *   This function will encapsulate the `DOMParser` logic, iteration over DOM nodes, application of mapping rules, and construction of `DeckSection` and `VisualComponent` arrays.
*   **Modify `UnifiedDeckBuilder.tsx`:**
    *   Introduce state variables to manage the visibility of the HTML import modal.
    *   Add a UI element (e.g., an "Import from HTML" button) to trigger the modal.
    *   The modal will contain a `<textarea>` for HTML input and a "Convert" button.
    *   Upon clicking "Convert", the input HTML will be passed to the `HtmlToDeckConverter` service.
    *   The returned `DeckSection[]` array will be used to populate the deck, likely by first clearing the existing deck (or prompting the user) and then using functions from the `useDeck` hook (e.g., `addSection`, `updateSection`) to add the new content.
*   **Utility for IDs:** Ensure a robust UUID generation function is available and used.

## 6. Scope and Error Handling
*   **Initial Focus:** The primary goal for the first version is accurate structural conversion of common HTML elements as outlined above.
*   **CSS/Styling:** External or inline CSS styles from the source HTML (e.g., `style` attributes, `<style>` tags, linked stylesheets) will generally be ignored. The visual appearance of converted content will primarily be determined by the active deck theme and the default styling of the `VisualComponent`s.
*   **Error Handling:**
    *   Malformed HTML: Reliance on the `DOMParser`'s built-in error tolerance.
    *   Unmapped Elements: As per the fallback strategy, these will be wrapped into `customHtml` components. Console warnings may be logged for diagnostic purposes.

This plan provides a clear path for implementing the HTML to deck conversion feature, focusing on a practical and iterative approach.
