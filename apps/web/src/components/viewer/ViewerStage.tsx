'use client';

// GUARDRAIL: Viewer component must NOT import Konva or editor dependencies
// GUARDRAIL: Use only CSS transforms/opacity for animations

interface ViewerStageProps {
  sessionId: string;
  token: string;
}

export function ViewerStage({ sessionId, token }: ViewerStageProps) {
  // Stub: will render slides fullscreen, sync via WS
  // TODO: Connect to WebSocket with token
  // TODO: Implement clock sync on mount
  // TODO: Render slides with Framer Motion (transform/opacity only)
  // TODO: Respect prefers-reduced-motion
  
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-white text-center">
        <h1 className="text-4xl mb-4">Viewer</h1>
        <p className="text-gray-400">Session: {sessionId}</p>
        <p className="text-xs text-gray-500 mt-2">Token: {token.substring(0, 20)}...</p>
        <p className="text-sm text-gray-500 mt-2">Waiting for presentation to start...</p>
      </div>
    </div>
  );
}

