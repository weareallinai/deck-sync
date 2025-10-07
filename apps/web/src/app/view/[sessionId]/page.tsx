'use client';

import { ViewerStage } from '@/components/viewer/ViewerStage';
import { useEffect, useState } from 'react';
import { extractViewerToken } from '@/lib/utils/jwt';

export default function ViewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    // Extract token after mount to avoid hydration mismatch
    const t = extractViewerToken();
    setToken(t);
    setIsPreview(t === 'presenter-preview');
    
    params.then(p => {
      setSessionId(p.sessionId);
      setReady(true);
    });
  }, [params]);

  // Show consistent loading state during SSR and initial client render
  if (!ready) {
    return (
      <div className="w-full h-full bg-black" style={{ minHeight: '100vh' }} />
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

