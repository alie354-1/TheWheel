// src/deck-builder/export/services/ComponentExporters.ts

import PptxGenJS from 'pptxgenjs';
import { VisualComponent, DeckTheme, DeckThemeColors, DeckThemeFonts } from '../../types';
import {
  TextBlock,
  ImageBlock,
  ListBlock,
  QuoteBlock,
  ChartBlock,
  ShapeBlock,
  VideoBlock,
  CodeBlock,
  ListItem,
  ChartData as DeckChartData,
  BlockType,
  ButtonBlock,
  DividerBlock,
  IconBlock,
  ChecklistBlock,
  EmbedBlock,
  CitationBlock,
  CalloutBoxBlock,
  ProblemSolutionBlock,
  DemoGalleryBlock,
  MarketMapBlock,
  TeamCardBlock,
  TractionWidgetBlock,
  MilestoneTrackerBlock,
  InvestmentAskBlock,
  CtaCardBlock, // Corrected Casing
} from '../../types/blocks';
import {
  pxToInch,
  formatColorForPptx,
  resolveColor,
  parseFontSize,
  applyCommonTextStyles,
  addPlaceholderComponent,
  getSafe,
  sanitizeLayout,
  convertRichTextToPptx,
  resolveFontFamily
} from './ExportUtils';

// --- Text Component Exporter ---
export const handleTextComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<TextBlock>; 
  const style = component.style;
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  const textProps: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
  };

  applyCommonTextStyles(textProps, style, themeColors, themeFonts);

  if (data?.variant === 'heading' && !textProps.fontSize) {
    textProps.fontSize = parseFontSize(themeFonts?.heading, 28); 
    textProps.fontFace = resolveFontFamily(style?.fontFamily, themeFonts, 'heading');
  } else if (data?.variant === 'subheading' && !textProps.fontSize) {
    textProps.fontSize = parseFontSize(themeFonts?.body, 22); 
    textProps.fontFace = resolveFontFamily(style?.fontFamily, themeFonts, 'heading');
  } else {
     textProps.fontFace = resolveFontFamily(style?.fontFamily, themeFonts, 'body');
  }
  
  if (!textProps.fontSize) {
    textProps.fontSize = parseFontSize(themeFonts?.body || style?.fontSize, 18);
  }

  let textContent = getSafe(data, 'text', '');
  if (!textContent && component.data?.textContent) { 
    textContent = component.data.textContent;
  }
  
  if (typeof textContent === 'object' && textContent !== null) {
    textContent = convertRichTextToPptx(textContent);
  }
  
  if (textContent === '' && data?.variant) {
    textContent = `[${data.variant}]`; 
  } else if (textContent === '') {
    textContent = '[Empty Text Block]';
  }

  slide.addText(textContent || ' ', textProps); 
};

// --- Image Component Exporter ---
export const handleImageComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  _theme: DeckTheme | null 
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<ImageBlock>;

  const imageUrl = getSafe(data, 'src');
  let imagePath: string;

  if (!imageUrl || typeof imageUrl !== 'string') {
    console.warn('Image component missing or invalid src:', component);
    addPlaceholderComponent(slide, 'Image (No Source)', layout);
    return;
  }

  // Fallback for placehold.co URLs to prevent export failure due to 404s/CORS
  if (imageUrl.includes('placehold.co')) {
    console.warn(`PPTX Export: Using fallback base64 image for problematic URL: ${imageUrl}`);
    // 1x1 transparent GIF
    imagePath = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  } else {
    imagePath = imageUrl;
  }

  const imageProps: PptxGenJS.ImageProps = {
    path: imagePath,
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
  };
  
  if (component.style?.objectFit === 'contain') {
    imageProps.sizing = { type: 'contain', w: pxToInch(layout.width), h: pxToInch(layout.height) };
  } else if (component.style?.objectFit === 'cover') {
    imageProps.sizing = { type: 'cover', w: pxToInch(layout.width), h: pxToInch(layout.height) };
  }

  slide.addImage(imageProps);
};

