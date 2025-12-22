/**
 * Onboarding Utilities
 * 
 * Helper functions for managing onboarding completion state.
 * Uses localStorage for client-side persistence with minimal server overhead.
 */

const ONBOARDING_STORAGE_KEY = 'mrshoofer_onboarding_completed';

/**
 * Mark onboarding as completed
 * Called when user clicks the final button in onboarding flow
 */
export function markOnboardingCompleted(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
  }
}

/**
 * Check if onboarding has been completed
 * Used to determine whether to show onboarding or skip to trip info
 */
export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

/**
 * Reset onboarding status
 * Useful for testing or if user wants to see onboarding again
 * Can be called from browser console: resetOnboardingStatus()
 */
export function resetOnboardingStatus(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    console.log('Onboarding status reset. Refresh the page to see onboarding again.');
  }
}

// Export for browser console debugging
if (typeof window !== 'undefined') {
  (window as any).resetOnboardingStatus = resetOnboardingStatus;
}
