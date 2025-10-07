'use client';

export function ConnectionStatus() {
  // Stub: will show WebSocket connection state and latency
  const status = 'connected'; // 'connecting' | 'connected' | 'disconnected'
  const latency = 42;

  const statusColors = {
    connecting: 'bg-yellow-500',
    connected: 'bg-green-500',
    disconnected: 'bg-red-500',
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${statusColors[status]}`} />
        <span className="text-sm font-medium capitalize">{status}</span>
      </div>
      {status === 'connected' && (
        <span className="text-xs text-gray-400">{latency}ms</span>
      )}
    </div>
  );
}

