import Phaser from 'phaser';

/**
 * Procedural texture generator for Blue Pulse environment props and landmarks.
 * Generates rich, crisp illustrated textures without any external asset dependencies.
 */
export class TextureGenerator {
  /**
   * Generates the Swimmer Avatar texture
   */
  static generateAvatar(scene: Phaser.Scene): void {
    if (scene.textures.exists('testAvatar')) return;

    const g = scene.make.graphics({ x: 0, y: 0 });
    // Outer turquoise glow
    g.fillStyle(0x00f0ff, 0.45);
    g.fillCircle(24, 24, 22);
    // Mid halo
    g.fillStyle(0x38bdf8, 0.75);
    g.fillCircle(24, 24, 16);
    // Amber/gold core
    g.fillStyle(0xfff176, 1);
    g.fillCircle(24, 24, 11);
    // Pure white center
    g.fillStyle(0xffffff, 1);
    g.fillCircle(24, 24, 5);

    g.generateTexture('testAvatar', 48, 48);
    g.destroy();
  }

  /**
   * Generates tall underwater basalt pillars
   */
  static generatePillar(scene: Phaser.Scene): void {
    if (scene.textures.exists('underwaterPillar')) return;

    const width = 90;
    const height = 450;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Main pillar body (deep marine basalt with vertical shading)
    g.fillStyle(0x02172d, 0.95);
    g.fillRect(15, 40, 60, height - 40);

    // Left shadow edge
    g.fillStyle(0x010c18, 0.95);
    g.fillRect(15, 40, 15, height - 40);

    // Right highlight edge
    g.fillStyle(0x06305a, 0.8);
    g.fillRect(60, 40, 15, height - 40);

    // Capital / top cornice
    g.fillStyle(0x06305a, 0.95);
    g.fillRoundedRect(5, 20, 80, 22, 4);
    g.fillStyle(0x0a467f, 0.8);
    g.fillRoundedRect(10, 8, 70, 16, 4);

    // Base pedestal
    g.fillStyle(0x02172d, 0.98);
    g.fillRoundedRect(5, height - 35, 80, 35, 6);

    // Fluted architectural grooves
    g.lineStyle(2, 0x010d1c, 0.75);
    g.lineBetween(32, 45, 32, height - 40);
    g.lineBetween(45, 45, 45, height - 40);
    g.lineBetween(58, 45, 58, height - 40);

    // Bioluminescent ancient vein running down pillar
    g.lineStyle(2, 0x00f0ff, 0.65);
    g.beginPath();
    g.moveTo(45, 50);
    g.lineTo(48, 120);
    g.lineTo(42, 190);
    g.lineTo(47, 280);
    g.lineTo(44, 380);
    g.strokePath();

    // Vein glow nodes
    g.fillStyle(0x38bdf8, 0.9);
    g.fillCircle(48, 120, 3.5);
    g.fillCircle(42, 190, 4);
    g.fillCircle(47, 280, 3.5);
    g.fillStyle(0xffffff, 0.95);
    g.fillCircle(42, 190, 1.8);

    g.generateTexture('underwaterPillar', width, height);
    g.destroy();
  }

  /**
   * Generates underwater rock arch / boulder formations
   */
  static generateRockFormation(scene: Phaser.Scene): void {
    if (scene.textures.exists('underwaterRock')) return;

    const width = 180;
    const height = 130;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Base large boulder
    g.fillStyle(0x021324, 0.95);
    g.fillRoundedRect(10, 45, 160, 80, 28);

    // Top craggy peak
    g.fillStyle(0x041f39, 0.95);
    g.fillRoundedRect(35, 15, 110, 75, 24);

    // Left shadow
    g.fillStyle(0x010912, 0.85);
    g.fillRoundedRect(12, 45, 45, 80, 20);

    // Ocean moss crest
    g.fillStyle(0x05465e, 0.8);
    g.fillRoundedRect(40, 15, 90, 14, 6);

    // Bioluminescent sea lichens
    g.fillStyle(0x38bdf8, 0.7);
    g.fillCircle(55, 38, 2.5);
    g.fillCircle(75, 50, 3);
    g.fillCircle(115, 42, 2.8);
    g.fillCircle(135, 65, 3.2);

    g.generateTexture('underwaterRock', width, height);
    g.destroy();
  }

