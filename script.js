// Initialize EmailJS
(function () {
    if (typeof emailjs !== 'undefined') {
        emailjs.init("9ckQHWPKQUV2yRMFM");
    }
})();

document.addEventListener('DOMContentLoaded', () => {
    initLandingCanvas();
});

const initLandingCanvas = () => {
    const landingCanvas = document.getElementById('landingCanvas');
    if (!landingCanvas) return;

    const ctx = landingCanvas.getContext('2d');
    let width = 0, height = 0;
    let mouse = { x: -1000, y: -1000 };
    let smoothMouse = { x: -1000, y: -1000 };
    let dpr = window.devicePixelRatio || 1;
    let frameCount = 0;

    // Config
    const config = {
        noiseScaleX: 0.005,
        noiseScaleY: 0.005,
        ySpacing: 12,
        amplitude: 30,
        centerSafeWidth: 50,
        speed: 0.001,
        lineWidth: 1.5
    };

    const palette = ["#222", "#333", "#111", "#444"];

    // Perlin Noise Implementation
    const noise = (function () {
        const p = new Uint8Array(512);
        const permutation = [151, 160, 137, 91, 90, 15, 131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23, 190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33, 88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166, 77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244, 102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196, 135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123, 5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42, 223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9, 129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228, 251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107, 49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254, 138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
        for (let i = 0; i < 256; i++) p[256 + i] = p[i] = permutation[i];
        const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
        const lerp = (t, a, b) => a + t * (b - a);
        const grad = (hash, x, y, z) => {
            const h = hash & 15;
            const u = h < 8 ? x : y, v = h < 4 ? y : h == 12 || h == 14 ? x : z;
            return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
        }
        return function (x, y, z) {
            const X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
            x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
            const u = fade(x), v = fade(y), w = fade(z);
            const A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z, B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;
            return lerp(w, lerp(v, lerp(u, grad(p[AA], x, y, z), grad(p[BA], x - 1, y, z)), lerp(u, grad(p[AB], x, y - 1, z), grad(p[BB], x - 1, y - 1, z))), lerp(v, lerp(u, grad(p[AA + 1], x, y, z - 1), grad(p[BA + 1], x - 1, y, z - 1)), lerp(u, grad(p[AB + 1], x, y - 1, z - 1), grad(p[BB + 1], x - 1, y - 1, z - 1))));
        };
    })();

    const map = (value, start1, stop1, start2, stop2) => {
        return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    };

    const resize = () => {
        const rect = landingCanvas.parentNode.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        landingCanvas.width = width * dpr;
        landingCanvas.height = height * dpr;
        ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        const rect = landingCanvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    // Logo Image
    const logoImg = new Image();
    let logoCanvas = null;
    logoImg.onload = () => {
        const c = document.createElement('canvas');
        c.width = logoImg.width;
        c.height = logoImg.height;
        const cx = c.getContext('2d');
        cx.drawImage(logoImg, 0, 0);
        cx.globalCompositeOperation = 'source-in';
        cx.fillStyle = '#FFFFFF'; // Force white logo
        cx.fillRect(0, 0, c.width, c.height);
        logoCanvas = c;
    };
    logoImg.src = 'images/White_Logo.webp'; // Updated path

    const animate = () => {
        if (!landingCanvas.isConnected) return; // Stop animation if canvas is removed
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);
        frameCount++;
        smoothMouse.x += (mouse.x - smoothMouse.x) * 0.15;
        smoothMouse.y += (mouse.y - smoothMouse.y) * 0.15;
        ctx.lineWidth = config.lineWidth;
        ctx.lineJoin = 'round';

        let layerIndex = 0;
        let mx = smoothMouse.x;
        let my = smoothMouse.y;

        for (let y = 0; y <= height; y += config.ySpacing) {
            layerIndex++;
            let col = palette[layerIndex % palette.length];
            ctx.strokeStyle = col;
            ctx.beginPath();
            for (let x = 0; x <= width; x += 5) {
                let n = noise(x * config.noiseScaleX, y * 0.01 - frameCount * config.speed, frameCount * 0.005);
                let centerDist = Math.abs(x - width / 2);
                let spreadFactor = Math.max(0, (centerDist - config.centerSafeWidth) / (width * 0.4));
                let wave = map(n, 0, 1, -config.amplitude, config.amplitude);
                wave *= spreadFactor;
                let interact = 0;
                if (mx > 0 && my > 0) {
                    let dx = x - mx;
                    let dy = y - my;
                    let dist = Math.sqrt(dx * dx + dy * dy);
                    let radius = 250;
                    if (dist < radius) {
                        let force = Math.pow((radius - dist) / radius, 2);
                        let mouseNoise = noise(x * 0.05, y * 0.05, frameCount * 0.05);
                        interact = mouseNoise * force * 60;
                    }
                }
                wave += interact;
                ctx.lineTo(x, y + wave);
            }
            ctx.stroke();
        }

        // Draw Logo
        if (logoCanvas) {
            const maxLogoW = Math.min(600, width * 0.5);
            const ratio = logoCanvas.width / logoCanvas.height;
            const lw = maxLogoW;
            const lh = lw / ratio;
            const lx = (width - lw) / 2;
            const ly = (height - lh) / 2;

            ctx.save();
            ctx.shadowColor = "rgba(255,255,255,1)";
            ctx.shadowBlur = 40;
            ctx.drawImage(logoCanvas, lx, ly, lw, lh);
            ctx.restore();
        }
        requestAnimationFrame(animate);
    };

    setTimeout(() => {
        resize();
        animate();
    }, 100);
};



// Scroll Reveal Animation (Simple & Clean - Editorial Feel)
function setupScrollReveal() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Select elements to animate
    const elementsToReveal = document.querySelectorAll('.hero-text-container, .section-title, .about-grid, .keyword-card, .cat-card, .pf-item');
    elementsToReveal.forEach(el => {
        el.classList.add('reveal-init'); // Base style
        observer.observe(el);
    });

    // Inject CSS for animations (Check if exists first to avoid dupes)
    if (!document.getElementById('reveal-styles')) {
        const style = document.createElement('style');
        style.id = 'reveal-styles';
        style.innerHTML = `
            .reveal-init {
                opacity: 0;
                transform: translateY(40px);
                transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .visible {
                opacity: 1 !important;
                transform: translateY(0) !important;
            }
        `;
        document.head.appendChild(style);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Capture initial content for History Back support
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        window.initialMainContent = mainContent.innerHTML;
    }

    setupScrollReveal();
});


