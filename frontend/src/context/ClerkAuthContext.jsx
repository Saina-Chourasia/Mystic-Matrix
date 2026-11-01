import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClerkProvider, useAuth, useUser, useSignIn, AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

const ClerkAuthContext = createContext({
  isClerkConfigured: false,
  isLoaded: true,
  isSignedIn: false,
  clerkUser: null,
  signInWithGoogle: async () => {},
  signOutFromClerk: async () => {},
  getToken: async () => null,
});

/**
 * Inner component active when ClerkProvider is loaded with a valid publishable key
 */
function ClerkAuthInner({ children }) {
  const { isLoaded, isSignedIn, userId, sessionId, getToken, signOut } = useAuth();
  const { user: clerkUser } = useUser();
  const { signIn } = useSignIn();

  const signInWithGoogle = async () => {
    if (!signIn) {
      throw new Error('Clerk Sign-In service is initializing. Please try again.');
    }
    return signIn.authenticateWithRedirect({
      strategy: 'oauth_google',
      redirectUrl: `${window.location.origin}/?tab=sso-callback`,
      redirectUrlComplete: `${window.location.origin}/?tab=login`
    });
  };

  const signOutFromClerk = async () => {
    if (signOut) {
      try {
        await signOut();
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('mystic_session_token');
        }
      } catch (e) {
        console.warn('Clerk signOut warning:', e);
      }
    }
  };

  const value = {
    isClerkConfigured: true,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
    userId,
    sessionId,
    clerkUser,
    signInWithGoogle,
    signOutFromClerk,
    getToken: async () => {
      try {
        return await getToken();
      } catch (err) {
        return null;
      }
    }
  };

  return (
    <ClerkAuthContext.Provider value={value}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

/**
 * Outer Clerk Provider Wrapper
 * Gracefully renders children even if VITE_CLERK_PUBLISHABLE_KEY is not yet configured,
 * preventing application crashes while surfacing configuration readiness.
 */
export function ClerkAuthProvider({ children }) {
  const publishableKey = (import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || '').trim();
  const isKeyValid = Boolean(
    publishableKey &&
    (publishableKey.startsWith('pk_test_') || publishableKey.startsWith('pk_live_'))
  );

  // If a valid publishable key is present, wrap with official ClerkProvider
  if (isKeyValid) {
    return (
      <ClerkProvider
        publishableKey={publishableKey}
        afterSignOutUrl="/"
      >
        <ClerkAuthInner>{children}</ClerkAuthInner>
      </ClerkProvider>
    );
  }

  // Graceful fallback provider when Clerk keys are awaiting configuration
  const fallbackValue = {
    isClerkConfigured: false,
    isLoaded: true,
    isSignedIn: false,
    clerkUser: null,
    signInWithGoogle: async () => {
      throw new Error(
        'Clerk is not configured. Please set VITE_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY in your .env file.'
      );
    },
    signOutFromClerk: async () => {},
    getToken: async () => null
  };

  return (
    <ClerkAuthContext.Provider value={fallbackValue}>
      {children}
    </ClerkAuthContext.Provider>
  );
}

export function useClerkAuth() {
  return useContext(ClerkAuthContext);
}

export { AuthenticateWithRedirectCallback };

