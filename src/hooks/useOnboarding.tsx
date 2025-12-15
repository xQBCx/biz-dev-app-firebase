import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const ONBOARDING_KEY = 'bizdev_onboarding_completed';

export function useOnboarding() {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      checkOnboardingStatus();
    } else {
      setIsLoading(false);
    }
  }, [user?.id]);

  const checkOnboardingStatus = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      // Check localStorage for onboarding completion (per user)
      const completedUsers = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}');
      const hasCompletedOnboarding = completedUsers[user.id] === true;

      // Check if this is a new user (created in the last 10 minutes)
      const userCreatedAt = new Date(user.created_at || '');
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      const isNewUser = userCreatedAt > tenMinutesAgo;

      // Show onboarding for new users who haven't completed it
      setShowOnboarding(!hasCompletedOnboarding && isNewUser);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setShowOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeOnboarding = () => {
    if (!user?.id) return;

    try {
      // Store completion in localStorage
      const completedUsers = JSON.parse(localStorage.getItem(ONBOARDING_KEY) || '{}');
      completedUsers[user.id] = true;
      localStorage.setItem(ONBOARDING_KEY, JSON.stringify(completedUsers));
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      setShowOnboarding(false);
    }
  };

  return {
    showOnboarding,
    isLoading,
    completeOnboarding
  };
}
