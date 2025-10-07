'use client';

import { Button } from '@deck/ui';

export function SidebarSlides() {
  // Stub: will render slide thumbnails with drag-reorder
  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="font-semibold">Slides</h2>
      </div>
      <div className="flex-1 overflow-auto p-2 space-y-2">
        <div className="aspect-video bg-gray-100 rounded border-2 border-blue-500 cursor-pointer">
          <div className="text-xs text-gray-500 p-2">Slide 1</div>
        </div>
        <div className="aspect-video bg-gray-100 rounded border cursor-pointer">
          <div className="text-xs text-gray-500 p-2">Slide 2</div>
        </div>
      </div>
      <div className="p-2 border-t">
        <Button size="sm" className="w-full">
          + Add Slide
        </Button>
      </div>
    </div>
  );
}

