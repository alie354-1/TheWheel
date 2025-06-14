-- This script archives the old journey system tables by renaming them with an 'archive_' prefix.

-- Archive Core Journey Tables
ALTER TABLE journey_phases RENAME TO archive_journey_phases;
ALTER TABLE journey_steps RENAME TO archive_journey_steps;
ALTER TABLE journey_step_templates RENAME TO archive_journey_step_templates;
ALTER TABLE journey_step_tools RENAME TO archive_journey_step_tools;
ALTER TABLE journey_step_relationships RENAME TO archive_journey_step_relationships;
ALTER TABLE journey_challenges RENAME TO archive_journey_challenges;
ALTER TABLE journey_domains RENAME TO archive_journey_domains;
ALTER TABLE journey_milestones RENAME TO archive_journey_milestones;
ALTER TABLE journey_smart_recommendations RENAME TO archive_journey_smart_recommendations;
ALTER TABLE journey_feature_events RENAME TO archive_journey_feature_events;
ALTER TABLE journey_tools RENAME TO archive_journey_tools;
ALTER TABLE journey_tool_reviews RENAME TO archive_journey_tool_reviews;
ALTER TABLE journey_tool_use_cases RENAME TO archive_journey_tool_use_cases;
ALTER TABLE journey_tool_features RENAME TO archive_journey_tool_features;

-- Archive Company Journey Tables
ALTER TABLE company_journey_steps RENAME TO archive_company_journey_steps;
ALTER TABLE company_journey_progress RENAME TO archive_company_journey_progress;
ALTER TABLE company_journey_maps RENAME TO archive_company_journey_maps;
ALTER TABLE company_journey_paths RENAME TO archive_company_journey_paths;
ALTER TABLE company_journey_ai_questions RENAME TO archive_company_journey_ai_questions;
ALTER TABLE company_journey_ai_recommendations RENAME TO archive_company_journey_ai_recommendations;
ALTER TABLE company_journeys RENAME TO archive_company_journeys;
ALTER TABLE company_journey_summary RENAME TO archive_company_journey_summary;


-- Archive User Journey Tables
ALTER TABLE user_journey_preferences RENAME TO archive_user_journey_preferences;
ALTER TABLE user_journey_progress RENAME TO archive_user_journey_progress;

