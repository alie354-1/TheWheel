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

export interface HtmlMeasurement {
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

  // const rect = measureElement.getBoundingClientRect(); // rect gives fractional values, offsetHeight/Width are rounded integers
  const height = measureElement.offsetHeight; 
  const width = measureElement.offsetWidth;

  container.removeChild(measureElement);

  return { width, height };
}
