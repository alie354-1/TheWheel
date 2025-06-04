// src/deck-builder/export/services/PptxExportService.ts

import PptxGenJS from 'pptxgenjs';
import { Deck, VisualComponent, DeckTheme, DeckThemeColors, DeckThemeFonts } from '../../types';
import { BlockType } from '../../types/blocks';
import {
  pxToInch,
  isValidDeckData,
  addPlaceholderComponent,
  sanitizeLayout,
  resolveColor,
  getSafe,
  formatColorForPptx // Added missing import
} from './ExportUtils';
import {
  handleTextComponent,
  handleImageComponent,
  handleListComponent,
  handleQuoteComponent,
  handleChartComponent,
  handleShapeComponent,
  handleVideoComponent,
  handleCodeComponent,
  handleButtonComponent,
  handleDividerComponent,
  handleIconComponent,
  handleChecklistComponent,
  handleEmbedComponent,
  handleCitationComponent,
  handleCalloutBoxComponent,
  handleProblemSolutionComponent,
  handleDemoGalleryComponent,
  handleMarketMapComponent,
  handleTeamCardComponent,
  handleTractionWidgetComponent,
  handleMilestoneTrackerComponent,
  handleInvestmentAskComponent,
  handleCtaCardComponent,
  handleGenericComponent, // Fallback for other/unsupported types
} from './ComponentExporters';

const MASTER_SLIDE_NAME = 'CUSTOM_MASTER_16X9';

/**
 * Dispatches a visual component to its appropriate handler for PPTX conversion.
 * @param slide The PptxGenJS slide object.
 * @param component The visual component to process.
 * @param theme The deck's theme.
 */
const dispatchComponentToHandler = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  try {
    // Ensure component and type are valid before dispatching
    if (!component || !component.type) {
      console.warn('PPTX Export: Invalid component data or missing type.', component);
      const layout = sanitizeLayout(component?.layout);
      addPlaceholderComponent(slide, 'Invalid Component Data', layout);
      return;
    }

    switch (component.type as BlockType) {
      case 'text':
        handleTextComponent(slide, component, theme);
        break;
      case 'image':
      case 'heroImage': // Assuming heroImage is similar to image for now
      case 'imageGallery': // Placeholder, needs specific handling
      case 'imageWithCaption': // Placeholder, needs specific handling
        handleImageComponent(slide, component, theme);
        break;
      case 'list':
        handleListComponent(slide, component, theme);
        break;
      case 'quote':
      case 'visualQuote': // Assuming visualQuote is similar for now
        handleQuoteComponent(slide, component, theme);
        break;
      case 'chart':
        handleChartComponent(slide, component, theme);
        break;
      case 'shape':
        handleShapeComponent(slide, component, theme);
        break;
      case 'video': // Includes 'mediaHero' if video type
        handleVideoComponent(slide, component, theme);
        break;
      case 'code':
        handleCodeComponent(slide, component, theme);
        break;
      case 'button':
        handleButtonComponent(slide, component, theme);
        break;
      case 'divider':
        handleDividerComponent(slide, component, theme);
        break;
      case 'icon':
        handleIconComponent(slide, component, theme);
        break;
      case 'checklist':
        handleChecklistComponent(slide, component, theme);
        break;
      case 'embed':
        handleEmbedComponent(slide, component, theme);
        break;
      case 'citation':
        handleCitationComponent(slide, component, theme);
        break;
      case 'calloutBox':
        handleCalloutBoxComponent(slide, component, theme);
        break;
      case 'problemSolution':
        handleProblemSolutionComponent(slide, component, theme);
        break;
      case 'demoGallery':
        handleDemoGalleryComponent(slide, component, theme);
        break;
      case 'marketMap':
        handleMarketMapComponent(slide, component, theme);
        break;
      case 'teamCard':
        handleTeamCardComponent(slide, component, theme);
        break;
      case 'tractionWidget':
        handleTractionWidgetComponent(slide, component, theme);
        break;
      case 'milestoneTracker':
        handleMilestoneTrackerComponent(slide, component, theme);
        break;
      case 'investmentAsk':
        handleInvestmentAskComponent(slide, component, theme);
        break;
      case 'ctaCard':
        handleCtaCardComponent(slide, component, theme);
        break;
      // Components that might still use generic or need specific handlers later
      case 'file':
      case 'audio':
      case 'timer':
      case 'poll':
      case 'customHtml':
      case 'timeline':
      case 'competitorTable':
      case 'logoWall':
      case 'businessModel':
      case 'testimonialCard':
      case 'useOfFunds':
      case 'mapBlock':
      case 'customImage':
      case 'metricCounter':
      case 'socialProofBadge':
      case 'opportunityIndicator':
      case 'beforeAfterComparison':
      case 'benefitCard':
      case 'competitivePositioning':
      case 'marketSegments':
      case 'advisorCard':
      case 'hiringPlan':
      case 'skillMatrix':
      case 'pressCard':
      case 'partnershipCard':
      case 'investorContactForm':
      case 'featureCard':
      case 'statsDisplay':
      case 'iconFeature':
         // For mediaHero, if it's not video, it might be an image or other content.
         // If component.data.mediaType === 'image' for mediaHero, could call handleImageComponent.
         // For now, let it fall to generic if not explicitly handled as video.
        if (component.type === 'mediaHero' && component.data?.mediaType === 'image') {
            handleImageComponent(slide, component, theme);
        } else {
            console.warn(`PPTX Export: Component type "${component.type}" using generic handler.`);
            handleGenericComponent(slide, component, theme);
        }
        break;
      default:
        console.warn(`PPTX Export: Unknown component type "${component.type}".`);
        handleGenericComponent(slide, component, theme);
        break;
    }
  } catch (error) {
    console.error(`PPTX Export: Error processing component type ${component?.type}, ID ${component?.id}:`, error);
    const layout = sanitizeLayout(component?.layout);
    addPlaceholderComponent(slide, `Error: ${component?.type || 'Unknown'}`, layout, `Error rendering ${component?.type}`);
  }
};


