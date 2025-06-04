import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  FileSpreadsheet,
  Coins,
  Rocket,
  BarChart3,
  Library,
  Plus,
  Lightbulb,
  ArrowRight
} from 'lucide-react';

export default function IdeaHub() {
  const tools = [
    {
      icon: Library,
      title: 'Idea Generation',
      description: 'Create new business ideas with AI assistance and explore variations.',
      action: {
        text: 'Generate Ideas',
        href: '/idea-hub/playground'
      }
    },
    {
      icon: Lightbulb,
      title: 'Quick Generation',
      description: 'Quickly generate business ideas with minimal input.',
      action: {
        text: 'Quick Generate',
        href: '/idea-hub/quick-generation'
      }
    },
    {
      icon: Lightbulb,
      title: 'Idea Refinement',
      description: 'Get AI feedback on your startup ideas and explore variations.',
      action: {
        text: 'Refine Idea',
        href: '/idea-hub/refinement'
      }
    },
    {
      icon: BarChart3,
      title: 'Market Validation',
      description: 'Validate your market assumptions and identify opportunities.',
      action: {
        text: 'Validate Market',
        href: '/idea-hub/market-validation'
      }
    },
    {
      icon: Coins,
      title: 'Business Model',
      description: 'Define your revenue streams and cost structure.',
      action: {
        text: 'Build Model',
        href: '/idea-hub/business-model'
      }
    },
    {
      icon: Rocket,
      title: 'Deck Builder',
      description: 'Create and manage presentations with themes and templates.',
      action: {
        text: 'Open Deck Builder',
        href: '/deck-builder'
      }
    },
    {
      icon: Bot,
      title: 'AI Discussion',
      description: 'Discuss your ideas with our AI co-founder.',
      action: {
        text: 'Start Discussion',
        href: '/idea-hub/ai-discussion'
      }
    },
    {
      icon: FileSpreadsheet,
      title: 'Idea Canvas',
      description: 'Structure and visualize your business concept.',
      action: {
        text: 'Open Canvas',
        href: '/idea-hub/canvas'
      }
    },
    {
      icon: Library,
      title: 'Saved Ideas',
      description: 'View and manage your saved business ideas.',
      action: {
        text: 'View Ideas',
        href: '/idea-hub/saved'
      }
    }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Idea Hub</h1>
            <p className="mt-1 text-sm text-gray-500">
              Transform your ideas into successful startups
            </p>
          </div>
          <Link
            to="/idea-hub/playground"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Idea
          </Link>
        </div>

        {/* Featured Tool */}
        <div className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8 sm:p-10">
            <div className="sm:flex sm:items-start sm:justify-between">
              <div className="sm:flex-1">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">
            New: Enhanced Idea Hub & Deck Builder
          </h2>
          <p className="mt-2 text-sm text-indigo-100 sm:text-base">
            Explore the new Enhanced Idea Hub, featuring our powerful Deck Builder. Create, manage,
            and customize presentations with themes and templates.
          </p>
          <div className="mt-4">
            <Link
              to="/deck-builder"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-indigo-600 bg-white hover:bg-indigo-50"
            >
              Go to Deck Builder
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
              </div>
              <div className="mt-4 sm:mt-0 sm:ml-6">
                <Rocket className="h-12 w-12 text-white opacity-75" /> 
              </div>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool, index) => (
            <div
              key={index}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <tool.icon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">{tool.title}</h3>
                    <p className="mt-1 text-sm text-gray-500">{tool.description}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    to={tool.action.href}
                    className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-900"
                  >
                    {tool.action.text}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
