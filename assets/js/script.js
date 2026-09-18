/* ==========================================================================
   GAWR GURA V2 — MAIN JAVASCRIPT ENGINE
   PRESERVED FUNCTIONALITY + PHASE 1 ANIMATION HOOKS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Flag to mark JS active for CSS fallbacks
    document.body.classList.add('js-enabled');

    // 1. Mobile Menu Drawer Toggle
    initMobileMenu();

    // 2. Lightbox Modal Preview
    initLightbox();

    // 3. Gallery Filtering System
    initGalleryFilter();

    // 4. Web Audio Synthesizer Music Player
    initSynthMusicPlayer();

    // 5. Interactive Message Editor
    initMessageEditor();

    // 6. Canvas Background Particles System
    initOceanCanvas();

    // 7. Phase 1 Scroll Reveal Fallback Initializer
    initScrollRevealFallback();
});

/* --------------------------------------------------------------------------
   1. MOBILE MENU
   -------------------------------------------------------------------------- */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

/* --------------------------------------------------------------------------
   2. LIGHTBOX MODAL
   -------------------------------------------------------------------------- */
function openLightbox(title, desc, imgSrc) {
    const modal = document.getElementById('lightbox-modal');
    const modalImg = document.getElementById('lightbox-img');
    const modalTitle = document.getElementById('lightbox-title');
    const modalDesc = document.getElementById('lightbox-desc');

    if (modal && modalImg && modalTitle && modalDesc) {
        modalImg.src = imgSrc;
        modalTitle.textContent = title;
        modalDesc.textContent = desc;
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function initLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeLightbox();
            }
        });
    }
}

/* --------------------------------------------------------------------------
   3. GALLERY FILTERING
   -------------------------------------------------------------------------- */
function initGalleryFilter() {
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-gura-cyan', 'text-ocean-950');
                b.classList.add('glass-card', 'text-slate-300');
            });

            btn.classList.add('active', 'bg-gura-cyan', 'text-ocean-950');
            btn.classList.remove('glass-card', 'text-slate-300');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                if (filterValue === 'all' || category === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

/* --------------------------------------------------------------------------
   4. WEB AUDIO SYNTHESIZER MUSIC PLAYER
   -------------------------------------------------------------------------- */
let audioCtx = null;
let isPlaying = false;
let currentSongIndex = 0;
let playbackInterval = null;
let currentProgress = 0;

const playlist = [
    {
        title: "REFLECT (Synth Edition)",
        artist: "Gawr Gura • Hololive English",
        cover: "assets/img/reflect.jpg",
        notes: [261.63, 329.63, 392.00, 523.25, 440.00, 349.23, 392.00, 293.66], // Melodic chord progression
        duration: 90
    },
    {
        title: "KING (Cover Synth)",
        artist: "Gawr Gura • Kanaria Cover",
        cover: "assets/img/debut.jpg",
        notes: [220.00, 261.63, 329.63, 440.00, 392.00, 329.63, 293.66, 261.63],
        duration: 105
    },
    {
        title: "Ride on Time (City Pop Remix)",
        artist: "Gawr Gura • Tatsuro Yamashita Cover",
        cover: "assets/img/3d.jpg",
        notes: [329.63, 392.00, 493.88, 587.33, 523.25, 440.00, 392.00, 329.63],
        duration: 120
    }
];

function initSynthMusicPlayer() {
    const playBtn = document.getElementById('play-btn');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationTimeEl = document.getElementById('duration-time');
    const musicContainer = document.getElementById('music');

    if (!playBtn) return;

    playBtn.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        if (isPlaying) {
            pauseTrack();
        } else {
            playTrack();
        }
    });

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
            loadSong(currentSongIndex);
            if (isPlaying) playTrack();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentSongIndex = (currentSongIndex + 1) % playlist.length;
            loadSong(currentSongIndex);
            if (isPlaying) playTrack();
        });
    }

    function loadSong(index) {
        const song = playlist[index];
        const titleEl = document.getElementById('song-title');
        const artistEl = document.getElementById('artist-name');
        const coverEl = document.getElementById('player-cover');

        if (titleEl) titleEl.textContent = song.title;
        if (artistEl) artistEl.textContent = song.artist;
        if (coverEl) coverEl.src = song.cover;

        currentProgress = 0;
        updateProgressUI(0, song.duration);
    }

    function playTrack() {
        isPlaying = true;
        if (playIcon) playIcon.className = "fa-solid fa-pause";
        if (musicContainer) musicContainer.classList.add('music-playing');

        playSynthTone();

        const song = playlist[currentSongIndex];
        if (playbackInterval) clearInterval(playbackInterval);

        playbackInterval = setInterval(() => {
            currentProgress++;
            updateProgressUI(currentProgress, song.duration);

            if (currentProgress % 3 === 0) {
                playSynthTone();
            }

            if (currentProgress >= song.duration) {
                currentSongIndex = (currentSongIndex + 1) % playlist.length;
                loadSong(currentSongIndex);
            }
        }, 1000);
    }

    function pauseTrack() {
        isPlaying = false;
        if (playIcon) playIcon.className = "fa-solid fa-play ml-1";
        if (musicContainer) musicContainer.classList.remove('music-playing');
        if (playbackInterval) clearInterval(playbackInterval);
    }

    function playSynthTone() {
        if (!audioCtx) return;
        try {
            const song = playlist[currentSongIndex];
            const randomFreq = song.notes[Math.floor(Math.random() * song.notes.length)];
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(randomFreq, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 1.2);
            
            animateEqualizer();
        } catch (e) {
            console.log('Audio Context playback notice:', e);
        }
    }

    function updateProgressUI(current, max) {
        if (progressBar) {
            const percent = (current / max) * 100;
            progressBar.style.width = `${percent}%`;
        }
        if (currentTimeEl) currentTimeEl.textContent = formatTime(current);
        if (durationTimeEl) durationTimeEl.textContent = formatTime(max);
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    function animateEqualizer() {
        const bars = document.querySelectorAll('.eq-bar');
        bars.forEach(bar => {
            const randomH = Math.floor(Math.random() * 32) + 8;
            bar.style.height = `${randomH}px`;
        });
    }
}

