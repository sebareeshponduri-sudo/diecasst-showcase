/**
 * Diecast Archive - Seed Data Provider
 * Generates and seeds museum-grade initial scale models with Base64 images
 */

function createDiecastArtwork(title, subtitle, carType, primaryColor, accentColor) {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 600;
  const ctx = canvas.getContext('2d');

  // Background - Dark studio showroom floor
  const bgGrad = ctx.createRadialGradient(400, 260, 50, 400, 300, 450);
  bgGrad.addColorStop(0, '#1c2430');
  bgGrad.addColorStop(0.6, '#0f141c');
  bgGrad.addColorStop(1, '#080b10');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 800, 600);

  // Soft overhead studio spotlight beam
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(400, 380, 340, 100, 0, 0, Math.PI * 2);
  const spotGrad = ctx.createRadialGradient(400, 380, 10, 400, 380, 340);
  spotGrad.addColorStop(0, 'rgba(165, 243, 252, 0.12)');
  spotGrad.addColorStop(0.5, 'rgba(147, 197, 253, 0.04)');
  spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = spotGrad;
  ctx.fill();
  ctx.restore();

  // Dark Acrylic Plinth Display Stand
  ctx.save();
  // Plinth base shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  ctx.roundRect(80, 430, 640, 70, 12);
  ctx.fill();

  // Plinth Top Surface
  const plinthGrad = ctx.createLinearGradient(80, 380, 720, 440);
  plinthGrad.addColorStop(0, '#1a222e');
  plinthGrad.addColorStop(0.5, '#243040');
  plinthGrad.addColorStop(1, '#151c27');
  ctx.fillStyle = plinthGrad;
  ctx.beginPath();
  ctx.roundRect(90, 390, 620, 50, 8);
  ctx.fill();

  // Plinth Bevel Edge highlight
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Acrylic reflection line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(110, 393);
  ctx.lineTo(690, 393);
  ctx.stroke();

  // Metal Plaque on plinth
  ctx.fillStyle = '#0a0d12';
  ctx.fillRect(250, 412, 300, 22);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 1;
  ctx.strokeRect(250, 412, 300, 22);

  // Plaque rivets
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.arc(256, 423, 2, 0, Math.PI * 2);
  ctx.arc(544, 423, 2, 0, Math.PI * 2);
  ctx.fill();

  // Plaque Text
  ctx.fillStyle = '#a5f3fc';
  ctx.font = 'bold 10px "Chakra Petch", monospace, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(title.toUpperCase() + '  •  ' + subtitle.toUpperCase(), 400, 427);
  ctx.restore();

  // Draw Car Scale Silhouette & Automotive Artwork
  ctx.save();
  // Car drop shadow on plinth
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.beginPath();
  ctx.ellipse(400, 395, 250, 25, 0, 0, Math.PI * 2);
  ctx.fill();

  // Render stylized precision scale diecast model
  renderStylizedCarModel(ctx, carType, primaryColor, accentColor);
  ctx.restore();

  // Studio Vignette & Grid Lines
  ctx.save();
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
  ctx.lineWidth = 1;
  for (let x = 40; x < 800; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }
  for (let y = 40; y < 600; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(800, y);
    ctx.stroke();
  }

  // Spec watermark tag
  ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
  ctx.font = '10px "Chakra Petch", monospace, sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText('DIECAST ARCHIVE // ARCHIVAL SPECIMEN', 770, 580);
  ctx.fillText('STUDIO REFERENCE RENDER', 770, 592);
  ctx.restore();

  return canvas.toDataURL('image/jpeg', 0.92);
}