// --- List Component Exporter ---
export const handleListComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<ListBlock>;
  const style = component.style;
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  const items = getSafe(data, 'items', []) as Partial<ListItem>[];

  if (!items || items.length === 0) {
    addPlaceholderComponent(slide, 'List (No Items)', layout);
    return;
  }

  const listContainerOptions: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
  };
  
  const defaultFontSize = parseFontSize(style?.fontSize || themeFonts?.body, 16);
  const defaultItemColor = resolveColor(style?.color, themeColors?.text);
  const defaultFontFamily = resolveFontFamily(style?.fontFamily, themeFonts, 'body');

  const textObjects: PptxGenJS.TextProps[] = items.map((item, index) => {
    const itemText = getSafe(item, 'text', `Item ${index + 1}`);
    const itemStyle = getSafe(item, 'style', {}) as React.CSSProperties;

    const bulletOptions: PptxGenJS.TextPropsOptions['bullet'] = data?.ordered
      ? { type: 'number', style: 'arabicPeriod' } 
      : {type: 'bullet'}; 

    return {
      text: itemText,
      options: {
        fontSize: parseFontSize(itemStyle.fontSize || style?.fontSize, defaultFontSize),
        fontFace: resolveFontFamily(itemStyle.fontFamily || style?.fontFamily, themeFonts, 'body', defaultFontFamily),
        color: resolveColor(itemStyle.color || style?.color, themeColors?.text, defaultItemColor),
        bullet: bulletOptions,
        paraSpaceBefore: index === 0 ? 0 : Number(defaultFontSize) * 0.2, 
      },
    };
  });
  
  slide.addText(textObjects, listContainerOptions);
};

// --- Quote Component Exporter ---
export const handleQuoteComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<QuoteBlock>;
  const style = component.style;
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  const quoteText = getSafe(data, 'text', '[Quote Text Missing]');
  const authorText = getSafe(data, 'author', '');

  const quoteFontSize = parseFontSize(style?.fontSize, 20);
  const authorFontSize = parseFontSize(style?.fontSize ? Number(style.fontSize) * 0.8 : undefined, 16);

  const textElements: PptxGenJS.TextProps[] = [
    {
      text: `“${quoteText}”`, 
      options: {
        x: pxToInch(layout.x),
        y: pxToInch(layout.y),
        w: pxToInch(layout.width),
        h: pxToInch(layout.height * (authorText ? 0.75 : 1)), 
        fontFace: resolveFontFamily(style?.fontFamily, themeFonts, 'body'),
        fontSize: quoteFontSize,
        color: resolveColor(style?.color, themeColors?.text),
        italic: true,
        align: (style?.textAlign as PptxGenJS.AlignH) || 'center',
        valign: 'middle',
      },
    },
  ];

  if (authorText) {
    textElements.push({
      text: `— ${authorText}`,
      options: {
        x: pxToInch(layout.x),
        y: pxToInch(layout.y + layout.height * 0.75),
        w: pxToInch(layout.width),
        h: pxToInch(layout.height * 0.25),
        fontFace: resolveFontFamily(style?.fontFamily, themeFonts, 'body'),
        fontSize: authorFontSize,
        color: resolveColor(style?.color, themeColors?.text, '666666'), 
        align: (style?.textAlign as PptxGenJS.AlignH) || 'right',
        valign: 'top',
      },
    });
  }
  
  textElements.forEach(el => slide.addText(el.text!, el.options));
};

