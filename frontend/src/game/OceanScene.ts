import Phaser from 'phaser';
import { TextureGenerator } from './props/TextureGenerator';
import { LandmarkManager, type NavigationTarget } from './landmarks/LandmarkManager';

// Clean assets (loaded if available, with procedural fallbacks guaranteed)
import coralReefImg from '../assets/media/coral_reef_clean.png';
import seaweedImg from '../assets/media/seaweed_clean.png';
import coralBranchImg from '../assets/media/coral1.png';
import turtleImg from '../assets/media/turtle.png';
import jellyfishImg from '../assets/media/jellyfish.png';
import aboutCleanImg from '../assets/media/about_clean.png';
import scheduleCleanImg from '../assets/media/schedule_clean.png';
import registerCleanImg from '../assets/media/register_clean.png';

type WasdKeys = Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

export default class OceanScene extends Phaser.Scene {
  // World exploration dimensions
  public static readonly WORLD_WIDTH = 3200;
  public static readonly WORLD_HEIGHT = 1800;

  private player!: Phaser.Physics.Arcade.Sprite;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd?: WasdKeys;
  private landmarkManager!: LandmarkManager;

  // Background animated props references
  private seaweedGroup: Phaser.GameObjects.Sprite[] = [];
  private jellyfishSprite?: Phaser.GameObjects.Sprite;
  private turtleSprite?: Phaser.GameObjects.Sprite;
  private bubbleEmitter?: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super('OceanScene');
  }

  preload(): void {
    // 1. Try loading clean PNG assets
    try {
      this.load.image('coralReefClean', coralReefImg);
      this.load.image('seaweedClean', seaweedImg);
      this.load.image('coralBranchClean', coralBranchImg);
      this.load.image('turtleClean', turtleImg);
      this.load.image('jellyfishClean', jellyfishImg);

      // Primary interactive landmarks provided by user
      this.load.image('landmark_schedule_img', scheduleCleanImg);
      this.load.image('landmark_about_img', aboutCleanImg);
      this.load.image('landmark_register_img', registerCleanImg);
    } catch {
      // Ignored: procedural fallbacks exist for all props
    }
  }

  create(): void {
    const worldW = OceanScene.WORLD_WIDTH;
    const worldH = OceanScene.WORLD_HEIGHT;

    // 1. Generate all required illustrated textures procedurally
    TextureGenerator.generateAll(this);

    // 2. Setup extended World Physics and Camera Bounds
    this.physics.world.setBounds(0, 0, worldW, worldH);
    this.cameras.main.setBounds(0, 0, worldW, worldH);

    // 3. Setup Landmark Manager with navigation bridge
    const onNavigate = this.registry.get('onNavigate') as ((target: NavigationTarget) => void) | undefined;
    this.landmarkManager = new LandmarkManager(this, onNavigate);

    // 4. Build Natural Underwater Environment (Decorative Props)
    this.createDecorativeEnvironment(worldW, worldH);

    // 5. Add Clickable Landmarks along the Seabed
    this.createLandmarks(worldW, worldH);

    // 6. Spawn Swimmer Avatar directly above Buried Clock Tower on seafloor
    const startX = worldW * 0.5;
    const startY = worldH - 350; // 1450: Seabed and landmarks in immediate view

    this.player = this.physics.add.sprite(startX, startY, 'testAvatar');
    this.player.setDepth(50);
    this.player.setCollideWorldBounds(true);
    this.player.setDamping(true);
    this.player.setDrag(0.9);
    this.player.setMaxVelocity(240);

    // Center camera immediately to avoid empty upper-ocean view on initial load
    this.cameras.main.centerOn(startX, startY);

    // 7. Smooth Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    // 8. Swimmer micro-bubble wake emitter
    this.createSwimmerWake();

    // 9. Keyboard controls setup
    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.wasd = keyboard.addKeys('W,A,S,D') as WasdKeys;
      keyboard.addCapture('UP,DOWN,LEFT,RIGHT,E');
    }

    // 10. Resize handler (keeps world bounds consistent while canvas scales)
    this.scale.on('resize', () => {
      this.physics.world.setBounds(0, 0, worldW, worldH);
      this.cameras.main.setBounds(0, 0, worldW, worldH);
    });
  }

  /**
   * Builds the natural underwater environment with decorative background props.
   * Keeps the central zone relatively open while framing the depths and flanks.
   */
  private createDecorativeEnvironment(worldW: number, worldH: number): void {
    // A. Distant Tall Basalt Pillars (Parallax depth 2)
    const pillarPositions = [220, 820, 2380, 2980];
    pillarPositions.forEach((px) => {
      const pillar = this.add.sprite(px, worldH - 10, 'underwaterPillar');
      pillar.setOrigin(0.5, 1);
      pillar.setDepth(2);
      pillar.setScrollFactor(0.92);
      pillar.setAlpha(0.75);
    });

    // B. Midground Marine Rock Formations (Depth 4)
    const rockPositions = [
      { x: 420, scale: 1.1 },
      { x: 1250, scale: 0.95 },
      { x: 1950, scale: 0.95 },
      { x: 2780, scale: 1.15 },
    ];
    rockPositions.forEach((pos) => {
      const rock = this.add.sprite(pos.x, worldH - 12, 'underwaterRock');
      rock.setOrigin(0.5, 1);
      rock.setScale(pos.scale);
      rock.setDepth(4);
      rock.setTint(0x99ccff);
    });

    // C. Natural Seaweed Clusters along Seafloor (Depth 6 with gentle sway)
    const seaweedPositions = [
      120, 160, 360, 400, 720, 880, 1320, 1880, 2320, 2480, 2820, 2860, 3080
    ];
    seaweedPositions.forEach((sx) => {
      const texture = this.textures.exists('seaweedClean') ? 'seaweedClean' : 'seaweedStalk';
      const sw = this.add.sprite(sx, worldH - 8, texture);
      sw.setOrigin(0.5, 1);
      sw.setDepth(6);
      const height = 180 + Math.random() * 80;
      sw.setDisplaySize(50 + Math.random() * 20, height);
      sw.setTint(0x88ddff);
      this.seaweedGroup.push(sw);
    });

    // D. Clean Coral Reef Clusters (Depth 5)
    const reefKey = this.textures.exists('coralReefClean') ? 'coralReefClean' : 'underwaterRock';
    const reefLeft = this.add.sprite(280, worldH - 15, reefKey);
    reefLeft.setOrigin(0.5, 1);
    reefLeft.setDisplaySize(220, 160);
    reefLeft.setDepth(5);
    reefLeft.setTint(0x99ddff);

    const reefRight = this.add.sprite(worldW - 320, worldH - 15, reefKey);
    reefRight.setOrigin(0.5, 1);
    reefRight.setDisplaySize(240, 170);
    reefRight.setFlipX(true);
    reefRight.setDepth(5);
    reefRight.setTint(0x99ddff);

    // E. Marine Companions (Animated Sea Turtle & Jellyfish)
    if (this.textures.exists('turtleClean')) {
      this.turtleSprite = this.add.sprite(worldW * 0.35, worldH * 0.28, 'turtleClean');
      this.turtleSprite.setOrigin(0.5, 0.5);
      this.turtleSprite.setDisplaySize(85, 60);
      this.turtleSprite.setDepth(15);
      this.turtleSprite.setAlpha(0.85);

      // Smooth horizontal swimming tween
      this.tweens.add({
        targets: this.turtleSprite,
        x: worldW * 0.65,
        y: worldH * 0.25,
        duration: 32000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
        onYoyo: () => {
          if (this.turtleSprite) this.turtleSprite.flipX = !this.turtleSprite.flipX;
        },
        onRepeat: () => {
          if (this.turtleSprite) this.turtleSprite.flipX = !this.turtleSprite.flipX;
        },
      });
    }

    if (this.textures.exists('jellyfishClean')) {
      this.jellyfishSprite = this.add.sprite(worldW * 0.72, worldH * 0.42, 'jellyfishClean');
      this.jellyfishSprite.setOrigin(0.5, 0.5);
      this.jellyfishSprite.setDisplaySize(65, 85);
      this.jellyfishSprite.setDepth(16);
      this.jellyfishSprite.setAlpha(0.8);

      // Gentle vertical pulsation
      this.tweens.add({
        targets: this.jellyfishSprite,
        y: worldH * 0.36,
        scaleX: (65 / this.jellyfishSprite.width) * 1.08,
        scaleY: (85 / this.jellyfishSprite.height) * 0.94,
        duration: 3800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    }
  }

  /**
   * Adds the clickable landmarks across the world:
   * - Buried clock tower — Schedule (Centerpiece milestone)
   * - Sunken ruins — About
   * - Pearl shell — Register
   * - Coral garden — Gallery
   * - Underwater monument — Our Team
   * - Sunken palace — Dashboard
   */
  private createLandmarks(worldW: number, worldH: number): void {
    const scheduleKey = this.textures.exists('landmark_schedule_img')
      ? 'landmark_schedule_img'
      : 'landmark_clock_tower';
    const aboutKey = this.textures.exists('landmark_about_img')
      ? 'landmark_about_img'
      : 'landmark_sunken_ruins';
    const registerKey = this.textures.exists('landmark_register_img')
      ? 'landmark_register_img'
      : 'landmark_pearl_shell';

    // 1. PRIMARY MILESTONE LANDMARK: Buried Tower / Capsule (Schedule)
    this.landmarkManager.addLandmark({
      id: 'clock-tower',
      name: 'Buried Capsule Tower',
      target: 'schedule',
      title: 'Buried Capsule Tower',
      subtitle: 'Press E or Click to View Schedule',
      x: worldW * 0.5, // Center coordinate x: 1600
      y: worldH - 16,
      textureKey: scheduleKey,
      displayWidth: 170,
      displayHeight: 270,
      triggerRadius: 215,
    });

    // 2. Sunken Ruins / Sanctuary (About)
    this.landmarkManager.addLandmark({
      id: 'sunken-ruins',
      name: 'Sunken Ruins',
      target: 'about',
      title: 'Sunken Sanctuary',
      subtitle: 'Press E or Click for About Litfest',
      x: worldW * 0.18, // x: ~576
      y: worldH - 16,
      textureKey: aboutKey,
      displayWidth: 235,
      displayHeight: 220,
      triggerRadius: 225,
    });

    // 3. Pearl Shell (Register)
    this.landmarkManager.addLandmark({
      id: 'pearl-shell',
      name: 'Iridescent Pearl Shell',
      target: 'register',
      title: 'Pearl of Passage',
      subtitle: 'Press E or Click to Register',
      x: worldW * 0.34, // x: ~1088
      y: worldH - 16,
      textureKey: registerKey,
      displayWidth: 170,
      displayHeight: 195,
      triggerRadius: 200,
    });

    // 4. Coral Garden (Gallery)
    this.landmarkManager.addLandmark({
      id: 'coral-garden',
      name: 'Luminous Coral Garden',
      target: 'gallery',
      title: 'Coral Garden',
      subtitle: 'Press E or Click to View Gallery',
      x: worldW * 0.66, // x: ~2112
      y: worldH - 16,
      textureKey: 'landmark_coral_garden',
      displayWidth: 145,
      displayHeight: 135,
      triggerRadius: 190,
    });

    // 5. Underwater Monument (Our Team)
    this.landmarkManager.addLandmark({
      id: 'underwater-monument',
      name: 'Trident Monument',
      target: 'team',
      title: 'Literati Obelisk',
      subtitle: 'Press E or Click for Our Team',
      x: worldW * 0.82, // x: ~2624
      y: worldH - 16,
      textureKey: 'landmark_monument',
      displayWidth: 125,
      displayHeight: 200,
      triggerRadius: 200,
    });

    // 6. Sunken Palace (Dashboard)
    this.landmarkManager.addLandmark({
      id: 'sunken-palace',
      name: 'Abyssal Palace',
      target: 'dashboard',
      title: 'Sunken Palace Portal',
      subtitle: 'Press E or Click for Dashboard',
      x: worldW * 0.94, // x: ~3008
      y: worldH - 16,
      textureKey: 'landmark_sunken_palace',
      displayWidth: 190,
      displayHeight: 210,
      triggerRadius: 220,
    });
  }

  /**
   * Subtle bubble wake trailing the swimmer avatar
   */
  private createSwimmerWake(): void {
    // Generate simple tiny bubble texture
    if (!this.textures.exists('wakeBubble')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xa5f3fc, 0.7);
      g.fillCircle(4, 4, 3);
      g.generateTexture('wakeBubble', 8, 8);
      g.destroy();
    }

    try {
      this.bubbleEmitter = this.add.particles(0, 0, 'wakeBubble', {
        speed: { min: 10, max: 25 },
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 800,
        frequency: 90,
        gravityY: -40, // rise naturally upwards
        follow: this.player,
      });
      this.bubbleEmitter.setDepth(48);
    } catch {
      // Emitter optional if particles API differs
    }
  }

  update(time: number, delta: number): void {
    if (!this.player) return;

    // 1. Swimmer Movement (Original proven water physics)
    let isMoving = false;
    if (this.cursors && this.wasd) {
      const left = this.cursors.left.isDown || this.wasd.A.isDown;
      const right = this.cursors.right.isDown || this.wasd.D.isDown;
      const up = this.cursors.up.isDown || this.wasd.W.isDown;
      const down = this.cursors.down.isDown || this.wasd.S.isDown;

      const dx = (right ? 1 : 0) - (left ? 1 : 0);
      const dy = (down ? 1 : 0) - (up ? 1 : 0);

      isMoving = dx !== 0 || dy !== 0;

      const dir = new Phaser.Math.Vector2(dx, dy).normalize();
      this.player.setAcceleration(dir.x * 600, dir.y * 600);

      // Subtle directional tilt for organic swimming feel
      if (isMoving) {
        const targetRotation = Math.atan2(dir.y, dir.x) * 0.2;
        this.player.rotation = Phaser.Math.Linear(this.player.rotation, targetRotation, 0.1);
      } else {
        this.player.rotation = Phaser.Math.Linear(this.player.rotation, 0, 0.08);
      }
    }

    // Control wake emitter frequency based on speed
    if (this.bubbleEmitter) {
      const speed = this.player.body?.velocity.length() ?? 0;
      if (speed < 20) {
        this.bubbleEmitter.stop();
      } else {
        this.bubbleEmitter.start();
      }
    }

    // 2. Subtle Environmental Seaweed Sway Animation
    const swayAngle = Math.sin(time * 0.002) * 0.05;
    for (let i = 0; i < this.seaweedGroup.length; i++) {
      const sw = this.seaweedGroup[i];
      const phase = Math.sin(time * 0.002 + i * 0.5) * 0.04;
      sw.rotation = swayAngle + phase;
    }

    // 3. Landmark Proximity & Interaction Updates
    if (this.landmarkManager) {
      this.landmarkManager.update(time, this.player.x, this.player.y);
    }
  }
}