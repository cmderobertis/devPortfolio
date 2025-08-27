import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, RotateCcw, Plus, Minus, Palette, Settings } from 'lucide-react';
import { 
  Page, 
  Stack, 
  LayoutGrid as Grid, 
  GridItem,
  Button,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Checkbox,
  ThemeVariantProvider
} from '../components/design-system';

// Import DVD logic utilities
import {
  colors,
  getRand,
  checkBoundaryCollide,
  addChaosToVelocity,
  increaseSpeed,
  increaseSize,
  createNewLogo,
  getNextColor,
  logoWidth as importedLogoWidth,
  logoHeight as importedLogoHeight,
  dvdLogoPath as importedDvdLogoPath,
  shadeColor,
} from "../utils/dvdLogic";

const DvdBouncerEnhanced = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const logosRef = useRef([]);
  const cornerHitCountRef = useRef(0);
  const lastCornerHitTimeRef = useRef(0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [logoCount, setLogoCount] = useState(1);
  const [enableChaos, setEnableChaos] = useState(false);
  const [enableSpeedIncrease, setEnableSpeedIncrease] = useState(true);
  const [enableSizeIncrease, setEnableSizeIncrease] = useState(false);
  const [showTrails, setShowTrails] = useState(false);
  const [cornerHitCount, setCornerHitCount] = useState(0);
  const [enablePhysics, setEnablePhysics] = useState(false);
  const [gravityStrength, setGravityStrength] = useState(0.1);
  const [bounceDamping, setBounceDamping] = useState(0.95);

  const drawSimplifiedLogo = useCallback((ctx, x, y, width, height, color) => {
    // Draw simplified DVD logo as rectangles
    ctx.fillStyle = color;
    
    // Main rectangle
    ctx.fillRect(x, y, width, height);
    
    // Add some simple geometric shapes to make it look like a logo
    const borderWidth = Math.max(2, width * 0.05);
    ctx.fillStyle = shadeColor(color, -20);
    ctx.fillRect(x, y, width, borderWidth); // Top border
    ctx.fillRect(x, y, borderWidth, height); // Left border
    
    // Center "DVD" text area
    const textAreaWidth = width * 0.6;
    const textAreaHeight = height * 0.4;
    const textX = x + (width - textAreaWidth) / 2;
    const textY = y + (height - textAreaHeight) / 2;
    
    ctx.fillStyle = shadeColor(color, 30);
    ctx.fillRect(textX, textY, textAreaWidth, textAreaHeight);
    
    // Simple "DVD" text representation with rectangles
    ctx.fillStyle = color;
    const letterWidth = textAreaWidth / 4;
    const letterHeight = textAreaHeight * 0.8;
    const letterY = textY + (textAreaHeight - letterHeight) / 2;
    
    // D
    ctx.fillRect(textX + letterWidth * 0.2, letterY, letterWidth * 0.6, letterHeight);
    
    // V 
    ctx.fillRect(textX + letterWidth * 1.2, letterY, letterWidth * 0.6, letterHeight);
    
    // D
    ctx.fillRect(textX + letterWidth * 2.2, letterY, letterWidth * 0.6, letterHeight);
  }, []);

  const animate = useCallback(() => {
    if (!isPlaying) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Clear canvas with trail effect or complete clear
    if (showTrails) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    }
    
    // Update and draw all logos
    logosRef.current = logosRef.current.map(logo => {
      let { x, y, velX, velY, width, height, color } = logo;
      
      // Apply physics if enabled
      if (enablePhysics) {
        velY += gravityStrength; // Apply gravity
      }
      
      // Update position
      x += velX;
      y += velY;
      
      // Check collisions and handle bouncing
      const collision = checkBoundaryCollide(x, y, width, height, canvasWidth, canvasHeight);
      
      if (collision.hit) {
        // Apply damping if physics enabled
        const damping = enablePhysics ? bounceDamping : 1;
        
        if (collision.side === 'left' || collision.side === 'right') {
          velX = -velX * damping;
          x = collision.side === 'left' ? 0 : canvasWidth - width;
        }
        
        if (collision.side === 'top' || collision.side === 'bottom') {
          velY = -velY * damping;
          y = collision.side === 'top' ? 0 : canvasHeight - height;
        }
        
        // Check for corner hits
        const isCornerHit = (
          (collision.side === 'left' || collision.side === 'right') &&
          (y <= 0 || y >= canvasHeight - height)
        ) || (
          (collision.side === 'top' || collision.side === 'bottom') &&
          (x <= 0 || x >= canvasWidth - width)
        );
        
        if (isCornerHit) {
          const now = Date.now();
          if (now - lastCornerHitTimeRef.current > 500) { // Debounce corner hits
            cornerHitCountRef.current += 1;
            setCornerHitCount(cornerHitCountRef.current);
            lastCornerHitTimeRef.current = now;
            
            // Change color on corner hit
            color = getNextColor(color);
            
            // Apply various effects on corner hit
            if (enableSpeedIncrease) {
              const speedIncrease = increaseSpeed(velX, velY);
              velX = speedIncrease.velX;
              velY = speedIncrease.velY;
            }
            
            if (enableSizeIncrease) {
              const sizeIncrease = increaseSize(width, height);
              width = Math.min(sizeIncrease.width, canvasWidth / 4);
              height = Math.min(sizeIncrease.height, canvasHeight / 4);
            }
          }
        } else {
          // Regular bounce - maybe change color
          if (Math.random() < 0.3) {
            color = getNextColor(color);
          }
        }
        
        // Add chaos if enabled
        if (enableChaos) {
          const chaos = addChaosToVelocity(velX, velY);
          velX = chaos.velX;
          velY = chaos.velY;
        }
      }
      
      // Draw the logo
      drawSimplifiedLogo(ctx, x, y, width, height, color);
      
      return { x, y, velX, velY, width, height, color };
    });
    
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, showTrails, enablePhysics, enableChaos, enableSpeedIncrease, enableSizeIncrease, gravityStrength, bounceDamping, drawSimplifiedLogo]);

  const initializeLogos = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    logosRef.current = [];
    
    for (let i = 0; i < logoCount; i++) {
      const newLogo = createNewLogo(canvas.width, canvas.height, importedLogoWidth, importedLogoHeight);
      logosRef.current.push(newLogo);
    }
    
    cornerHitCountRef.current = 0;
    setCornerHitCount(0);
  }, [logoCount]);

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const reset = () => {
    setIsPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    initializeLogos();
    
    // Clear canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw initial logos
      logosRef.current.forEach(logo => {
        drawSimplifiedLogo(ctx, logo.x, logo.y, logo.width, logo.height, logo.color);
      });
    }
  };

  const addLogo = () => {
    if (logoCount < 20) {
      setLogoCount(prev => prev + 1);
    }
  };

  const removeLogo = () => {
    if (logoCount > 1) {
      setLogoCount(prev => prev - 1);
    }
  };

  // Initialize logos when component mounts or logoCount changes
  useEffect(() => {
    initializeLogos();
  }, [initializeLogos]);

  // Start/stop animation
  useEffect(() => {
    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate);
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying, animate]);

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const size = Math.min(rect.width * 0.95, 600);
      canvas.width = size;
      canvas.height = size * 0.75; // 4:3 aspect ratio
      
      // Reinitialize logos on resize
      if (!isPlaying) {
        initializeLogos();
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        logosRef.current.forEach(logo => {
          drawSimplifiedLogo(ctx, logo.x, logo.y, logo.width, logo.height, logo.color);
        });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [isPlaying, initializeLogos, drawSimplifiedLogo]);

  return (
    <ThemeVariantProvider variant="minimal">
      <Page maxWidth="full">
        <Stack spacing="lg">
          <Stack spacing="md" align="center">
            <Typography variant="display-large">
              DVD Bouncer Simulation
            </Typography>
            <Typography variant="body-large" align="center">
              Classic DVD screensaver with physics, chaos, and corner hit tracking
            </Typography>
          </Stack>

          <Grid columns={12} spacing="md">
            {/* Controls Sidebar */}
            <GridItem span={12} spanMd={3}>
              <Stack spacing="md">
                {/* Playback Controls */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">Playback</Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="sm">
                      <Button
                        variant="filled"
                        onClick={togglePlayPause}
                        icon={isPlaying ? <Pause size={16} /> : <Play size={16} />}
                        fullWidth
                      >
                        {isPlaying ? 'Pause' : 'Play'}
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={reset}
                        icon={<RotateCcw size={16} />}
                        fullWidth
                      >
                        Reset
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Logo Controls */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">
                      <Palette style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Logos ({logoCount})
                    </Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="sm">
                      <Stack direction="horizontal" spacing="sm">
                        <Button
                          variant="outlined"
                          onClick={removeLogo}
                          disabled={logoCount <= 1}
                          icon={<Minus size={16} />}
                          style={{ flex: 1 }}
                        >
                          Remove
                        </Button>
                        
                        <Button
                          variant="outlined"
                          onClick={addLogo}
                          disabled={logoCount >= 20}
                          icon={<Plus size={16} />}
                          style={{ flex: 1 }}
                        >
                          Add
                        </Button>
                      </Stack>
                      
                      <Typography variant="body-small" align="center">
                        Max: 20 logos
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Effects Controls */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">
                      <Settings style={{ display: 'inline', marginRight: '0.5rem' }} />
                      Effects
                    </Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="md">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Checkbox
                          checked={enableChaos}
                          onChange={(e) => setEnableChaos(e.target.checked)}
                        />
                        <Typography variant="body-medium">Chaos Mode</Typography>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Checkbox
                          checked={enableSpeedIncrease}
                          onChange={(e) => setEnableSpeedIncrease(e.target.checked)}
                        />
                        <Typography variant="body-medium">Speed Boost</Typography>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Checkbox
                          checked={enableSizeIncrease}
                          onChange={(e) => setEnableSizeIncrease(e.target.checked)}
                        />
                        <Typography variant="body-medium">Size Growth</Typography>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Checkbox
                          checked={showTrails}
                          onChange={(e) => setShowTrails(e.target.checked)}
                        />
                        <Typography variant="body-medium">Trail Effect</Typography>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Checkbox
                          checked={enablePhysics}
                          onChange={(e) => setEnablePhysics(e.target.checked)}
                        />
                        <Typography variant="body-medium">Physics Mode</Typography>
                      </div>
                    </Stack>
                  </CardContent>
                </Card>

                {/* Physics Controls */}
                {enablePhysics && (
                  <Card>
                    <CardHeader>
                      <Typography variant="title-medium">Physics</Typography>
                    </CardHeader>
                    <CardContent>
                      <Stack spacing="md">
                        <div>
                          <Typography variant="label-medium">
                            Gravity: {gravityStrength.toFixed(2)}
                          </Typography>
                          <input
                            type="range"
                            min="0"
                            max="0.5"
                            step="0.01"
                            value={gravityStrength}
                            onChange={(e) => setGravityStrength(parseFloat(e.target.value))}
                            style={{ width: '100%' }}
                          />
                        </div>
                        
                        <div>
                          <Typography variant="label-medium">
                            Bounce Damping: {bounceDamping.toFixed(2)}
                          </Typography>
                          <input
                            type="range"
                            min="0.5"
                            max="1"
                            step="0.01"
                            value={bounceDamping}
                            onChange={(e) => setBounceDamping(parseFloat(e.target.value))}
                            style={{ width: '100%' }}
                          />
                        </div>
                      </Stack>
                    </CardContent>
                  </Card>
                )}

                {/* Statistics */}
                <Card>
                  <CardHeader>
                    <Typography variant="title-medium">Statistics</Typography>
                  </CardHeader>
                  <CardContent>
                    <Stack spacing="sm">
                      <div>
                        <Typography variant="body-medium">Corner Hits</Typography>
                        <Typography variant="display-small" style={{ 
                          color: 'var(--md-sys-color-primary)',
                          fontWeight: 'bold'
                        }}>
                          {cornerHitCount}
                        </Typography>
                      </div>
                      
                      <Typography variant="body-small" style={{ 
                        color: 'var(--md-sys-color-on-surface-variant)'
                      }}>
                        Colors change on corner hits and random bounces
                      </Typography>
                    </Stack>
                  </CardContent>
                </Card>
              </Stack>
            </GridItem>

            {/* Main Canvas Area */}
            <GridItem span={12} spanMd={9}>
              <Card>
                <CardContent>
                  <Stack spacing="md" align="center">
                    <Typography variant="title-medium">
                      DVD Bouncer Canvas
                    </Typography>
                    
                    <div style={{ 
                      width: '100%', 
                      display: 'flex', 
                      justifyContent: 'center',
                      backgroundColor: '#000000',
                      borderRadius: 'var(--md-sys-shape-corner-medium)',
                      padding: '1rem'
                    }}>
                      <canvas
                        ref={canvasRef}
                        style={{
                          backgroundColor: '#000000',
                          border: '2px solid var(--md-sys-color-outline)',
                          borderRadius: 'var(--md-sys-shape-corner-small)',
                          maxWidth: '100%',
                          height: 'auto'
                        }}
                      />
                    </div>
                    
                    <Typography variant="body-small" align="center" style={{ 
                      color: 'var(--md-sys-color-on-surface-variant)',
                      maxWidth: '500px'
                    }}>
                      Watch the DVD logos bounce around the screen. When they hit a corner perfectly, 
                      they'll change color and trigger special effects based on your settings!
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </GridItem>
          </Grid>
        </Stack>
      </Page>
    </ThemeVariantProvider>
  );
};

export default DvdBouncerEnhanced;