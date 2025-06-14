import { DeckSection, VisualComponent, VisualComponentLayout } from '../types/index.ts';
import {
  BlockType,
  BLOCK_REGISTRY,
} from '../types/blocks.ts';
import { generateUUID } from '../utils/uuid.ts';
import { 
  DEFAULT_LOGICAL_SLIDE_WIDTH as LOGICAL_SLIDE_WIDTH,
  DEFAULT_LOGICAL_SLIDE_HEIGHT as LOGICAL_SLIDE_HEIGHT
} from '../preview/hooks/usePreviewState.ts'; 

const DEFAULT_COMPONENT_SPACING = 20; 
const DEFAULT_COMPONENT_X = 10; 
const DEFAULT_SLIDE_PADDING = 10; 
// const LOGICAL_SLIDE_HEIGHT = 720; // Now imported
const AVG_CHAR_WIDTH = 6; 
const LINE_HEIGHT_PX = 30; // Base for non-measured or minimums
const TEXT_PADDING_PX = 16; // Represents total vertical padding (e.g., 8px top + 8px bottom)
const MIN_TEXT_HEIGHT_PX = LINE_HEIGHT_PX + TEXT_PADDING_PX; 
const HEIGHT_SAFETY_MARGIN_PX = 5; // Small safety margin for DOM-measured heights

interface ComponentConversionResult {
  component: VisualComponent | null;
  consumedChildNodes: boolean; 
}

// Helper function for DOM-based height measurement
function getMeasuredDomHeight(innerHTML: string, width: number, baseFontSize: string = '16px', baseLineHeight: string = 'normal'): number {
  const measurementDiv = document.createElement('div');
  measurementDiv.style.position = 'absolute';
  measurementDiv.style.visibility = 'hidden';
  measurementDiv.style.width = `${width}px`;
  measurementDiv.style.padding = `${TEXT_PADDING_PX / 2}px`; // Simulate internal padding
  measurementDiv.style.boxSizing = 'border-box';
  measurementDiv.style.font = baseFontSize; // Apply base font size
  measurementDiv.style.lineHeight = baseLineHeight; // Apply base line height
  measurementDiv.style.wordBreak = 'break-word';
  measurementDiv.innerHTML = innerHTML;
  document.body.appendChild(measurementDiv);
  const measuredHeight = measurementDiv.offsetHeight;
  document.body.removeChild(measurementDiv);
  return measuredHeight;
}

// Helper to get text content from an HTML string for measurement
function getTextForMeasurement(htmlString: string): string {
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;
  return tempDiv.textContent || '';
}

function getCleanedInnerHTML(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('script, style, button, title, meta, link, nav, footer.slide-footer').forEach(el => el.remove());
  clone.querySelectorAll('font').forEach(fontTag => {
    const span = document.createElement('span');
    span.style.display = 'inline';
    const color = fontTag.getAttribute('color');
    if (color) {
      span.style.color = color;
    }
    while (fontTag.firstChild) {
      span.appendChild(fontTag.firstChild);
    }
    if (fontTag.parentNode) {
      fontTag.parentNode.replaceChild(span, fontTag);
    }
  });
  return clone.innerHTML.replace(/<!--[\s\S]*?-->/g, '').trim();
}

function getCleanedTextContent(element: Element): string {
  const clone = element.cloneNode(true) as Element;
  clone.querySelectorAll('script, style, button, title, meta, link, nav, footer.slide-footer').forEach(el => el.remove());
  return (clone.textContent || '').replace(/\s+/g, ' ').trim();
}

function isSignificantNode(node: Node): boolean {
  if (node.nodeType === Node.ELEMENT_NODE) {
    const el = node as Element;
    const tagName = el.tagName.toLowerCase();
    if (['script', 'style', 'button', 'head', 'meta', 'title', 'link', 'nav', 'footer'].includes(tagName)) return false;
    if (el.hasAttributes() && (el.getAttribute('src') || el.getAttribute('href'))) return true;
    if (getCleanedTextContent(el).length > 2) return true; 
    if (el.children.length > 0) {
      return Array.from(el.children).some(child => isSignificantNode(child as Node));
    }
    return false;
  }
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent || '').trim().length > 2; 
  }
  return false;
}

