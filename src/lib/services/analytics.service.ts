import { supabase } from "../supabase"; // Using the singleton implementation

// Types for analytics data
export interface AnalyticsEvent {
  id: string;
  event_name: string;
  user_id: string | null;
  company_id: string | null;
  payload: any;
  created_at: string;
}

export interface AnalyticsAggregate {
  id: string;
  metric_name: string;
  dimensions: any;
  value: any;
  calculated_at: string;
  time_period_start: string | null;
  time_period_end: string | null;
}

export interface AnalyticsReport {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  company_id: string | null;
  configuration: any;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsDashboard {
  id: string;
  name: string;
  description: string | null;
  user_id: string;
  company_id: string | null;
  layout: any;
  created_at: string;
  updated_at: string;
}

// Service functions

export async function fetchAnalyticsEvents(companyId: string): Promise<AnalyticsEvent[]> {
  const { data, error } = await supabase
    .from("analytics_events")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AnalyticsEvent[];
}

export async function fetchAnalyticsAggregates(companyId: string): Promise<AnalyticsAggregate[]> {
  const { data, error } = await supabase
    .from("analytics_aggregates")
    .select("*")
    .contains("dimensions", { company_id: companyId })
    .order("calculated_at", { ascending: false });
  if (error) throw error;
  return data as AnalyticsAggregate[];
}

export async function fetchAnalyticsReports(companyId: string): Promise<AnalyticsReport[]> {
  const { data, error } = await supabase
    .from("analytics_reports")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AnalyticsReport[];
}

export async function fetchAnalyticsDashboards(companyId: string): Promise<AnalyticsDashboard[]> {
  const { data, error } = await supabase
    .from("analytics_dashboards")
    .select("*")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as AnalyticsDashboard[];
}

export async function trackEvent(
  event_name: string,
  user_id: string | null,
  company_id: string | null,
  payload: any
) {
  const { error } = await supabase
    .from("analytics_events")
    .insert([{ event_name, user_id, company_id, payload }]);
  if (error) throw error;
}

export const analyticsService = {
  fetchAnalyticsEvents,
  fetchAnalyticsAggregates,
  fetchAnalyticsReports,
  fetchAnalyticsDashboards,
  trackEvent,
};