/* --------------------------------------------------------------------------
   5. INTERACTIVE MESSAGE EDITOR
   -------------------------------------------------------------------------- */
function toggleEditMessage() {
    const displayDiv = document.getElementById('message-display');
    const editorDiv = document.getElementById('message-editor');
    const btnText = document.getElementById('edit-btn-text');
    const pText = document.getElementById('msg-text-paragraph');
    const inputArea = document.getElementById('custom-msg-input');

    if (displayDiv && editorDiv && btnText && pText && inputArea) {
        if (editorDiv.classList.contains('hidden')) {
            editorDiv.classList.remove('hidden');
            displayDiv.classList.add('hidden');
            btnText.textContent = "Simpan Pesan";
        } else {
            pText.textContent = `"${inputArea.value}"`;
            editorDiv.classList.add('hidden');
            displayDiv.classList.remove('hidden');
            btnText.textContent = "Edit Pesan";
        }
    }
}

function initMessageEditor() {
    // Global scope binding for inline HTML onclick handlers
    window.toggleEditMessage = toggleEditMessage;
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
}

/* --------------------------------------------------------------------------
   6. CANVAS PARTICLES SYSTEM (BUBBLE SIMULATION)
   -------------------------------------------------------------------------- */
function initOceanCanvas() {
    const canvas = document.getElementById('ocean-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Particle {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.radius = Math.random() * 3 + 1;
            this.speed = Math.random() * 1.2 + 0.4;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.swing = Math.random() * 0.02;
            this.swingStep = Math.random() * Math.PI * 2;
        }

        update() {
            this.y -= this.speed;
            this.swingStep += this.swing;
            this.x += Math.sin(this.swingStep) * 0.5;

            if (this.y < -20) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 242, 254, ${this.opacity})`;
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00f2fe';
            ctx.fill();
            ctx.closePath();
        }
    }

    const particles = Array.from({ length: 35 }, () => new Particle());

    function render() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(render);
    }

    render();
}

/* --------------------------------------------------------------------------
   7. SCROLL REVEAL FALLBACK (PHASE 1 VISIBILITY GUARANTEE)
   -------------------------------------------------------------------------- */
function initScrollRevealFallback() {
    const revealElements = document.querySelectorAll('.reveal-on-scroll');
    
    // Auto reveal elements as fallback so content is immediately visible & animated
    const handleScroll = () => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.88) {
                el.classList.add('is-revealed');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    setTimeout(handleScroll, 100);
}