// --- Chart Component Exporter ---
export const handleChartComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<ChartBlock>;
  const themeColors = theme?.colors;

  const chartTypeString = getSafe(data, 'chartType', 'bar') as string;
  const chartData = getSafe(data, 'data') as DeckChartData | undefined;

  if (!chartData || !chartData.labels || !chartData.datasets || chartData.datasets.length === 0) {
    addPlaceholderComponent(slide, 'Chart (Invalid Data)', layout);
    return;
  }

  const pptxChartData: Array<{ name: string; labels: string[]; values: number[]; }> = chartData.datasets.map((dataset, index) => ({
    name: dataset.label || `Dataset ${index + 1}`,
    labels: chartData.labels,
    values: dataset.data,
  }));
  
  const chartOptions: PptxGenJS.IChartOpts = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    chartColors: themeColors ? [
        formatColorForPptx(themeColors.primary),
        formatColorForPptx(themeColors.secondary),
        formatColorForPptx(themeColors.accent),
        formatColorForPptx(themeColors.text), 
    ] : undefined,
    showLegend: getSafe(data, 'options.legend.display', true), // Default to true if not specified
    // ... other chart options from component.data.options or component.style
  };
  
  const title = getSafe(component.data, 'options.title.text') || getSafe(component.data, 'title');
  if (title) {
    chartOptions.title = title;
    chartOptions.titleFontSize = parseFontSize(getSafe(data, 'options.title.font.size'), 14);
    chartOptions.titleColor = resolveColor(getSafe(data, 'options.title.color'), themeColors?.text);
  }

  // Map internal chartType string to PptxGenJS.ChartType enum or string literal
  let pptxLibChartType: string; // Explicitly use string

  // Assign direct string literals expected by PptxGenJS
  switch (chartTypeString.toLowerCase()) {
    case 'bar': pptxLibChartType = 'bar'; break;
    case 'line': pptxLibChartType = 'line'; break;
    case 'pie': pptxLibChartType = 'pie'; break;
    case 'doughnut': pptxLibChartType = 'doughnut'; break;
    case 'radar': pptxLibChartType = 'radar'; break;
    case 'scatter': pptxLibChartType = 'scatter'; break;
    case 'area': pptxLibChartType = 'area'; break; // Added area
    case 'bar3d': pptxLibChartType = 'bar3D'; break; // Note '3D' casing
    case 'bubble': pptxLibChartType = 'bubble'; break;
    case 'polararea': 
      pptxLibChartType = 'polarArea'; 
      console.warn(`Chart type 'polarArea' may have limited support or specific requirements in PptxGenJS.`);
      break;
    default:
      console.warn(`Unsupported chart type for PPTX: ${chartTypeString}. Defaulting to bar chart.`);
      pptxLibChartType = 'bar';
  }

  try {
    slide.addChart(pptxLibChartType as any, pptxChartData, chartOptions); // Keep 'as any' for robustness
  } catch (error) {
    console.error("Error adding chart to PPTX:", error, component, pptxChartData, chartOptions);
    addPlaceholderComponent(slide, `Chart (Export Error: ${chartTypeString})`, layout);
  }
};

// --- Shape Component Exporter ---
export const handleShapeComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<ShapeBlock>;
  const style = component.style;
  const themeColors = theme?.colors;

  const shapeType = getSafe(data, 'shape');
  
  const shapeOptions: PptxGenJS.ShapeProps = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    fill: { color: resolveColor(style?.backgroundColor, themeColors?.primary, 'F0F0F0') },
  };

  if (style?.borderColor || style?.borderWidth) {
    shapeOptions.line = {
      color: resolveColor(style.borderColor, themeColors?.secondary, '000000'),
      width: typeof style.borderWidth === 'string' ? parseFloat(style.borderWidth) : (style.borderWidth || 1),
    };
  }
  
  let finalPptxShapeType: any; 

  switch (shapeType) {
    case 'rectangle':
      finalPptxShapeType = 'rect';
      break;
    case 'circle':
      finalPptxShapeType = 'oval';
      const size = Math.min(layout.width, layout.height);
      shapeOptions.w = pxToInch(size);
      shapeOptions.h = pxToInch(size);
      break;
    default:
      console.warn(`Unsupported shape type: ${shapeType}`);
      addPlaceholderComponent(slide, `Shape (${shapeType || 'Unknown'})`, layout);
      return;
  }

  slide.addShape(finalPptxShapeType, shapeOptions);
};

// --- Video Component Exporter ---
export const handleVideoComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  _theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<VideoBlock>;
  const videoSrc = getSafe(data, 'src');

  if (!videoSrc || typeof videoSrc !== 'string') {
    addPlaceholderComponent(slide, 'Video (No Source)', layout);
    return;
  }
  
  slide.addText('Click to view video', {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    hyperlink: { url: videoSrc, tooltip: `Video: ${videoSrc}` },
    align: 'center',
    valign: 'middle',
    color: '0077CC', 
    underline: { style: 'sng', color: '0077CC' }, 
  });
};

// --- Code Component Exporter ---
export const handleCodeComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<CodeBlock>;
  const style = component.style;
  const themeColors = theme?.colors;

  const codeText = getSafe(data, 'code', '[No code content]');

  const textProps: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    fontFace: style?.fontFamily || 'Courier New', 
    fontSize: parseFontSize(style?.fontSize, 10), 
    color: resolveColor(style?.color, themeColors?.text, '333333'),
    fill: { color: formatColorForPptx(style?.backgroundColor || themeColors?.background || 'F5F5F5') }, 
    margin: pxToInch(10), 
  };

  slide.addText(codeText, textProps);
};

