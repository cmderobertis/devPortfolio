import { useState, useEffect, useCallback } from 'react';
import '../styles/DuckKonundrum.css';
import InteractivePageWrapper from '../components/InteractivePageWrapper';
import '../components/InteractivePageWrapper.css';

// Import MD3 Control Panel components
import ControlPanel, { 
    ControlGroup, 
    ButtonControl, 
    InfoDisplay, 
    StatusIndicator 
} from '../components/design-system/ControlPanel';
import '../components/design-system/ControlPanel.css';

// Entity classes
class Duck {
  constructor(position = 0) {
    this.position = position;
    this.name = "Harold";
  }
}

class Member {
  constructor(name, number, position = 0) {
    this.name = name;
    this.number = number;
    this.position = position;
  }
}

class Chair {
  constructor(id, originalPosition) {
    this.id = id;
    this.originalPosition = originalPosition;
    this.currentPosition = originalPosition;
    this.paintedLetter = null;
  }
}

class PaintCan {
  constructor(size, color) {
    this.size = size;
    this.color = color;
    this.isOpen = false;
    this.paintLevel = 100; // percentage
    this.mixedColor = color;
  }
}

// Game state management
const createInitialState = () => {
  const members = [
    new Member("Cam", 1),
    new Member("Bob", 2),
    new Member("Tyler", 3),
    new Member("Nisrine", 4),
    new Member("Lucie", 5),
    new Member("Ciso", 6)
  ];

  const chairs = [
    new Chair(1, 1),
    new Chair(2, 2),
    new Chair(3, 3),
    new Chair(4, 4),
    new Chair(5, 5),
    new Chair(6, 6)
  ];

  const paintCans = [
    new PaintCan("XL", "Red"),
    new PaintCan("L", "Blue"),
    new PaintCan("M", "Green"),
    new PaintCan("S", "Yellow"),
    new PaintCan("XS", "Purple")
  ];

  return {
    duck: new Duck(0),
    members,
    chairs,
    paintCans,
    selectedMember: null,
    selectedPaintCan: null,
    selectedChair: null,
    draggedItem: null,
    swapMode: false,
    swapSelection: { first: null, second: null },
    mixingBowl: { color: null, ingredients: [] },
    isComplete: false,
    finalWord: "",
    paintedLetters: [],
    instructionsVisible: true,
    currentInstructionStep: 0
  };
};

// Original puzzle instructions (to be filled with actual MIT Mystery Hunt text)
const puzzleInstructions = [
  {
    step: "Step 1",
    content:
      "Gather the following supplies: five armless chairs and an armchair, six members of your team, three metal cans containing red, yellow, and blue paint, three watering cans of notably different sizes, and a live duck. Please do not endanger the life of the duck at any time. We prefer that no animals be harmed during the finding of this coin.",
  },
  {
    step: "Step 2",
    content:
      "Place the chairs in a circle, evenly spaced. Label the seats of the chairs in red paint with the numbers 1 to 6, labelling the armchair 1 and proceeding in ascending order clockwise.",
  },
  {
    step: "Step 3",
    content:
      "When the paint dries, have a team member sit in each chair (facing the center of the circle.) The team members have numbers but those numbers will change throughout the game. The member in the armchair is always member #1. Then, member numbering proceeds clockwise around the circle regardless of chair number. (Note that at the beginning, everyone has the same number as the chair they are sitting in... this will change.) Any team member who is not sitting has no number. If there is no one sitting in the armchair, everyone sitting down becomes #12 1/2 until someone sits in the armchair. Number changes become effective at the beginning of each step.",
  },
  {
    step: "Step 4",
    content:
      "Get the duck to sit under chair #5. If it is reluctant, give it food. Be friendly and it will eventually play along. Ducks love mystery hunts.",
  },
  {
    step: "Step 5",
    content:
      "Paint member #4 blue with yellow polka dots (whether he likes it or not. If he was going to be a baby, he shouldn't have sat in chair #4.)",
  },
  {
    step: "Step 6",
    content:
      "Have members #3 and #6 switch places, taking their chairs with them.",
  },
  {
    step: "Step 7",
    content:
      "Paint each paint can with a mixture of the paint from the other two cans. Mix the paint from the purple can and the green can in the smallest watering can, mix the paint from the green can and orange can in the largest watering can, and mix the paint from the purple can and the orange can in the medium watering can.",
  },
  {
    step: "Step 8",
    content:
      "Add up the numbers of all the members and call the result N. Have member #4 repeatedly chant the Nth letter of the alphabet until further notice. At this point, if the duck is paying attention, he should waddle under the chair directly across the circle from him (the duck.) If not, you probably did something wrong and should start over until it works.",
  },
  {
    step: "Step 9",
    content:
      "Send member #3 into the kitchen to get some Cheetos and indigo paint. (You do have a kitchen with those things in them, don't you?) Meanwhile, the member chanting a letter should stop chanting and paint the letter they have been chanting on the underside of the chair immediately to their right in the only primary-colored paint not being worn by a team member.",
  },
  // Add more steps as needed
  {
    step: "Final Step",
    content: "[Paste final step instructions here]",
  },
];

