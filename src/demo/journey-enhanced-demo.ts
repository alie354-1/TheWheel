/**
 * Journey Enhanced System Demo
 * 
 * This script demonstrates the enhanced two-tier journey system functionality
 * with real-looking mock data to showcase the new features.
 */

import { journeyFrameworkService } from "../lib/services/journeyFramework.service";
import { companyJourneyServiceEnhanced } from "../lib/services/companyJourneyEnhanced.service";
import { journeyProgressService } from "../lib/services/journeyProgress.service";
import { journeyRecommendationsService } from "../lib/services/journeyRecommendations.service";
import { communityJourneyIntegrationService } from "../lib/services/communityJourneyIntegration.service";

/**
 * Demo: Enhanced Journey System Features
 */
export class JourneySystemDemo {
  private companyId: string = 'demo-company-1';

  async runDemo() {
    console.log('🚀 Starting Journey Enhanced System Demo');
    console.log('=====================================\n');

    try {
      await this.demonstrateFrameworkManagement();
      await this.demonstrateCompanyCustomization();
      await this.demonstrateProgressTracking();
      await this.demonstrateSmartRecommendations();
      await this.demonstrateCommunityIntegration();
      await this.demonstrateTemplateUpdates();
    } catch (error) {
      console.error('Demo failed:', error);
    }

    console.log('\n✅ Journey Enhanced System Demo Complete!');
    console.log('=========================================');
  }

  private async demonstrateFrameworkManagement() {
    console.log('📋 1. Framework Management & Template System');
    console.log('--------------------------------------------');

    // Get journey phases
    const phases = await journeyFrameworkService.getPhases();
    console.log(`Found ${phases.length} journey phases:`);
    phases.forEach(phase => {
      console.log(`  • ${phase.name}: ${phase.description}`);
    });

    // Get journey domains
    const domains = await journeyFrameworkService.getDomains();
    console.log(`\nFound ${domains.length} journey domains:`);
    domains.forEach(domain => {
      console.log(`  • ${domain.name}: ${domain.description}`);
    });

    // Get framework step templates
    const templates = await journeyFrameworkService.getStepTemplates({
      limit: 5
    });
    console.log(`\nSample framework step templates (${templates.length} shown):`);
    templates.forEach(template => {
      console.log(`  • ${template.name} (${template.difficulty})`);
      console.log(`    - ${template.description}`);
      console.log(`    - Estimated time: ${template.estimated_time_days} days`);
    });

    console.log('\n');
  }

  private async demonstrateCompanyCustomization() {
    console.log('🏢 2. Company-Specific Customization');
    console.log('-----------------------------------');

    // Import framework steps to company
    const availableTemplates = await journeyFrameworkService.getStepTemplates({ limit: 3 });
    const templateIds = availableTemplates.map(t => t.id);

    console.log('Importing framework steps to company...');
    await journeyFrameworkService.importStepsToCompany({
      companyId: this.companyId,
      stepIds: templateIds,
      customizeOnImport: true,
      preserveOrder: true
    });

    // Get company steps
    const companySteps = await companyJourneyServiceEnhanced.getCompanySteps(this.companyId);
    console.log(`\nCompany now has ${companySteps.length} customized steps:`);
    companySteps.forEach(step => {
      console.log(`  • ${step.name} (${step.status})`);
      if (step.is_custom) {
        console.log(`    - Custom step created by company`);
      } else {
        console.log(`    - Based on framework template: ${step.canonical_step_id}`);
      }
    });

    // Update step progress
    if (companySteps.length > 0) {
      const firstStep = companySteps[0];
      console.log(`\nUpdating progress for "${firstStep.name}"...`);
      await companyJourneyServiceEnhanced.updateStepProgress(
        this.companyId,
        firstStep.id,
        {
          status: 'in_progress',
          completion_percentage: 75,
          notes: 'Making good progress on customer interviews'
        }
      );
      console.log('✅ Progress updated successfully!');
    }

    console.log('\n');
  }

  private async demonstrateProgressTracking() {
    console.log('📊 3. Advanced Progress Tracking & Analytics');
    console.log('-------------------------------------------');

    // Get progress analytics
    const analytics = await journeyProgressService.getProgressAnalytics(this.companyId);
    console.log('Progress Analytics:');
    console.log(`  • Completion Rate: ${analytics.completionRate.toFixed(1)}%`);
    console.log(`  • Completed Steps: ${analytics.completedSteps}/${analytics.totalSteps}`);
    console.log(`  • Current Phase: ${analytics.currentPhase}`);
    console.log(`  • In Progress: ${analytics.inProgressSteps} steps`);
    console.log(`  • Blocked: ${analytics.blockedSteps} steps`);
    console.log(`  • Estimated Completion: ${analytics.estimatedCompletionDays} days`);

    // Track milestone achievement
    console.log('\nTracking milestone achievement...');
    await journeyProgressService.trackMilestone(this.companyId, {
      milestoneType: 'phase_completion',
      milestoneName: 'Validation Phase Complete',
      description: 'Successfully completed all validation phase steps',
      metadata: {
        phaseId: 'validate',
        stepsCompleted: 3,
        timeTakenDays: 14
      }
    });
    console.log('✅ Milestone tracked successfully!');

    console.log('\n');
  }