function mapElementToVisualComponent(
  element: Element,
  slideWidth: number,
  depth: number = 0
): ComponentConversionResult {
  const componentId = generateUUID();
  let blockType: BlockType | null = null;
  let componentData: any = {};
  let layout: VisualComponentLayout = { 
    x: DEFAULT_COMPONENT_X,
    y: 0, 
    width: slideWidth - 2 * DEFAULT_COMPONENT_X, // Use available slide width
    height: 50, 
    zIndex: 1,
  };
  let consumedChildNodes = false; 

  const tagName = element.tagName.toLowerCase();
  const textContent = getCleanedTextContent(element);
  const innerHTML = getCleanedInnerHTML(element);
  
  if (['script', 'style', 'head', 'meta', 'title', 'link', 'button', 'nav', 'footer'].includes(tagName)) {
    return { component: null, consumedChildNodes: true };
  }

  const hasLayoutClasses = element.classList.contains('grid') || element.classList.contains('flex');
  const significantChildrenArray = Array.from(element.children).filter(c => isSignificantNode(c as Node));

  switch (tagName) {
    case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6':
      if (!textContent) return { component: null, consumedChildNodes: true };
      blockType = 'text';
      const level = parseInt(tagName.substring(1), 10);
      componentData = { text: innerHTML.trim(), variant: 'heading', level };
      // Determine base font size for heading for measurement
      const headingFontSize = `${(2.5 - (level * 0.25))}em`; // Example: h1=2.25em, h2=2em ... h6=1.25em
      const measuredHeadingHeight = getMeasuredDomHeight(innerHTML, layout.width, headingFontSize);
      layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measuredHeadingHeight) + HEIGHT_SAFETY_MARGIN_PX;
      consumedChildNodes = true;
      break;

    case 'p':
      if (!textContent && !element.querySelector('img, a, span, strong, em, br')) return { component: null, consumedChildNodes: true };
      blockType = 'text';
      componentData = { text: innerHTML.trim(), variant: 'paragraph' };
      const measuredParagraphHeight = getMeasuredDomHeight(innerHTML, layout.width);
      layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measuredParagraphHeight) + HEIGHT_SAFETY_MARGIN_PX;
      consumedChildNodes = true;
      break;

    case 'img':
      blockType = 'image';
      const imgEl = element as HTMLImageElement;
      componentData = { src: imgEl.getAttribute('src') || '', alt: imgEl.getAttribute('alt') || '' };
      const naturalWidth = imgEl.naturalWidth || BLOCK_REGISTRY.image.defaultSize?.width || 350;
      const naturalHeight = imgEl.naturalHeight || BLOCK_REGISTRY.image.defaultSize?.height || 250;
      if (naturalWidth > 0 && naturalHeight > 0) {
        layout.width = Math.min(naturalWidth, layout.width); 
        layout.height = (layout.width / naturalWidth) * naturalHeight;
      } else {
        layout.width = BLOCK_REGISTRY.image.defaultSize?.width || 350;
        layout.height = BLOCK_REGISTRY.image.defaultSize?.height || 250;
      }
      layout.height = Math.max(50, layout.height);
      consumedChildNodes = true;
      break;

    case 'ul': case 'ol':
      const listItems = Array.from(element.children)
        .filter(li => li.tagName.toLowerCase() === 'li')
        .map(li => ({ id: generateUUID(), text: getCleanedInnerHTML(li as Element) }));
      if (listItems.length === 0) return { component: null, consumedChildNodes: true };
      blockType = 'list';
      componentData = { ordered: tagName === 'ol', items: listItems };
      // DOM-based height measurement for list items
      let totalMeasuredListHeight = 0;
      listItems.forEach(item => {
        // Measure each list item individually. Width for measurement could be layout.width or slightly less due to bullet points.
        const itemMeasuredHeight = getMeasuredDomHeight(item.text, layout.width - 20); // Subtract a bit for bullet/number
        totalMeasuredListHeight += Math.max(LINE_HEIGHT_PX + (TEXT_PADDING_PX/2) , itemMeasuredHeight); // Ensure at least one line height + some padding
      });
      // Add spacing between items and overall padding/safety margin
      layout.height = totalMeasuredListHeight + 
                      (listItems.length > 1 ? (listItems.length -1) * (DEFAULT_COMPONENT_SPACING / 2) : 0) + // Spacing between items
                      TEXT_PADDING_PX + // Overall padding for the list block
                      HEIGHT_SAFETY_MARGIN_PX;
      layout.height = Math.max(MIN_TEXT_HEIGHT_PX, layout.height);
      consumedChildNodes = true;
      break;

    case 'pre':
      const codeElement = element.querySelector('code');
      // Use textContent for broader compatibility, fallback to element.textContent
      const codeContent = codeElement ? (codeElement.textContent || '') : (element.textContent || ''); 
      if (!codeContent || !codeContent.trim()) return { component: null, consumedChildNodes: true };
      blockType = 'code';
      componentData = { code: codeContent.trim() };
      layout.height = Math.max(40, codeContent.split('\n').length * (LINE_HEIGHT_PX - 4) + TEXT_PADDING_PX);
      layout.width = Math.min(slideWidth - 2 * DEFAULT_COMPONENT_X, 800);
      consumedChildNodes = true;
      break;

    case 'blockquote':
      const bqTextElement = element.querySelector('p');
      const bqTextHTML = bqTextElement ? getCleanedInnerHTML(bqTextElement) : innerHTML;
      const bqTextContent = getTextForMeasurement(bqTextHTML);
      if (!bqTextContent.trim()) return { component: null, consumedChildNodes: true };
      blockType = 'quote';
      const authorElement = element.querySelector('cite, footer');
      componentData = { text: bqTextHTML, author: authorElement ? getCleanedTextContent(authorElement) : '' };
      if (bqTextContent.length < 120) {
        layout.width = Math.min(layout.width, Math.max(250, bqTextContent.length * 8 + (componentData.author.length * 7)));
      }
      const measuredQuoteHeight = getMeasuredDomHeight(innerHTML, layout.width);
      layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measuredQuoteHeight) + HEIGHT_SAFETY_MARGIN_PX;
      consumedChildNodes = true;
      break;

    case 'table':
      const tableEl = element as HTMLTableElement;
      if (tableEl.rows.length === 0) return { component: null, consumedChildNodes: true };
      blockType = 'table';
      const tableRows = Array.from(tableEl.rows).map(row => Array.from(row.cells).map(cell => getCleanedInnerHTML(cell as HTMLElement)));
      componentData = { rows: tableRows };
      layout.height = Math.max(30, tableRows.length * (LINE_HEIGHT_PX + 6) + TEXT_PADDING_PX);
      layout.width = Math.min(slideWidth - 2 * DEFAULT_COMPONENT_X, 800);
      consumedChildNodes = true;
      break;
    
    case 'div':
      if (hasLayoutClasses && significantChildrenArray.length > 0 && depth < 2) {
        return { component: null, consumedChildNodes: false }; 
      }
      if (significantChildrenArray.length === 1 && !textContent.trim() && !hasLayoutClasses) {
         return { component: null, consumedChildNodes: false };
      }
      const isTextualDiv = textContent && 
        (!element.children.length || Array.from(element.children).every(ch => ['span', 'strong', 'em', 'a', 'br', 'b', 'i', 'u', 'font', 'sup', 'sub'].includes(ch.tagName.toLowerCase())));

      if (isTextualDiv) {
        blockType = 'text';
        componentData = { text: innerHTML.trim(), variant: 'paragraph' };
        const divTextForMeasure = getTextForMeasurement(innerHTML);
        const measuredDivHeight = getMeasuredDomHeight(innerHTML, layout.width);
        layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measuredDivHeight) + HEIGHT_SAFETY_MARGIN_PX;
        consumedChildNodes = true;
        break; 

      } else if (textContent.trim() || (significantChildrenArray.length > 0 && depth <= 1) || (hasLayoutClasses && significantChildrenArray.length <= 1 && depth <=1) ) {
        blockType = 'customHtml';
        componentData = { html: element.outerHTML };
        const elementHeight = (element as HTMLElement).offsetHeight;
        layout.height = Math.max(40, elementHeight > 0 ? elementHeight : (element.scrollHeight > 0 ? element.scrollHeight / 2 : 100) );
        consumedChildNodes = true; 

      } else if (significantChildrenArray.length > 0 && depth < 2) {
        return { component: null, consumedChildNodes: false };
      } else { 
        return { component: null, consumedChildNodes: true };
      }
      break;

    default: // Handle other tags as generic text if they have content, or try to recurse
      if (textContent) {
        blockType = 'text';
        componentData = { text: innerHTML.trim(), variant: 'paragraph' };
        const defaultTextForMeasure = getTextForMeasurement(innerHTML);
        const measuredDefaultTextHeight = getMeasuredDomHeight(innerHTML, layout.width);
        layout.height = Math.max(MIN_TEXT_HEIGHT_PX, measuredDefaultTextHeight) + HEIGHT_SAFETY_MARGIN_PX;
        consumedChildNodes = true; 

      } else if (significantChildrenArray.length > 0 && depth < 2) {
        return { component: null, consumedChildNodes: false };
      } else {
        return { component: null, consumedChildNodes: true }; 
      }
  }

  if (blockType) {
    const finalComponent: VisualComponent = { 
      id: componentId, 
      type: blockType, 
      data: componentData, 
      layout, 
      order: 0,
      // Diagnostic style removed
      // style: { ...(componentData.style || {}), ...diagnosticStyle } 
    };
    return { component: finalComponent, consumedChildNodes };
  }
  return { component: null, consumedChildNodes: consumedChildNodes };
}

