'use client';

import { Button } from '@deck/ui';

export function Toolbar() {
  // Stub: will contain text, shape, image, video tools
  return (
    <div className="h-14 border-b bg-white px-4 flex items-center gap-2">
      <Button size="sm" variant="ghost">
        Text
      </Button>
      <Button size="sm" variant="ghost">
        Shape
      </Button>
      <Button size="sm" variant="ghost">
        Image
      </Button>
      <Button size="sm" variant="ghost">
        Video
      </Button>
      <div className="flex-1" />
      <Button size="sm">
        Save
      </Button>
    </div>
  );
}

