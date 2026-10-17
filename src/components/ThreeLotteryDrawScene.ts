import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class ThreeLotteryDrawScene {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();
  private ballsGroup: THREE.Group = new THREE.Group();
  private outerCage!: THREE.Mesh;
  private isCinematic: boolean = false;
  private resizeHandler: () => void = () => {};
  private onClosed?: () => void;
  private isInline: boolean = false;
  private resizeObserver?: ResizeObserver;

  constructor(container: HTMLElement, lotName: string = "Jackpot Live Draw", onClosed?: () => void, isInline: boolean = false) {
    this.container = container;
    this.onClosed = onClosed;
    this.isInline = isInline;
    this.init(lotName);
  }

  private init(lotName: string) {
    // Clear container
    this.container.innerHTML = "";

    // Wrapper UI for Zero-Occlusion Bottom Dock & Top Spec Badge
    const wrapper = document.createElement("div");
    wrapper.className = "relative w-full h-full min-h-[220px] overflow-hidden bg-slate-950 font-sans select-none flex flex-col justify-between";

    // 1. Top Spec Badge (Minimal, Top-Left)
    const topBadge = document.createElement("div");
    topBadge.className = this.isInline 
      ? "absolute top-2 left-2 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-amber-500/40 px-2 py-0.5 rounded-xl shadow-lg backdrop-blur-sm"
      : "absolute top-4 left-4 z-20 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md border border-amber-500/30 px-3.5 py-1.5 rounded-2xl shadow-xl";
    topBadge.innerHTML = `
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
      <div class="${this.isInline ? 'text-[10px]' : 'text-xs'}">
        <span class="font-black text-amber-300 uppercase tracking-wider">3D PBR Studio Live</span>
        <span class="text-slate-400 block text-[8px] font-mono truncate max-w-[140px]">${lotName}</span>
      </div>
    `;
    wrapper.appendChild(topBadge);

    // Right Action Button (Close or Expand to Fullscreen)
    const rightBtn = document.createElement("button");
    if (this.isInline) {
      rightBtn.className = "absolute top-2 right-2 z-20 bg-amber-500/20 hover:bg-amber-500 border border-amber-500/40 text-amber-300 hover:text-slate-950 px-2 py-1 rounded-xl text-[10px] font-mono font-bold transition cursor-pointer flex items-center gap-1 shadow-lg";
      rightBtn.innerHTML = `<i class="fa-solid fa-expand text-[10px]"></i> <span>ফুলস্ক্রিন</span>`;
      rightBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        if ((window as any).app && typeof (window as any).app.openThreeLotteryDraw === 'function') {
          (window as any).app.openThreeLotteryDraw(lotName);
        }
      });
    } else {
      rightBtn.className = "absolute top-4 right-4 z-20 bg-slate-900/80 hover:bg-rose-950 border border-slate-800 hover:border-rose-500/50 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition cursor-pointer flex items-center gap-1.5 shadow-xl";
      rightBtn.innerHTML = `<i class="fa-solid fa-xmark text-sm"></i> <span>বন্ধ করুন</span>`;
      rightBtn.addEventListener("click", () => {
        this.destroy();
        if (this.onClosed) this.onClosed();
      });
    }
    wrapper.appendChild(rightBtn);

    // WebGL Canvas Container
    const canvasContainer = document.createElement("div");
    canvasContainer.className = "absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing";
    wrapper.appendChild(canvasContainer);

    // 2. Collapsible Bottom Dock (Zero Viewport Occlusion)
    const bottomDock = document.createElement("div");
    bottomDock.id = "three-bottom-dock";
    if (this.isInline) {
      bottomDock.className = "absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 w-[96%] max-w-[440px] bg-slate-900/90 backdrop-blur-sm border border-slate-800 rounded-xl p-1.5 shadow-xl transition-all duration-300 flex items-center justify-between text-[9px] font-mono";
      bottomDock.innerHTML = `
        <div class="flex items-center gap-1 font-bold text-amber-300">
          <i class="fa-solid fa-cube text-xs"></i> <span>৩ডি লাইভ ড্র</span>
        </div>
        <div class="flex items-center gap-1">
          <button id="cam-preset-1" class="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-white cursor-pointer transition">ফ্রন্ট</button>
          <button id="cam-preset-2" class="bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded text-white cursor-pointer transition">টপ</button>
          <button id="spin-speed-btn" class="bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 px-2 py-0.5 rounded cursor-pointer font-bold transition">⚡ স্পিড</button>
        </div>
      `;
    } else {
      bottomDock.className = "absolute bottom-5 left-1/2 -translate-x-1/2 z-20 w-[94%] max-w-[720px] bg-slate-900/90 backdrop-blur-lg border border-slate-800/80 rounded-3xl p-3.5 shadow-2xl transition-all duration-300 flex flex-col gap-3";
      bottomDock.innerHTML = `
        <div class="flex items-center justify-between border-b border-slate-800/80 pb-2">
          <div class="flex items-center gap-2 text-xs font-bold text-white font-mono">
            <i class="fa-solid fa-cube text-amber-400"></i>
            <span>ড্র মেশিন স্টুডিও পিবিআর কন্ট্রোল</span>
          </div>
          <button id="three-zen-toggle" class="text-[10px] font-mono text-slate-400 hover:text-white bg-slate-800/60 px-2.5 py-1 rounded-xl transition cursor-pointer flex items-center gap-1">
            <i class="fa-solid fa-eye-slash"></i> <span id="three-zen-label">সিনেমা মোড</span>
          </button>
        </div>
        <div class="grid grid-cols-3 gap-2 text-xs font-mono">
          <button id="cam-preset-1" class="bg-slate-800/60 hover:bg-amber-600/20 border border-slate-700/60 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 py-2 rounded-xl transition cursor-pointer font-bold flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-camera"></i> ফ্রন্ট ভিউ
          </button>
          <button id="cam-preset-2" class="bg-slate-800/60 hover:bg-cyan-600/20 border border-slate-700/60 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-300 py-2 rounded-xl transition cursor-pointer font-bold flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-circle-notch"></i> টপ অরবিট
          </button>
          <button id="spin-speed-btn" class="bg-amber-500/15 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 py-2 rounded-xl transition cursor-pointer font-bold flex items-center justify-center gap-1.5">
            <i class="fa-solid fa-bolt"></i> স্পিড বুস্ট
          </button>
        </div>
      `;
    }
    wrapper.appendChild(bottomDock);

    this.container.appendChild(wrapper);

    // -------------------------------------------------------------
    // THREE.JS SCENE SETUP
    // -------------------------------------------------------------
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x060913);
    this.scene.fog = new THREE.FogExp2(0x060913, 0.035);

    const width = canvasContainer.clientWidth || (this.isInline ? 360 : window.innerWidth);
    const height = canvasContainer.clientHeight || (this.isInline ? 220 : window.innerHeight);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.set(0, this.isInline ? 1.8 : 2.5, this.isInline ? 6.2 : 7);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio || 1, 1.25));
    this.renderer.setSize(width, height);
    this.renderer.shadowMap.enabled = !isHeadless;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    canvasContainer.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.maxPolarAngle = Math.PI / 2 + 0.1;
    this.controls.minDistance = 2.5;
    this.controls.maxDistance = 14;

    // Studio Environment & Lighting
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting rig
    const hemiLight = new THREE.HemisphereLight(0xb1e1ff, 0x091022, 0.8);
    this.scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e6, 2.0);
    keyLight.position.set(4, 7, 5);
    keyLight.castShadow = !isHeadless;
    keyLight.shadow.mapSize.width = 512;
    keyLight.shadow.mapSize.height = 512;
    keyLight.shadow.bias = -0.0005;
    this.scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    fillLight.position.set(-5, 3, -3);
    this.scene.add(fillLight);

    // Ground contact shadow plane
    const shadowGeo = new THREE.PlaneGeometry(8, 8);
    const canvasTexture = this.createRadialGradientTexture();
    const shadowMat = new THREE.MeshBasicMaterial({
      map: canvasTexture,
      transparent: true,
      opacity: 0.6,
      depthWrite: false
    });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -1.2;
    this.scene.add(shadowPlane);

    // -------------------------------------------------------------
    // PROCEDURAL 3D LOTTERY MACHINE & BALLS (Composite 3-12 parts)
    // -------------------------------------------------------------
    const machineGroup = new THREE.Group();
    this.scene.add(machineGroup);

    // Base stand (Brushed Titanium/Steel)
    const baseGeo = new THREE.CylinderGeometry(1.6, 1.9, 0.4, 32);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.25,
      anisotropy: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = -1.0;
    baseMesh.castShadow = true;
    baseMesh.receiveShadow = true;
    machineGroup.add(baseMesh);

    // Gold decorative accent ring on base
    const ringGeo = new THREE.TorusGeometry(1.65, 0.05, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.95,
      roughness: 0.15
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = -0.8;
    machineGroup.add(ringMesh);

    // Glass Dome (MeshPhysicalMaterial with transmission, ior)
    const domeGeo = new THREE.SphereGeometry(1.6, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.75);
    const domeMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0.1,
      roughness: 0.05,
      transmission: 0.92,
      ior: 1.5,
      thickness: 1.2,
      transparent: true,
      opacity: 0.85,
      depthWrite: false
    });
    this.outerCage = new THREE.Mesh(domeGeo, domeMat);
    this.outerCage.position.y = 0.2;
    machineGroup.add(this.outerCage);

    // Inside Spinning Cage / Mixer Blades
    const mixerGroup = new THREE.Group();
    machineGroup.add(mixerGroup);

    const bladeGeo = new THREE.BoxGeometry(2.2, 0.08, 0.2);
    const bladeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.2 });
    for (let i = 0; i < 3; i++) {
      const blade = new THREE.Mesh(bladeGeo, bladeMat);
      blade.rotation.y = (i * Math.PI) / 3;
      mixerGroup.add(blade);
    }
    mixerGroup.position.y = 0.2;

    // Floating Lottery Balls inside the Sphere (12 balls with colors & glowing PBR finish)
    const ballGeo = new THREE.SphereGeometry(0.22, 32, 32);
    const ballColors = [0xf59e0b, 0xef4444, 0x3b82f6, 0x10b981, 0x8b5cf6, 0xec4899, 0x06b6d4, 0xf97316];
    
    for (let i = 0; i < 12; i++) {
      const col = ballColors[i % ballColors.length];
      const ballMat = new THREE.MeshPhysicalMaterial({
        color: col,
        metalness: 0.3,
        roughness: 0.2,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1
      });
      const ballMesh = new THREE.Mesh(ballGeo, ballMat);
      ballMesh.castShadow = true;

      // Random initial position inside sphere radius < 1.1
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 0.8 * Math.cbrt(Math.random());
      
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta) + 0.2;
      const z = r * Math.cos(phi);

      ballMesh.position.set(x, y, z);
      
      // Store random float velocities
      (ballMesh as any).userData = {
        vx: (Math.random() - 0.5) * 0.035,
        vy: (Math.random() - 0.5) * 0.035,
        vz: (Math.random() - 0.5) * 0.035,
        seed: Math.random() * 10
      };

      this.ballsGroup.add(ballMesh);
    }
    machineGroup.add(this.ballsGroup);

    // -------------------------------------------------------------
    // EVENT LISTENERS & ANIMATION LOOP
    // -------------------------------------------------------------
    this.resizeHandler = () => {
      if (!canvasContainer) return;
      const w = canvasContainer.clientWidth || (this.isInline ? 360 : window.innerWidth);
      const h = canvasContainer.clientHeight || (this.isInline ? 220 : window.innerHeight);
      if (w === 0 || h === 0) return;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    };
    window.addEventListener("resize", this.resizeHandler);

    if (typeof ResizeObserver !== "undefined") {
      this.resizeObserver = new ResizeObserver(() => {
        this.resizeHandler();
      });
      this.resizeObserver.observe(canvasContainer);
    }

    // UI Controls listeners
    const zenToggle = wrapper.querySelector("#three-zen-toggle");
    const zenLabel = wrapper.querySelector("#three-zen-label");
    zenToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.isCinematic = !this.isCinematic;
      if (bottomDock) {
        bottomDock.style.transform = this.isCinematic ? "translate(-50%, 140%)" : "translate(-50%, 0%)";
      }
      if (topBadge) topBadge.style.opacity = this.isCinematic ? "0" : "1";
      if (rightBtn) rightBtn.style.opacity = this.isCinematic ? "0" : "1";
      if (zenLabel) zenLabel.textContent = this.isCinematic ? "কন্ট্রোল দেখান" : "সিনেমা মোড";
    });

    wrapper.querySelector("#cam-preset-1")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.camera.position.set(0, 1.5, 5.5);
      this.controls.target.set(0, 0, 0);
    });

    wrapper.querySelector("#cam-preset-2")?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.camera.position.set(0, 5, 3);
      this.controls.target.set(0, 0, 0);
    });

    let isSpeedBoost = false;
    wrapper.querySelector("#spin-speed-btn")?.addEventListener("click", (e) => {
      e.stopPropagation();
      isSpeedBoost = !isSpeedBoost;
      const btn = e.currentTarget as HTMLElement;
      if (isSpeedBoost) {
        btn.classList.add("bg-amber-500", "text-slate-950");
        btn.classList.remove("text-amber-300");
      } else {
        btn.classList.remove("bg-amber-500", "text-slate-950");
        btn.classList.add("text-amber-300");
      }
    });

    // Render loop
    let mixerSpeed = 1.0;
    const animate = () => {
      this.animId = requestAnimationFrame(animate);
      if (typeof document !== 'undefined' && document.hidden) return;

      const delta = Math.min(this.clock.getDelta(), 0.1);
      const time = this.clock.getElapsedTime();

      if (isSpeedBoost) {
        mixerSpeed = THREE.MathUtils.damp(mixerSpeed, 3.5, 3, delta);
      } else {
        mixerSpeed = THREE.MathUtils.damp(mixerSpeed, 1.0, 3, delta);
      }

      // Rotate mixer blades
      mixerGroup.rotation.y += 1.5 * delta * mixerSpeed;

      // Animate balls inside sphere
      this.ballsGroup.children.forEach((ball) => {
        const data = (ball as any).userData;
        ball.position.x += data.vx * mixerSpeed;
        ball.position.y += data.vy * mixerSpeed;
        ball.position.z += data.vz * mixerSpeed;

        // Bounce inside sphere radius 1.1
        const dist = Math.sqrt(ball.position.x ** 2 + (ball.position.y - 0.2) ** 2 + ball.position.z ** 2);
        if (dist > 1.1) {
          ball.position.x *= 0.95;
          ball.position.y = 0.2 + (ball.position.y - 0.2) * 0.95;
          ball.position.z *= 0.95;
          data.vx *= -1;
          data.vy *= -1;
          data.vz *= -1;
        }

        ball.rotation.x += 0.02;
        ball.rotation.y += 0.03;
      });

      // Gentle floating machine bobbing
      machineGroup.position.y = Math.sin(time * 2) * 0.04;

      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  private createRadialGradientTexture(): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;
    const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    gradient.addColorStop(0, "rgba(56, 189, 248, 0.4)");
    gradient.addColorStop(0.5, "rgba(15, 23, 42, 0.2)");
    gradient.addColorStop(1, "rgba(6, 9, 19, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  public destroy() {
    cancelAnimationFrame(this.animId);
    window.removeEventListener("resize", this.resizeHandler);
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.controls) {
      this.controls.dispose();
    }
    if (this.scene) {
      this.scene.traverse((child: any) => {
        if (child.geometry) child.geometry.dispose();
        if (child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((m: any) => m.dispose());
          } else {
            child.material.dispose();
          }
        }
      });
      if (this.scene.environment && typeof (this.scene.environment as any).dispose === 'function') {
        (this.scene.environment as any).dispose();
      }
    }
    if (this.renderer) {
      this.renderer.forceContextLoss();
      this.renderer.dispose();
      this.renderer.domElement.remove();
    }
  }
}
