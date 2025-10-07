'use client';

import { Stage as KonvaStage, Layer } from 'react-konva';
import { useRef } from 'react';

export function Stage() {
  const stageRef = useRef(null);

  // Stub: will render Konva canvas with deck elements
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-lg" style={{ aspectRatio: '16/9', width: '80%' }}>
        <KonvaStage
          ref={stageRef}
          width={1280}
          height={720}
          className="border border-gray-300"
        >
          <Layer>
            {/* Elements will be rendered here */}
          </Layer>
        </KonvaStage>
      </div>
    </div>
  );
}