// --- Button Component Exporter ---
export const handleButtonComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<ButtonBlock>;
  const style = component.style;
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  const buttonText = getSafe(data, 'label', 'Button');
  const buttonUrl = getSafe(data, 'url');

  const shapeOptions: PptxGenJS.ShapeProps = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    fill: { color: resolveColor(style?.backgroundColor, themeColors?.primary, '0077CC') },
  };
   if (style?.borderColor || style?.borderWidth) {
    shapeOptions.line = {
      color: resolveColor(style.borderColor, themeColors?.secondary, '000000'),
      width: typeof style.borderWidth === 'string' ? parseFloat(style.borderWidth) : (Number(style.borderWidth) || 1),
    };
  }

  slide.addShape('rect', shapeOptions);

  const textProps: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    align: 'center',
    valign: 'middle',
    fontSize: parseFontSize(style?.fontSize, 14),
    fontFace: resolveFontFamily(style?.fontFamily, themeFonts, 'body'),
    color: resolveColor(style?.color, themeColors?.text, 'FFFFFF'), 
  };
  
  if (buttonUrl && typeof buttonUrl === 'string') {
    textProps.hyperlink = { url: buttonUrl, tooltip: `Link: ${buttonUrl}` };
  }

  slide.addText(buttonText, textProps);
};

// --- Divider Component Exporter ---
export const handleDividerComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const style = component.style;
  const themeColors = theme?.colors;

  const isVertical = layout.height > layout.width;
  const lineWidthInPx = typeof style?.borderWidth === 'string' ? parseFloat(style.borderWidth) : Number(style?.borderWidth) || 1;
  const lineWidthInches = pxToInch(Math.max(1, lineWidthInPx)); 

  const lineColor = resolveColor(style?.borderColor || style?.backgroundColor, themeColors?.secondary, 'C0C0C0');

  const shapeOptions: PptxGenJS.ShapeProps = {
    fill: { color: lineColor }, 
  };

  if (isVertical) {
    shapeOptions.x = pxToInch(layout.x + layout.width / 2 - lineWidthInPx / 2);
    shapeOptions.y = pxToInch(layout.y);
    shapeOptions.w = lineWidthInches;
    shapeOptions.h = pxToInch(layout.height);
  } else {
    shapeOptions.x = pxToInch(layout.x);
    shapeOptions.y = pxToInch(layout.y + layout.height / 2 - lineWidthInPx / 2);
    shapeOptions.w = pxToInch(layout.width);
    shapeOptions.h = lineWidthInches;
  }

  slide.addShape('rect', shapeOptions);
};

// --- Icon Component Exporter ---
export const handleIconComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<IconBlock>;
  const style = component.style;
  const themeColors = theme?.colors;

  const iconName = getSafe(data, 'iconName', 'HelpCircle'); 
  const placeholderText = `[ICON: ${iconName}]`;
  slide.addText(placeholderText, {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    align: 'center',
    valign: 'middle',
    fontSize: Math.min(parseFontSize(style?.fontSize, 24), pxToInch(layout.height) * 20), 
    color: resolveColor(style?.color, themeColors?.text),
  });
};

// --- Checklist Component Exporter ---
export const handleChecklistComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<ChecklistBlock>;
  const style = component.style;
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  const items = getSafe(data, 'items', []) as { text: string; checked: boolean }[];

  if (!items || items.length === 0) {
    addPlaceholderComponent(slide, 'Checklist (No Items)', layout);
    return;
  }

  const listContainerOptions: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
  };

  const defaultFontSize = parseFontSize(style?.fontSize, 14);
  const defaultItemColor = resolveColor(style?.color, themeColors?.text);

  const textObjects: PptxGenJS.TextProps[] = items.map((item, index) => {
    const prefix = item.checked ? '☑ ' : '☐ '; 
    return {
      text: prefix + (item.text || `Task ${index + 1}`),
      options: {
        fontSize: defaultFontSize,
        fontFace: resolveFontFamily(style?.fontFamily, themeFonts, 'body'),
        color: defaultItemColor,
        paraSpaceBefore: index === 0 ? 0 : defaultFontSize * 0.3,
      },
    };
  });

  slide.addText(textObjects, listContainerOptions);
};

// --- Embed Component Exporter ---
export const handleEmbedComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  _theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<EmbedBlock>;
  const url = getSafe(data, 'url');

  if (!url || typeof url !== 'string') {
    addPlaceholderComponent(slide, 'Embed (No URL)', layout);
    return;
  }

  slide.addText(`View Embedded Content: ${url.substring(0,50)}${url.length > 50 ? '...' : ''}`, {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    hyperlink: { url: url, tooltip: `Link: ${url}` },
    align: 'center',
    valign: 'middle',
    color: '0077CC',
    fontSize: 12,
    underline: { style: 'sng', color: '0077CC' },
  });
};