  /**
   * Generates procedural Seaweed Stalk
   */
  static generateSeaweedStalk(scene: Phaser.Scene): void {
    if (scene.textures.exists('seaweedStalk')) return;

    const width = 60;
    const height = 240;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Undulating stalk
    g.lineStyle(6, 0x052e3d, 0.95);
    g.beginPath();
    g.moveTo(30, 240);
    g.lineTo(24, 180);
    g.lineTo(38, 120);
    g.lineTo(26, 60);
    g.lineTo(34, 25);
    g.lineTo(30, 0);
    g.strokePath();

    // Fronds along the stem
    g.fillStyle(0x084b61, 0.85);
    // Left fronds
    g.fillEllipse(18, 170, 26, 12);
    g.fillEllipse(15, 100, 24, 10);
    g.fillEllipse(20, 40, 20, 8);
    // Right fronds
    g.fillStyle(0x0e6480, 0.85);
    g.fillEllipse(42, 135, 26, 11);
    g.fillEllipse(40, 75, 22, 9);
    g.fillEllipse(36, 20, 16, 7);

    // Glowing tip
    g.fillStyle(0x22d3ee, 0.9);
    g.fillCircle(30, 4, 3);

    g.generateTexture('seaweedStalk', width, height);
    g.destroy();
  }

  /**
   * Generates the BURIED CLOCK TOWER Landmark (Schedule)
   * A tall, gothic sunken clock tower buried into the seabed, with an illuminated nautical dial.
   */
  static generateClockTower(scene: Phaser.Scene): void {
    if (scene.textures.exists('landmark_clock_tower')) return;

    const width = 160;
    const height = 270;
    const g = scene.make.graphics({ x: 0, y: 0 });

    const cx = width / 2; // 80

    // 1. Tower Body (Sunken gothic masonry with deep sea shading)
    g.fillStyle(0x03192f, 0.98);
    g.fillRect(35, 75, 90, 160);

    // Left shadow / depth edge
    g.fillStyle(0x010d1c, 0.95);
    g.fillRect(35, 75, 24, 160);

    // Right highlight edge
    g.fillStyle(0x07365f, 0.85);
    g.fillRect(100, 75, 25, 160);

    // Decorative masonry horizontal moldings
    g.fillStyle(0x0b4b7f, 0.9);
    g.fillRect(30, 72, 100, 8);
    g.fillRect(32, 140, 96, 6);
    g.fillRect(28, 205, 104, 8);

    // 2. Gothic Spire / Roof (Tilted slightly, ancient copper patina)
    g.fillStyle(0x0d9488, 0.9);
    g.beginPath();
    g.moveTo(cx, 10);
    g.lineTo(30, 72);
    g.lineTo(130, 72);
    g.closePath();
    g.fillPath();

    // Spire shadow facet
    g.fillStyle(0x0f766e, 0.95);
    g.beginPath();
    g.moveTo(cx, 10);
    g.lineTo(30, 72);
    g.lineTo(cx, 72);
    g.closePath();
    g.fillPath();

    // Spire finial crest
    g.fillStyle(0x38bdf8, 1);
    g.fillCircle(cx, 8, 4);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx, 8, 2);

    // 3. Gothic Arched Sanctuary Window (below clock)
    g.fillStyle(0x021120, 1);
    g.fillRoundedRect(55, 155, 50, 45, 12);
    // Inner warm amber / gold festival lantern glow
    g.fillStyle(0xf59e0b, 0.65);
    g.fillCircle(cx, 175, 14);
    g.fillStyle(0xfef08a, 0.85);
    g.fillCircle(cx, 175, 7);

    // 4. Luminous Clock Face (The crowning landmark feature)
    // Clock outer ornate stone frame
    g.fillStyle(0x0a416b, 1);
    g.fillCircle(cx, 106, 28);

    // Brass/gold bezel ring
    g.fillStyle(0xd97706, 1);
    g.fillCircle(cx, 106, 25);

    // Outer dial glow
    g.fillStyle(0x0284c7, 0.9);
    g.fillCircle(cx, 106, 23);

    // Radiant aqua clock dial face
    g.fillStyle(0x38bdf8, 0.95);
    g.fillCircle(cx, 106, 20);
    g.fillStyle(0xe0f2fe, 1);
    g.fillCircle(cx, 106, 16);

