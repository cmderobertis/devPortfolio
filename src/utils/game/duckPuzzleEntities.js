// Duck Konundrum Puzzle - Entity Classes and Game Logic
// Extracted from DuckKonundrum.jsx

// Entity classes
export class Duck {
  constructor(position = 0) {
    this.position = position;
    this.name = "Harold";
  }
}

export class Member {
  constructor(name, number, position = 0) {
    this.name = name;
    this.number = number;
    this.position = position;
  }
}

export class Chair {
  constructor(id, originalPosition) {
    this.id = id;
    this.originalPosition = originalPosition;
    this.currentPosition = originalPosition;
    this.paintedLetter = null;
  }
}

export class PaintCan {
  constructor(size, color) {
    this.size = size;
    this.color = color;
    this.isOpen = false;
    this.paintLevel = 100; // percentage
    this.mixedColor = color;
  }
}

// Game state initialization
export const createInitialState = () => {
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

// Entity querying functions
export const getEntitiesAtPosition = (gameState, position) => {
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

// Movement functions
export const createMoveMember = (setGameState) => (memberName, newPosition) => {
  setGameState(prev => ({
    ...prev,
    members: prev.members.map(member =>
      member.name === memberName
        ? { ...member, position: newPosition }
        : member
    )
  }));
};

export const createMoveDuck = (setGameState) => (newPosition) => {
  setGameState(prev => ({
    ...prev,
    duck: { ...prev.duck, position: newPosition }
  }));
};

// Rotation logic
export const createRotateMembers = (setGameState) => (clockwise = true) => {
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

// Paint letter function
export const createPaintLetter = (setGameState) => (letter, chairPosition, paintColor) => {
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