function loadProductDetail(product) {
    fetch(`sections/instruments/${product}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching product detail: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const productDetailContainer = document.getElementById('product-detail-container');
            if (!productDetailContainer) {
                throw new Error('Product detail container not found');
            }
            productDetailContainer.innerHTML = data;

            // Show popup
            const popup = document.getElementById('product-detail-popup');
            popup.style.display = 'block';
            popup.classList.add('fade-in');

            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            // Scroll to top when popup opens
            popup.scrollTop = 0;
        })
        .catch(error => console.error('Error loading product detail:', error));
}

function closeProductDetail() {
    const popup = document.getElementById('product-detail-popup');
    popup.style.display = 'none';
    popup.classList.remove('fade-in');

    // Allow scrolling
    document.body.style.overflow = 'auto';
}

function loadPostDetail(post) {
    fetch(`sections/posts/${post}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching post detail: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const postDetailContainer = document.getElementById('post-detail-container');
            if (!postDetailContainer) {
                throw new Error('Post detail container not found');
            }
            postDetailContainer.innerHTML = data;

            // Show popup
            const popup = document.getElementById('post-detail-popup');
            popup.style.display = 'block';
            popup.classList.add('fade-in');

            // Prevent scrolling
            document.body.style.overflow = 'hidden';

            // Scroll to top when popup opens
            popup.scrollTop = 0;
        })
        .catch(error => console.error('Error loading post detail:', error));
}

function closePostDetail() {
    const popup = document.getElementById('post-detail-popup');
    popup.style.display = 'none';
    popup.classList.remove('fade-in');

    // Allow scrolling
    document.body.style.overflow = 'auto';
}

// Handle right-click events
document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('#post-detail-popup')) {
        e.preventDefault();
        closePostDetail();
    }
});

// Handle ESC key events
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closePostDetail();
    }
});

// Handle right-click events
document.addEventListener('contextmenu', function (e) {
    if (e.target.closest('#product-detail-popup')) {
        e.preventDefault();
        closeProductDetail();
    }
});

// Handle ESC key events
// Handle ESC key events
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeProductDetail();
    }
});

