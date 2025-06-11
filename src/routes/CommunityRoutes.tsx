import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy-loaded community pages
const CommunityHomePage = lazy(() => import('../pages/community/CommunityHomePage'));
const CommunityGroupsPage = lazy(() => import('../pages/community/CommunityGroupsPage'));
const CommunityDiscussionsPage = lazy(() => import('../pages/community/CommunityDiscussionsPage'));
const CreateDiscussionPage = lazy(() => import('../pages/community/CreateDiscussionPage'));
const CommunityEventsPage = lazy(() => import('../pages/community/CommunityEventsPage'));
const CommunityExpertsPage = lazy(() => import('../pages/community/CommunityExpertsPage'));
const CommunityAchievementsPage = lazy(() => import('../pages/community/CommunityAchievementsPage'));
const ConnectionDashboard = lazy(() => import('../pages/community/ConnectionDashboard'));
const UserConnectionsPage = lazy(() => import('../pages/community/UserConnectionsPage'));

// Loading fallback
const LoadingFallback = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

/**
 * Community Routes Component
 * 
 * Defines all routes for the community features.
 * Uses lazy loading for better performance.
 */
const CommunityRoutes: React.FC = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route index element={<CommunityHomePage />} />
        <Route path="groups" element={<CommunityGroupsPage />} />
        <Route path="groups/:groupId" element={<CommunityGroupsPage />} />
        <Route path="discussions" element={<CommunityDiscussionsPage />} />
        <Route path="discussions/new" element={<CreateDiscussionPage />} />
        <Route path="discussions/new/:groupId" element={<CreateDiscussionPage />} />
        <Route path="discussions/:threadId" element={<CommunityDiscussionsPage />} />
        <Route path="events" element={<CommunityEventsPage />} />
        <Route path="events/:eventId" element={<CommunityEventsPage />} />
        <Route path="experts" element={<CommunityExpertsPage />} />
        <Route path="experts/:expertId" element={<CommunityExpertsPage />} />
        <Route path="achievements" element={<CommunityAchievementsPage />} />
        <Route path="connections" element={<ConnectionDashboard />} />
        <Route path="my-connections" element={<UserConnectionsPage />} />
        <Route path="*" element={<Navigate to="/community" replace />} />
      </Routes>
    </Suspense>
  );
};

export default CommunityRoutes;