-- Archive Step-related Tables
ALTER TABLE step_progress RENAME TO archive_step_progress;
ALTER TABLE company_progress RENAME TO archive_company_progress;
ALTER TABLE company_custom_steps RENAME TO archive_company_custom_steps;
ALTER TABLE company_focus_areas RENAME TO archive_company_focus_areas;
ALTER TABLE company_step_dependencies RENAME TO archive_company_step_dependencies;
ALTER TABLE company_step_kpis RENAME TO archive_company_step_kpis;
ALTER TABLE company_step_progress RENAME TO archive_company_step_progress;
ALTER TABLE company_step_tasks RENAME TO archive_company_step_tasks;
ALTER TABLE company_step_tool_recommendations RENAME TO archive_company_step_tool_recommendations;
ALTER TABLE company_task_progress RENAME TO archive_company_task_progress;
ALTER TABLE company_task_summary RENAME TO archive_company_task_summary;
ALTER TABLE domain_journey_mapping RENAME TO archive_domain_journey_mapping;
ALTER TABLE domain_step_logs RENAME TO archive_domain_step_logs;
ALTER TABLE domain_step_metadata RENAME TO archive_domain_step_metadata;
ALTER TABLE domain_step_recommendations RENAME TO archive_domain_step_recommendations;
ALTER TABLE domain_step_statistics RENAME TO archive_domain_step_statistics;
ALTER TABLE domain_steps RENAME TO archive_domain_steps;
ALTER TABLE domain_steps_status RENAME TO archive_domain_steps_status;
ALTER TABLE imported_phases RENAME TO archive_imported_phases;
ALTER TABLE imported_steps RENAME TO archive_imported_steps;
ALTER TABLE imported_tools RENAME TO archive_imported_tools;
ALTER TABLE step_batch_operations RENAME TO archive_step_batch_operations;
ALTER TABLE step_comments RENAME TO archive_step_comments;
ALTER TABLE step_completion_analytics RENAME TO archive_step_completion_analytics;
ALTER TABLE step_deliverables RENAME TO archive_step_deliverables;
ALTER TABLE step_expert_recommendations RENAME TO archive_step_expert_recommendations;
ALTER TABLE step_feedback RENAME TO archive_step_feedback;
ALTER TABLE step_instances RENAME TO archive_step_instances;
ALTER TABLE step_kpi_templates RENAME TO archive_step_kpi_templates;
ALTER TABLE step_recommendation_group_items RENAME TO archive_step_recommendation_group_items;
ALTER TABLE step_recommendation_groups RENAME TO archive_step_recommendation_groups;
ALTER TABLE step_recommendations RENAME TO archive_step_recommendations;
ALTER TABLE step_relationships RENAME TO archive_step_relationships;
ALTER TABLE step_requirements RENAME TO archive_step_requirements;
ALTER TABLE step_resources RENAME TO archive_step_resources;
ALTER TABLE step_status_history RENAME TO archive_step_status_history;
ALTER TABLE step_task_templates RENAME TO archive_step_task_templates;
ALTER TABLE step_template_analytics RENAME TO archive_step_template_analytics;
ALTER TABLE step_template_recommendations RENAME TO archive_step_template_recommendations;
ALTER TABLE step_templates RENAME TO archive_step_templates;
ALTER TABLE step_tool_recommendation_templates RENAME TO archive_step_tool_recommendation_templates;
ALTER TABLE step_tools RENAME TO archive_step_tools;
ALTER TABLE user_learning_profiles RENAME TO archive_user_learning_profiles;


-- =================================================================
-- ROLLBACK SCRIPT
-- Uncomment the following lines to revert the changes.
-- =================================================================

-- -- Rollback Core Journey Tables
-- ALTER TABLE archive_journey_phases RENAME TO journey_phases;
-- ALTER TABLE archive_journey_steps RENAME TO journey_steps;
-- ALTER TABLE archive_journey_step_templates RENAME TO journey_step_templates;
-- ALTER TABLE archive_journey_step_tools RENAME TO journey_step_tools;
-- ALTER TABLE archive_journey_step_relationships RENAME TO journey_step_relationships;
-- ALTER TABLE archive_journey_challenges RENAME TO journey_challenges;
-- ALTER TABLE archive_journey_domains RENAME TO journey_domains;
-- ALTER TABLE archive_journey_milestones RENAME TO journey_milestones;
-- ALTER TABLE archive_journey_smart_recommendations RENAME TO journey_smart_recommendations;
-- ALTER TABLE archive_journey_feature_events RENAME TO journey_feature_events;
-- ALTER TABLE archive_journey_tools RENAME TO journey_tools;
-- ALTER TABLE archive_journey_tool_reviews RENAME TO journey_tool_reviews;
-- ALTER TABLE archive_journey_tool_use_cases RENAME TO journey_tool_use_cases;
-- ALTER TABLE archive_journey_tool_features RENAME TO journey_tool_features;

-- -- Rollback Company Journey Tables
-- ALTER TABLE archive_company_journey_steps RENAME TO company_journey_steps;
-- ALTER TABLE archive_company_journey_progress RENAME TO company_journey_progress;
-- ALTER TABLE archive_company_journey_maps RENAME TO company_journey_maps;
-- ALTER TABLE archive_company_journey_paths RENAME TO company_journey_paths;
-- ALTER TABLE archive_company_journey_ai_questions RENAME TO company_journey_ai_questions;
-- ALTER TABLE archive_company_journey_ai_recommendations RENAME TO company_journey_ai_recommendations;
-- ALTER TABLE archive_company_journeys RENAME TO company_journeys;
-- ALTER TABLE archive_company_journey_summary RENAME TO company_journey_summary;

