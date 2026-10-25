import Phaser from 'phaser';

export type NavigationTarget =
  | 'schedule'
  | 'about'
  | 'register'
  | 'gallery'
  | 'team'
  | 'dashboard';

export interface LandmarkConfig {
  id: string;
  name: string;
  target: NavigationTarget;
  title: string;
  subtitle: string;
  x: number;
  y: number;
  textureKey: string;
  displayWidth: number;
  displayHeight: number;
  triggerRadius?: number;
}

export interface LandmarkInstance extends LandmarkConfig {
  sprite: Phaser.Physics.Arcade.Sprite;
  auraGraphics: Phaser.GameObjects.Graphics;
  promptContainer: Phaser.GameObjects.Container;
  glowIntensity: number;
  isNear: boolean;
  basePromptY: number;
}

export class LandmarkManager {
  private scene: Phaser.Scene;
  private landmarks: LandmarkInstance[] = [];
  private keyE?: Phaser.Input.Keyboard.Key;
  private onNavigateCallback?: (target: NavigationTarget) => void;
  private activeNearbyLandmark: LandmarkInstance | null = null;

  constructor(scene: Phaser.Scene, onNavigate?: (target: NavigationTarget) => void) {
    this.scene = scene;
    this.onNavigateCallback = onNavigate;

    if (scene.input.keyboard) {
      this.keyE = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    }
  }

