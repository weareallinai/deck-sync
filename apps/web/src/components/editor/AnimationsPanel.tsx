'use client';

import { useEditorStore } from '@/lib/state/editorStore';
import { Button } from '@deck/ui';
import { useState } from 'react';
import type { Animation } from '@deck/shared';

export function AnimationsPanel() {
  const selectedElement = useEditorStore(state => state.getSelectedElement());
  const currentSlideId = useEditorStore(state => state.currentSlideId);
  const selectedElementId = useEditorStore(state => state.selectedElementId);
  const updateElement = useEditorStore(state => state.updateElement);
  const saveHistory = useEditorStore(state => state.saveHistory);
  
  const [isAddingAnimation, setIsAddingAnimation] = useState(false);

  if (!selectedElement || !currentSlideId || !selectedElementId) {
    return (
      <div className="p-4 border-t bg-gray-50">
        <h3 className="font-semibold mb-2 text-sm text-gray-700">Animations</h3>
        <div className="text-xs text-gray-500 italic">
          Select an element to add animations
        </div>
      </div>
    );
  }

  const animations = selectedElement.animations || [];

  const handleAddAnimation = () => {
    const newAnimation: Animation = {
      type: 'fade',
      trigger: 'on-step',
      duration: 0.3,
      delay: 0,
      easing: 'ease-out',
    };

    updateElement(currentSlideId, selectedElementId, {
      animations: [...animations, newAnimation],
    });
    saveHistory();
    setIsAddingAnimation(false);
  };

  const handleUpdateAnimation = (index: number, updates: Partial<Animation>) => {
    const newAnimations = [...animations];
    newAnimations[index] = { ...newAnimations[index], ...updates };
    updateElement(currentSlideId, selectedElementId, {
      animations: newAnimations,
    });
  };

  const handleDeleteAnimation = (index: number) => {
    const newAnimations = animations.filter((_, i) => i !== index);
    updateElement(currentSlideId, selectedElementId, {
      animations: newAnimations,
    });
    saveHistory();
  };

  const handleReorderAnimation = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === animations.length - 1)
    ) {
      return;
    }

    const newAnimations = [...animations];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newAnimations[index], newAnimations[targetIndex]] = [
      newAnimations[targetIndex],
      newAnimations[index],
    ];

    updateElement(currentSlideId, selectedElementId, {
      animations: newAnimations,
    });
    saveHistory();
  };

  return (
    <div className="p-4 border-t bg-gray-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm text-gray-700">Animations</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsAddingAnimation(true)}
          className="text-xs px-2 h-6"
        >
          + Add
        </Button>
      </div>

      {animations.length === 0 && !isAddingAnimation && (
        <div className="text-xs text-gray-500 italic mb-3">
          No animations • Click "Add" to create one
        </div>
      )}

      {isAddingAnimation && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded">
          <div className="text-xs text-blue-700 mb-2">
            Add animation to this element?
          </div>
          <div className="flex gap-1">
            <Button
              size="sm"
              onClick={handleAddAnimation}
              className="text-xs h-6 px-2"
            >
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsAddingAnimation(false)}
              className="text-xs h-6 px-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {animations.map((animation, index) => (
        <AnimationItem
          key={index}
          animation={animation}
          index={index}
          totalCount={animations.length}
          onUpdate={(updates) => handleUpdateAnimation(index, updates)}
          onDelete={() => handleDeleteAnimation(index)}
          onReorder={(direction) => handleReorderAnimation(index, direction)}
          onBlur={() => saveHistory()}
        />
      ))}

      {animations.length > 0 && (
        <div className="mt-3 pt-3 border-t text-xs text-gray-500 italic">
          💡 Animations play in order (top to bottom)
        </div>
      )}
    </div>
  );
}

// Animation Item Component
interface AnimationItemProps {
  animation: Animation;
  index: number;
  totalCount: number;
  onUpdate: (updates: Partial<Animation>) => void;
  onDelete: () => void;
  onReorder: (direction: 'up' | 'down') => void;
  onBlur: () => void;
}

function AnimationItem({
  animation,
  index,
  totalCount,
  onUpdate,
  onDelete,
  onReorder,
  onBlur,
}: AnimationItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-2 border border-gray-300 rounded bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 text-left text-xs font-medium text-gray-700"
        >
          {isExpanded ? '▼' : '▶'} {animation.type} ({animation.trigger})
        </button>
        <div className="flex gap-1">
          <button
            onClick={() => onReorder('up')}
            disabled={index === 0}
            className="text-xs px-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
            title="Move up"
          >
            ↑
          </button>
          <button
            onClick={() => onReorder('down')}
            disabled={index === totalCount - 1}
            className="text-xs px-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
            title="Move down"
          >
            ↓
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-1 text-red-500 hover:text-red-700"
            title="Delete"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-2 space-y-2">
          {/* Animation Type */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Type</label>
            <select
              value={animation.type}
              onChange={(e) => onUpdate({ type: e.target.value as Animation['type'] })}
              onBlur={onBlur}
              className="w-full px-2 py-1 text-xs border rounded"
            >
              <option value="fade">Fade In</option>
              <option value="slide-up">Slide Up</option>
              <option value="slide-down">Slide Down</option>
              <option value="slide-left">Slide Left</option>
              <option value="slide-right">Slide Right</option>
              <option value="zoom">Zoom In</option>
              <option value="bounce">Bounce</option>
            </select>
          </div>

          {/* Trigger */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Trigger</label>
            <select
              value={animation.trigger}
              onChange={(e) => onUpdate({ trigger: e.target.value as Animation['trigger'] })}
              onBlur={onBlur}
              className="w-full px-2 py-1 text-xs border rounded"
            >
              <option value="on-step">On Step</option>
              <option value="on-load">On Slide Load</option>
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Duration: {animation.duration}s
            </label>
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={animation.duration}
              onChange={(e) => onUpdate({ duration: parseFloat(e.target.value) })}
              onMouseUp={onBlur}
              className="w-full"
            />
          </div>

          {/* Delay */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">
              Delay: {animation.delay}s
            </label>
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={animation.delay}
              onChange={(e) => onUpdate({ delay: parseFloat(e.target.value) })}
              onMouseUp={onBlur}
              className="w-full"
            />
          </div>

          {/* Easing */}
          <div>
            <label className="text-xs text-gray-600 block mb-1">Easing</label>
            <select
              value={animation.easing}
              onChange={(e) => onUpdate({ easing: e.target.value as Animation['easing'] })}
              onBlur={onBlur}
              className="w-full px-2 py-1 text-xs border rounded"
            >
              <option value="linear">Linear</option>
              <option value="ease">Ease</option>
              <option value="ease-in">Ease In</option>
              <option value="ease-out">Ease Out</option>
              <option value="ease-in-out">Ease In Out</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