    // Hour marker tick marks (12, 3, 6, 9)
    g.fillStyle(0x0369a1, 1);
    g.fillRect(cx - 1.5, 92, 3, 4);   // 12
    g.fillRect(cx + 12, 104.5, 4, 3); // 3
    g.fillRect(cx - 1.5, 116, 3, 4);  // 6
    g.fillRect(cx - 16, 104.5, 4, 3); // 9

    // Clock hands (pointing to 10:10)
    g.lineStyle(2.5, 0x0f172a, 1);
    // Hour hand (pointing to ~10)
    g.lineBetween(cx, 106, cx - 8, 98);
    // Minute hand (pointing to ~2)
    g.lineStyle(2, 0xd97706, 1);
    g.lineBetween(cx, 106, cx + 10, 96);
    // Center brass pin
    g.fillStyle(0xfff176, 1);
    g.fillCircle(cx, 106, 3);

    // 5. Seabed sand mound burying the base (uneven drift)
    g.fillStyle(0x041b31, 0.95);
    g.beginPath();
    g.moveTo(10, 270);
    g.lineTo(30, 245);
    g.lineTo(55, 228);
    g.lineTo(90, 235);
    g.lineTo(130, 248);
    g.lineTo(155, 270);
    g.closePath();
    g.fillPath();

    // Base barnacles and sea moss
    g.fillStyle(0x0d9488, 0.7);
    g.fillCircle(45, 232, 6);
    g.fillCircle(58, 236, 5);
    g.fillCircle(112, 242, 7);

    // Bioluminescent runes running up the left pillar edge
    g.fillStyle(0x00f0ff, 0.85);
    g.fillCircle(42, 120, 2.5);
    g.fillCircle(42, 132, 2);
    g.fillCircle(42, 144, 2.5);

