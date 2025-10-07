'use client';

import { Button } from '@deck/ui';
import { useEditorStore } from '@/lib/state/editorStore';
import { useState } from 'react';
import type { TextEl, ShapeEl, ImageEl, VideoEl } from '@deck/shared';

export function Toolbar() {
  const [showShapeMenu, setShowShapeMenu] = useState(false);
  
  const currentSlideId = useEditorStore(state => state.currentSlideId);
  const addElement = useEditorStore(state => state.addElement);
  const deck = useEditorStore(state => state.deck);
  const undo = useEditorStore(state => state.undo);
  const redo = useEditorStore(state => state.redo);
  const canUndo = useEditorStore(state => state.canUndo);
  const canRedo = useEditorStore(state => state.canRedo);
  const saveHistory = useEditorStore(state => state.saveHistory);

  const handleAddText = () => {
    if (!currentSlideId) return;
    
    const newText: TextEl = {
      id: `text-${Date.now()}`,
      type: 'text',
      x: 100,
      y: 100,
      w: 300,
      h: 100,
      z: 0,
      content: 'Double-click to edit',
      style: {
        fontSize: 32,
        fontFamily: 'Arial',
        color: '#000000',
        align: 'left',
      },
    };
    
    addElement(currentSlideId, newText);
    saveHistory();
  };

  const handleAddShape = (shape: 'rect' | 'ellipse' | 'line') => {
    if (!currentSlideId) return;
    
    const newShape: ShapeEl = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shape,
      x: 200,
      y: 200,
      w: shape === 'line' ? 200 : 150,
      h: shape === 'line' ? 2 : 150,
      z: 0,
      fill: shape === 'line' ? undefined : '#4F46E5',
      stroke: shape === 'line' ? { color: '#000000', width: 3 } : undefined,
    };
    
    addElement(currentSlideId, newShape);
    saveHistory();
    setShowShapeMenu(false);
  };

  const handleAddImage = () => {
    if (!currentSlideId) return;
    
    // Placeholder image from Unsplash
    const newImage: ImageEl = {
      id: `image-${Date.now()}`,
      type: 'image',
      x: 300,
      y: 150,
      w: 400,
      h: 300,
      z: 0,
      src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
      alt: 'Placeholder image',
    };
    
    addElement(currentSlideId, newImage);
    saveHistory();
  };

  const handleAddVideo = () => {
    if (!currentSlideId) return;
    
    // Placeholder video
    const newVideo: VideoEl = {
      id: `video-${Date.now()}`,
      type: 'video',
      x: 250,
      y: 150,
      w: 640,
      h: 360,
      z: 0,
      src: 'https://example.com/video.mp4',
      loop: false,
    };
    
    addElement(currentSlideId, newVideo);
    saveHistory();
  };

  const handleSave = () => {
    // TODO: Implement save functionality
    alert('Save functionality coming soon! Deck: ' + (deck?.title || 'Untitled'));
  };

  return (
    <div className="h-14 border-b bg-white px-4 flex items-center gap-2">
      {/* Deck title */}
      <div className="flex items-center gap-2 mr-4 border-r pr-4">
        <span className="text-sm font-semibold text-gray-700">
          {deck?.title || 'Untitled Deck'}
        </span>
      </div>

      {/* Undo/Redo */}
      <div className="flex items-center gap-1 mr-2 border-r pr-4">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => undo()}
          disabled={!canUndo()}
          title="Undo (Cmd+Z)"
          className="text-xs"
        >
          ↶
        </Button>
        <Button 
          size="sm" 
          variant="ghost"
          onClick={() => redo()}
          disabled={!canRedo()}
          title="Redo (Cmd+Shift+Z)"
          className="text-xs"
        >
          ↷
        </Button>
      </div>

      {/* Add elements */}
      <div className="flex items-center gap-1">
        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleAddText}
          disabled={!currentSlideId}
          title="Add Text"
        >
          <span className="text-lg mr-1">T</span>
          Text
        </Button>

        <div className="relative">
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setShowShapeMenu(!showShapeMenu)}
            disabled={!currentSlideId}
            title="Add Shape"
          >
            <span className="text-lg mr-1">⬜</span>
            Shape
          </Button>
          
          {showShapeMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border shadow-lg rounded-md py-1 z-50 min-w-[120px]">
              <button
                onClick={() => handleAddShape('rect')}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                ⬜ Rectangle
              </button>
              <button
                onClick={() => handleAddShape('ellipse')}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                ⭕ Circle
              </button>
              <button
                onClick={() => handleAddShape('line')}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
              >
                ➖ Line
              </button>
            </div>
          )}
        </div>

        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleAddImage}
          disabled={!currentSlideId}
          title="Add Image"
        >
          <span className="text-lg mr-1">🖼️</span>
          Image
        </Button>

        <Button 
          size="sm" 
          variant="ghost"
          onClick={handleAddVideo}
          disabled={!currentSlideId}
          title="Add Video"
        >
          <span className="text-lg mr-1">🎬</span>
          Video
        </Button>
      </div>

      <div className="flex-1" />

      {/* Save button */}
      <Button 
        size="sm"
        onClick={handleSave}
      >
        💾 Save
      </Button>
    </div>
  );
}

