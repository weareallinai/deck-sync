'use client';

import { ViewerStage } from '@/components/viewer/ViewerStage';
import { useEffect, useState } from 'react';
import { extractViewerToken } from '@/lib/utils/jwt';

export default function ViewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [token, setToken] = useState<string | null>(() => {
    // Extract token immediately on mount
    if (typeof window !== 'undefined') {
      return extractViewerToken();
    }
    return null;
  });
  const [isPreview, setIsPreview] = useState(() => {
    // Check preview mode immediately
    if (typeof window !== 'undefined') {
      const t = extractViewerToken();
      return t === 'presenter-preview';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    params.then(p => {
      setSessionId(p.sessionId);
      setIsLoading(false);
    });
  }, [params]);

  // Show loading state while we resolve params
  if (isLoading) {
    return (
      <div className={isPreview ? 'w-full h-full bg-black' : 'h-screen w-screen bg-black'} />
    );
  }

  // GUARDRAIL: Deny access without valid token
  if (!token) {
    console.error('[Viewer] No token found in URL');
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-2">Invalid Session</h1>
          <p className="text-gray-400 text-sm">Missing or expired viewer token</p>
        </div>
      </div>
    );
  }

  // GUARDRAIL: Viewer page imports NO editor dependencies (Konva, etc.)
  return (
    <div className={isPreview ? 'w-full h-full bg-black' : 'h-screen w-screen bg-black'}>
      <ViewerStage sessionId={sessionId} token={token} isPreview={isPreview} />
    </div>
  );
}

