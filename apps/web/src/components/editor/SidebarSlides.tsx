'use client';

import { Button } from '@deck/ui';
import { useEditorStore } from '@/lib/state/editorStore';

export function SidebarSlides() {
  const deck = useEditorStore(state => state.deck);
  const slides = useEditorStore(state => state.slides);
  const currentSlideId = useEditorStore(state => state.currentSlideId);
  const setCurrentSlide = useEditorStore(state => state.setCurrentSlide);
  const addSlide = useEditorStore(state => state.addSlide);
  const deleteSlide = useEditorStore(state => state.deleteSlide);
  const duplicateSlide = useEditorStore(state => state.duplicateSlide);
  const saveHistory = useEditorStore(state => state.saveHistory);

  const handleAddSlide = () => {
    addSlide();
    saveHistory();
  };

  const handleDeleteSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this slide?')) {
      deleteSlide(slideId);
      saveHistory();
    }
  };

  const handleDuplicateSlide = (slideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    duplicateSlide(slideId);
    saveHistory();
  };

  if (!deck) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <p className="text-sm text-gray-500">No deck loaded</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      <div className="p-4 border-b bg-white">
        <h2 className="font-semibold text-sm text-gray-700">Slides</h2>
        <p className="text-xs text-gray-500 mt-1">
          {deck.slides.length} slide{deck.slides.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {deck.slides.map((slideRef, index) => {
          const slide = slides.get(slideRef.id);
          if (!slide) return null;

          const isActive = slideRef.id === currentSlideId;

          return (
            <div
              key={slideRef.id}
              className={`group relative cursor-pointer transition-all ${
                isActive ? 'ring-2 ring-blue-500' : 'hover:ring-2 hover:ring-gray-300'
              }`}
              onClick={() => setCurrentSlide(slideRef.id)}
            >
              {/* Slide number badge */}
              <div className="absolute -top-2 -left-2 bg-gray-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center z-10">
                {index + 1}
              </div>

              {/* Slide thumbnail */}
              <div 
                className="aspect-video bg-white rounded border-2 overflow-hidden relative"
                style={{
                  backgroundColor: slide.bg.type === 'color' ? slide.bg.value : '#ffffff',
                }}
              >
                {/* Simplified element preview */}
                <div className="absolute inset-0 p-1">
                  {slide.elements.slice(0, 3).map((el) => (
                    <div
                      key={el.id}
                      className="absolute bg-gray-300 opacity-40 rounded"
                      style={{
                        left: `${(el.x / 1280) * 100}%`,
                        top: `${(el.y / 720) * 100}%`,
                        width: `${(el.w / 1280) * 100}%`,
                        height: `${(el.h / 720) * 100}%`,
                      }}
                    />
                  ))}
                  {slide.elements.length > 3 && (
                    <div className="absolute bottom-1 right-1 text-xs text-gray-500 bg-white px-1 rounded">
                      +{slide.elements.length - 3} more
                    </div>
                  )}
                  {slide.elements.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-400">
                      Empty
                    </div>
                  )}
                </div>

                {/* Action buttons (shown on hover) */}
                <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => handleDuplicateSlide(slideRef.id, e)}
                    className="bg-white hover:bg-gray-100 border rounded p-1 text-xs shadow"
                    title="Duplicate"
                  >
                    📋
                  </button>
                  {deck.slides.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteSlide(slideRef.id, e)}
                      className="bg-white hover:bg-red-50 border border-red-200 rounded p-1 text-xs shadow"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="p-3 border-t bg-white">
        <Button 
          size="sm" 
          className="w-full"
          onClick={handleAddSlide}
        >
          ➕ Add Slide
        </Button>
      </div>
    </div>
  );
}

