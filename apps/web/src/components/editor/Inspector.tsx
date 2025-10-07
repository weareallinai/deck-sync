'use client';

import { useEditorStore } from '@/lib/state/editorStore';
import { Button } from '@deck/ui';
import type { Background } from '@deck/shared';
import { AVAILABLE_FONTS, DEFAULT_FONT } from '@/lib/utils/fonts';

export function Inspector() {
  const selectedElement = useEditorStore(state => state.getSelectedElement());
  const currentSlideId = useEditorStore(state => state.currentSlideId);
  const selectedElementId = useEditorStore(state => state.selectedElementId);
  const currentSlide = useEditorStore(state => state.getCurrentSlide());
  const updateElement = useEditorStore(state => state.updateElement);
  const deleteElement = useEditorStore(state => state.deleteElement);
  const duplicateElement = useEditorStore(state => state.duplicateElement);
  const reorderElement = useEditorStore(state => state.reorderElement);
  const updateSlideBackground = useEditorStore(state => state.updateSlideBackground);
  const saveHistory = useEditorStore(state => state.saveHistory);

  // Show slide properties when no element is selected
  if (!selectedElement || !currentSlideId || !selectedElementId) {
    return (
      <div className="p-4">
        <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-900 mb-4">Slide Properties</h2>
        {currentSlideId && currentSlide ? (
          <SlidePropertiesPanel 
            slideId={currentSlideId}
            slide={currentSlide}
            updateSlideBackground={updateSlideBackground}
            saveHistory={saveHistory}
          />
        ) : (
          <div className="text-sm text-gray-600 dark:text-gray-600">
            No slide selected
          </div>
        )}
      </div>
    );
  }

  const handleUpdate = (updates: any) => {
    updateElement(currentSlideId, selectedElementId, updates);
  };

  const handleDelete = () => {
    if (confirm('Delete this element?')) {
      deleteElement(currentSlideId, selectedElementId);
      saveHistory();
    }
  };

  const handleDuplicate = () => {
    duplicateElement(currentSlideId, selectedElementId);
    saveHistory();
  };

  const handleUpdateAndSave = (updates: any) => {
    updateElement(currentSlideId, selectedElementId, updates);
    saveHistory();
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-sm text-gray-900 dark:text-gray-900">Properties</h2>
        <div className="text-xs text-gray-900 dark:text-gray-900 font-medium bg-gray-100 px-2 py-1 rounded">
          {selectedElement.type}
        </div>
      </div>

      {/* Position & Size */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">Position & Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">X</label>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Y</label>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Width</label>
            <input
              type="number"
              value={Math.round(selectedElement.w)}
              onChange={(e) => handleUpdate({ w: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
            />
          </div>
          <div>
            <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Height</label>
            <input
              type="number"
              value={Math.round(selectedElement.h)}
              onChange={(e) => handleUpdate({ h: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
            />
          </div>
        </div>
      </div>

      {/* Type-specific properties */}
      {selectedElement.type === 'text' && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">Text</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Content</label>
              <textarea
                value={selectedElement.content}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                onBlur={() => saveHistory()}
                className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Font Family</label>
              <select
                value={selectedElement.style.fontFamily || DEFAULT_FONT.value}
                onChange={(e) => handleUpdateAndSave({ style: { ...selectedElement.style, fontFamily: e.target.value } })}
                className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
                style={{ fontFamily: selectedElement.style.fontFamily || DEFAULT_FONT.value }}
              >
                {AVAILABLE_FONTS.map((font) => (
                  <option 
                    key={font.value} 
                    value={font.value}
                    style={{ fontFamily: font.value }}
                  >
                    {font.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Font Size</label>
              <input
                type="number"
                value={selectedElement.style.fontSize || 24}
                onChange={(e) => handleUpdate({ style: { ...selectedElement.style, fontSize: Number(e.target.value) } })}
                onBlur={() => saveHistory()}
                className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Color</label>
              <input
                type="color"
                value={selectedElement.style.color || '#000000'}
                onChange={(e) => handleUpdateAndSave({ style: { ...selectedElement.style, color: e.target.value } })}
                className="w-full h-8 border rounded"
              />
            </div>
          </div>
        </div>
      )}

      {selectedElement.type === 'video' && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">Video</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Video Type</label>
              <div className="text-xs text-gray-600 dark:text-gray-600 mt-1">
                {selectedElement.videoType === 'youtube' && '📺 YouTube'}
                {selectedElement.videoType === 'vimeo' && '🎬 Vimeo'}
                {selectedElement.videoType === 'direct' && '🎥 Direct File'}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Video URL</label>
              <input
                type="text"
                value={selectedElement.src}
                onChange={(e) => {
                  const { parseVideoUrl } = require('@/lib/utils/video');
                  const videoInfo = parseVideoUrl(e.target.value);
                  updateElement(currentSlideId, selectedElementId, {
                    src: e.target.value,
                    videoType: videoInfo.type,
                    youtubeId: videoInfo.youtubeId,
                    vimeoId: videoInfo.vimeoId,
                  });
                }}
                onBlur={() => saveHistory()}
                placeholder="YouTube, Vimeo, or direct MP4 URL"
                className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="video-loop"
                checked={selectedElement.loop || false}
                onChange={(e) => handleUpdateAndSave({ loop: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="video-loop" className="text-xs text-gray-900 dark:text-gray-900 font-medium">
                Loop video
              </label>
            </div>
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">
                Start at (seconds)
              </label>
              <input
                type="number"
                min="0"
                value={selectedElement.startAt || 0}
                onChange={(e) => handleUpdate({ startAt: Number(e.target.value) })}
                onBlur={() => saveHistory()}
                className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
              />
            </div>
            {selectedElement.youtubeId && (
              <div className="text-xs text-gray-600 dark:text-gray-600 bg-blue-50 p-2 rounded">
                <span className="font-medium">YouTube ID:</span> {selectedElement.youtubeId}
              </div>
            )}
            {selectedElement.vimeoId && (
              <div className="text-xs text-gray-600 dark:text-gray-600 bg-purple-50 p-2 rounded">
                <span className="font-medium">Vimeo ID:</span> {selectedElement.vimeoId}
              </div>
            )}
          </div>
        </div>
      )}

      {selectedElement.type === 'shape' && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">Shape</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Fill Color</label>
              <input
                type="color"
                value={selectedElement.fill || '#cccccc'}
                onChange={(e) => handleUpdateAndSave({ fill: e.target.value })}
                className="w-full h-8 border rounded"
              />
            </div>
            {selectedElement.stroke && (
              <>
                <div>
                  <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Stroke Color</label>
                  <input
                    type="color"
                    value={selectedElement.stroke.color}
                    onChange={(e) => handleUpdateAndSave({ stroke: { ...selectedElement.stroke, color: e.target.value } })}
                    className="w-full h-8 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-900 dark:text-gray-900 font-medium">Stroke Width</label>
                  <input
                    type="number"
                    value={selectedElement.stroke.width}
                    onChange={(e) => handleUpdate({ stroke: { ...selectedElement.stroke, width: Number(e.target.value) } })}
                    onBlur={() => saveHistory()}
                    className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Layer control */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-900 mb-2">Layer</h3>
        <div className="grid grid-cols-2 gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              reorderElement(currentSlideId, selectedElementId, 'front');
              saveHistory();
            }}
            className="text-xs"
          >
            ⬆️ Front
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              reorderElement(currentSlideId, selectedElementId, 'back');
              saveHistory();
            }}
            className="text-xs"
          >
            ⬇️ Back
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              reorderElement(currentSlideId, selectedElementId, 'forward');
              saveHistory();
            }}
            className="text-xs"
          >
            ↑ Forward
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => {
              reorderElement(currentSlideId, selectedElementId, 'backward');
              saveHistory();
            }}
            className="text-xs"
          >
            ↓ Backward
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t">
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={handleDuplicate}
          className="w-full text-sm"
        >
          📋 Duplicate
        </Button>
        <Button 
          size="sm" 
          onClick={handleDelete}
          className="w-full text-sm bg-red-600 hover:bg-red-700"
        >
          🗑️ Delete
        </Button>
      </div>
    </div>
  );
}

// Slide Properties Panel Component
interface SlidePropertiesPanelProps {
  slideId: string;
  slide: any;
  updateSlideBackground: (slideId: string, bg: Background) => void;
  saveHistory: () => void;
}

function SlidePropertiesPanel({ slideId, slide, updateSlideBackground, saveHistory }: SlidePropertiesPanelProps) {
  const handleBackgroundTypeChange = (type: 'color' | 'gradient' | 'image') => {
    let newBg: Background;
    
    switch (type) {
      case 'color':
        newBg = { type: 'color', value: slide.bg.type === 'color' ? slide.bg.value : '#ffffff' };
        break;
      case 'gradient':
        newBg = { type: 'gradient', value: 'linear-gradient(to bottom, #3b82f6, #8b5cf6)' };
        break;
      case 'image':
        newBg = { type: 'image', value: 'https://picsum.photos/1280/720' };
        break;
    }
    
    updateSlideBackground(slideId, newBg);
    saveHistory();
  };

  const handleColorChange = (color: string) => {
    updateSlideBackground(slideId, { type: 'color', value: color });
    saveHistory();
  };

  const handleGradientChange = (gradient: string) => {
    updateSlideBackground(slideId, { type: 'gradient', value: gradient });
    saveHistory();
  };

  const handleImageUrlChange = (url: string) => {
    if (url.trim()) {
      updateSlideBackground(slideId, { type: 'image', value: url });
      saveHistory();
    }
  };

  return (
    <div className="space-y-4">
      {/* Background Type Selector */}
      <div>
        <label className="text-xs text-gray-900 dark:text-gray-900 font-medium mb-2 block">Background Type</label>
        <select
          value={slide.bg.type}
          onChange={(e) => handleBackgroundTypeChange(e.target.value as 'color' | 'gradient' | 'image')}
          className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white"
        >
          <option value="color">Solid Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
      </div>

      {/* Color Picker (for solid color) */}
      {slide.bg.type === 'color' && (
        <div>
          <label className="text-xs text-gray-900 dark:text-gray-900 font-medium mb-2 block">Background Color</label>
          <input
            type="color"
            value={slide.bg.value}
            onChange={(e) => handleColorChange(e.target.value)}
            className="w-full h-10 border rounded cursor-pointer"
          />
          <div className="mt-1 text-xs text-gray-900 dark:text-gray-900 font-mono">{slide.bg.value}</div>
        </div>
      )}

      {/* Gradient Editor (simple two-color gradient) */}
      {slide.bg.type === 'gradient' && (
        <div>
          <label className="text-xs text-gray-900 dark:text-gray-900 font-medium mb-2 block">Gradient</label>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-900 dark:text-gray-900 font-medium">Direction:</span>
              <select
                value={slide.bg.value.includes('to bottom') ? 'to bottom' : slide.bg.value.includes('to right') ? 'to right' : 'to bottom'}
                onChange={(e) => {
                  const colors = slide.bg.value.match(/#[0-9a-fA-F]{6}/g) || ['#3b82f6', '#8b5cf6'];
                  handleGradientChange(`linear-gradient(${e.target.value}, ${colors[0]}, ${colors[1]})`);
                }}
                className="flex-1 px-2 py-1 text-xs text-gray-900 dark:text-gray-900 border rounded bg-white"
              >
                <option value="to bottom">Top to Bottom</option>
                <option value="to right">Left to Right</option>
                <option value="to bottom right">Diagonal</option>
              </select>
            </div>
            <div className="text-xs text-gray-900 dark:text-gray-900 font-mono bg-gray-50 p-2 rounded overflow-x-auto border">
              {slide.bg.value}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-500 italic">
              💡 Tip: Edit gradient CSS directly in the future
            </div>
          </div>
        </div>
      )}

      {/* Image URL Input (placeholder for R2 upload) */}
      {slide.bg.type === 'image' && (
        <div>
          <label className="text-xs text-gray-900 dark:text-gray-900 font-medium mb-2 block">Background Image</label>
          <input
            type="text"
            value={slide.bg.value}
            onChange={(e) => {
              updateSlideBackground(slideId, { type: 'image', value: e.target.value });
            }}
            onBlur={() => saveHistory()}
            placeholder="Enter image URL"
            className="w-full px-2 py-1 text-sm text-gray-900 dark:text-gray-900 border rounded bg-white mb-2"
          />
          <div className="text-xs text-gray-500 dark:text-gray-500 italic mb-2">
            📸 Paste an image URL (drag & drop upload coming soon)
          </div>
          {slide.bg.value && (
            <div className="aspect-video bg-gray-100 rounded overflow-hidden border">
              <img 
                src={slide.bg.value} 
                alt="Background preview" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      <div>
        <label className="text-xs text-gray-900 dark:text-gray-900 font-medium mb-2 block">Preview</label>
        <div 
          className="aspect-video rounded border-2 border-gray-300"
          style={
            slide.bg.type === 'color' ? {
              backgroundColor: slide.bg.value,
            } : slide.bg.type === 'gradient' ? {
              backgroundImage: slide.bg.value,
            } : {
              backgroundImage: `url(${slide.bg.value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          }
        />
      </div>
    </div>
  );
}

