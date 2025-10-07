'use client';

import { Stage as KonvaStage, Layer, Rect, Text, Image, Ellipse, Line, Transformer } from 'react-konva';
import { useRef, useEffect, useState } from 'react';
import { useEditorStore } from '@/lib/state/editorStore';
import type { Element as SlideElement } from '@deck/shared';
import Konva from 'konva';

export function Stage() {
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [stageSize, setStageSize] = useState({ width: 1280, height: 720 });
  
  const currentSlide = useEditorStore(state => state.getCurrentSlide());
  const selectedElementId = useEditorStore(state => state.selectedElementId);
  const selectElement = useEditorStore(state => state.selectElement);
  const updateElement = useEditorStore(state => state.updateElement);
  const currentSlideId = useEditorStore(state => state.currentSlideId);

  // Calculate scale to fit canvas in viewport
  useEffect(() => {
    const updateScale = () => {
      if (!containerRef.current) return;
      
      const containerWidth = containerRef.current.clientWidth;
      const containerHeight = containerRef.current.clientHeight;
      
      const scaleX = (containerWidth * 0.9) / 1280;
      const scaleY = (containerHeight * 0.9) / 720;
      const newScale = Math.min(scaleX, scaleY, 1); // Don't scale up beyond 100%
      
      setScale(newScale);
      setStageSize({
        width: 1280 * newScale,
        height: 720 * newScale,
      });
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Handle transformer attachment
  useEffect(() => {
    if (!transformerRef.current || !selectedElementId) return;
    
    const stage = stageRef.current;
    if (!stage) return;
    
    const selectedNode = stage.findOne(`#${selectedElementId}`);
    if (selectedNode) {
      transformerRef.current.nodes([selectedNode]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedElementId]);

  const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    // Clicked on empty area - deselect
    if (e.target === e.target.getStage()) {
      selectElement(null);
    }
  };

  const handleElementClick = (elementId: string) => {
    selectElement(elementId);
  };

  const handleDragEnd = (elementId: string, e: Konva.KonvaEventObject<DragEvent>) => {
    if (!currentSlideId) return;
    
    const node = e.target;
    updateElement(currentSlideId, elementId, {
      x: node.x() / scale, // Un-scale the position
      y: node.y() / scale,
    });
  };

  const handleTransformEnd = (elementId: string, e: Konva.KonvaEventObject<Event>) => {
    if (!currentSlideId) return;
    
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    
    // Reset scale and apply to width/height
    node.scaleX(1);
    node.scaleY(1);
    
    updateElement(currentSlideId, elementId, {
      x: node.x() / scale,
      y: node.y() / scale,
      w: (node.width() * scaleX) / scale,
      h: (node.height() * scaleY) / scale,
    });
  };

  if (!currentSlide) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">No slide selected</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-gray-100 overflow-hidden">
      <div 
        className="bg-white shadow-2xl" 
        style={{ 
          width: stageSize.width, 
          height: stageSize.height 
        }}
      >
        <KonvaStage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={scale}
          scaleY={scale}
          onClick={handleStageClick}
          onTap={handleStageClick}
        >
          <Layer>
            {/* Background */}
            <Rect
              width={1280}
              height={720}
              fill={currentSlide.bg.type === 'color' ? currentSlide.bg.value : '#ffffff'}
            />
            
            {/* Elements */}
            {currentSlide.elements.map((element) => (
              <ElementRenderer
                key={element.id}
                element={element}
                isSelected={element.id === selectedElementId}
                onClick={() => handleElementClick(element.id)}
                onDragEnd={(e) => handleDragEnd(element.id, e)}
                onTransformEnd={(e) => handleTransformEnd(element.id, e)}
              />
            ))}
            
            {/* Transformer for selected element */}
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Limit resize
                if (newBox.width < 10 || newBox.height < 10) {
                  return oldBox;
                }
                return newBox;
              }}
            />
          </Layer>
        </KonvaStage>
      </div>
    </div>
  );
}

// Element renderer component
interface ElementRendererProps {
  element: SlideElement;
  isSelected: boolean;
  onClick: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

function ElementRenderer({ element, isSelected, onClick, onDragEnd, onTransformEnd }: ElementRendererProps) {
  const shapeRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && shapeRef.current) {
      shapeRef.current.moveToTop();
    }
  }, [isSelected]);

  const commonProps = {
    id: element.id,
    x: element.x,
    y: element.y,
    draggable: true,
    onClick,
    onTap: onClick,
    onDragEnd,
    onTransformEnd,
    ref: shapeRef,
  };

  switch (element.type) {
    case 'text':
      return (
        <Text
          {...commonProps}
          text={element.content}
          fontSize={element.style.fontSize || 24}
          fontFamily={element.style.fontFamily || 'Arial'}
          fill={element.style.color || '#000000'}
          width={element.w}
          height={element.h}
          align={element.style.align || 'left'}
        />
      );

    case 'shape':
      if (element.shape === 'rect') {
        return (
          <Rect
            {...commonProps}
            width={element.w}
            height={element.h}
            fill={element.fill || '#cccccc'}
            stroke={element.stroke?.color}
            strokeWidth={element.stroke?.width}
          />
        );
      } else if (element.shape === 'ellipse') {
        return (
          <Ellipse
            {...commonProps}
            radiusX={element.w / 2}
            radiusY={element.h / 2}
            x={element.x + element.w / 2}
            y={element.y + element.h / 2}
            fill={element.fill || '#cccccc'}
            stroke={element.stroke?.color}
            strokeWidth={element.stroke?.width}
          />
        );
      } else if (element.shape === 'line') {
        return (
          <Line
            {...commonProps}
            points={[0, 0, element.w, element.h]}
            stroke={element.stroke?.color || '#000000'}
            strokeWidth={element.stroke?.width || 2}
          />
        );
      }
      return null;

    case 'image':
      return <ImageElement {...commonProps} element={element} />;

    case 'video':
      // Placeholder for video - show a rectangle with "VIDEO" text
      return (
        <>
          <Rect
            {...commonProps}
            width={element.w}
            height={element.h}
            fill="#000000"
            opacity={0.8}
          />
          <Text
            x={element.x}
            y={element.y + element.h / 2 - 12}
            text="VIDEO"
            fontSize={24}
            fontFamily="Arial"
            fill="#ffffff"
            width={element.w}
            align="center"
          />
        </>
      );

    default:
      return null;
  }
}

// Image element with loading
interface ImageElementProps {
  element: any;
  id: string;
  x: number;
  y: number;
  draggable: boolean;
  onClick: () => void;
  onTap: () => void;
  onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => void;
  onTransformEnd: (e: Konva.KonvaEventObject<Event>) => void;
}

function ImageElement(props: ImageElementProps) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new window.Image();
    img.src = props.element.src;
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      setImage(img);
    };
  }, [props.element.src]);

  if (!image) {
    return (
      <Rect
        {...props}
        width={props.element.w}
        height={props.element.h}
        fill="#e0e0e0"
      />
    );
  }

  return (
    <Image
      {...props}
      image={image}
      width={props.element.w}
      height={props.element.h}
    />
  );
}

