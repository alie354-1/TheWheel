import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, RadialLinearScale, Filler, Tooltip, Legend, Title } from 'chart.js';
import { Bar, Line, Pie, Doughnut, Radar, PolarArea, Scatter, Bubble } from 'react-chartjs-2';
// Import VisualComponent from the correct path relative to this file
// ChartBlockTypeDefinition and ChartData are needed. VisualComponent is not directly used for props anymore.
import { ChartBlock as ChartBlockTypeDefinition, ChartData } from '../../../../../deck-builder/types/blocks';


// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
  Title
);

interface ChartBlockComponentProps {
  block: ChartBlockTypeDefinition; 
}

const ChartBlockComponent: React.FC<ChartBlockComponentProps> = ({ block }) => {
  // Destructure directly from block, which is now ChartBlockTypeDefinition
  const { chartType, data: chartSpecificData, options: blockOptions, id } = block;

  // Default options - can be overridden by block.options
  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: !!blockOptions?.plugins?.title?.text, // Only display if title text is provided
        text: blockOptions?.plugins?.title?.text || '',
      },
    },
    // Spread any other options from the block
    ...blockOptions, 
  };

  // Ensure data is in the format Chart.js expects
  const chartJsData = {
    labels: chartSpecificData?.labels || [],
    datasets: chartSpecificData?.datasets || [],
  };

  // Helper to render the correct chart type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return <Bar id={id} options={defaultOptions} data={chartJsData} />;
      case 'line':
        return <Line id={id} options={defaultOptions} data={chartJsData} />;
      case 'pie':
        return <Pie id={id} options={defaultOptions} data={chartJsData} />;
      case 'doughnut':
        return <Doughnut id={id} options={defaultOptions} data={chartJsData} />;
      case 'radar':
        return <Radar id={id} options={defaultOptions} data={chartJsData} />;
      case 'polarArea':
        return <PolarArea id={id} options={defaultOptions} data={chartJsData} />;
      case 'scatter':
        // Scatter charts might need specific data structure (e.g., {x, y} points)
        // This basic setup assumes datasets[n].data contains such points.
        return <Scatter id={id} options={defaultOptions} data={chartJsData} />;
      case 'bubble':
        // Bubble charts also need specific data structure (e.g., {x, y, r} points)
        return <Bubble id={id} options={defaultOptions} data={chartJsData} />;
      default:
        return <div className="text-red-500">Unsupported chart type: {chartType}</div>;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {chartSpecificData && chartSpecificData.datasets && chartSpecificData.labels ? (
        renderChart()
      ) : (
        <div className="flex items-center justify-center h-full text-gray-500">
          Configure chart data in the inspector.
        </div>
      )}
    </div>
  );
};

export default ChartBlockComponent;