  private async demonstrateSmartRecommendations() {
    console.log('🧠 4. AI-Powered Smart Recommendations');
    console.log('-------------------------------------');

    // Get smart recommendations
    const recommendations = await journeyProgressService.getSmartRecommendations(this.companyId);
    console.log(`Generated ${recommendations.length} smart recommendations:`);
    
    recommendations.forEach((rec, index) => {
      console.log(`\n${index + 1}. ${rec.title} (${rec.priority} priority)`);
      console.log(`   Description: ${rec.description}`);
      console.log(`   Impact: ${rec.estimatedImpact}`);
      console.log(`   Confidence: ${(rec.confidenceScore * 100).toFixed(1)}%`);
      if (rec.actionItems.length > 0) {
        console.log('   Action Items:');
        rec.actionItems.forEach(item => {
          console.log(`     - ${item}`);
        });
      }
    });

    // Get personalized step recommendations
    const stepRecommendations = await journeyRecommendationsService.getPersonalizedStepRecommendations(
      this.companyId,
      { limit: 3 }
    );
    console.log(`\nPersonalized step recommendations (${stepRecommendations.length}):`);
    stepRecommendations.forEach(rec => {
      console.log(`  • ${rec.stepName} - ${rec.reason}`);
      console.log(`    Confidence: ${(rec.confidence * 100).toFixed(1)}%`);
    });

    console.log('\n');
  }

  private async demonstrateCommunityIntegration() {
    console.log('👥 5. Community Integration & Peer Insights');
    console.log('------------------------------------------');

    // Share progress with community
    console.log('Sharing progress with community...');
    await communityJourneyIntegrationService.shareProgress(this.companyId, {
      stepId: 'demo-step-1',
      milestoneType: 'step_completion',
      insights: 'Focus on mobile experience - customers primarily use mobile for research',
      visibility: 'community',
      anonymizedLevel: 'company_name'
    });
    console.log('✅ Progress shared with community!');

    // Get peer progress
    const peerProgress = await communityJourneyIntegrationService.getPeerProgress(
      this.companyId,
      { limit: 5, anonymized: true }
    );
    console.log(`\nPeer progress insights (${peerProgress.length} companies):`);
    peerProgress.forEach(peer => {
      console.log(`  • ${peer.companyName} (${peer.industry})`);
      console.log(`    Progress: ${peer.completionRate.toFixed(1)}% - ${peer.currentPhase}`);
      if (peer.recentMilestones.length > 0) {
        console.log(`    Recent: ${peer.recentMilestones[0]}`);
      }
    });

    // Get expert recommendations
    console.log('\nExpert recommendations for community:');
    const expertRecs = await communityJourneyIntegrationService.getExpertRecommendations(
      'customer-interviews'
    );
    expertRecs.forEach(rec => {
      console.log(`  • ${rec.expertName}: "${rec.recommendation}"`);
      console.log(`    Success Rate: ${rec.successRate}% | Time: ${rec.estimatedHours}h`);
    });

    console.log('\n');
  }

  private async demonstrateTemplateUpdates() {
    console.log('🔄 6. Template Updates & Notifications');
    console.log('-------------------------------------');

    // Get template update notifications
    const notifications = await journeyFrameworkService.getTemplateUpdateNotifications(
      this.companyId
    );
    console.log(`Found ${notifications.length} template update notifications:`);
    
    notifications.forEach(notification => {
      console.log(`\n📢 ${notification.title} (${notification.notificationType})`);
      console.log(`   Message: ${notification.message}`);
      console.log(`   Priority: ${notification.priority}/10`);
      console.log(`   Action Required: ${notification.actionRequired ? 'Yes' : 'No'}`);
      if (notification.changesSummary) {
        console.log('   Changes:');
        Object.entries(notification.changesSummary).forEach(([key, value]) => {
          console.log(`     - ${key}: ${value}`);
        });
      }
    });

    // Check for template updates
    console.log('\nChecking for framework updates...');
    const hasUpdates = await journeyFrameworkService.checkForTemplateUpdates();
    if (hasUpdates.length > 0) {
      console.log(`✨ ${hasUpdates.length} template updates available!`);
      hasUpdates.forEach(update => {
        console.log(`  • ${update.templateName}: ${update.updateType}`);
      });
    } else {
      console.log('📅 All templates are up to date!');
    }

    console.log('\n');
  }
}

// Demo runner function
export async function runJourneySystemDemo() {
  const demo = new JourneySystemDemo();
  await demo.runDemo();
}

// Export for use in browser console or tests
if (typeof window !== 'undefined') {
  (window as any).runJourneySystemDemo = runJourneySystemDemo;
  console.log('🎯 Journey System Demo loaded! Run with: runJourneySystemDemo()');
}
