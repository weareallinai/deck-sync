'use client';

import { Button } from '@deck/ui';

interface PresenterControlsProps {
  onStart: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentStep: number;
}

export function PresenterControls({ 
  onStart, 
  onNext, 
  onPrev, 
  currentStep 
}: PresenterControlsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold mb-2">Presentation Controls</h3>
        <div className="space-y-2">
          <Button className="w-full" size="lg" onClick={onStart}>
            Start Presentation
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={onPrev}>
              Previous
            </Button>
            <Button variant="secondary" size="sm" onClick={onNext}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 pt-4">
        <h3 className="text-sm font-semibold mb-2">Session Info</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <div>Current Step: {currentStep}</div>
        </div>
      </div>
    </div>
  );
}