-- -- Rollback User Journey Tables
-- ALTER TABLE archive_user_journey_preferences RENAME TO user_journey_preferences;
-- ALTER TABLE archive_user_journey_progress RENAME TO user_journey_progress;

-- -- Rollback Step-related Tables
-- ALTER TABLE archive_step_progress RENAME TO step_progress;
-- ALTER TABLE archive_company_progress RENAME TO company_progress;
-- ALTER TABLE archive_company_custom_steps RENAME TO company_custom_steps;
-- ALTER TABLE archive_company_focus_areas RENAME TO company_focus_areas;
-- ALTER TABLE archive_company_step_dependencies RENAME TO company_step_dependencies;
-- ALTER TABLE archive_company_step_kpis RENAME TO company_step_kpis;
-- ALTER TABLE archive_company_step_progress RENAME TO company_step_progress;
-- ALTER TABLE archive_company_step_tasks RENAME TO company_step_tasks;
-- ALTER TABLE archive_company_step_tool_recommendations RENAME TO company_step_tool_recommendations;
-- ALTER TABLE archive_company_task_progress RENAME TO company_task_progress;
-- ALTER TABLE archive_company_task_summary RENAME TO company_task_summary;
-- ALTER TABLE archive_domain_journey_mapping RENAME TO domain_journey_mapping;
-- ALTER TABLE archive_domain_step_logs RENAME TO domain_step_logs;
-- ALTER TABLE archive_domain_step_metadata RENAME TO domain_step_metadata;
-- ALTER TABLE archive_domain_step_recommendations RENAME TO domain_step_recommendations;
-- ALTER TABLE archive_domain_step_statistics RENAME TO domain_step_statistics;
-- ALTER TABLE archive_domain_steps RENAME TO domain_steps;
-- ALTER TABLE archive_domain_steps_status RENAME TO domain_steps_status;
-- ALTER TABLE archive_imported_phases RENAME TO imported_phases;
-- ALTER TABLE archive_imported_steps RENAME TO imported_steps;
-- ALTER TABLE archive_imported_tools RENAME TO imported_tools;
-- ALTER TABLE archive_step_batch_operations RENAME TO step_batch_operations;
-- ALTER TABLE archive_step_comments RENAME TO step_comments;
-- ALTER TABLE archive_step_completion_analytics RENAME TO step_completion_analytics;
-- ALTER TABLE archive_step_deliverables RENAME TO step_deliverables;
-- ALTER TABLE archive_step_expert_recommendations RENAME TO step_expert_recommendations;
-- ALTER TABLE archive_step_feedback RENAME TO step_feedback;
-- ALTER TABLE archive_step_instances RENAME TO step_instances;
-- ALTER TABLE archive_step_kpi_templates RENAME TO step_kpi_templates;
-- ALTER TABLE archive_step_recommendation_group_items RENAME TO step_recommendation_group_items;
-- ALTER TABLE archive_step_recommendation_groups RENAME TO step_recommendation_groups;
-- ALTER TABLE archive_step_recommendations RENAME TO step_recommendations;
-- ALTER TABLE archive_step_relationships RENAME TO step_relationships;
-- ALTER TABLE archive_step_requirements RENAME TO step_requirements;
-- ALTER TABLE archive_step_resources RENAME TO step_resources;
-- ALTER TABLE archive_step_status_history RENAME TO step_status_history;
-- ALTER TABLE archive_step_task_templates RENAME TO step_task_templates;
-- ALTER TABLE archive_step_template_analytics RENAME TO step_template_analytics;
-- ALTER TABLE archive_step_template_recommendations RENAME TO step_template_recommendations;
-- ALTER TABLE archive_step_templates RENAME TO step_templates;
-- ALTER TABLE archive_step_tool_recommendation_templates RENAME TO step_tool_recommendation_templates;
-- ALTER TABLE archive_step_tools RENAME TO step_tools;
-- ALTER TABLE archive_user_learning_profiles RENAME TO user_learning_profiles;