function renderStylizedCarModel(ctx, type, primaryColor, accentColor) {
  const cx = 400;
  const cy = 300;

  // Car Body Gradient
  const bodyGrad = ctx.createLinearGradient(cx - 240, cy - 80, cx + 240, cy + 90);
  bodyGrad.addColorStop(0, primaryColor);
  bodyGrad.addColorStop(0.3, adjustBrightness(primaryColor, 35));
  bodyGrad.addColorStop(0.7, primaryColor);
  bodyGrad.addColorStop(1, adjustBrightness(primaryColor, -40));

  ctx.fillStyle = bodyGrad;
  ctx.strokeStyle = adjustBrightness(primaryColor, 50);
  ctx.lineWidth = 2;

  // Dynamic profile based on car type
  ctx.beginPath();
  if (type === 'porsche') {
    // Porsche GT3 RS Streamlined Teardrop Coupe
    ctx.moveTo(170, 365);
    ctx.lineTo(190, 320);
    ctx.quadraticCurveTo(220, 270, 290, 265); // Front hood
    ctx.quadraticCurveTo(340, 220, 430, 220); // Roof
    ctx.quadraticCurveTo(530, 225, 590, 310); // Fastback rear
    ctx.lineTo(630, 340); // Rear bumper
    ctx.lineTo(625, 370);
    ctx.lineTo(170, 370);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // High Carbon GT Wing
    ctx.fillStyle = '#111827';
    ctx.beginPath();
    ctx.roundRect(570, 205, 75, 10, 3);
    ctx.fill();
    ctx.strokeStyle = '#374151';
    ctx.stroke();
    // Wing uprights
    ctx.fillStyle = '#1f2937';
    ctx.fillRect(590, 215, 6, 45);
    ctx.fillRect(620, 215, 6, 45);
  } else if (type === 'ferrari') {
    // Ferrari F40 Wedge & Integrated Rear Wing
    ctx.moveTo(160, 370);
    ctx.lineTo(180, 335);
    ctx.lineTo(280, 305); // Low angular front hood
    ctx.lineTo(345, 235); // Sharp windshield
    ctx.lineTo(470, 235); // Flat roof
    ctx.lineTo(540, 295); // Rear louvered engine bay
    ctx.lineTo(640, 295); // High integrated wing top
    ctx.lineTo(640, 370); // Rear fascia
    ctx.lineTo(160, 370);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // F40 Wing air tunnel opening
    ctx.fillStyle = '#0f141c';
    ctx.beginPath();
    ctx.roundRect(565, 305, 60, 35, 4);
    ctx.fill();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (type === 'rx7') {
    // Mazda RX-7 Organic Curvaceous Japanese Legend
    ctx.moveTo(170, 368);
    ctx.quadraticCurveTo(200, 325, 270, 300);
    ctx.quadraticCurveTo(340, 240, 420, 240); // Bubble roof
    ctx.quadraticCurveTo(510, 245, 580, 330); // Sloping hatch
    ctx.lineTo(630, 355);
    ctx.lineTo(625, 370);
    ctx.lineTo(170, 370);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Subtle curved rear wing
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(580, 285, 50, 8, 3);
    ctx.fill();
  } else if (type === 'countach') {
    // Lamborghini Countach Wedge Geometry
    ctx.moveTo(150, 370);
    ctx.lineTo(260, 295);
    ctx.lineTo(350, 240);
    ctx.lineTo(460, 240);
    ctx.lineTo(570, 310);
    ctx.lineTo(645, 330);
    ctx.lineTo(640, 370);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Large arrow wing
    ctx.fillStyle = adjustBrightness(primaryColor, -20);
    ctx.beginPath();
    ctx.moveTo(560, 240);
    ctx.lineTo(635, 235);
    ctx.lineTo(630, 250);
    ctx.lineTo(560, 250);
    ctx.closePath();
    ctx.fill();
  } else {
    // Classic Muscle / Sports Roadster
    ctx.moveTo(160, 365);
    ctx.lineTo(185, 325);
    ctx.lineTo(300, 310);
    ctx.lineTo(340, 270);
    ctx.lineTo(460, 270);
    ctx.lineTo(540, 325);
    ctx.lineTo(635, 345);
    ctx.lineTo(630, 370);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // Windows & Cockpit Glass (Glossy dark tint with sky reflections)
  const glassGrad = ctx.createLinearGradient(300, 230, 500, 310);
  glassGrad.addColorStop(0, '#0c121e');
  glassGrad.addColorStop(0.5, '#1e293b');
  glassGrad.addColorStop(1, '#0a0f18');

  ctx.fillStyle = glassGrad;
  ctx.strokeStyle = 'rgba(165, 243, 252, 0.4)';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(340, 305);
  ctx.lineTo(355, 248);
  ctx.lineTo(435, 248);
  ctx.lineTo(505, 305);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Glass highlight streak
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(370, 252);
  ctx.lineTo(450, 302);
  ctx.stroke();

  // Aerodynamic body creases and door cut-lines
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.45)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(360, 305);
  ctx.lineTo(360, 365);
  ctx.moveTo(480, 305);
  ctx.lineTo(480, 365);
  ctx.moveTo(270, 335);
  ctx.lineTo(540, 345);
  ctx.stroke();

  // Wheels & Diecast Rims
  renderDiecastWheel(ctx, 245, 370, 42, accentColor);
  renderDiecastWheel(ctx, 555, 370, 42, accentColor);

  // Headlights & Tail Lights glow
  ctx.fillStyle = '#ffffff';
  ctx.shadowColor = '#a5f3fc';
  ctx.shadowBlur = 12;
  ctx.beginPath();
  ctx.arc(175, 340, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0; // Reset shadow

  ctx.fillStyle = '#ef4444';
  ctx.shadowColor = '#ef4444';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(628, 348, 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;
}

function renderDiecastWheel(ctx, x, y, radius, rimColor) {
  // Rubber Tire
  ctx.save();
  ctx.fillStyle = '#111827';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#374151';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Wheel Rim Outer Lip
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.72, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rimColor || '#94a3b8';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Brake Caliper & Drilled Rotor
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f59e0b'; // Gold / Brembo Caliper
  ctx.beginPath();
  ctx.arc(x - 8, y - 8, 8, 0, Math.PI);
  ctx.fill();

  // Multi-Spoke Alloy Rim
  ctx.strokeStyle = rimColor || '#e2e8f0';
  ctx.lineWidth = 2.5;
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * (radius * 0.7), y + Math.sin(angle) * (radius * 0.7));
    ctx.stroke();
  }

  // Center Lug Nut Cap
  ctx.fillStyle = '#a5f3fc';
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function adjustBrightness(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  let r = (num >> 16) + Math.round(255 * (percent / 100));
  let g = ((num >> 8) & 0x00ff) + Math.round(255 * (percent / 100));
  let b = (num & 0x0000ff) + Math.round(255 * (percent / 100));
  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getInitialSeedCars() {
  const porscheImg = createDiecastArtwork('Porsche 911 GT3 RS', '1:18 AutoArt Composite', 'porsche', '#22c55e', '#111827');
  const ferrariImg = createDiecastArtwork('Ferrari F40 LM', '1:24 Kyosho Diecast', 'ferrari', '#dc2626', '#f59e0b');
  const rx7Img = createDiecastArtwork('Mazda RX-7 FD3S', '1:43 Ignition Model', 'rx7', '#eab308', '#78350f');
  const countachImg = createDiecastArtwork('Lamborghini Countach LP5000', '1:18 Kyosho Diecast', 'countach', '#f8fafc', '#94a3b8');
  const cobraImg = createDiecastArtwork('Shelby Cobra 427 S/C', '1:24 CMC Exclusive', 'cobra', '#2563eb', '#f1f5f9');

  const skylineImg = typeof SKYLINE_IMG_B64 !== 'undefined' 
    ? SKYLINE_IMG_B64 
    : createDiecastArtwork('Nissan Skyline GT-R R34', '1:64 Mini GT', 'skyline', '#2563eb', '#94a3b8');

  return [
    {
      id: 'car-1700000001',
      name: 'Skyline GT-R R34 V-Spec II',
      brand: 'Nissan',
      scale: '1:64',
      maker: 'Mini GT',
      year: '1999',
      color: 'Bayside Blue',
      imageData: skylineImg,
      notes: 'Iconic Japanese supercar killer powered by the legendary RB26DETT twin-turbo inline-6 and ATTESA E-TS AWD. Precision 1:64 scale casting by Mini GT with rolling rubber tires, carbon-textured aero diffusers, and factory V-Spec badging.',
      createdAt: 1700000001000
    },
    {
      id: 'car-1700000002',
      name: '911 GT3 RS (991.2) Weissach',
      brand: 'Porsche',
      scale: '1:18',
      maker: 'AutoArt',
      year: '2018',
      color: 'Lizard Green / Carbon',
      imageData: porscheImg,
      notes: 'Weissach Package track weapon. High-revving 4.0L naturally aspirated flat-six producing 520 hp. AutoArt composite diecast model with fully opening luggage bay, doors, detailed roll cage, magnesium wheels, and carbon weave wing.',
      createdAt: 1700000002000
    },
    {
      id: 'car-1700000003',
      name: 'F40 LM Competizione',
      brand: 'Ferrari',
      scale: '1:24',
      maker: 'Kyosho',
      year: '1989',
      color: 'Rosso Corsa',
      imageData: ferrariImg,
      notes: 'The purest analog twin-turbocharged supercar celebrating Enzo Ferrari’s 40th anniversary. Features twin IHI turbocharged 2.9L Tipo F120A V8, Kevlar chassis, and exposed rear turbocharger wastegates.',
      createdAt: 1700000003000
    },
    {
      id: 'car-1700000004',
      name: 'RX-7 FD3S Type R Bathurst',
      brand: 'Mazda',
      scale: '1:43',
      maker: 'Ignition Model',
      year: '2001',
      color: 'Sunburst Yellow',
      imageData: rx7Img,
      notes: 'Sequential twin-turbocharged 13B-REW rotary engine. Resin-cast scale replica featuring custom TE37 bronze forged wheels, carbon front splitter, RE-Amemiya aero diffuser, and dual stainless titanium exhaust tips.',
      createdAt: 1700000004000
    },
    {
      id: 'car-1700000005',
      name: 'Countach LP5000 QV',
      brand: 'Lamborghini',
      scale: '1:18',
      maker: 'Kyosho',
      year: '1985',
      color: 'Pearl White / Bianco',
      imageData: countachImg,
      notes: 'Quattrovalvole 5.2L V12 with iconic scissor doors, aggressive Gandini wedge styling, flared wheel arches, and delta rear wing. Functioning steering and pop-up headlights.',
      createdAt: 1700000005000
    },
    {
      id: 'car-1700000006',
      name: 'Cobra 427 S/C Semi-Competition',
      brand: 'Shelby',
      scale: '1:24',
      maker: 'CMC Exclusive',
      year: '1965',
      color: 'Guardsman Blue w/ White Stripes',
      imageData: cobraImg,
      notes: 'Hand-assembled museum-grade replica consisting of over 1,200 individual metal parts. Massive 7.0L Ford FE 427 big-block V8, side-pipe exhausts, and authentic knock-off wire wheels.',
      createdAt: 1700000006000
    }
  ];
}