// Helper function to get color hex values
const getColorHex = (colorName) => {
  const colors = {
    'Red': '#e74c3c',
    'Blue': '#3498db', 
    'Green': '#27ae60',
    'Yellow': '#f1c40f',
    'Purple': '#9b59b6'
  };
  return colors[colorName] || '#95a5a6';
};

const DuckKonundrum = () => {
  const [gameState, setGameState] = useState(createInitialState());
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Get all entities at a position
  const getEntitiesAtPosition = (position) => {
    const entities = [];
    
    // Check for members
    const membersHere = gameState.members.filter(m => m.position === position);
    membersHere.forEach(member => entities.push({ type: 'member', data: member }));
    
    // Check for chairs
    const chairHere = gameState.chairs.find(c => c.currentPosition === position);
    if (chairHere) entities.push({ type: 'chair', data: chairHere });
    
    // Check for duck
    if (gameState.duck.position === position) {
      entities.push({ type: 'duck', data: gameState.duck });
    }
    
    return entities;
  };

  // Move member to position
  const moveMember = (memberName, newPosition) => {
    setGameState(prev => ({
      ...prev,
      members: prev.members.map(member =>
        member.name === memberName
          ? { ...member, position: newPosition }
          : member
      )
    }));
  };

  // Move duck
  const moveDuck = (newPosition) => {
    setGameState(prev => ({
      ...prev,
      duck: { ...prev.duck, position: newPosition }
    }));
  };

  // Toggle swap mode
  const toggleSwapMode = () => {
    setGameState(prev => ({
      ...prev,
      swapMode: !prev.swapMode,
      swapSelection: { first: null, second: null }
    }));
  };

  // Handle swap selection
  const handleSwapSelection = (entity, position) => {
    if (!gameState.swapMode) return;
    
    const selection = { entity, position, id: `${entity.type}-${entity.data.id || entity.data.name || 'duck'}` };
    
    setGameState(prev => {
      if (!prev.swapSelection.first) {
        return {
          ...prev,
          swapSelection: { first: selection, second: null }
        };
      } else if (!prev.swapSelection.second && prev.swapSelection.first.id !== selection.id) {
        return {
          ...prev,
          swapSelection: { first: prev.swapSelection.first, second: selection }
        };
      } else {
        // Reset if clicking same entity or trying to select a third
        return {
          ...prev,
          swapSelection: { first: selection, second: null }
        };
      }
    });
  };

  // Execute swap
  const executeSwap = () => {
    const { first, second } = gameState.swapSelection;
    if (!first || !second) return;
    
    setGameState(prev => {
      const newState = { ...prev };
      
      // Swap positions based on entity types
      if (first.entity.type === 'member') {
        const memberIndex = newState.members.findIndex(m => m.name === first.entity.data.name);
        if (memberIndex !== -1) {
          newState.members[memberIndex].position = second.position;
        }
      } else if (first.entity.type === 'chair') {
        const chairIndex = newState.chairs.findIndex(c => c.id === first.entity.data.id);
        if (chairIndex !== -1) {
          newState.chairs[chairIndex].currentPosition = second.position;
        }
      } else if (first.entity.type === 'duck') {
        newState.duck.position = second.position;
      }
      
      if (second.entity.type === 'member') {
        const memberIndex = newState.members.findIndex(m => m.name === second.entity.data.name);
        if (memberIndex !== -1) {
          newState.members[memberIndex].position = first.position;
        }
      } else if (second.entity.type === 'chair') {
        const chairIndex = newState.chairs.findIndex(c => c.id === second.entity.data.id);
        if (chairIndex !== -1) {
          newState.chairs[chairIndex].currentPosition = first.position;
        }
      } else if (second.entity.type === 'duck') {
        newState.duck.position = first.position;
      }
      
      return {
        ...newState,
        swapMode: false,
        swapSelection: { first: null, second: null }
      };
    });
  };

  // Rotate all members clockwise or counterclockwise
  const rotateMembers = (clockwise = true) => {
    setGameState(prev => {
      const membersInCircle = prev.members.filter(m => m.position >= 1 && m.position <= 6);
      const newMembers = [...prev.members];
      
      membersInCircle.forEach(member => {
        const memberIndex = newMembers.findIndex(m => m.name === member.name);
        let newPosition = clockwise ? member.position + 1 : member.position - 1;
        
        if (newPosition > 6) newPosition = 1;
        if (newPosition < 1) newPosition = 6;
        
        newMembers[memberIndex].position = newPosition;
      });
      
      return { ...prev, members: newMembers };
    });
  };

  // Paint letter on chair
  const paintLetter = (letter, chairPosition, paintColor) => {
    setGameState(prev => {
      const newChairs = [...prev.chairs];
      const chairIndex = newChairs.findIndex(c => c.currentPosition === chairPosition);
      
      if (chairIndex !== -1) {
        newChairs[chairIndex].paintedLetter = letter;
        newChairs[chairIndex].paintColor = paintColor;
      }
      
      return {
        ...prev,
        chairs: newChairs,
        paintedLetters: [...prev.paintedLetters, { letter, position: chairPosition, color: paintColor }]
      };
    });
  };

  // Mix paint colors
  const mixPaint = (color1, color2) => {
    const mixMap = {
      'Red+Blue': '#8e44ad',
      'Blue+Red': '#8e44ad',
      'Red+Yellow': '#e67e22',
      'Yellow+Red': '#e67e22',
      'Blue+Yellow': '#16a085',
      'Yellow+Blue': '#16a085',
      'Red+Green': '#795548',
      'Green+Red': '#795548',
      'Blue+Green': '#607d8b',
      'Green+Blue': '#607d8b',
      'Yellow+Green': '#8bc34a',
      'Green+Yellow': '#8bc34a'
    };
    
    return mixMap[`${color1}+${color2}`] || getColorHex(color1);
  };

  // Handle drag start
  const handleDragStart = (e, item, type) => {
    setDraggedItem({ ...item, type });
    const rect = e.target.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e, targetPosition) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    if (draggedItem.type === 'member') {
      moveMember(draggedItem.name, targetPosition);
    } else if (draggedItem.type === 'duck') {
      moveDuck(targetPosition);
    }
    
    setDraggedItem(null);
  };

  // Reset puzzle
  const resetPuzzle = () => {
    setGameState(createInitialState());
    setDraggedItem(null);
  };

  // Select item for interaction
  const selectItem = (item, type) => {
    setGameState(prev => ({
      ...prev,
      selectedMember: type === 'member' ? item : null,
      selectedPaintCan: type === 'paintCan' ? item : null,
      selectedChair: type === 'chair' ? item : null
    }));
  };

  // Render grid position with drag and drop and swap functionality
  const renderPosition = (position) => {
    const membersAtPosition = gameState.members.filter(m => m.position === position);
    const chairAtPosition = gameState.chairs.find(c => c.currentPosition === position);
    const isDuckHere = gameState.duck.position === position;
    const isKitchen = position === 0;
    const entities = getEntitiesAtPosition(position);

    const isSwapSelected = (entity) => {
      const id = `${entity.type}-${entity.data.id || entity.data.name || 'duck'}`;
      return gameState.swapSelection.first?.id === id || gameState.swapSelection.second?.id === id;
    };

    const getSwapClass = (entity) => {
      if (!gameState.swapMode) return '';
      const id = `${entity.type}-${entity.data.id || entity.data.name || 'duck'}`;
      if (gameState.swapSelection.first?.id === id) return 'swap-first';
      if (gameState.swapSelection.second?.id === id) return 'swap-second';
      return 'swappable';
    };

    return (
      <div 
        key={position} 
        className={`grid-position ${isKitchen ? 'kitchen' : 'circle-position'} ${gameState.swapMode ? 'swap-mode' : ''}`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, position)}
      >
        <div className="position-label">
          {isKitchen ? '🏠 Kitchen' : `Position ${position}`}
        </div>
        {chairAtPosition && (
          <div 
            className={`chair ${gameState.selectedChair?.id === chairAtPosition.id ? 'selected' : ''} ${getSwapClass({ type: 'chair', data: chairAtPosition })}`}
            onClick={() => {
              if (gameState.swapMode) {
                handleSwapSelection({ type: 'chair', data: chairAtPosition }, position);
              } else {
                selectItem(chairAtPosition, 'chair');
              }
            }}
            style={{ backgroundColor: chairAtPosition.paintColor || '#f39c12' }}
          >
            🪑 Chair {chairAtPosition.id}
            {chairAtPosition.paintedLetter && (
              <div 
                className="painted-letter"
                style={{ backgroundColor: chairAtPosition.paintColor || '#e74c3c' }}
              >
                {chairAtPosition.paintedLetter}
              </div>
            )}
          </div>
        )}
        {membersAtPosition.map(member => (
          <div 
            key={member.name} 
            className={`member ${gameState.selectedMember?.name === member.name ? 'selected' : ''} ${getSwapClass({ type: 'member', data: member })}`}
            draggable={!gameState.swapMode}
            onDragStart={(e) => !gameState.swapMode && handleDragStart(e, member, 'member')}
            onClick={() => {
              if (gameState.swapMode) {
                handleSwapSelection({ type: 'member', data: member }, position);
              } else {
                selectItem(member, 'member');
              }
            }}
          >
            👤 {member.name} ({member.number})
          </div>
        ))}
        {isDuckHere && (
          <div 
            className={`duck ${getSwapClass({ type: 'duck', data: gameState.duck })}`}
            draggable={!gameState.swapMode}
            onDragStart={(e) => !gameState.swapMode && handleDragStart(e, gameState.duck, 'duck')}
            onClick={() => {
              if (gameState.swapMode) {
                handleSwapSelection({ type: 'duck', data: gameState.duck }, position);
              }
            }}
          >
            🦆 Harold
          </div>
        )}
      </div>
    );
  };

  const membersInCircle = gameState.members.filter(m => m.position >= 1 && m.position <= 6).length;
  const { first, second } = gameState.swapSelection;

  // Instructions window functions
  const toggleInstructions = () => {
    setGameState(prev => ({ ...prev, instructionsVisible: !prev.instructionsVisible }));
  };

  const nextInstructionStep = () => {
    setGameState(prev => ({
      ...prev,
      currentInstructionStep: Math.min(prev.currentInstructionStep + 1, puzzleInstructions.length - 1)
    }));
  };

  const prevInstructionStep = () => {
    setGameState(prev => ({
      ...prev,
      currentInstructionStep: Math.max(prev.currentInstructionStep - 1, 0)
    }));
  };

  const goToInstructionStep = (stepIndex) => {
    setGameState(prev => ({
      ...prev,
      currentInstructionStep: Math.max(0, Math.min(stepIndex, puzzleInstructions.length - 1))
    }));
  };

  const currentInstruction = puzzleInstructions[gameState.currentInstructionStep];

  return (
    <InteractivePageWrapper>
      <div className="duck-konundrum">
      <h1>🦆 Interactive Duck Konundrum Puzzle</h1>
      <p>Drag members and Harold around to solve the MIT Mystery Hunt puzzle! Mix paints and discover the hidden word.</p>

      <div className="main-layout">
        {/* Left Panel - Game Board */}
        <div className="game-board">
          <h3>🎯 Game Board</h3>
          
          <div className="positions-container">
            {/* Kitchen Area with Controls */}
            <div className="kitchen-and-controls">
              <div className="kitchen-area">
                {renderPosition(0)}
              </div>
              
              {/* MD3 Control Panel for Kitchen Actions */}
              <ControlPanel 
                title="Game Controls"
                position="floating"
                collapsible={false}
                className="duck-controls-panel"
              >
                <ControlGroup label="Navigation" direction="horizontal">
                  <ButtonControl
                    variant={gameState.instructionsVisible ? "filled" : "outlined"}
                    onClick={toggleInstructions}
                    icon="fas fa-scroll"
                    size="small"
                  >
                    {gameState.instructionsVisible ? 'Hide Instructions' : 'Show Instructions'}
                  </ButtonControl>
                </ControlGroup>

                <ControlGroup label="Movement" direction="horizontal">
                  <ButtonControl
                    variant={gameState.swapMode ? "filled" : "outlined"}
                    onClick={toggleSwapMode}
                    icon="fas fa-exchange-alt"
                    size="small"
                  >
                    {gameState.swapMode ? 'Exit Swap' : 'Swap Mode'}
                  </ButtonControl>
                  
                  {gameState.swapMode && first && second && (
                    <ButtonControl
                      variant="filled"
                      onClick={executeSwap}
                      icon="fas fa-check"
                      size="small"
                    >
                      Execute Swap
                    </ButtonControl>
                  )}
                </ControlGroup>

                <ControlGroup label="Rotation" direction="horizontal">
                  <ButtonControl
                    variant="outlined"
                    onClick={() => rotateMembers(true)}
                    icon="fas fa-redo"
                    size="small"
                  >
                    Clockwise
                  </ButtonControl>
                  
                  <ButtonControl
                    variant="outlined"
                    onClick={() => rotateMembers(false)}
                    icon="fas fa-undo"
                    size="small"
                  >
                    Counter-CW
                  </ButtonControl>
                </ControlGroup>

                <ControlGroup label="Reset" direction="horizontal">
                  <ButtonControl
                    variant="text"
                    onClick={resetPuzzle}
                    icon="fas fa-sync-alt"
                    size="small"
                  >
                    Reset Puzzle
                  </ButtonControl>
                </ControlGroup>
              </ControlPanel>
            </div>
            
            {/* Circle Positions */}
            <div className="circle-positions">
              {[1, 2, 3, 4, 5, 6].map(position => renderPosition(position))}
            </div>
          </div>
        </div>

        {/* Right Panel - Controls and Info */}
        <div className="side-panel">
          {/* Original Puzzle Instructions Card */}
          {gameState.instructionsVisible && (
            <div className="instructions-card">
              <div className="instructions-card-header">
                <h4>📜 Original MIT Mystery Hunt Instructions</h4>
                <button 
                  className="close-instructions-card"
                  onClick={toggleInstructions}
                  title="Hide Instructions"
                >
                  ✕
                </button>
              </div>
              
              <div className="instructions-card-content">
                <div className="step-indicator">
                  <span className="step-number">
                    Step {gameState.currentInstructionStep + 1} of {puzzleInstructions.length}
                  </span>
                  <span className="step-title">{currentInstruction.step}</span>
                </div>
                
                <div className="instruction-text">
                  {currentInstruction.content}
                </div>
              </div>
              
              <div className="instructions-card-navigation">
                <button 
                  className="nav-btn prev-btn"
                  onClick={prevInstructionStep}
                  disabled={gameState.currentInstructionStep === 0}
                >
                  ← Previous
                </button>
                
                <div className="step-dots">
                  {puzzleInstructions.map((_, index) => (
                    <button
                      key={index}
                      className={`btn ${index === gameState.currentInstructionStep ? 'active' : ''}`}
                      onClick={() => goToInstructionStep(index)}
                      title={puzzleInstructions[index].step}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button 
                  className="nav-btn next-btn"
                  onClick={nextInstructionStep}
                  disabled={gameState.currentInstructionStep === puzzleInstructions.length - 1}
                >
                  Next →
                </button>
              </div>
            </div>
          )}

          {/* MD3 Puzzle Status */}
          <div className="puzzle-status">
            <h4>🎯 Puzzle Status</h4>
            
            <div className="duck-status-displays">
              <InfoDisplay 
                label="In Circle" 
                value={`${membersInCircle}/6`} 
                color="primary"
                icon="fas fa-users"
              />
              <InfoDisplay 
                label="Letters" 
                value={gameState.paintedLetters.length} 
                color="secondary"
                icon="fas fa-paint-brush"
              />
              <StatusIndicator 
                status={gameState.swapMode ? "running" : "idle"} 
                label={gameState.swapMode ? 'Swapping' : 'Moving'}
              />
            </div>

            {gameState.swapMode && (
              <div className="swap-status">
                <h5>Swap Selection:</h5>
                <div className="swap-info">
                  {first ? `1st: ${first.entity.type} ${first.entity.data.name || first.entity.data.id || 'Harold'}` : '1st: None'}
                </div>
                <div className="swap-info">
                  {second ? `2nd: ${second.entity.type} ${second.entity.data.name || second.entity.data.id || 'Harold'}` : '2nd: None'}
                </div>
              </div>
            )}
          </div>

          {/* Paint Mixing Station */}
          <div className="paint-station">
            <h4>🎨 Paint Station</h4>
            <div className="paint-cans-interactive">
              {gameState.paintCans.map((can, index) => (
                <div 
                  key={index} 
                  className={`paint-can-interactive ${gameState.selectedPaintCan === can ? 'selected' : ''}`}
                  style={{ 
                    backgroundColor: getColorHex(can.color),
                    '--paint-level': `${can.paintLevel}%`
                  }}
                  onClick={() => selectItem(can, 'paintCan')}
                >
                  <div className="can-size">{can.size}</div>
                  <div className="can-color">{can.color}</div>
                  <div className="paint-level" style={{ height: `${can.paintLevel}%` }}></div>
                </div>
              ))}
            </div>
            
            {/* Mixing Bowl */}
            <div className="mixing-bowl">
              <h5>Mixing Bowl</h5>
              <div 
                className="bowl"
                style={{ backgroundColor: gameState.mixingBowl.color || '#ecf0f1' }}
              >
                {gameState.mixingBowl.ingredients.length > 0 ? (
                  <div className="ingredients">
                    {gameState.mixingBowl.ingredients.join(' + ')}
                  </div>
                ) : (
                  <div className="empty-bowl">Empty</div>
                )}
              </div>
            </div>
          </div>

          {/* Letter Painting */}
          <div className="letter-painting">
            <h4>✈️ Letter Painting</h4>
            <div className="paint-controls">
              <input 
                type="text" 
                maxLength="1" 
                placeholder="Letter" 
                className="letter-input"
              />
              <button 
                className="paint-button"
                disabled={!gameState.selectedMember || !gameState.selectedPaintCan}
              >
                Paint Letter
              </button>
            </div>
            
            {/* Painted Letters Display */}
            <div className="painted-letters">
              <h5>Painted Letters:</h5>
              <div className="letters-grid">
                {gameState.paintedLetters.map((painted, index) => (
                  <div key={index} className="painted-letter-display">
                    <div 
                      className="letter-circle"
                      style={{ backgroundColor: painted.color }}
                    >
                      {painted.letter}
                    </div>
                    <div className="letter-position">Pos {painted.position}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Selected Items Display */}
          <div className="selection-info">
            <h4>🔍 Selected Items</h4>
            {gameState.selectedMember && (
              <div className="selected-item">
                <strong>Member:</strong> {gameState.selectedMember.name} ({gameState.selectedMember.number})
              </div>
            )}
            {gameState.selectedPaintCan && (
              <div className="selected-item">
                <strong>Paint:</strong> {gameState.selectedPaintCan.size} {gameState.selectedPaintCan.color}
              </div>
            )}
            {gameState.selectedChair && (
              <div className="selected-item">
                <strong>Chair:</strong> Chair {gameState.selectedChair.id} at position {gameState.selectedChair.currentPosition}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* How to Play Instructions */}
      <div className="how-to-play">
        <h4>📝 How to Use This Interactive Solver</h4>
        <ul>
          <li><strong>Instructions:</strong> Click "Show Instructions" to view the original puzzle text step by step</li>
          <li><strong>Drag Mode:</strong> Drag 👤 members and 🦆 Harold to different positions</li>
          <li><strong>Swap Mode:</strong> Click any two entities (members, chairs, duck) to swap their positions</li>
          <li><strong>Rotation:</strong> Use clockwise/counter-clockwise buttons to rotate all members around the circle</li>
          <li><strong>Painting:</strong> Select paint cans and members, then paint letters on chairs</li>
          <li><strong>Goal:</strong> Follow the original instructions and manipulate the elements to solve the puzzle!</li>
        </ul>
        {gameState.swapMode && (
          <div className="swap-instructions">
            <h5>🔄 Swap Mode Active</h5>
            <p>Click on any two entities to select them for swapping. You can swap:</p>
            <ul>
              <li>Member ↔️ Member</li>
              <li>Chair ↔️ Chair</li>
              <li>Member ↔️ Chair (they'll trade positions)</li>
              <li>Any entity ↔️ Harold the Duck</li>
            </ul>
          </div>
        )}
      </div>
      </div>
    </InteractivePageWrapper>
  );
};

export default DuckKonundrum;