  /**
   * Adds a landmark to the world
   */
  public addLandmark(config: LandmarkConfig): LandmarkInstance {
    const triggerRadius = config.triggerRadius ?? Math.max(config.displayWidth * 1.1, 190);

    // 1. Aura graphics behind landmark
    const auraGraphics = this.scene.add.graphics();
    auraGraphics.setDepth(5);

    // 2. Landmark physics sprite
    const sprite = this.scene.physics.add.sprite(config.x, config.y, config.textureKey);
    sprite.setOrigin(0.5, 1);
    sprite.setDisplaySize(config.displayWidth, config.displayHeight);
    sprite.setDepth(8);
    sprite.setImmovable(true);
    sprite.setTint(0xd4edfc);
    sprite.setInteractive({ useHandCursor: true });

    // 3. Floating interaction prompt badge above landmark
    const basePromptY = config.y - config.displayHeight - 28;
    const promptContainer = this.scene.add.container(config.x, basePromptY);
    promptContainer.setDepth(60);
    promptContainer.setAlpha(0);

    // Prompt background (glassy rounded pill)
    const promptBg = this.scene.add.graphics();
    promptBg.fillStyle(0x02172d, 0.92);
    promptBg.fillRoundedRect(-110, -22, 220, 44, 12);
    promptBg.lineStyle(2, 0x00f0ff, 0.85);
    promptBg.strokeRoundedRect(-110, -22, 220, 44, 12);
    promptContainer.add(promptBg);

    // Key badge icon [E]
    const keyBadge = this.scene.add.graphics();
    keyBadge.fillStyle(0x0284c7, 0.95);
    keyBadge.fillRoundedRect(-98, -14, 28, 28, 6);
    keyBadge.lineStyle(1.5, 0xfff176, 1);
    keyBadge.strokeRoundedRect(-98, -14, 28, 28, 6);
    promptContainer.add(keyBadge);

    const keyText = this.scene.add.text(-84, 0, 'E', {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#fff176',
    });
    keyText.setOrigin(0.5, 0.5);
    promptContainer.add(keyText);

    // Landmark title
    const titleText = this.scene.add.text(-60, -9, config.title, {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#38bdf8',
    });
    promptContainer.add(titleText);

    // Action subtitle
    const subText = this.scene.add.text(-60, 6, config.subtitle, {
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSize: '10px',
      color: '#bae6fd',
    });
    promptContainer.add(subText);

    // Hit area for prompt click
    promptContainer.setSize(220, 44);
    promptContainer.setInteractive(
      new Phaser.Geom.Rectangle(-110, -22, 220, 44),
      Phaser.Geom.Rectangle.Contains
    );

    const instance: LandmarkInstance = {
      ...config,
      triggerRadius,
      sprite,
      auraGraphics,
      promptContainer,
      glowIntensity: 0,
      isNear: false,
      basePromptY,
    };

    // Click handlers
    promptContainer.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      pointer.event?.stopPropagation();
      this.triggerLandmark(instance);
    });

    sprite.on('pointerdown', () => {
      this.triggerLandmark(instance);
    });

    this.landmarks.push(instance);
    return instance;
  }

  /**
   * Triggers the interaction when approaching and pressing E or clicking
   */
  public triggerLandmark(landmark: LandmarkInstance): void {
    // 1. Visual flash burst
    this.scene.tweens.add({
      targets: landmark.sprite,
      scaleX: (landmark.displayWidth / landmark.sprite.width) * 1.08,
      scaleY: (landmark.displayHeight / landmark.sprite.height) * 1.08,
      duration: 160,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    // 2. Dispatch custom event for React integration
    window.dispatchEvent(
      new CustomEvent('bluepulse:navigate', {
        detail: {
          section: landmark.target,
          landmarkId: landmark.id,
          name: landmark.name,
        },
      })
    );

    // 3. Invoke direct callback if configured
    this.onNavigateCallback?.(landmark.target);
  }

  /**
   * Update loop: detects proximity, updates turquoise glow, and checks input
   */
  public update(time: number, playerX: number, playerY: number): void {
    let closestLandmark: LandmarkInstance | null = null;
    let closestDist = Infinity;

    for (const lm of this.landmarks) {
      // Calculate distance to landmark center
      const landmarkCenterY = lm.y - lm.displayHeight * 0.5;
      const dist = Phaser.Math.Distance.Between(playerX, playerY, lm.x, landmarkCenterY);

      const isNear = dist < (lm.triggerRadius ?? 190);
      lm.isNear = isNear;

      if (isNear && dist < closestDist) {
        closestDist = dist;
        closestLandmark = lm;
      }

      // Smooth glow intensity interpolation
      const targetGlow = isNear ? 1.0 : 0.0;
      lm.glowIntensity = Phaser.Math.Linear(lm.glowIntensity, targetGlow, 0.08);

      // Floating prompt visibility & bobbing
      lm.promptContainer.setAlpha(lm.glowIntensity);
      if (lm.glowIntensity > 0.05) {
        const bob = Math.sin(time * 0.0035) * 4;
        lm.promptContainer.setY(lm.basePromptY + bob);
      }

      // Redraw glowing aura
      this.drawAura(lm, time);
    }

    this.activeNearbyLandmark = closestLandmark;

    // Check E key press
    if (this.keyE && Phaser.Input.Keyboard.JustDown(this.keyE)) {
      if (this.activeNearbyLandmark) {
        this.triggerLandmark(this.activeNearbyLandmark);
      }
    }
  }

  /**
   * Renders the pulsating turquoise aura
   */
  private drawAura(lm: LandmarkInstance, time: number): void {
    const g = lm.auraGraphics;
    g.clear();

    const rx = lm.x;
    const ry = lm.y - lm.displayHeight * 0.5;
    const rw = lm.displayWidth;
    const intensity = lm.glowIntensity;

    // 1. Seafloor contact shadow - grounds landmark into seabed sand drift naturally
    const shadowW = rw * 0.95;
    const shadowH = 14;
    g.fillStyle(0x010f22, 0.55);
    g.fillEllipse(rx, lm.y - 3, shadowW, shadowH);
    g.fillStyle(0x021c38, 0.38);
    g.fillEllipse(rx, lm.y - 5, shadowW * 0.75, shadowH * 0.7);

    // 2. Idle ambient oceanic back-glow (gentle breathing beacon so landmarks stand out as primary destinations)
    const idlePulse = 0.88 + Math.sin(time * 0.0025 + rx * 0.008) * 0.12;
    const ambientAlpha = 0.14 * idlePulse;
    g.fillStyle(0x00f0ff, ambientAlpha);
    g.fillCircle(rx, ry, rw * 0.58 * idlePulse);
    g.fillStyle(0x38bdf8, ambientAlpha * 0.75);
    g.fillCircle(rx, ry, rw * 0.38 * idlePulse);

    // 3. Active Proximity Glow when swimmer approaches
    if (intensity > 0.01) {
      const activePulse = 1 + Math.sin(time * 0.004) * 0.12;

      // Outer vibrant turquoise aura
      const outerRadius = rw * 0.78 * activePulse;
      g.fillStyle(0x00f0ff, 0.28 * intensity);
      g.fillCircle(rx, ry, outerRadius);

      // Inner electric cyan halo
      const innerRadius = rw * 0.54 * activePulse;
      g.fillStyle(0x38bdf8, 0.42 * intensity);
      g.fillCircle(rx, ry, innerRadius);

      // Core illumination accent
      g.fillStyle(0xffffff, 0.22 * intensity);
      g.fillCircle(rx, ry, rw * 0.26 * activePulse);

      // Luminous seabed light reflection pool
      g.fillStyle(0x00f0ff, 0.32 * intensity);
      g.fillEllipse(rx, lm.y - 5, rw * 0.88, 16);
    }

    // 4. Dynamic Sprite Tinting:
    // When far away: soft deep-water oceanic tint (0xd4edfc) blending into water haze
    // When approached (intensity -> 1): pure brilliant white (0xffffff) showcasing vivid original artwork
    const r = Math.min(255, Math.floor(212 + (255 - 212) * intensity));
    const gr = Math.min(255, Math.floor(237 + (255 - 237) * intensity));
    const b = 255;
    lm.sprite.setTint(Phaser.Display.Color.GetColor(r, gr, b));
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    for (const lm of this.landmarks) {
      lm.auraGraphics.destroy();
      lm.promptContainer.destroy();
      lm.sprite.destroy();
    }
    this.landmarks = [];
  }
}