    g.generateTexture('landmark_clock_tower', width, height);
    g.destroy();
  }

  /**
   * Generates PEARL SHELL Landmark (Register)
   */
  static generatePearlShell(scene: Phaser.Scene): void {
    if (scene.textures.exists('landmark_pearl_shell')) return;

    const width = 150;
    const height = 130;
    const g = scene.make.graphics({ x: 0, y: 0 });
    const cx = width / 2;

    // Pedestal rock base
    g.fillStyle(0x02162a, 0.95);
    g.fillRoundedRect(20, 85, 110, 42, 16);

    // Back upper shell fan
    g.fillStyle(0x075985, 0.95);
    g.beginPath();
    g.moveTo(cx, 90);
    g.lineTo(25, 30);
    g.lineTo(50, 12);
    g.lineTo(cx, 6);
    g.lineTo(100, 12);
    g.lineTo(125, 30);
    g.closePath();
    g.fillPath();

    // Shell radiating rib ridges
    g.lineStyle(2, 0x38bdf8, 0.7);
    g.lineBetween(cx, 90, 35, 28);
    g.lineBetween(cx, 90, 55, 18);
    g.lineBetween(cx, 90, 75, 12);
    g.lineBetween(cx, 90, 95, 18);
    g.lineBetween(cx, 90, 115, 28);

    // Inner iridescent nacre chamber
    g.fillStyle(0xbae6fd, 0.85);
    g.fillEllipse(cx, 75, 80, 38);

    // Giant luminous pearl (Register artifact)
    // Outer pearl aura
    g.fillStyle(0x38bdf8, 0.5);
    g.fillCircle(cx, 68, 22);
    // Pearl body
    g.fillStyle(0xf0f9ff, 1);
    g.fillCircle(cx, 68, 17);
    // Iridescent luster
    g.fillStyle(0xfef08a, 0.7);
    g.fillCircle(cx - 3, 65, 8);
    // Specular highlight
    g.fillStyle(0xffffff, 1);
    g.fillCircle(cx - 5, 63, 4);

    g.generateTexture('landmark_pearl_shell', width, height);
    g.destroy();
  }

  /**
   * Generates SUNKEN RUINS Landmark (About)
   */
  static generateSunkenRuins(scene: Phaser.Scene): void {
    if (scene.textures.exists('landmark_sunken_ruins')) return;

    const width = 180;
    const height = 180;
    const g = scene.make.graphics({ x: 0, y: 0 });
    const cx = width / 2;

    // Weathered temple pediment / roof
    g.fillStyle(0x031d38, 0.98);
    g.beginPath();
    g.moveTo(cx, 15);
    g.lineTo(20, 60);
    g.lineTo(160, 60);
    g.closePath();
    g.fillPath();

    // Pediment relief engraving
    g.fillStyle(0x0c4a6e, 0.8);
    g.fillCircle(cx, 40, 12);

    // Architrave beam
    g.fillStyle(0x07355c, 0.95);
    g.fillRect(15, 60, 150, 14);

    // Classical pillars
    const pillarPositions = [28, 62, 102, 136];
    pillarPositions.forEach((px) => {
      g.fillStyle(0x02192f, 0.95);
      g.fillRect(px, 74, 16, 75);
      g.fillStyle(0x063963, 0.8);
      g.fillRect(px + 8, 74, 8, 75);
    });

    // Dark sanctum doorway (between inner pillars)
    g.fillStyle(0x010913, 1);
    g.fillRoundedRect(72, 85, 36, 64, 8);
    // Inner turquoise sanctum aura
    g.fillStyle(0x00f0ff, 0.6);
    g.fillCircle(90, 115, 12);
    g.fillStyle(0xffffff, 0.85);
    g.fillCircle(90, 115, 5);

    // Stepped pedestal base
    g.fillStyle(0x031d38, 1);
    g.fillRect(10, 149, 160, 14);
    g.fillRect(5, 163, 170, 17);

    // Weathered vines
    g.lineStyle(2, 0x0d9488, 0.85);
    g.beginPath();
    g.moveTo(35, 74);
    g.lineTo(40, 110);
    g.lineTo(36, 145);
    g.strokePath();

    g.generateTexture('landmark_sunken_ruins', width, height);
    g.destroy();
  }

  /**
   * Generates CORAL GARDEN Landmark (Gallery)
   */
  static generateCoralGarden(scene: Phaser.Scene): void {
    if (scene.textures.exists('landmark_coral_garden')) return;

    const width = 160;
    const height = 150;
    const g = scene.make.graphics({ x: 0, y: 0 });

    // Coral reef base arch
    g.fillStyle(0x031f3b, 0.95);
    g.fillRoundedRect(15, 70, 130, 75, 24);

    // Vibrant coral branches radiating upwards
    // Left coral branch (magenta/violet marine glow)
    g.fillStyle(0x0284c7, 0.9);
    g.fillRoundedRect(25, 25, 20, 60, 10);
    g.fillCircle(35, 22, 11);
    g.fillStyle(0x38bdf8, 1);
    g.fillCircle(35, 22, 5);

    // Center tall crystalline coral
    g.fillStyle(0x0369a1, 0.95);
    g.fillRoundedRect(70, 10, 22, 80, 11);
    g.fillCircle(81, 10, 12);
    g.fillStyle(0x7dd3fc, 1);
    g.fillCircle(81, 10, 6);

    // Right coral branch
    g.fillStyle(0x0e7490, 0.9);
    g.fillRoundedRect(115, 30, 20, 55, 10);
    g.fillCircle(125, 28, 10);
    g.fillStyle(0x22d3ee, 1);
    g.fillCircle(125, 28, 5);

    // Glowing anemone polyps
    const polypColors = [0x00f0ff, 0xa5f3fc, 0x38bdf8, 0x22d3ee];
    for (let i = 0; i < 8; i++) {
      const px = 30 + (i * 14);
      const py = 75 + Math.sin(i) * 8;
      g.fillStyle(polypColors[i % polypColors.length], 0.85);
      g.fillCircle(px, py, 3.5);
    }

    g.generateTexture('landmark_coral_garden', width, height);
    g.destroy();
  }

  /**
   * Generates UNDERWATER MONUMENT Landmark (Our Team)
   */
  static generateUnderwaterMonument(scene: Phaser.Scene): void {
    if (scene.textures.exists('landmark_monument')) return;

    const width = 140;
    const height = 220;
    const g = scene.make.graphics({ x: 0, y: 0 });
    const cx = width / 2;

    // Monolith Obelisk Body (Tapered)
    g.fillStyle(0x02192f, 0.98);
    g.beginPath();
    g.moveTo(cx - 20, 30);
    g.lineTo(cx + 20, 30);
    g.lineTo(cx + 35, 175);
    g.lineTo(cx - 35, 175);
    g.closePath();
    g.fillPath();

    // Shading facet
    g.fillStyle(0x010e1c, 0.95);
    g.beginPath();
    g.moveTo(cx - 20, 30);
    g.lineTo(cx, 30);
    g.lineTo(cx, 175);
    g.lineTo(cx - 35, 175);
    g.closePath();
    g.fillPath();

    // Obelisk Pyramidion Cap
    g.fillStyle(0x0284c7, 1);
    g.beginPath();
    g.moveTo(cx, 8);
    g.lineTo(cx - 20, 30);
    g.lineTo(cx + 20, 30);
    g.closePath();
    g.fillPath();

    // Golden tip crest
    g.fillStyle(0xfff176, 1);
    g.fillCircle(cx, 8, 4);

    // Central Engraved Trident Emblem (Litfest Team symbol)
    g.lineStyle(3, 0x38bdf8, 1);
    // Center prong
    g.lineBetween(cx, 70, cx, 125);
    // Left prong
    g.beginPath();
    g.moveTo(cx - 14, 75);
    g.lineTo(cx - 14, 98);
    g.lineTo(cx, 106);
    g.strokePath();
    // Right prong
    g.beginPath();
    g.moveTo(cx + 14, 75);
    g.lineTo(cx + 14, 98);
    g.lineTo(cx, 106);
    g.strokePath();

    // Trident center star
    g.fillStyle(0x00f0ff, 1);
    g.fillCircle(cx, 90, 4);

    // Stepped plinth base
    g.fillStyle(0x04213d, 1);
    g.fillRect(20, 175, 100, 18);
    g.fillRect(10, 193, 120, 24);

    g.generateTexture('landmark_monument', width, height);
    g.destroy();
  }

  /**
   * Generates SUNKEN PALACE Landmark (Dashboard)
   */
  static generateSunkenPalace(scene: Phaser.Scene): void {
    if (scene.textures.exists('landmark_sunken_palace')) return;

    const width = 220;
    const height = 240;
    const g = scene.make.graphics({ x: 0, y: 0 });
    const cx = width / 2;

    // Palace main central hall
    g.fillStyle(0x031c36, 0.98);
    g.fillRect(40, 90, 140, 125);

    // Palace wings
    g.fillStyle(0x02152a, 0.95);
    g.fillRect(15, 120, 45, 95);
    g.fillRect(160, 120, 45, 95);

    // Central majestic dome
    g.fillStyle(0x0369a1, 0.95);
    g.fillCircle(cx, 75, 36);
    g.fillRect(cx - 36, 75, 72, 16);

    // Dome crown spire
    g.fillStyle(0x38bdf8, 1);
    g.fillRoundedRect(cx - 3, 22, 6, 25, 3);
    g.fillCircle(cx, 18, 5);

    // Flanking wing minarets
    g.fillStyle(0x0284c7, 0.9);
    g.fillRoundedRect(22, 85, 12, 35, 4);
    g.fillRoundedRect(186, 85, 12, 35, 4);
    g.fillCircle(28, 80, 4);
    g.fillCircle(192, 80, 4);

    // Grand Portal Entrance Arch
    g.fillStyle(0x010c18, 1);
    g.fillRoundedRect(cx - 24, 135, 48, 80, 16);

    // Portal inner royal radiance
    g.fillStyle(0x00f0ff, 0.65);
    g.fillCircle(cx, 170, 16);
    g.fillStyle(0xfff176, 0.85);
    g.fillCircle(cx, 170, 7);

    // Palace grand foundation terrace
    g.fillStyle(0x052e54, 1);
    g.fillRect(5, 215, 210, 22);

    g.generateTexture('landmark_sunken_palace', width, height);
    g.destroy();
  }

  /**
   * Helper to initialize all textures at once
   */
  static generateAll(scene: Phaser.Scene): void {
    this.generateAvatar(scene);
    this.generatePillar(scene);
    this.generateRockFormation(scene);
    this.generateSeaweedStalk(scene);
    this.generateClockTower(scene);
    this.generatePearlShell(scene);
    this.generateSunkenRuins(scene);
    this.generateCoralGarden(scene);
    this.generateUnderwaterMonument(scene);
    this.generateSunkenPalace(scene);
  }
}
