import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Trash2, PlusCircle } from 'lucide-react';
import { ChartData, ChartDataset } from '../../types/blocks'; // Assuming types are here

interface ChartDataEditorProps {
  value: ChartData;
  onChange: (newValue: ChartData) => void;
  chartType: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'scatter' | 'bubble';
}

const ChartDataEditor: React.FC<ChartDataEditorProps> = ({ value, onChange, chartType }) => {
  const [internalData, setInternalData] = useState<ChartData>(value || { labels: [], datasets: [] });

  useEffect(() => {
    // Ensure data structure matches chart type expectations, especially for pie/doughnut
    if (['pie', 'doughnut', 'polarArea'].includes(chartType)) {
      if (internalData.datasets.length > 1) {
        // These types usually have one dataset with multiple values/colors
        setInternalData(prev => ({
          ...prev,
          datasets: [prev.datasets[0] || { label: 'Dataset 1', data: [], backgroundColor: [] }]
        }));
      }
    }
    // Initialize with one dataset if empty
    if (internalData.datasets.length === 0) {
      setInternalData(prev => ({
        ...prev,
        datasets: [{ label: 'Dataset 1', data: [], backgroundColor: [] }]
      }));
    }
  }, [chartType, internalData.datasets]);


  const handleLabelsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLabels = e.target.value.split(',').map(label => label.trim());
    const newData = { ...internalData, labels: newLabels };
    setInternalData(newData);
    onChange(newData);
  };

  const handleDatasetLabelChange = (datasetIndex: number, newLabel: string) => {
    const newDatasets = [...internalData.datasets];
    newDatasets[datasetIndex].label = newLabel;
    const newData = { ...internalData, datasets: newDatasets };
    setInternalData(newData);
    onChange(newData);
  };

  const handleDatasetDataChange = (datasetIndex: number, dataIndex: number, newValue: string) => {
    const newDatasets = [...internalData.datasets];
    const numericValue = parseFloat(newValue);
    newDatasets[datasetIndex].data[dataIndex] = isNaN(numericValue) ? 0 : numericValue;
    const newData = { ...internalData, datasets: newDatasets };
    setInternalData(newData);
    onChange(newData);
  };
  
  const handleDatasetColorChange = (datasetIndex: number, colorIndex: number, newColor: string, isBackgroundColor: boolean) => {
    const newDatasets = [...internalData.datasets];
    const colors = (isBackgroundColor ? newDatasets[datasetIndex].backgroundColor : newDatasets[datasetIndex].borderColor) || [];
    
    if (Array.isArray(colors)) {
      const newColors = [...colors];
      newColors[colorIndex] = newColor;
      if (isBackgroundColor) {
        newDatasets[datasetIndex].backgroundColor = newColors;
      } else {
        newDatasets[datasetIndex].borderColor = newColors;
      }
    } else if (typeof colors === 'string' && colorIndex === 0) { // Single color string
      if (isBackgroundColor) {
        newDatasets[datasetIndex].backgroundColor = newColor;
      } else {
        newDatasets[datasetIndex].borderColor = newColor;
      }
    }

    const newData = { ...internalData, datasets: newDatasets };
    setInternalData(newData);
    onChange(newData);
  };


  const addDataPoint = (datasetIndex: number) => {
    const newDatasets = [...internalData.datasets];
    newDatasets[datasetIndex].data.push(0);
     // For pie/doughnut/polar, add a corresponding color
    if (['pie', 'doughnut', 'polarArea'].includes(chartType) && Array.isArray(newDatasets[datasetIndex].backgroundColor)) {
      (newDatasets[datasetIndex].backgroundColor as string[]).push(getRandomColor());
    }
    const newData = { ...internalData, datasets: newDatasets };
    setInternalData(newData);
    onChange(newData);
  };

  const removeDataPoint = (datasetIndex: number, dataIndex: number) => {
    const newDatasets = [...internalData.datasets];
    newDatasets[datasetIndex].data.splice(dataIndex, 1);
    if (['pie', 'doughnut', 'polarArea'].includes(chartType) && Array.isArray(newDatasets[datasetIndex].backgroundColor)) {
      (newDatasets[datasetIndex].backgroundColor as string[]).splice(dataIndex, 1);
    }
    const newData = { ...internalData, datasets: newDatasets };
    setInternalData(newData);
    onChange(newData);
  };
  
  const addDataset = () => {
    if (['pie', 'doughnut', 'polarArea'].includes(chartType) && internalData.datasets.length > 0) {
      alert(`${chartType} charts typically use only one dataset.`);
      return;
    }
    const newDataset: ChartDataset = {
      label: `Dataset ${internalData.datasets.length + 1}`,
      data: internalData.labels.map(() => 0), // Initialize data points based on labels length
      backgroundColor: internalData.labels.map(() => getRandomColor()), // Default colors for pie/doughnut
      borderColor: '#ffffff',
      borderWidth: 1
    };
    const newData = { ...internalData, datasets: [...internalData.datasets, newDataset] };
    setInternalData(newData);
    onChange(newData);
  };

  const removeDataset = (datasetIndex: number) => {
    const newDatasets = internalData.datasets.filter((_, index) => index !== datasetIndex);
    const newData = { ...internalData, datasets: newDatasets };
    setInternalData(newData);
    onChange(newData);
  };

  const getRandomColor = () => `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}`;

  return (
    <div className="space-y-4 p-2 border rounded-md">
      <div>
        <Label htmlFor="chart-labels" className="text-sm font-medium">Labels (comma-separated)</Label>
        <Input
          id="chart-labels"
          type="text"
          value={internalData.labels.join(', ')}
          onChange={handleLabelsChange}
          className="mt-1"
          placeholder="e.g., Jan, Feb, Mar"
        />
      </div>

      {internalData.datasets.map((dataset, datasetIndex) => (
        <div key={datasetIndex} className="p-3 border rounded-md space-y-3 bg-gray-50">
          <div className="flex justify-between items-center">
            <Label htmlFor={`dataset-label-${datasetIndex}`} className="text-sm font-medium">Dataset {datasetIndex + 1} Label</Label>
            {(!['pie', 'doughnut', 'polarArea'].includes(chartType) || internalData.datasets.length > 1) && (
                 <Button variant="ghost" size="sm" onClick={() => removeDataset(datasetIndex)} className="text-red-500 hover:text-red-700">
                   <Trash2 className="h-4 w-4" />
                 </Button>
            )}
          </div>
          <Input
            id={`dataset-label-${datasetIndex}`}
            type="text"
            value={dataset.label}
            onChange={(e) => handleDatasetLabelChange(datasetIndex, e.target.value)}
            className="mt-1"
          />

          <div className="space-y-2">
            <Label className="text-xs font-medium text-gray-700">Data Points:</Label>
            {dataset.data.map((dataPoint, dataIndex) => (
              <div key={dataIndex} className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={dataPoint}
                  onChange={(e) => handleDatasetDataChange(datasetIndex, dataIndex, e.target.value)}
                  className="flex-grow"
                />
                {/* Color picker for each data point, relevant for pie/doughnut/polarArea */}
                {(['pie', 'doughnut', 'polarArea'].includes(chartType) && Array.isArray(dataset.backgroundColor)) && (
                  <Input 
                    type="color" 
                    value={(dataset.backgroundColor as string[])[dataIndex] || getRandomColor()}
                    onChange={(e) => handleDatasetColorChange(datasetIndex, dataIndex, e.target.value, true)}
                    className="h-8 w-8 p-0.5"
                  />
                )}
                <Button variant="ghost" size="sm" onClick={() => removeDataPoint(datasetIndex, dataIndex)} className="text-red-500 hover:text-red-600 p-1"> {/* Changed size to sm and added padding */}
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => addDataPoint(datasetIndex)} className="mt-1">
              <PlusCircle className="h-4 w-4 mr-1" /> Add Data Point
            </Button>
          </div>
          
          {/* General backgroundColor/borderColor for non-pie charts */}
          {!['pie', 'doughnut', 'polarArea'].includes(chartType) && (
            <>
              <div>
                <Label htmlFor={`dataset-bgcolor-${datasetIndex}`} className="text-xs font-medium">Background Color</Label>
                <Input 
                  id={`dataset-bgcolor-${datasetIndex}`}
                  type="color" 
                  value={typeof dataset.backgroundColor === 'string' ? dataset.backgroundColor : (dataset.backgroundColor?.[0] || '#4A90E2')}
                  onChange={(e) => handleDatasetColorChange(datasetIndex, 0, e.target.value, true)}
                  className="mt-1 h-8 w-full"
                />
              </div>
              <div>
                <Label htmlFor={`dataset-bordercolor-${datasetIndex}`} className="text-xs font-medium">Border Color</Label>
                <Input 
                  id={`dataset-bordercolor-${datasetIndex}`}
                  type="color" 
                  value={typeof dataset.borderColor === 'string' ? dataset.borderColor : (dataset.borderColor?.[0] || '#4A90E2')}
                  onChange={(e) => handleDatasetColorChange(datasetIndex, 0, e.target.value, false)}
                  className="mt-1 h-8 w-full"
                />
              </div>
            </>
          )}
        </div>
      ))}
      {!['pie', 'doughnut', 'polarArea'].includes(chartType) && (
        <Button variant="outline" size="sm" onClick={addDataset} className="mt-2">
          <PlusCircle className="h-4 w-4 mr-1" /> Add Dataset
        </Button>
      )}
    </div>
  );
};

export default ChartDataEditor;
