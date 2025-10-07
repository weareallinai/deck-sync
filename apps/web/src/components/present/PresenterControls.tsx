'use client';

import { Button } from '@deck/ui';

export function PresenterControls() {
  // Stub: will send WS commands for next/prev/start/pause
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Presentation Controls</h3>
        <div className="space-y-2">
          <Button className="w-full" size="lg">
            Start Presentation
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm">
              Previous
            </Button>
            <Button variant="secondary" size="sm">
              Next
            </Button>
          </div>
          <Button variant="ghost" size="sm" className="w-full">
            Pause
          </Button>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold mb-2">Session Info</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Session ID: stub-session</div>
          <div>Viewers: 0</div>
          <div>Current Slide: 1 / 10</div>
        </div>
      </div>
    </div>
  );
}