/**
 * Exports a deck to a PowerPoint (.pptx) file.
 * @param deck The deck object to export.
 * @param fileName The desired file name for the exported presentation.
 */
export const exportDeckToPptx = async (deck: Deck, fileName: string = 'presentation.pptx'): Promise<void> => {
  if (!isValidDeckData(deck)) {
    // isValidDeckData already logs the error
    // Optionally, throw an error or notify the user more formally
    return Promise.reject(new Error('Invalid deck data for PPTX export.'));
  }

  const pptx = new PptxGenJS();

  // Define a 16:9 master slide layout (standard widescreen)
  // Dimensions: 10" x 5.625" (default 16:9) or 13.33" x 7.5" (another common 16:9)
  // PptxGenJS default is 10x5.625. We can use this or define our own.
  // Let's use the default by not setting a custom master initially,
  // or explicitly define one if we need specific background/placeholders.
  
  // Forcing a layout:
  // pptx.layout = 'LAYOUT_WIDE'; // This is a predefined 16:9 layout in PptxGenJS
  // Or define a custom master slide if more control is needed:
  pptx.defineLayout({ name: MASTER_SLIDE_NAME, width: 10, height: 5.625 }); // Standard 16:9 inches
  pptx.layout = MASTER_SLIDE_NAME;


  // Set presentation properties
  const author = getSafe(deck, 'user_id', 'The Wheel Deck Builder'); // Example: use user_id or a default
  pptx.author = author;
  pptx.company = getSafe(deck, 'company_name', 'User Company'); // Placeholder, could be dynamic
  pptx.revision = '1'; // Could be based on deck.updated_at or a version number if available
  pptx.subject = deck.title || 'Presentation Subject';
  pptx.title = deck.title || 'Presentation Title';

  // Apply global theme defaults if available (e.g., default font, background)
  const globalTheme = deck.theme || null;
  if (globalTheme?.colors?.background) {
    // This sets the background for all slides using this master, if not overridden per slide
    // pptx.defineSlideMaster({
    //   title: MASTER_SLIDE_NAME, // Match the layout name
    //   background: { color: formatColorForPptx(globalTheme.colors.background) },
    // });
  }


  // Iterate over deck sections (slides)
  if (deck.sections && deck.sections.length > 0) {
    deck.sections.forEach((section, sectionIndex) => {
      // Each section becomes a slide. Apply the master for consistent layout.
      const slide = pptx.addSlide({ masterName: MASTER_SLIDE_NAME });

      // Apply section-specific background if defined
      if (section.slideStyle?.backgroundColor) {
        slide.background = { color: formatColorForPptx(section.slideStyle.backgroundColor) };
      } else if (globalTheme?.colors?.slideBackground) {
         slide.background = { color: formatColorForPptx(globalTheme.colors.slideBackground) };
      } else if (globalTheme?.colors?.background) {
         // Fallback to global background if no specific slide background
         slide.background = { color: formatColorForPptx(globalTheme.colors.background) };
      }


      // Add a slide title if section has one (as a distinct element, not part of components)
      // This is a common practice unless titles are exclusively managed as components.
      if (section.title) {
        slide.addText(section.title, {
          x: pxToInch(50),      // Example positioning in inches
          y: pxToInch(25),
          w: pxToInch(1280 - 100), // Full width minus margins
          h: pxToInch(70),
          fontSize: 28,         // Prominent title font size
          bold: true,
          align: 'center',
          color: resolveColor(undefined, globalTheme?.colors?.text, '000000'),
          fontFace: globalTheme?.fonts?.heading || 'Arial',
        });
      }

      // Iterate over components in the section
      if (section.components && section.components.length > 0) {
        // Sort components by 'order' or 'zIndex' if necessary for correct layering
        const sortedComponents = [...section.components].sort((a, b) => {
          const zIndexA = getSafe(a, 'layout.zIndex', getSafe(a, 'order', 0));
          const zIndexB = getSafe(b, 'layout.zIndex', getSafe(b, 'order', 0));
          return zIndexA - zIndexB;
        });

        sortedComponents.forEach(component => {
          dispatchComponentToHandler(slide, component, globalTheme);
        });
      } else if (!section.title) { // Only add "no content" if there's no title either
        // Fallback if no components and no title, to avoid a completely blank slide
        slide.addText('Slide content not available.', {
          x: 1, y: 1, w: 8, h: 1, fontSize: 18,
          color: resolveColor(undefined, globalTheme?.colors?.text, '333333')
        });
      }

      // Add slide numbers (optional, can be part of master slide definition too)
      slide.slideNumber = {
        x: pxToInch(1280 - 60), // Position to bottom-right
        y: pxToInch(720 - 30),
        fontSize: 10,
        color: resolveColor(undefined, globalTheme?.colors?.text, '333333'),
        fontFace: globalTheme?.fonts?.caption || globalTheme?.fonts?.body || 'Arial',
      };
    });
  } else {
    // If there are no sections, add a single blank title slide
    const slide = pptx.addSlide({ masterName: MASTER_SLIDE_NAME });
    slide.addText(deck.title || 'Presentation', { x: 0.5, y: 2.5, w: 9, h: 1, fontSize: 32, align: 'center' });
    if (globalTheme?.colors?.background) {
      slide.background = { color: formatColorForPptx(globalTheme.colors.background) };
    }
  }

  try {
    await pptx.writeFile({ fileName });
    console.log(`PPTX Export: Presentation "${fileName}" exported successfully.`);
  } catch (error) {
    console.error('PPTX Export: Error writing PPTX file:', error);
    // Consider re-throwing or returning a more specific error to the caller
    throw error; // Re-throw to allow UI to catch and display message
  }
};