// --- Citation Component Exporter ---
export const handleCitationComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<CitationBlock>;
  const style = component.style;
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  let citationText = getSafe(data, 'text', '[Citation text missing]');
  if (!citationText && data?.source) { 
    citationText = `${data.author || ''} (${data.year || ''}). ${data.source}.`;
  }
  
  const textProps: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
  };
  applyCommonTextStyles(textProps, style, themeColors, themeFonts); 
  
  textProps.fontSize = parseFontSize(style?.fontSize, 10); 
  textProps.italic = style?.fontStyle === 'italic' || true; 
  textProps.color = resolveColor(style?.color, themeColors?.text, '595959'); 

  slide.addText(citationText, textProps);
};

// --- Callout Box Component Exporter ---
export const handleCalloutBoxComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  const data = component.data as Partial<CalloutBoxBlock>;
  const style = component.style; 
  const themeColors = theme?.colors;
  const themeFonts = theme?.fonts;

  const text = getSafe(data, 'text', '[Callout text missing]');
  const title = getSafe(data, 'title');
  const variant = getSafe(data, 'variant', 'info');
  
  let fillColor = style?.backgroundColor;
  let textColor = style?.color;
  let borderColor = style?.borderColor;

  if (!fillColor) { 
    switch (variant) {
      case 'info': fillColor = themeColors?.primary || 'E0EFFF'; break; 
      case 'warning': fillColor = 'FFF3CD'; break; 
      case 'success': fillColor = 'D4EDDA'; break; 
      case 'danger': fillColor = 'F8D7DA'; break;  
      case 'custom': fillColor = data?.backgroundColor || 'F0F0F0'; break;
      default: fillColor = 'F0F0F0'; 
    }
  }
  fillColor = formatColorForPptx(fillColor);

  if (!textColor) {
     textColor = data?.textColor || themeColors?.text || '000000';
  }
   textColor = formatColorForPptx(textColor);

  if (!borderColor) {
    borderColor = data?.borderColor || fillColor; 
  }
  borderColor = formatColorForPptx(borderColor);

  const shapeOptions: PptxGenJS.ShapeProps = {
    x: pxToInch(layout.x),
    y: pxToInch(layout.y),
    w: pxToInch(layout.width),
    h: pxToInch(layout.height),
    fill: { color: fillColor },
    line: { color: borderColor, width: 1 },
  };
  slide.addShape('rect', shapeOptions);

  const textProps: PptxGenJS.TextPropsOptions = {
    x: pxToInch(layout.x + 10), 
    y: pxToInch(layout.y + 5),
    w: pxToInch(layout.width - 20),
    h: pxToInch(layout.height - 10),
    fontFace: resolveFontFamily(style?.fontFamily, themeFonts, 'body'),
    color: textColor,
    fontSize: parseFontSize(style?.fontSize, 12),
  };
  
  if (title) {
     const textRuns: PptxGenJS.TextProps[] = [
        { text: title, options: { bold: true, fontSize: parseFontSize(style?.fontSize, 12) * 1.1 } },
        { text: `\n${text}`, options: { fontSize: parseFontSize(style?.fontSize, 12) } } 
    ];
    slide.addText(textRuns, textProps);

  } else {
    slide.addText(text, textProps);
  }
};

// --- Placeholder Handlers for New Components ---
export const handleProblemSolutionComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'problemSolution', sanitizeLayout(component.layout));
};
export const handleDemoGalleryComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'demoGallery', sanitizeLayout(component.layout));
};
export const handleMarketMapComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'marketMap', sanitizeLayout(component.layout));
};
export const handleTeamCardComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'teamCard', sanitizeLayout(component.layout));
};
export const handleTractionWidgetComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'tractionWidget', sanitizeLayout(component.layout));
};
export const handleMilestoneTrackerComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'milestoneTracker', sanitizeLayout(component.layout));
};
export const handleInvestmentAskComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'investmentAsk', sanitizeLayout(component.layout));
};
export const handleCtaCardComponent = (slide: PptxGenJS.Slide, component: VisualComponent, _theme: DeckTheme | null): void => {
  addPlaceholderComponent(slide, 'ctaCard', sanitizeLayout(component.layout));
};

// Generic handler for component types not yet explicitly supported
export const handleGenericComponent = (
  slide: PptxGenJS.Slide,
  component: VisualComponent,
  _theme: DeckTheme | null
): void => {
  const layout = sanitizeLayout(component.layout);
  addPlaceholderComponent(slide, component.type, layout);
};