function processNodesRecursive(
  nodes: NodeListOf<ChildNode> | HTMLCollection,
  currentYPosition: { y: number },
  slideWidth: number,
  slideHeight: number, 
  startNewSlideCb: () => void, 
  depth: number = 0
): VisualComponent[] {
  const componentsForThisPass: VisualComponent[] = [];
  Array.from(nodes).forEach(node => {
    if (!isSignificantNode(node as Node)) {
      return;
    }

    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const result = mapElementToVisualComponent(element, slideWidth, depth); 
      
      if (result.component) {
        if (currentYPosition.y + result.component.layout.height > slideHeight - DEFAULT_SLIDE_PADDING && componentsForThisPass.length > 0) {
          startNewSlideCb(); 
        }
        result.component.layout.y = currentYPosition.y;
        
        componentsForThisPass.push(result.component);
        currentYPosition.y += result.component.layout.height + DEFAULT_COMPONENT_SPACING;
      }
      
      if (!result.consumedChildNodes && element.childNodes.length > 0 && depth < 3) {
        let childSlideWidth = slideWidth;
        // Attempt to get width from parent div if it's not consumed and might have its own width
        if (element.tagName.toLowerCase() === 'div') {
            const styleAttr = element.getAttribute('style');
            if (styleAttr) {
                const match = styleAttr.match(/width:\s*(\d+)(px|%)/);
                if (match && match[1]) {
                    const w = parseInt(match[1]);
                    if (match[2] === 'px' && w > 0 && w < slideWidth) {
                        childSlideWidth = w - (2 * DEFAULT_COMPONENT_X); // Account for potential padding
                    } else if (match[2] === '%' && w > 0 && w <= 100) {
                        childSlideWidth = (slideWidth * w / 100) - (2 * DEFAULT_COMPONENT_X);
                    }
                    childSlideWidth = Math.max(100, childSlideWidth); // Ensure a minimum sensible width
                }
            }
        }
        const childComponents = processNodesRecursive(element.childNodes, currentYPosition, childSlideWidth, slideHeight, startNewSlideCb, depth + 1);
        componentsForThisPass.push(...childComponents);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
        const currentTextContent = (node.textContent || '').trim(); // Renamed to avoid conflict
        if (currentTextContent.length > 5) { 
            let textWidth = slideWidth - 2 * DEFAULT_COMPONENT_X; // Use available slide width
            const measuredLooseTextHeight = getMeasuredDomHeight(currentTextContent, textWidth);
            const textHeight = Math.max(MIN_TEXT_HEIGHT_PX, measuredLooseTextHeight) + HEIGHT_SAFETY_MARGIN_PX;
            
            if (currentYPosition.y + textHeight > slideHeight - DEFAULT_SLIDE_PADDING && componentsForThisPass.length > 0) {
              startNewSlideCb();
              currentYPosition.y = DEFAULT_SLIDE_PADDING; // Reset Y for new slide
            }

            const newTextComponent: VisualComponent = {
                id: generateUUID(), type: 'text', data: { text: currentTextContent, variant: 'paragraph' },
                layout: { x: DEFAULT_COMPONENT_X, y: currentYPosition.y, width: textWidth, height: textHeight, zIndex: 1 },
                order: 0, 
            };
            componentsForThisPass.push(newTextComponent);
            currentYPosition.y += textHeight + DEFAULT_COMPONENT_SPACING;
        }
    }
  });
  return componentsForThisPass;
}

