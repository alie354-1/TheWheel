import React from 'react';

// Simple Bar Chart Component
export function BarChart({ data, title, colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'] }: {
  data: { label: string; value: number }[];
  title: string;
  colors?: string[];
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center">
            <div className="w-20 text-sm text-gray-600 text-right mr-3">
              {item.label}
            </div>
            <div className="flex-1 flex items-center">
              <div
                className="h-6 rounded transition-all duration-500"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                  backgroundColor: colors[index % colors.length],
                  minWidth: '20px'
                }}
              />
              <span className="ml-2 text-sm font-medium text-gray-900">
                {item.value}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Simple Pie Chart Component
export function PieChart({ data, title }: {
  data: { label: string; value: number; color: string }[];
  title: string;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = 0;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="#f3f4f6"
              strokeWidth="2"
            />
            {data.map((slice, index) => {
              const percentage = (slice.value / total) * 100;
              const angle = (slice.value / total) * 360;
              const strokeDasharray = `${(angle / 360) * 502.65} 502.65`;
              const strokeDashoffset = -currentAngle * 502.65 / 360;
              currentAngle += angle;

              return (
                <circle
                  key={index}
                  cx="100"
                  cy="100"
                  r="80"
                  fill="none"
                  stroke={slice.color}
                  strokeWidth="20"
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500"
                />
              );
            })}
          </svg>
        </div>
        <div className="ml-6 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center">
              <div
                className="w-4 h-4 rounded-full mr-2"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">
                {item.label}: {((item.value / total) * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Line Chart Component
export function LineChart({ data, title, color = '#3B82F6' }: {
  data: { label: string; value: number }[];
  title: string;
  color?: string;
}) {
  const maxValue = Math.max(...data.map(d => d.value));
  const minValue = Math.min(...data.map(d => d.value));
  const range = maxValue - minValue;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="relative h-48">
        <svg width="100%" height="100%" viewBox="0 0 400 200" className="overflow-visible">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={i}
              x1="40"
              y1={40 + (i * 30)}
              x2="360"
              y2={40 + (i * 30)}
              stroke="#f3f4f6"
              strokeWidth="1"
            />
          ))}
          
          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={data.map((point, index) => {
              const x = 40 + (index * (320 / (data.length - 1)));
              const y = 160 - ((point.value - minValue) / range) * 120;
              return `${x},${y}`;
            }).join(' ')}
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = 40 + (index * (320 / (data.length - 1)));
            const y = 160 - ((point.value - minValue) / range) * 120;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
              />
            );
          })}
          
          {/* X-axis labels */}
          {data.map((point, index) => {
            const x = 40 + (index * (320 / (data.length - 1)));
            return (
              <text
                key={index}
                x={x}
                y="185"
                textAnchor="middle"
                className="text-xs fill-gray-600"
              >
                {point.label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// Statistics Block Component
export function StatsBlock({ stats, title }: {
  stats: { label: string; value: string; change?: string; positive?: boolean }[];
  title: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
            {stat.change && (
              <div className={`text-xs ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
                {stat.positive ? '↗' : '↘'} {stat.change}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Quote Block Component
export function QuoteBlock({ quote, author, company }: {
  quote: string;
  author: string;
  company?: string;
}) {
  return (
    <div className="bg-blue-50 p-6 rounded-lg border-l-4 border-blue-500">
      <blockquote className="text-lg italic text-gray-700 mb-4">
        "{quote}"
      </blockquote>
      <div className="text-right">
        <div className="font-semibold text-gray-900">— {author}</div>
        {company && <div className="text-sm text-gray-600">{company}</div>}
      </div>
    </div>
  );
}

// Feature List Component
export function FeatureList({ features, title }: {
  features: string[];
  title: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-gray-700">{feature}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Timeline Component
export function Timeline({ events, title }: {
  events: { date: string; title: string; description?: string }[];
  title: string;
}) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">{title}</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-4 bottom-4 w-0.5 bg-blue-300"></div>
        
        {events.map((event, index) => (
          <div key={index} className="relative flex items-start mb-6 last:mb-0">
            <div className="absolute left-4 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
            <div className="ml-12">
              <div className="text-sm font-semibold text-blue-600">{event.date}</div>
              <div className="text-base font-medium text-gray-900">{event.title}</div>
              {event.description && (
                <div className="text-sm text-gray-600 mt-1">{event.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Image Placeholder Component
export function ImagePlaceholder({ type, caption }: {
  type: 'hero' | 'product' | 'team' | 'office';
  caption?: string;
}) {
  const getIcon = () => {
    switch (type) {
      case 'hero': return '🏢';
      case 'product': return '📱';
      case 'team': return '👥';
      case 'office': return '🏢';
      default: return '🖼️';
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'hero': return 'Hero Image';
      case 'product': return 'Product Image';
      case 'team': return 'Team Photo';
      case 'office': return 'Office Image';
      default: return 'Image';
    }
  };

  return (
    <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
      <div className="text-4xl mb-2">{getIcon()}</div>
      <div className="text-lg font-medium text-gray-700 mb-1">{getTitle()}</div>
      <div className="text-sm text-gray-500">Click to upload or replace image</div>
      {caption && (
        <div className="text-sm text-gray-600 mt-2 italic">{caption}</div>
      )}
    </div>
  );
}
