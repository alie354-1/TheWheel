import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../lib/store';
import OnboardingWizard from '../components/onboarding/OnboardingWizard';
import { multiPersonaProfileService } from '../lib/services/multi-persona-profile.service';

const OnboardingWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const handleOnboardingComplete = async (data: {
    role: ('founder' | 'company_member' | 'service_provider')[];
    companyStage?: 'idea_stage' | 'solid_idea' | 'existing_company';
  }) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Create personas based on selected roles
      for (const role of data.role) {
        // Create a persona for each selected role
        const persona = await multiPersonaProfileService.createPersona(user.id, {
          name: `${role.charAt(0).toUpperCase() + role.slice(1).replace('_', ' ')} Profile`,
          type: role,
          is_active: false
        });
        
        if (persona && role === 'founder' && data.companyStage) {
          // Update founder persona with company stage
          await multiPersonaProfileService.updatePersona(persona.id, {
            project_context: {
              current_startup_stage: data.companyStage === 'idea_stage' 
                ? 'ideation' 
                : data.companyStage === 'solid_idea' 
                  ? 'validation' 
                  : 'growth'
            }
          });
          
          // Highlight appropriate features based on company stage
          if (data.companyStage === 'idea_stage') {
            // Highlight idea playground
            navigate('/idea-hub/playground');
          } else if (data.companyStage === 'solid_idea') {
            // Highlight company formation
            navigate('/company/setup');
          } else if (data.companyStage === 'existing_company') {
            // Highlight company dashboard
            navigate('/company/dashboard');
          }
        }
      }
      
      // Redirect to dashboard if no specific navigation occurred
      if (loading) {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
      navigate('/dashboard'); // Fallback navigation
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <OnboardingWizard onComplete={handleOnboardingComplete} />
    </div>
  );
};

export default OnboardingWizardPage;