function loadSection(event, section, pushState = true) {
    if (event) event.preventDefault();

    if (pushState) {
        history.pushState({ section: section }, null, `?section=${section}`);
    }

    console.log(`Attempting to load section: ${section}`);

    // Cleanup active game loop if exists (when navigating away)
    if (typeof gameLoopId !== 'undefined' && gameLoopId) {
        cancelAnimationFrame(gameLoopId);
        gameLoopId = null;
    }
    // Cleanup Piano loop
    if (typeof pianoLoopId !== 'undefined' && pianoLoopId) {
        cancelAnimationFrame(pianoLoopId);
        pianoLoopId = null;
    }

    fetch(`sections/${section}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching section: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const mainContent = document.getElementById('main-content');
            if (!mainContent) {
                console.error("Main content element not found!");
                return;
            }
            mainContent.innerHTML = data;

            // Re-run scroll to top
            window.scrollTo(0, 0);


            console.log(`Successfully loaded section: ${section}`);

            // Re-initialize any dynamic scripts if needed
            setupContactForm();
            initWaveformPlayers(); // Initialize the new audio players
            initSoundDesignGame(); // Initialize Sound Design mini-game
            initPianoVisualizer(); // Initialize Piano Visualizer
        })
        .catch(error => {
            console.error('Error loading section:', error);
            alert(`Failed to load content for ${section}. Please check console.`);
        });
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            const combinedMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

            try {
                await emailjs.send('service_ex9470o', 'template_03yvv9m', {
                    user_name: name,
                    user_email: email,
                    message: combinedMessage
                });
                alert('Message sent successfully!');
                contactForm.reset();
            } catch (error) {
                console.error('Failed to send message:', error);
                alert('Failed to send message. Please try again later.');
            }
        });
    }
}

// Global array to track instances to stop previous one when new one plays
let activeWaveSurfers = [];

function initWaveformPlayers() {
    // Check if WaveSurfer is loaded
    if (typeof WaveSurfer === 'undefined') {
        console.warn('WaveSurfer.js not loaded yet. Skipping audio init.');
        return;
    }

    // Clear old instances if any (cleanup)
    activeWaveSurfers.forEach(ws => ws.destroy());
    activeWaveSurfers = [];

    const trackItems = document.querySelectorAll('.track-item');
    if (!trackItems.length) return;

    console.log(`Initializing ${trackItems.length} waveform players...`);

    trackItems.forEach((item, index) => {
        const url = item.getAttribute('data-url');
        const container = item.querySelector('.waveform-container');
        const playBtn = item.querySelector('.play-btn');
        const timeDisplay = item.querySelector('.track-time');

        // Use a unique ID for the container if needed, or pass element directly
        // WaveSurfer 7 supports passing the HTMLElement directly

        const wavesurfer = WaveSurfer.create({
            container: container,
            waveColor: '#555',       // Darker grey for unplayed
            progressColor: '#3b82f6', // Accent blue for played
            cursorColor: 'transparent', // Hide cursor line or keep it subtle
            barWidth: 2,
            barGap: 3,
            barRadius: 2,
            height: 60,
            responsive: true,
            normalize: true,
            hideScrollbar: true,
            url: url
        });

        activeWaveSurfers.push(wavesurfer);

        // Events
        wavesurfer.on('ready', () => {
            const duration = wavesurfer.getDuration();
            timeDisplay.textContent = formatTime(duration);
        });

        wavesurfer.on('audioprocess', () => {
            const currentTime = wavesurfer.getCurrentTime();
            timeDisplay.textContent = formatTime(currentTime);
        });

        wavesurfer.on('finish', () => {
            playBtn.classList.remove('playing');
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            timeDisplay.textContent = formatTime(wavesurfer.getDuration()); // Reset time display
        });

        // Play Button Click
        playBtn.addEventListener('click', () => {
            // Pause all others
            activeWaveSurfers.forEach(ws => {
                if (ws !== wavesurfer && ws.isPlaying()) {
                    ws.pause();
                    // Reset other buttons logic if needed, but simpler to just handle state update in interaction/play event
                }
            });
            // Update UI for others
            document.querySelectorAll('.play-btn').forEach(btn => {
                if (btn !== playBtn) {
                    btn.classList.remove('playing');
                    btn.innerHTML = '<i class="fas fa-play"></i>';
                }
            });

            wavesurfer.playPause();

            if (wavesurfer.isPlaying()) {
                playBtn.classList.add('playing');
                playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            } else {
                playBtn.classList.remove('playing');
                playBtn.innerHTML = '<i class="fas fa-play"></i>';
            }
        });
    });
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

let gameLoopId = null;
let gameAudioCtx = null;

function initSoundDesignGame() {
    const canvas = document.getElementById('gameCanvas');
    const container = document.getElementById('sound-design-game-area');

    if (!canvas || !container) return;

    if (gameLoopId) cancelAnimationFrame(gameLoopId);

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Game State
    let isPlaying = true;
    let lastTime = 0;

    let damageTexts = [];
    let slashes = [];
    let debris = [];
    let shakeAmt = 0;

    // Boss Object
    const boss = {
        x: width * 0.75,
        y: height / 2,
        size: 90,
        hp: 1000,
        maxHp: 1000,
        flash: 0,
        scale: 1,
        color: '#ff4444',
        angle: 0
    };

    // Hero Object
    const hero = {
        x: width * 0.25,
        y: height / 2,
        size: 50,
        color: '#4488ff',
        floatY: 0
    };

    // Audio Setup
    function initAudio() {
        if (!gameAudioCtx) {
            gameAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (gameAudioCtx.state === 'suspended') {
            gameAudioCtx.resume();
        }
    }

    function playAttackSound(isCrit) {
        if (!gameAudioCtx) return;
        const t = gameAudioCtx.currentTime;

        const noiseBuffer = gameAudioCtx.createBuffer(1, gameAudioCtx.sampleRate * 0.1, gameAudioCtx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

        const noiseSrc = gameAudioCtx.createBufferSource();
        noiseSrc.buffer = noiseBuffer;
        const noiseFilter = gameAudioCtx.createBiquadFilter();
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1000, t);
        noiseFilter.frequency.exponentialRampToValueAtTime(8000, t + 0.1);

        const noiseGain = gameAudioCtx.createGain();
        noiseGain.gain.setValueAtTime(0.3, t);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        noiseSrc.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(gameAudioCtx.destination);
        noiseSrc.start();

        const osc = gameAudioCtx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.2);

        const gain = gameAudioCtx.createGain();
        gain.gain.setValueAtTime(isCrit ? 0.8 : 0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

        osc.connect(gain);
        gain.connect(gameAudioCtx.destination);
        osc.start();
        osc.stop(t + 0.3);

        if (isCrit) {
            const osc2 = gameAudioCtx.createOscillator();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1200, t);
            osc2.frequency.linearRampToValueAtTime(600, t + 0.3);
            const gain2 = gameAudioCtx.createGain();
            gain2.gain.setValueAtTime(0.3, t);
            gain2.gain.exponentialRampToValueAtTime(0.01, t + 0.3);
            osc2.connect(gain2);
            gain2.connect(gameAudioCtx.destination);
            osc2.start();
            osc2.stop(t + 0.4);
        }
    }

    class Debris {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.vx = (Math.random() - 0.5) * 15;
            this.vy = (Math.random() - 0.5) * 15;
            this.life = 1.0;
            this.color = color;
            this.size = Math.random() * 4 + 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.life -= 0.05;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.size, this.size);
            ctx.globalAlpha = 1.0;
        }
    }

    class DamageText {
        constructor(x, y, dmg, isCrit) {
            this.x = x;
            this.y = y;
            this.dmg = dmg;
            this.isCrit = isCrit;
            this.life = 1.0;
            this.vy = -3;
        }
        update() {
            this.y += this.vy;
            this.life -= 0.02;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.font = this.isCrit ? "900 36px 'Orbitron', Arial" : "700 24px 'Orbitron', Arial";
            ctx.fillStyle = this.isCrit ? "#ffdd00" : "#fff";
            ctx.strokeStyle = "rgba(0,0,0,0.8)";
            ctx.lineWidth = 4;
            ctx.textAlign = "center";
            ctx.shadowColor = this.isCrit ? "#ffaa00" : "#00aaff";
            ctx.shadowBlur = 10;
            ctx.strokeText(this.dmg, this.x, this.y);
            ctx.fillText(this.dmg, this.x, this.y);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    class Slash {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.life = 1.0;
            this.angle = Math.random() * Math.PI - (Math.PI / 2);
        }
        update() {
            this.life -= 0.15;
        }
        draw() {
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.angle);

            // Draw energy slash mark
            ctx.beginPath();
            ctx.moveTo(-80, -5);
            ctx.bezierCurveTo(-20, -20, 20, 20, 80, 5);
            ctx.bezierCurveTo(20, 10, -20, -10, -80, -5);
            ctx.fillStyle = "#aaddff";
            ctx.shadowColor = "#0088ff";
            ctx.shadowBlur = 15;
            ctx.fill();

            ctx.restore();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    function drawGrid(t) {
        // Simple perspective grid
        ctx.strokeStyle = 'rgba(68, 136, 255, 0.2)';
        ctx.lineWidth = 1;
        const horizon = height * 0.4;
        const gridSpeed = (t * 0.05) % 40;

        ctx.beginPath();
        // Vertical lines (perspective)
        for (let i = -width; i < width * 2; i += 80) {
            // Draw lines converging to vanishing point(center, horizon)
            // Simpler: just vertical lines that fan out
            const x = i;
            ctx.moveTo(x, horizon);
            ctx.lineTo((x - width / 2) * 5 + width / 2, height);
        }
        // Horizontal lines (moving)
        for (let j = 0; j < 20; j++) {
            const y = horizon + Math.pow(j, 1.5) * 5 + gridSpeed;
            if (y > height) continue;
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
        }
        ctx.stroke();

        // Floor glow
        const grad = ctx.createLinearGradient(0, horizon, 0, height);
        grad.addColorStop(0, 'rgba(68,136,255,0)');
        grad.addColorStop(1, 'rgba(68,136,255,0.1)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, horizon, width, height - horizon);
    }

    function drawHero(t) {
        hero.floatY = Math.sin(t * 0.003) * 5;
        const hx = hero.x;
        const hy = hero.y + hero.floatY;
        const sz = hero.size;

        ctx.save();
        ctx.translate(hx, hy);

        // Cyber Knight Shield Shape
        ctx.beginPath();
        ctx.moveTo(-sz / 2, -sz / 2);
        ctx.lineTo(sz / 2, 0);
        ctx.lineTo(-sz / 2, sz / 2);
        ctx.lineTo(-sz / 4, 0);
        ctx.closePath();

        ctx.fillStyle = hero.color;
        ctx.shadowColor = hero.color;
        ctx.shadowBlur = 20;
        ctx.fill();

        // Core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-sz / 4, 0, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
        ctx.shadowBlur = 0;
    }

    function drawBoss(t) {
        const bx = boss.x;
        const by = boss.y;
        boss.angle += 0.01;

        let pulse = Math.sin(t * 0.01) * 0.1 + 1; // 0.9 to 1.1 scale
        if (boss.scale < 1) {
            // Recoil
            boss.scale += 0.05;
            pulse *= boss.scale;
        }

        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(pulse, pulse);
        ctx.rotate(boss.angle);

        // Spiky Boss Shape
        ctx.beginPath();
        const spikes = 6;
        const outer = boss.size;
        const inner = boss.size * 0.4;
        for (let i = 0; i < spikes * 2; i++) {
            const r = (i % 2 === 0) ? outer : inner;
            const a = (Math.PI * i) / spikes;
            ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();

        ctx.fillStyle = boss.flash > 0 ? '#fff' : '#220000';
        ctx.strokeStyle = boss.flash > 0 ? '#fff' : boss.color;
        ctx.lineWidth = 4;

        ctx.fill();
        ctx.stroke();

        // Glow
        if (!boss.flash) {
            ctx.shadowColor = boss.color;
            ctx.shadowBlur = 30;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }

        if (boss.flash > 0) boss.flash--;

        // Inner Core
        ctx.rotate(-boss.angle * 2);
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.rect(-10, -10, 20, 20);
        ctx.fill();

        ctx.restore();
    }

    function loop(timestamp) {
        if (!isPlaying) return;
        const dt = timestamp - lastTime;
        lastTime = timestamp;

        // Screen shake interaction
        let dx = 0, dy = 0;
        if (shakeAmt > 0) {
            dx = (Math.random() - 0.5) * shakeAmt;
            dy = (Math.random() - 0.5) * shakeAmt;
            shakeAmt *= 0.9;
            if (shakeAmt < 0.5) shakeAmt = 0;
        }

        ctx.save();
        ctx.translate(dx, dy);

        // Clear & Background
        ctx.fillStyle = '#050510';
        ctx.fillRect(-10, -10, width + 20, height + 20);

        drawGrid(timestamp);
        drawHero(timestamp);
        drawBoss(timestamp);

        // Debris
        for (let i = debris.length - 1; i >= 0; i--) {
            debris[i].update();
            debris[i].draw();
            if (debris[i].life <= 0) debris.splice(i, 1);
        }

        // Slashes
        for (let i = slashes.length - 1; i >= 0; i--) {
            slashes[i].update();
            slashes[i].draw();
            if (slashes[i].life <= 0) slashes.splice(i, 1);
        }

        // Damage Text
        for (let i = damageTexts.length - 1; i >= 0; i--) {
            damageTexts[i].update();
            damageTexts[i].draw();
            if (damageTexts[i].life <= 0) damageTexts.splice(i, 1);
        }

        ctx.restore();
        gameLoopId = requestAnimationFrame(loop);
    }

    // Auto-start
    gameLoopId = requestAnimationFrame(loop);

    canvas.addEventListener('mousedown', (e) => {
        if (!isPlaying) return;
        initAudio();

        const isCrit = Math.random() > 0.7;
        const dmg = Math.floor(Math.random() * 8000) + (isCrit ? 5000 : 2000); // Higher numbers logic

        playAttackSound(isCrit);

        // Visuals
        boss.flash = 4;
        boss.scale = 0.8;
        shakeAmt = isCrit ? 25 : 8;

        damageTexts.push(new DamageText(boss.x + (Math.random() - 0.5) * 80, boss.y - 80, dmg, isCrit));
        slashes.push(new Slash(boss.x, boss.y));

        // Spawn debris
        for (let i = 0; i < 10; i++) {
            debris.push(new Debris(boss.x, boss.y, isCrit ? '#ffaa00' : '#ff4444'));
        }
    });
}

/* --- Piano Visualizer Logic --- */
let pianoLoopId = null;

function initPianoVisualizer() {
    const canvas = document.getElementById('pianoCanvas');
    const container = document.getElementById('media-scoring-visual');

    if (!canvas || !container) return;

    if (pianoLoopId) cancelAnimationFrame(pianoLoopId);

    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = container.offsetWidth;
        height = container.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    resize();
    window.addEventListener('resize', resize);

    // Config
    const whiteKeyCount = 14;
    const keyWidth = width / whiteKeyCount;
    const keyHeight = 80;
    const whiteKeys = [];
    const blackKeys = [];

    // Initialize Keys
    for (let i = 0; i < whiteKeyCount; i++) {
        whiteKeys.push({
            x: i * keyWidth,
            y: height - keyHeight,
            w: keyWidth,
            h: keyHeight,
            active: 0,
            note: i
        });
    }
    // Black keys pattern (2, 3, 2...)
    for (let i = 0; i < whiteKeyCount - 1; i++) {
        if (i % 7 !== 2 && i % 7 !== 6) {
            blackKeys.push({
                x: (i + 0.7) * keyWidth,
                y: height - keyHeight,
                w: keyWidth * 0.6,
                h: keyHeight * 0.6,
                active: 0,
                note: i + 0.5
            });
        }
    }

    let notes = [];
    let particles = [];
    let noteTimer = 0;

    // Audio Tone
    function playTone(freq) {
        if (!gameAudioCtx) {
            gameAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (gameAudioCtx.state === 'suspended') gameAudioCtx.resume();

        const osc = gameAudioCtx.createOscillator();
        const gain = gameAudioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, gameAudioCtx.currentTime);

        gain.gain.setValueAtTime(0.05, gameAudioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, gameAudioCtx.currentTime + 1.0);

        osc.connect(gain);
        gain.connect(gameAudioCtx.destination);
        osc.start();
        osc.stop(gameAudioCtx.currentTime + 1.0);
    }

    const baseFreqs = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
    function getFreq(index) {
        const octave = Math.floor(index / 7);
        const note = index % 7;
        return baseFreqs[note] * Math.pow(2, octave);
    }

    class FallingNote {
        constructor() {
            this.targetKeyIndex = Math.floor(Math.random() * whiteKeys.length);
            const target = whiteKeys[this.targetKeyIndex];

            this.w = target.w * 0.8;
            this.h = Math.random() * 40 + 20;
            this.x = target.x + (target.w - this.w) / 2;
            this.y = -100;
            this.speed = Math.random() * 2 + 2;
            this.color = `hsla(${200 + this.targetKeyIndex * 10}, 80%, 60%, 0.8)`;
            this.hit = false;
        }
        update() {
            this.y += this.speed;
            if (!this.hit && this.y + this.h >= height - keyHeight) {
                this.hit = true;
                whiteKeys[this.targetKeyIndex].active = 10;

                for (let i = 0; i < 5; i++) {
                    particles.push({
                        x: this.x + this.w / 2,
                        y: height - keyHeight,
                        vx: (Math.random() - 0.5) * 4,
                        vy: Math.random() * -5 - 2,
                        life: 1,
                        color: this.color
                    });
                }
            }
        }
        draw() {
            if (this.hit) {
                this.h -= this.speed;
                if (this.h <= 0) return;
            }
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillRect(this.x, this.y, this.w, this.h);
            ctx.shadowBlur = 0;
        }
    }

    function loop() {
        ctx.fillStyle = '#0b0b15';
        ctx.fillRect(0, 0, width, height);

        noteTimer++;
        if (noteTimer > 20) {
            notes.push(new FallingNote());
            if (Math.random() > 0.7) notes.push(new FallingNote());
            noteTimer = 0;
        }

        for (let i = notes.length - 1; i >= 0; i--) {
            notes[i].update();
            notes[i].draw();
            if (notes[i].y > height || (notes[i].hit && notes[i].h <= 0)) {
                notes.splice(i, 1);
            }
        }

        whiteKeys.forEach((k, i) => {
            ctx.fillStyle = k.active > 0 ? '#ccddff' : '#eee';
            if (k.active > 0) k.active--;
            ctx.fillRect(k.x + 1, k.y, k.w - 2, k.h);
            ctx.fillStyle = 'rgba(0,0,0,0.1)';
            ctx.fillRect(k.x + 1, k.y + k.h - 10, k.w - 2, 10);
        });

        blackKeys.forEach(k => {
            ctx.fillStyle = '#111';
            ctx.fillRect(k.x, k.y, k.w, k.h);
        });

        for (let i = particles.length - 1; i >= 0; i--) {
            let p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.2;
            p.life -= 0.05;

            ctx.globalAlpha = Math.max(0, p.life);
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;

            if (p.life <= 0) particles.splice(i, 1);
        }

        pianoLoopId = requestAnimationFrame(loop);
    }

    loop();

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (y > height - keyHeight) {
            const index = Math.floor(x / keyWidth);
            if (index >= 0 && index < whiteKeys.length) {
                const k = whiteKeys[index];
                if (k.active === 0) {
                    k.active = 15;
                    playTone(getFreq(index) * 2);
                    for (let i = 0; i < 3; i++) {
                        particles.push({
                            x: k.x + k.w / 2,
                            y: height - keyHeight,
                            vx: (Math.random() - 0.5) * 4,
                            vy: Math.random() * -5 - 2,
                            life: 1,
                            color: '#fff'
                        });
                    }
                }
            }
        }
    });
}

// =========================================
// Post Production Page Interactive Audio
// =========================================

// Global Audio Context for Zap Demo
let zapCtx = null;

function initZapAudio() {
    if (!zapCtx) {
        zapCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (zapCtx.state === 'suspended') {
        zapCtx.resume();
    }
}

// Global function for playing audio demos
window.playDemo = function (element, audioId) {
    // Stop all other audios
    document.querySelectorAll('audio').forEach(audio => {
        if (audio.id !== audioId) {
            audio.pause();
            audio.currentTime = 0;
            // Reset icons
            const parent = audio.parentElement;
            const icon = parent.querySelector('i');
            if (icon) icon.className = 'fas fa-play-circle';
        }
    });

    const audio = document.getElementById(audioId);
    const icon = element.querySelector('i');

    if (audio.paused) {
        audio.play().catch(e => {
            console.error('Audio playback failed:', e);
            alert('오디오를 재생할 수 없습니다. 파일 경로를 확인해주세요.');
        });
        icon.className = 'fas fa-pause-circle';
        // highlight effect handling if needed
    } else {
        audio.pause();
        icon.className = 'fas fa-play-circle';
    }

    audio.onended = function () {
        icon.className = 'fas fa-play-circle';
    };
};

// Global function for Zap Sound (Latency Demo)
window.playZap = function (isDelayed, element) {
    initZapAudio();

    // Visual feedback (Instant Flash)
    const flash = element.querySelector('.flash-overlay');
    const btn = element.querySelector('.trigger-btn');

    // Click animation
    if (btn) {
        btn.style.transform = 'scale(0.9)';
        setTimeout(() => btn.style.transform = 'scale(1)', 100);
    }

    // Flash animation
    if (flash) {
        flash.style.opacity = '0.8';
        setTimeout(() => flash.style.opacity = '0', 50);
    }

    // Audio Logic
    const playSound = () => {
        const t = zapCtx.currentTime;
        const osc = zapCtx.createOscillator();
        const gain = zapCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2000, t); // High freq
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1); // Drop quickly (100ms)

        gain.gain.setValueAtTime(0.5, t);
        gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

        osc.connect(gain);
        gain.connect(zapCtx.destination);

        osc.start(t);
        osc.stop(t + 0.15);
    };

    if (isDelayed) {
        // High Latency: Delay audio by 300ms
        setTimeout(playSound, 300);
    } else {
        // Zero Latency: Play immediately
        playSound();
    }
};


// --- Hero Particle Network Animation ---
function initHeroCanvas() {
    const canvas = document.getElementById('hero-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];

    // Config
    const particleCount = 100; // Number of nodes
    const connectionDistance = 150;
    const mouseDistance = 200;

    let mouse = { x: null, y: null };

    // Resize
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initParticles();
    }

    window.addEventListener('resize', resize);

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });

    canvas.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5; // Slow movement
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1; // 1 to 3px
            this.color = `rgba(200, 200, 200, ${Math.random() * 0.5 + 0.1})`; // Greyish
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Boundary wrap
            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;

            // Mouse Interaction
            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouseDistance) {
                    const forceDirectionX = dx / distance;
                    const forceDirectionY = dy / distance;
                    const force = (mouseDistance - distance) / mouseDistance;

                    // Repel
                    // const directionX = forceDirectionX * force * this.density;
                    // const directionY = forceDirectionY * force * this.density;

                    // Gentle push away
                    this.x -= forceDirectionX * 2;
                    this.y -= forceDirectionY * 2;
                }
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        // Calculate density based on screen size
        const count = (width * height) / 15000; // rough density
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Update and Draw Particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw Connections
        connectParticles();

        requestAnimationFrame(animate);
    }

    function connectParticles() {
        let opacityValue = 1;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a; b < particles.length; b++) {
                let distance = ((particles[a].x - particles[b].x) * (particles[a].x - particles[b].x)) +
                    ((particles[a].y - particles[b].y) * (particles[a].y - particles[b].y));

                if (distance < (connectionDistance * connectionDistance)) {
                    opacityValue = 1 - (distance / 20000);
                    ctx.strokeStyle = `rgba(150, 150, 150, ${opacityValue * 0.2})`; // Faint grey lines
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }

        // Connect to mouse
        if (mouse.x != null) {
            for (let i = 0; i < particles.length; i++) {
                let distance = ((particles[i].x - mouse.x) * (particles[i].x - mouse.x)) +
                    ((particles[i].y - mouse.y) * (particles[i].y - mouse.y));
                if (distance < (mouseDistance * mouseDistance)) {
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.1)`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
    }

    resize();
    animate();
}

// Ensure initHeroCanvas is called
// Ensure initHeroCanvas is called
document.addEventListener('DOMContentLoaded', () => {
    initHeroCanvas();
});

// --- History Back Button Support ---
window.addEventListener('popstate', (event) => {
    const mainContent = document.getElementById('main-content');

    if (event.state && event.state.section) {
        // We are going forward/back to a specific section
        loadSection(null, event.state.section, false);
    } else {
        // We are going back to the Initial State (Home)
        if (mainContent && window.initialMainContent) {
            console.log("Restoring Home Page");

            // Clean up any running loops from sections
            if (typeof gameLoopId !== 'undefined' && gameLoopId) {
                cancelAnimationFrame(gameLoopId);
                gameLoopId = null;
            }
            if (typeof pianoLoopId !== 'undefined' && pianoLoopId) {
                cancelAnimationFrame(pianoLoopId);
                pianoLoopId = null;
            }

            mainContent.innerHTML = window.initialMainContent;

            // Re-initialize Home components
            initLandingCanvas();
            setupScrollReveal();
            // Re-bind CatBar events? No need, onclicks are inline in HTML string.
        }
    }
});
