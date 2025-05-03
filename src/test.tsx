import React, { useEffect, useState } from 'react';
import { Typography, Box, CircularProgress, Button } from '@mui/material';
import { ideaPathway1AIService } from './lib/services/idea-pathway1-ai.service';

/**
 * Test component to verify the fix for the idea-pathway1-ai.service.ts
 */
function IdeaPathway1AIServiceTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    setTestResults([]);

    try {
      // Results array to collect all test outputs
      const results: string[] = [];
      
      // Test 1: Test with null idea
      results.push("===== TEST 1: NULL IDEA =====");
      try {
        const nullResult = await ideaPathway1AIService.generateCompanySuggestions(null as any, 'test-user', 3);
        results.push(`✅ SUCCESS: Generated ${nullResult.length} mock suggestions with null idea`);
        results.push(`First suggestion title: ${nullResult[0].title}`);
      } catch (error) {
        results.push(`❌ FAILED: Error when using null idea: ${(error as Error).message}`);
      }

      // Test 2: Test with undefined idea
      results.push("\n===== TEST 2: UNDEFINED IDEA =====");
      try {
        const undefinedResult = await ideaPathway1AIService.generateCompanySuggestions(undefined as any, 'test-user', 3);
        results.push(`✅ SUCCESS: Generated ${undefinedResult.length} mock suggestions with undefined idea`);
        results.push(`First suggestion title: ${undefinedResult[0].title}`);
      } catch (error) {
        results.push(`❌ FAILED: Error when using undefined idea: ${(error as Error).message}`);
      }

      // Test 3: Test with valid idea
      results.push("\n===== TEST 3: VALID IDEA =====");
      try {
        const mockIdea = {
          id: 'test-id',
          canvas_id: 'canvas-1',
          title: "Test Idea",
          description: "A test idea description",
          problem_statement: "Test problem statement",
          solution_concept: "Test solution concept",
          target_audience: "Test target audience",
          unique_value: "Test unique value proposition",
          business_model: "Test business model",
          marketing_strategy: "Test marketing strategy",
          revenue_model: "Test revenue model",
          go_to_market: "Test go-to-market strategy",
          market_size: "Test market size estimate",
          used_company_context: false,
          is_archived: false,
          version: 1,
          
          // Add required properties according to IdeaPlaygroundIdea interface
          status: 'draft' as any, // IdeaStatus enum
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tags: [],
          isFavorite: false
        };
        const validResult = await ideaPathway1AIService.generateCompanySuggestions(mockIdea, 'test-user', 3);
        results.push(`✅ SUCCESS: Generated ${validResult.length} mock suggestions with valid idea`);
        results.push(`First suggestion title: ${validResult[0].title}`);
      } catch (error) {
        results.push(`❌ FAILED: Error when using valid idea: ${(error as Error).message}`);
      }

      // Add summary
      results.push("\n===== SUMMARY =====");
      if (results.filter(r => r.includes('❌ FAILED')).length === 0) {
        results.push("✅ All tests passed! The fix for handling undefined/null ideas is working correctly.");
        results.push("This has resolved the error: TypeError: Cannot read properties of undefined (reading 'title')");
      } else {
        results.push("❌ Some tests failed. The fix may not be working properly.");
      }

      // Set the results
      setTestResults(results);
    } catch (error) {
      setError(`An error occurred while running tests: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Idea Pathway 1 AI Service Test
      </Typography>

      <Typography variant="body1" paragraph>
        This test verifies the fix for the TypeError: Cannot read properties of undefined (reading 'title') error in the idea-pathway1-ai.service.ts file.
      </Typography>

      <Button 
        variant="contained" 
        color="primary" 
        onClick={runTests} 
        disabled={loading}
        sx={{ mb: 4 }}
      >
        Run Tests
      </Button>

      {loading && (
        <Box display="flex" alignItems="center" mb={2}>
          <CircularProgress size={24} sx={{ mr: 2 }} />
          <Typography>Running tests...</Typography>
        </Box>
      )}

      {error && (
        <Typography color="error" paragraph>
          {error}
        </Typography>
      )}

      {testResults.length > 0 && (
        <Box 
          bgcolor="#f5f5f5" 
          p={2} 
          borderRadius={1}
          sx={{ 
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            maxHeight: '500px',
            overflow: 'auto'
          }}
        >
          {testResults.join('\n')}
        </Box>
      )}
    </Box>
  );
}

export default IdeaPathway1AIServiceTest;
