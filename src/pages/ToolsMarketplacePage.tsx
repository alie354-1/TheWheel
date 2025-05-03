import React, { useEffect, useState } from 'react';
import { journeyContentService } from '../lib/services/journeyContent.service';
// Reverting to '@/' alias for UI components
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function ToolsMarketplacePage() {
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    setLoading(true);
    setError(null);
    try {
      // TODO: Decide how to fetch tools for the marketplace now.
      // Option 1: Fetch all unique tools from journey_step_tools? Requires backend change or complex query.
      // Option 2: Fetch tools from a different source if applicable?
      // For now, commenting out the call to the removed function.
      // const data = await journeyContentService.getAllGlobalTools();
      console.warn("ToolsMarketplacePage: getAllGlobalTools was removed from service. Fetching logic needs update.");
      const data: any[] = []; // Placeholder
      setTools(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tools');
      setTools([]);
    } finally {
      setLoading(false);
    }
  }

  // TODO: Extract categories from the fetched tools if needed for filtering
  const categories = [...new Set(tools.map(tool => tool.category).filter(Boolean))];

  const filteredTools = tools.filter(tool => {
    const matchesSearch = searchTerm === '' ||
      tool.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Tools Marketplace</h1>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          type="text"
          placeholder="Search tools..."
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)} // Added type for 'e'
          className="flex-grow"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p>Loading tools...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTools.length === 0 ? (
            <p>No tools found matching your criteria.</p>
          ) : (
            filteredTools.map(tool => (
              <Card key={tool.id}>
                <CardHeader>
                  <CardTitle>{tool.name || 'Unnamed Tool'}</CardTitle>
                  {tool.category && <CardDescription>{tool.category}</CardDescription>}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">{tool.description || 'No description available.'}</p>
                  {/* Add more tool details here if needed */}
                </CardContent>
                <CardFooter>
                  {tool.url && (
                    <a href={tool.url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline">Visit Website</Button>
                    </a>
                  )}
                  {/* Add button to add tool to company or view details */}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default ToolsMarketplacePage;
