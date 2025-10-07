'use client';

import { ViewerStage } from '@/components/viewer/ViewerStage';
import { useEffect, useState } from 'react';
import { extractViewerToken } from '@/lib/utils/jwt';

export default function ViewPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const [sessionId, setSessionId] = useState<string>('');
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    params.then(p => setSessionId(p.sessionId));
    
    // GUARDRAIL: Extract JWT from URL ?t= parameter
    const viewerToken = extractViewerToken();
    if (!viewerToken) {
      console.error('[Viewer] No token found in URL');
    }
    setToken(viewerToken);
  }, [params]);

  // GUARDRAIL: Deny access without valid token
  if (!token) {
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
    <div className="h-screen w-screen bg-black">
      <ViewerStage sessionId={sessionId} token={token} />
    </div>
  );
}

