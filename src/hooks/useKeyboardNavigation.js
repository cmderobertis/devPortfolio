import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Custom hook for keyboard navigation in grid-based interfaces
 * Provides WCAG 2.1 AA compliant keyboard navigation
 */
const useKeyboardNavigation = ({ 
  gridWidth = 0, 
  gridHeight = 0, 
  initialPosition = { x: 0, y: 0 },
  wrapAround = false,
  onPositionChange = null,
  onSelect = null,
  onEscape = null 
}) => {
  const [focusPosition, setFocusPosition] = useState(initialPosition);
  const [isKeyboardActive, setIsKeyboardActive] = useState(false);
  const containerRef = useRef(null);

  // Update focus position and call callback if provided
  const updateFocusPosition = useCallback((newPosition) => {
    setFocusPosition(newPosition);
    if (onPositionChange) {
      onPositionChange(newPosition);
    }
  }, [onPositionChange]);

  // Handle keyboard events
  const handleKeyDown = useCallback((event) => {
    if (!isKeyboardActive) return;

    const { x, y } = focusPosition;
    let newX = x;
    let newY = y;
    let handled = true;

    switch (event.key) {
      case 'ArrowUp':
        if (wrapAround) {
          newY = y > 0 ? y - 1 : gridHeight - 1;
        } else {
          newY = Math.max(0, y - 1);
        }
        break;
        
      case 'ArrowDown':
        if (wrapAround) {
          newY = y < gridHeight - 1 ? y + 1 : 0;
        } else {
          newY = Math.min(gridHeight - 1, y + 1);
        }
        break;
        
      case 'ArrowLeft':
        if (wrapAround) {
          newX = x > 0 ? x - 1 : gridWidth - 1;
        } else {
          newX = Math.max(0, x - 1);
        }
        break;
        
      case 'ArrowRight':
        if (wrapAround) {
          newX = x < gridWidth - 1 ? x + 1 : 0;
        } else {
          newX = Math.min(gridWidth - 1, x + 1);
        }
        break;
        
      case 'Home':
        newX = 0;
        newY = 0;
        break;
        
      case 'End':
        newX = gridWidth - 1;
        newY = gridHeight - 1;
        break;
        
      case 'PageUp':
        newY = Math.max(0, y - Math.floor(gridHeight / 4));
        break;
        
      case 'PageDown':
        newY = Math.min(gridHeight - 1, y + Math.floor(gridHeight / 4));
        break;
        
      case 'Enter':
      case ' ':
        if (onSelect) {
          onSelect(focusPosition);
        }
        break;
        
      case 'Escape':
        if (onEscape) {
          onEscape();
        } else {
          setIsKeyboardActive(false);
        }
        break;
        
      default:
        handled = false;
        break;
    }

    if (handled) {
      event.preventDefault();
      event.stopPropagation();
      
      if (newX !== x || newY !== y) {
        updateFocusPosition({ x: newX, y: newY });
      }
    }
  }, [focusPosition, isKeyboardActive, gridWidth, gridHeight, wrapAround, onSelect, onEscape, updateFocusPosition]);

  // Activate keyboard navigation on focus
  const handleFocus = useCallback(() => {
    setIsKeyboardActive(true);
  }, []);

  // Deactivate keyboard navigation on blur
  const handleBlur = useCallback((event) => {
    // Don't deactivate if focus is moving to a child element
    if (containerRef.current && containerRef.current.contains(event.relatedTarget)) {
      return;
    }
    setIsKeyboardActive(false);
  }, []);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('focus', handleFocus, true);
    container.addEventListener('blur', handleBlur, true);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('focus', handleFocus, true);
      container.removeEventListener('blur', handleBlur, true);
    };
  }, [handleKeyDown, handleFocus, handleBlur]);

  // Reset position when grid dimensions change
  useEffect(() => {
    if (focusPosition.x >= gridWidth || focusPosition.y >= gridHeight) {
      updateFocusPosition({ x: 0, y: 0 });
    }
  }, [gridWidth, gridHeight, focusPosition, updateFocusPosition]);

  return {
    focusPosition,
    isKeyboardActive,
    containerRef,
    setFocusPosition: updateFocusPosition,
    activateKeyboard: () => setIsKeyboardActive(true),
    deactivateKeyboard: () => setIsKeyboardActive(false)
  };
};

export default useKeyboardNavigation;