export function convertHtmlToDeckSections(htmlString: string): DeckSection[] {
  console.log('[Converter] Starting HTML to Deck Sections conversion.');
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const sections: DeckSection[] = [];
  let globalSectionOrder = 0;
  
  const slideElements = doc.querySelectorAll('section.slide');
  console.log(`[Converter] Found ${slideElements.length} <section class="slide"> elements.`);

  const createNewSection = (title: string, componentsToAdd: VisualComponent[], currentPartCounter: number): void => {
    const sectionTitle = currentPartCounter === 0 ? title : `${title} (Part ${currentPartCounter + 1})`;
    if (componentsToAdd.length === 0 && sections.some(s => s.title === sectionTitle)) {
        // Avoid creating totally empty duplicate named sections if a split happened with no content for a part
        if (sections.length > 0 && sections[sections.length-1].components.length === 0 && sections[sections.length-1].title === sectionTitle) return;
        // Allow first section to be empty if no components were generated at all
        if (sections.length === 0 && componentsToAdd.length === 0) { /* allow */ }
        else if (componentsToAdd.length === 0) return;
    }

    const orderedComponents = componentsToAdd.map((comp, index) => ({
      ...comp,
      order: index,
    }));
    sections.push({ 
      id: generateUUID(), 
      title: sectionTitle, 
      type: 'custom', 
      components: orderedComponents, 
      order: globalSectionOrder++ 
    });
    console.log(`[Converter] Created section: "${sectionTitle}", ${orderedComponents.length} components.`);
  };
  
  if (slideElements.length === 0) {
    console.warn("[Converter] No <section class=\"slide\"> elements found. Treating entire body as one or more slides.");
    let baseTitle = doc.title || 'Imported Content';
    const h1 = doc.body.querySelector('h1');
    if (h1 && h1.textContent) baseTitle = getCleanedTextContent(h1);
    
    let yPos = { y: DEFAULT_SLIDE_PADDING };
    let componentsForCurrentPage: VisualComponent[] = [];
    let partCounterForBody = 0; 

    const startNewPageForBody = () => {
      if (componentsForCurrentPage.length > 0) {
        createNewSection(baseTitle, componentsForCurrentPage, partCounterForBody);
      }
      componentsForCurrentPage = [];
      yPos.y = DEFAULT_SLIDE_PADDING; 
      partCounterForBody++;
    };
    
    const bodyNodes = doc.body.childNodes;
    const allBodyComponents = processNodesRecursive(bodyNodes, yPos, LOGICAL_SLIDE_WIDTH, LOGICAL_SLIDE_HEIGHT, startNewPageForBody, 0);
    componentsForCurrentPage.push(...allBodyComponents); 
    
    if (componentsForCurrentPage.length > 0 || sections.length === 0) {
      createNewSection(baseTitle, componentsForCurrentPage, partCounterForBody);
    }
    
  } else {
    slideElements.forEach((slideElement, slideIndex) => {
      let baseSlideTitle = `Slide ${slideIndex + 1}`;
      const firstHeading = slideElement.querySelector('h1, h2, h3, h4, h5, h6');
      if (firstHeading) {
          const titleText = getCleanedTextContent(firstHeading as Element);
          if (titleText) baseSlideTitle = titleText;
      }
      
      let currentYPositionInLogicalSlide = { y: DEFAULT_SLIDE_PADDING };
      let componentsForCurrentPage: VisualComponent[] = [];
      let partCounterForSection = 0; 

      const startNewPageForSectionElement = () => {
        if (componentsForCurrentPage.length > 0) {
          createNewSection(baseSlideTitle, componentsForCurrentPage, partCounterForSection);
        }
        componentsForCurrentPage = [];
        currentYPositionInLogicalSlide.y = DEFAULT_SLIDE_PADDING;
        partCounterForSection++;
      };

      console.log(`[Converter] Processing HTML <section> ${slideIndex + 1}: "${baseSlideTitle}"`);
      const contentContainer = slideElement.querySelector('.slide-content') || slideElement;
      
      const sectionChildNodes = contentContainer.childNodes;
      const sectionComponents = processNodesRecursive(
        sectionChildNodes, 
        currentYPositionInLogicalSlide,
        LOGICAL_SLIDE_WIDTH, 
        LOGICAL_SLIDE_HEIGHT, 
        startNewPageForSectionElement,
        0
      );
      componentsForCurrentPage.push(...sectionComponents);
      
      if (componentsForCurrentPage.length > 0 || partCounterForSection === 0) {
        createNewSection(baseSlideTitle, componentsForCurrentPage, partCounterForSection);
      }
    });
  }

  console.log(`[Converter] Conversion complete. Total sections created: ${sections.length}`);
  return sections;
}

// Helper for applying styles to an element if it's an HTMLElement
// This was causing issues with Deno/TS, so removing it and using direct assignment or helper functions.
// declare global {
//     interface HTMLElement {
//         apply<T extends HTMLElement>(this: T, func: (el: T) => void): T;
//     }
//     interface Element {
//         apply<T extends Element>(this: T, func: (el: T) => void): T;
//     }
//     interface Node {
//       apply<T extends Node>(this: T, func: (el: T) => void): T;
//     }
// }

// if (typeof Element !== 'undefined' && !Element.prototype.apply) {
//     Element.prototype.apply = function<T extends Element>(this: T, func: (el: T) => void): T {
//         func(this);
//         return this;
//     };
// }
// if (typeof HTMLElement !== 'undefined' && !HTMLElement.prototype.apply) {
//   HTMLElement.prototype.apply = function<T extends HTMLElement>(this: T, func: (el: T) => void): T {
//       func(this);
//       return this;
//   };
// }
// if (typeof Node !== 'undefined' && !Node.prototype.apply) {
//   Node.prototype.apply = function<T extends Node>(this: T, func: (el: T) => void): T {
//       func(this);
//       return this;
//   };
// }
