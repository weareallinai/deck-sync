'use client';

import { useEditorStore } from '@/lib/state/editorStore';
import { Button } from '@deck/ui';

export function Inspector() {
  const selectedElement = useEditorStore(state => state.getSelectedElement());
  const currentSlideId = useEditorStore(state => state.currentSlideId);
  const selectedElementId = useEditorStore(state => state.selectedElementId);
  const updateElement = useEditorStore(state => state.updateElement);
  const deleteElement = useEditorStore(state => state.deleteElement);
  const duplicateElement = useEditorStore(state => state.duplicateElement);
  const reorderElement = useEditorStore(state => state.reorderElement);
  const saveHistory = useEditorStore(state => state.saveHistory);

  if (!selectedElement || !currentSlideId || !selectedElementId) {
    return (
      <div className="p-4">
        <h2 className="font-semibold text-sm text-gray-700 mb-4">Properties</h2>
        <div className="text-sm text-gray-500">
          Select an element to edit properties
        </div>
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
        <h2 className="font-semibold text-sm text-gray-700">Properties</h2>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {selectedElement.type}
        </div>
      </div>

      {/* Position & Size */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">Position & Size</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-600">X</label>
            <input
              type="number"
              value={Math.round(selectedElement.x)}
              onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Y</label>
            <input
              type="number"
              value={Math.round(selectedElement.y)}
              onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Width</label>
            <input
              type="number"
              value={Math.round(selectedElement.w)}
              onChange={(e) => handleUpdate({ w: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
          <div>
            <label className="text-xs text-gray-600">Height</label>
            <input
              type="number"
              value={Math.round(selectedElement.h)}
              onChange={(e) => handleUpdate({ h: Number(e.target.value) })}
              onBlur={() => saveHistory()}
              className="w-full px-2 py-1 text-sm border rounded"
            />
          </div>
        </div>
      </div>

      {/* Type-specific properties */}
      {selectedElement.type === 'text' && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Text</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">Content</label>
              <textarea
                value={selectedElement.content}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                onBlur={() => saveHistory()}
                className="w-full px-2 py-1 text-sm border rounded"
                rows={3}
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Font Family</label>
              <select
                value={selectedElement.style.fontFamily || 'Arial'}
                onChange={(e) => handleUpdateAndSave({ style: { ...selectedElement.style, fontFamily: e.target.value } })}
                className="w-full px-2 py-1 text-sm border rounded"
              >
                <option value="Arial">Arial</option>
                <option value="Helvetica">Helvetica</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Georgia">Georgia</option>
                <option value="Courier New">Courier New</option>
                <option value="Verdana">Verdana</option>
                <option value="Trebuchet MS">Trebuchet MS</option>
                <option value="Comic Sans MS">Comic Sans MS</option>
                <option value="Impact">Impact</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600">Font Size</label>
              <input
                type="number"
                value={selectedElement.style.fontSize || 24}
                onChange={(e) => handleUpdate({ style: { ...selectedElement.style, fontSize: Number(e.target.value) } })}
                onBlur={() => saveHistory()}
                className="w-full px-2 py-1 text-sm border rounded"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600">Color</label>
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

      {selectedElement.type === 'shape' && (
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-600 mb-2">Shape</h3>
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">Fill Color</label>
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
                  <label className="text-xs text-gray-600">Stroke Color</label>
                  <input
                    type="color"
                    value={selectedElement.stroke.color}
                    onChange={(e) => handleUpdateAndSave({ stroke: { ...selectedElement.stroke, color: e.target.value } })}
                    className="w-full h-8 border rounded"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600">Stroke Width</label>
                  <input
                    type="number"
                    value={selectedElement.stroke.width}
                    onChange={(e) => handleUpdate({ stroke: { ...selectedElement.stroke, width: Number(e.target.value) } })}
                    onBlur={() => saveHistory()}
                    className="w-full px-2 py-1 text-sm border rounded"
                  />
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Layer control */}
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-600 mb-2">Layer</h3>
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

