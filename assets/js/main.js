// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // 1. Custom Cursor setup
    const cursor = document.querySelector('.cursor');
    const cursorFollower = document.querySelector('.cursor-follower');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button');

    // Only apply custom cursor on non-touch devices
    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Move inner cursor instantly (0 latency)
            gsap.set(cursor, {
                x: mouseX,
                y: mouseY
            });
        });

        // Snappy follow for outer ring
        gsap.ticker.add(() => {
            followerX += (mouseX - followerX) * 0.35;
            followerY += (mouseY - followerY) * 0.35;

            gsap.set(cursorFollower, {
                x: followerX,
                y: followerY
            });
        });

        // Hover states
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursor.classList.add('hovered');
                cursorFollower.classList.add('hovered');
            });
            target.addEventListener('mouseleave', () => {
                cursor.classList.remove('hovered');
                cursorFollower.classList.remove('hovered');
            });
        });
    }

    // 2. Magnetic effect for specific elements
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach((elem) => {
        elem.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const strength = this.getAttribute('data-strength') || 20;

            // Get mouse position relative to element center
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            gsap.to(this, {
                x: x / rect.width * strength,
                y: y / rect.height * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        elem.addEventListener('mouseleave', function () {
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        });
    });

    // Helper function to split text into inline-block spans for individual animations
    function splitTextIntoSpans(element) {
        const text = element.textContent.trim();
        element.innerHTML = "";
        [...text].forEach(char => {
            const span = document.createElement("span");
            span.className = "char-trigger";
            if (char === " ") {
                span.innerHTML = "&nbsp;";
            } else {
                span.textContent = char;
            }
            element.appendChild(span);
        });
    }

    // Prepare intro title characters for animation
    const introTitle = document.querySelector(".intro-title");
    if (introTitle) splitTextIntoSpans(introTitle);

    // Split hero name lines into individual character spans for per-letter animation
    const heroNameLines = document.querySelectorAll(".hero-name-line");
    heroNameLines.forEach(line => {
        const text = line.textContent.trim();
        line.innerHTML = "";
        [...text].forEach(char => {
            const span = document.createElement("span");
            span.className = "char";
            span.textContent = char === " " ? "\u00A0" : char;
            line.appendChild(span);
        });
    });

    // Dynamic font size fitter — shrinks font if text overflows container
    function fitTextElements() {
        const linesToFit = [...heroNameLines];

        linesToFit.forEach(line => {
            if (!line) return;
            const container = line.closest(".hero-content, .intro-text") || line.parentElement;
            if (!container) return;

            const cs = getComputedStyle(container);
            const padding = parseFloat(cs.paddingLeft || 0) + parseFloat(cs.paddingRight || 0);
            let maxWidth = container.clientWidth - padding;
            
            // Failsafe for containers that don't have a strict width
            const safeMaxWidth = window.innerWidth * 0.9;
            if (maxWidth > safeMaxWidth || maxWidth === 0) maxWidth = safeMaxWidth;

            // Reset to CSS default
            line.style.fontSize = "";
            const text = line.textContent;
            
            // Create hidden measurer with same font
            const measurer = document.createElement("span");
            measurer.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;pointer-events:none;";
            measurer.style.fontFamily = getComputedStyle(line).fontFamily;
            measurer.style.fontWeight = getComputedStyle(line).fontWeight;
            measurer.style.letterSpacing = getComputedStyle(line).letterSpacing;
            measurer.style.textTransform = "uppercase";
            measurer.textContent = text;
            document.body.appendChild(measurer);

            let size = parseFloat(getComputedStyle(line).fontSize);
            measurer.style.fontSize = size + "px";

            // Shrink until text fits (down to 8px if needed)
            while (measurer.offsetWidth > maxWidth && size > 8) {
                size -= 1;
                measurer.style.fontSize = size + "px";
            }

            document.body.removeChild(measurer);
            line.style.fontSize = size + "px";
        });
    }

    fitTextElements();
    window.addEventListener("resize", fitTextElements);

    // Set initial states for main page elements to prevent flashing
    gsap.set(".navbar", { y: -30, opacity: 0 });
    gsap.set(".subtitle", { y: 80, opacity: 0 });
    gsap.set(".hero-name-line .char", { opacity: 0, y: 60, rotationX: -80 });
    gsap.set(".hero-desc", { y: 80, opacity: 0 });
    gsap.set(".hero-cta", { y: 80, opacity: 0 });
    gsap.set(".scroll-indicator", { opacity: 0 });

    // 3. Intro Sequence Animations
    const introTl = gsap.timeline();

    // First, show the particle
    gsap.fromTo(".intro-particle",
        { scale: 0.3, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" }
    );

    // Continuous pulse on particle
    const pulseTween = gsap.to(".intro-particle", {
        scale: 1.4,
        opacity: 0.8,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut"
    });

    // Morph particle to rotating cyber core
    introTl.to(".intro-particle", {
        scale: 4,
        opacity: 0,
        duration: 0.8,
        ease: "power2.inOut",
        onComplete: () => {
            pulseTween.kill();
            const particle = document.querySelector(".intro-particle");
            if (particle) particle.style.display = "none";
        }
    }, "+=0.2");

    introTl.to(".intro-core", {
        scale: 1,
        opacity: 1,
        duration: 1.0,
        ease: "elastic.out(1, 0.75)"
    }, "-=0.8");

    // Swing-down 3D reveal for "hello !" characters
    introTl.fromTo(".intro-title .char-trigger",
        {
            opacity: 0,
            y: 40,
            rotationX: -90,
            transformPerspective: 600,
            transformOrigin: "50% 0%"
        },
        {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.8,
            stagger: 0.06,
            ease: "back.out(2.5)"
        },
        "-=0.6"
    );

    // Reveal divider line
    introTl.to(".intro-divider", {
        width: "140px",
        duration: 0.8,
        ease: "power2.inOut"
    }, "-=0.5");

    // Reveal subtitles with snappy elastic pop
    introTl.fromTo(".intro-sub-item",
        {
            opacity: 0,
            y: 35,
            scale: 0.95
        },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: "back.out(2)"
        },
        "-=0.4"
    );

    // Reveal Initialize button
    introTl.to(".intro-trigger-container", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.3");

    // Interactive Canvas Plexus Background Setup
    const canvas = document.querySelector(".intro-canvas");
    if (canvas) {
        const ctx = canvas.getContext("2d");
        let particles = [];
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;

        const maxParticles = Math.min(80, Math.floor((width * height) / 15000));
        let mouse = { x: null, y: null, radius: 180 };

        window.addEventListener("resize", () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener("mousemove", (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });
        window.addEventListener("mouseout", () => {
            mouse.x = null;
            mouse.y = null;
        });

        window.introCanvasPhase = 'normal';
        window.sliderProgress = 0;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 1.5;
                this.vy = (Math.random() - 0.5) * 1.5;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                // Bounce off edges correctly to avoid getting trapped
                if (this.x <= 0) { this.x = 0; this.vx = Math.abs(this.vx); }
                if (this.x >= width) { this.x = width; this.vx = -Math.abs(this.vx); }
                if (this.y <= 0) { this.y = 0; this.vy = Math.abs(this.vy); }
                if (this.y >= height) { this.y = height; this.vy = -Math.abs(this.vy); }

                if (window.introCanvasPhase === 'normal') {
                    // Apply friction if moving too fast (e.g. after explosion)
                    const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
                    if (speed > 1) {
                        this.vx *= 0.94;
                        this.vy *= 0.94;
                    }

                    // Pull towards center based on slider progress
                    if (window.sliderProgress > 0) {
                        const cx = width / 2;
                        const cy = height / 2;
                        const dx = cx - this.x;
                        const dy = cy - this.y;
                        this.vx += dx * 0.003 * window.sliderProgress;
                        this.vy += dy * 0.003 * window.sliderProgress;
                    }

                    // Mouse repel
                    if (mouse.x !== null && mouse.y !== null) {
                        const dx = this.x - mouse.x;
                        const dy = this.y - mouse.y;
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        if (dist < mouse.radius) {
                            const force = (mouse.radius - dist) / mouse.radius;
                            this.vx -= (dx / dist) * force * 1.5;
                            this.vy -= (dy / dist) * force * 1.5;
                        }
                    }
                } else if (window.introCanvasPhase === 'implode') {
                    const cx = width / 2;
                    const cy = height / 2;
                    const dx = cx - this.x;
                    const dy = cy - this.y;
                    this.vx += dx * 0.035;
                    this.vy += dy * 0.035;
                    // Apply strong friction so they gather cleanly at center and do not slingshot past it
                    this.vx *= 0.82;
                    this.vy *= 0.82;
                } else if (window.introCanvasPhase === 'explode') {
                    const cx = width / 2;
                    const cy = height / 2;
                    const dx = this.x - cx;
                    const dy = this.y - cy;
                    // Authoritatively overwrite velocity for a consistent, smooth outward burst
                    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) {
                        const angle = Math.random() * Math.PI * 2;
                        this.vx = Math.cos(angle) * 7;
                        this.vy = Math.sin(angle) * 7;
                    } else {
                        const dist = Math.sqrt(dx * dx + dy * dy);
                        this.vx = (dx / dist) * 10;
                        this.vy = (dy / dist) * 10;
                    }
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = "rgba(0, 240, 255, 0.4)";
                ctx.fill();
            }
        }

        for (let i = 0; i < maxParticles; i++) {
            particles.push(new Particle());
        }

        function animate() {
            ctx.clearRect(0, 0, width, height);

            ctx.fillStyle = "rgba(0, 240, 255, 0.015)";
            const gridSize = 40;
            for (let x = 0; x < width; x += gridSize) {
                for (let y = 0; y < height; y += gridSize) {
                    ctx.fillRect(x, y, 1, 1);
                }
            }

            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Reset explosion phase immediately after exactly one frame has processed it
            if (window.introCanvasPhase === 'explode') {
                window.introCanvasPhase = 'normal';
            }

            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i];
                    const p2 = particles[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 100) {
                        const alpha = ((100 - dist) / 100) * 0.15;
                        ctx.beginPath();
                        ctx.moveTo(p1.x, p1.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }

                if (mouse.x !== null && mouse.y !== null) {
                    const p = particles[i];
                    const dx = p.x - mouse.x;
                    const dy = p.y - mouse.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < mouse.radius) {
                        const alpha = ((mouse.radius - dist) / mouse.radius) * 0.25;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouse.x, mouse.y);
                        ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
                        ctx.lineWidth = 0.7;
                        ctx.stroke();
                    }
                }
            }

            if (document.body.contains(canvas)) {
                requestAnimationFrame(animate);
            }
        }
        animate();
    }

    // Slide to Access Decryption Lock
    const sliderContainer = document.querySelector(".intro-slider-container");
    const sliderHandle = document.querySelector(".intro-slider-handle");
    const sliderFill = document.querySelector(".intro-slider-fill");
    const sliderText = document.querySelector(".intro-slider-text");

    if (sliderContainer && sliderHandle) {
        let isDragging = false;
        let startX = 0;
        let containerWidth = sliderContainer.clientWidth;
        let handleWidth = sliderHandle.clientWidth;
        let maxX = containerWidth - handleWidth - 6;

        const onDragStart = (e) => {
            isDragging = true;
            startX = (e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : 0)) - (parseFloat(sliderHandle.style.left) || 3);
            sliderHandle.style.transition = "none";
            sliderFill.style.transition = "none";
            document.body.style.cursor = "grabbing";
        };

        const onDragMove = (e) => {
            if (!isDragging) return;
            const clientX = e.clientX || (e.touches && e.touches[0] ? e.touches[0].clientX : null);
            if (clientX === null) return;

            let x = clientX - startX;
            if (x < 3) x = 3;
            if (x > maxX + 3) x = maxX + 3;

            sliderHandle.style.left = x + "px";
            sliderFill.style.width = (x + handleWidth / 2) + "px";

            const progress = (x - 3) / maxX;
            window.sliderProgress = progress;
            sliderText.style.opacity = Math.max(0, 1 - progress * 1.5);
        };

        const onDragEnd = () => {
            if (!isDragging) return;
            isDragging = false;
            document.body.style.cursor = "";

            const currentX = parseFloat(sliderHandle.style.left) || 3;
            if (currentX >= maxX - 10) {
                sliderHandle.style.left = (maxX + 3) + "px";
                sliderFill.style.width = "100%";
                sliderContainer.classList.add("unlocked", "scanning");

                const handleIcon = sliderHandle.querySelector(".handle-icon");
                const successIcon = sliderHandle.querySelector(".success-icon");
                if (handleIcon) handleIcon.style.display = "none";
                if (successIcon) successIcon.style.display = "block";

                sliderText.textContent = "ACCESS GRANTED";
                sliderText.style.opacity = "1";

                // Turn off slider gravity so explosion can happen freely
                window.sliderProgress = 0;

                // Canvas Implode/Explode effect
                window.introCanvasPhase = 'implode';
                setTimeout(() => {
                    window.introCanvasPhase = 'explode';
                }, 400); // Explode outward when core vanishes
                // (It will automatically switch back to 'normal' internally inside Particle.update)

                setTimeout(() => {
                    const exitTl = gsap.timeline({
                        onComplete: () => {
                            document.body.classList.remove("loading");
                            const overlay = document.querySelector(".intro-overlay");
                            const canvasBg = document.querySelector(".intro-canvas");
                            if (canvasBg && overlay) {
                                // Transition the canvas to the main site background
                                canvasBg.classList.add("main-bg");
                                document.body.insertBefore(canvasBg, document.body.firstChild);
                            }
                            if (overlay) overlay.remove();
                            runMainReveal();
                        }
                    });

                    exitTl.to(sliderContainer, {
                        scale: 0.95,
                        opacity: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });

                    // Cool cyber-implode fade out for the core
                    exitTl.to(".intro-core", {
                        scale: 0.3,
                        rotation: 90,
                        opacity: 0,
                        duration: 0.7,
                        ease: "back.in(1.5)"
                    }, "-=0.1");

                    exitTl.to(".intro-text", {
                        y: -60,
                        opacity: 0,
                        duration: 0.8,
                        ease: "power3.in"
                    }, "-=1.2");

                    exitTl.to(".intro-overlay", {
                        opacity: 0,
                        duration: 0.9,
                        ease: "power2.out"
                    }, "-=0.7");
                }, 600);
            } else {
                sliderHandle.style.transition = "left 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                sliderFill.style.transition = "width 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
                sliderHandle.style.left = "3px";
                sliderFill.style.width = "0%";
                sliderText.style.opacity = "1";
                window.sliderProgress = 0; // Reset canvas particles
            }
        };

        sliderHandle.addEventListener("mousedown", onDragStart);
        sliderHandle.addEventListener("touchstart", onDragStart, { passive: true });

        window.addEventListener("mousemove", onDragMove);
        window.addEventListener("touchmove", onDragMove, { passive: false });

        window.addEventListener("mouseup", onDragEnd);
        window.addEventListener("touchend", onDragEnd);

        window.addEventListener("resize", () => {
            containerWidth = sliderContainer.clientWidth;
            handleWidth = sliderHandle.clientWidth;
            maxX = containerWidth - handleWidth - 6;
        });
    }

    // Page Reveal Timeline
    function runMainReveal() {
        const mainTl = gsap.timeline();

        // Navbar
        mainTl.fromTo(".navbar",
            { y: -30, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
        );

        // Subtitle
        mainTl.fromTo(".subtitle",
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
            "-=0.4"
        );

        // First name — per-character 3D flip
        mainTl.to("#hero-first .char", {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.05,
            ease: "back.out(2)",
            transformPerspective: 600
        }, "-=0.3");

        // Surname — per-character 3D flip (slightly delayed)
        mainTl.to("#hero-last .char", {
            opacity: 1,
            y: 0,
            rotationX: 0,
            duration: 0.6,
            stagger: 0.035,
            ease: "back.out(2)",
            transformPerspective: 600
        }, "-=0.3");

        // Gradient shimmer sweep across both names
        mainTl.add(() => {
            document.querySelectorAll(".hero-name-line").forEach(line => {
                line.classList.add("shimmer-active");
            });
        }, "-=0.1");

        // Glowing underline reveal
        mainTl.add(() => {
            document.querySelector(".hero-title").classList.add("line-reveal");
        }, "-=0.5");

        // Description
        mainTl.fromTo(".hero-desc",
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: "power4.out" },
            "-=0.6"
        );

        // CTA button
        mainTl.fromTo(".hero-cta",
            { y: 80, opacity: 0 },
            {
                y: 0, opacity: 1, duration: 0.8, ease: "power4.out",
                onComplete: () => {
                    gsap.set(".hero-cta", { overflow: "visible" });
                }
            },
            "-=0.5"
        );

        // Scroll indicator
        mainTl.fromTo(".scroll-indicator",
            { opacity: 0 },
            { opacity: 0.5, duration: 1 },
            "-=0.5"
        );
    }

    // 4. Smart/Hide Navbar on Scroll Down
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        let currentScroll = window.pageYOffset || document.documentElement.scrollTop;

        // If scrolling down and past the initial 100px
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            navbar.classList.add('nav-hidden');
        } else {
            // Scrolling up or at the very top
            navbar.classList.remove('nav-hidden');
        }

        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll; // Avoid negative values on bounce back
    }, { passive: true });

    // 5. Scroll Animations (GSAP ScrollTrigger)

    // Reveal text elements (fade and translate up)
    const revealElements = document.querySelectorAll('.reveal-up');
    revealElements.forEach((elem) => {
        gsap.fromTo(elem,
            { y: 50, opacity: 0 },
            {
                y: 0,
                opacity: 1,
                duration: 0.8,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: elem,
                    start: "top 85%", // animation starts when top of element hits 85% of viewport height
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Line animations
    const lines = document.querySelectorAll('.line');
    lines.forEach((line) => {
        gsap.fromTo(line,
            { scaleX: 0 },
            {
                scaleX: 1,
                duration: 1,
                ease: "power3.inOut",
                scrollTrigger: {
                    trigger: line,
                    start: "top 90%"
                }
            }
        );
    });

    // Certifications Staggered Reveal
    gsap.fromTo(".cert-item",
        { x: -50, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".cert-list",
                start: "top 80%"
            }
        }
    );

    // Tags Staggered Reveal
    gsap.fromTo(".tag",
        { scale: 0.8, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 0.4,
            stagger: 0.05,
            ease: "back.out(1.7)",
            scrollTrigger: {
                trigger: ".tags",
                start: "top 85%"
            }
        }
    );

    // Nav link scroll spy — glow active section link
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    link.classList.remove("active");
                    if (link.getAttribute("href") === `#${id}`) {
                        link.classList.add("active");
                    }
                });
            }
        });
    }, {
        threshold: 0,
        rootMargin: "-40% 0px -50% 0px"
    });

    sections.forEach(section => scrollSpyObserver.observe(section));

    // ==========================================
    // 6. 3D PERSPECTIVE CAROUSEL & PORTAL SHOWCASE
    // ==========================================

    // Dynamic Blueprint SVG Generator
    function getBlueprintSVG(projectId, slideIndex) {
        if (projectId === 'furrytails') {
            if (slideIndex === 0) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <path d="M 10 30 L 100 30" stroke="var(--accent-color)" stroke-width="2" />
                    <path d="M 590 350 L 500 350" stroke="var(--accent-color)" stroke-width="2" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">VET_CLINIC_APPOINTMENTS // TIME_SLOTS</text>
                    <g transform="translate(30, 80)">
                        <rect x="0" y="0" width="220" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1" fill="none" />
                        <text x="10" y="25" font-family="Courier, monospace" font-size="11" fill="#fff">APPOINTMENT SCHEDULER</text>
                        <line x1="10" y1="35" x2="210" y2="35" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        
                        <g transform="translate(15, 50)" font-family="Courier, monospace" font-size="9" fill="#ccc">
                            <text x="0" y="10">09:00 AM [BOOKED]</text>
                            <rect x="145" y="0" width="45" height="12" rx="2" fill="rgba(255, 0, 0, 0.15)" stroke="red" stroke-width="0.5" />
                            <text x="148" y="9" font-size="7" fill="red">UNAVAIL</text>

                            <text x="0" y="30">10:00 AM [PENDING]</text>
                            <rect x="145" y="20" width="45" height="12" rx="2" fill="rgba(255, 165, 0, 0.15)" stroke="orange" stroke-width="0.5" />
                            <text x="148" y="29" font-size="7" fill="orange">PENDING</text>

                            <text x="0" y="50">11:00 AM [AVAILABLE]</text>
                            <rect x="145" y="40" width="45" height="12" rx="2" fill="rgba(0, 240, 255, 0.15)" stroke="var(--accent-color)" stroke-width="0.5" class="bp-pulse" />
                            <text x="148" y="49" font-size="7" fill="var(--accent-color)">SELECT</text>

                            <text x="0" y="70">12:00 PM [AVAILABLE]</text>
                            <rect x="145" y="60" width="45" height="12" rx="2" fill="rgba(0, 240, 255, 0.05)" stroke="rgba(0, 240, 255, 0.3)" stroke-width="0.5" />
                            <text x="148" y="69" font-size="7" fill="#888">SELECT</text>
                            
                            <text x="0" y="90">01:00 PM [AVAILABLE]</text>
                            <rect x="145" y="80" width="45" height="12" rx="2" fill="rgba(0, 240, 255, 0.05)" stroke="rgba(0, 240, 255, 0.3)" stroke-width="0.5" />
                            <text x="148" y="89" font-size="7" fill="#888">SELECT</text>
                        </g>
                        <text x="15" y="180" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" opacity="0.8">SLOT_INTERVAL: 60 MIN</text>
                    </g>
                    <g transform="translate(280, 80)">
                        <rect x="0" y="0" width="290" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#fff">APPOINTMENT SUMMARY</text>
                        <line x1="15" y1="35" x2="275" y2="35" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        <rect x="15" y="50" width="260" height="25" rx="3" stroke="rgba(0, 240, 255, 0.2)" fill="rgba(0,240,255,0.03)" />
                        <text x="25" y="66" font-family="Courier, monospace" font-size="9" fill="#bbb">PET: Rocky (G. Shepherd)</text>
                        
                        <rect x="15" y="85" width="260" height="25" rx="3" stroke="rgba(0, 240, 255, 0.2)" fill="rgba(0,240,255,0.03)" />
                        <text x="25" y="101" font-family="Courier, monospace" font-size="9" fill="#bbb">SERVICE: Anti-Rabies Vaccine</text>
                        
                        <g transform="translate(15, 122)">
                            <text x="0" y="12" font-family="Courier, monospace" font-size="9" fill="#888">SERVICE BASE FEE ............. $35.00</text>
                            <text x="0" y="27" font-family="Courier, monospace" font-size="9" fill="#888">SCHEDULING TARIFF ............ $0.00</text>
                            <line x1="0" y1="35" x2="260" y2="35" stroke="rgba(0,240,255,0.15)" stroke-width="1" stroke-dasharray="3 3" />
                            <text x="0" y="52" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">TOTAL DUE: $35.00</text>
                        </g>
                    </g>
                    <path d="M 30 310 L 570 310" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                    <circle cx="45" cy="330" r="4" fill="var(--accent-color)" class="bp-pulse" />
                    <text x="60" y="334" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" opacity="0.8">TIMESLOT_VALIDATOR: STABLE</text>
                    <rect x="460" y="320" width="110" height="22" rx="3" stroke="var(--accent-color)" fill="rgba(0,240,255,0.05)" />
                    <text x="475" y="335" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">SUBMIT_APPT</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">PET_BOARDING_LODGING // CAPACITY_CHECK</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="540" height="210" rx="4" stroke="rgba(0, 240, 255, 0.4)" stroke-width="1" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="var(--accent-secondary)" font-weight="bold">LODGING SCHEDULER & CAPACITY</text>
                        <line x1="15" y1="35" x2="525" y2="35" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" />
                        
                        <g transform="translate(20, 50)" font-family="Courier, monospace" font-size="10" fill="#ccc">
                            <text x="0" y="15">BOARDING TYPE: [OVERNIGHT]</text>
                            <rect x="240" y="2" width="260" height="20" rx="3" stroke="rgba(0, 240, 255, 0.2)" fill="rgba(0,240,255,0.03)" />
                            <text x="250" y="15" fill="#888">Daycare | *Overnight* | Extended</text>
                            
                            <text x="0" y="50">START DATE: [JUNE 15, 2025]</text>
                            <text x="270" y="50">END DATE: [JUNE 18, 2025] (3 DAYS)</text>
                            
                            <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(0, 240, 255, 0.15)" stroke-width="1" />
                            
                            <text x="0" y="105" fill="var(--accent-color)" font-weight="bold">DB_LOCK: checkBoardingCapacity()</text>
                            <text x="0" y="125">OCCUPANTS IN DATE RANGE: 14 CLIENTS</text>
                            <text x="0" y="145">MAX LODGING LIMIT: 20 CORES</text>
                        </g>
                    </g>
                    <g transform="translate(30, 310)">
                        <text x="0" y="15" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">CAPACITY RATIO:</text>
                        <rect x="150" y="3" width="200" height="15" rx="3" stroke="rgba(0,240,255,0.3)" fill="none" />
                        <rect x="153" y="6" width="140" height="9" rx="2" fill="var(--accent-color)" class="bp-pulse" />
                        <text x="365" y="15" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)">70% OCCUPIED // 6 VACANT</text>
                    </g>
                </svg>
                `;
            } else if (slideIndex === 2) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">PAYMENT_REGISTRY // POLYMORPHIC_VERIFICATION</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="20" y="25" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">BILLING DETAILS</text>
                        <line x1="20" y1="35" x2="220" y2="35" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="60" font-family="Courier, monospace" font-size="9" fill="#888">PAYEE ID: .... USER_ID#0482</text>
                        <text x="20" y="80" font-family="Courier, monospace" font-size="9" fill="#888">PAYABLE TYPE: . App\\\\Models\\\\Boarding</text>
                        <text x="20" y="100" font-family="Courier, monospace" font-size="9" fill="#888">TOTAL BILL: ... $135.00</text>
                        <line x1="20" y1="120" x2="220" y2="120" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="145" font-family="Courier, monospace" font-size="9" fill="#fff">METHOD: GCash</text>
                        <text x="20" y="165" font-family="Courier, monospace" font-size="9" fill="#fff">TYPE: 30% Deposit ($40.50)</text>
                        <text x="20" y="190" font-family="Courier, monospace" font-size="9" fill="var(--accent-secondary)" font-weight="bold">REF NO: 2025091512345</text>
                    </g>
                    <g transform="translate(290, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">STAFF VERIFICATION QUEUE</text>
                        <line x1="15" y1="32" x2="265" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <text x="15" y="55" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">STATUS: PENDING STAFF SIGN-OFF</text>
                        
                        <g transform="translate(15, 80)" font-family="Courier, monospace" font-size="9" fill="#ccc">
                            <text x="0" y="10">GCash Ref Format ..... [13 Digits] OK</text>
                            <text x="0" y="30">User Verification ... [Google Sign-in] OK</text>
                            <text x="0" y="50">Polymorphic Link .... [BoardingID #12] OK</text>
                        </g>
                        
                        <g transform="translate(15, 160)">
                            <text x="0" y="12" font-family="Courier, monospace" font-size="9" fill="#fff">EMAIL NOTIFIER TRIGGERS:</text>
                            <rect x="0" y="22" width="10" height="10" stroke="var(--accent-color)" fill="rgba(0,240,255,0.2)" />
                            <path d="M 2 27 L 4 29 L 8 23" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                            <text x="18" y="31" font-family="Courier, monospace" font-size="9" fill="#ccc">BookingConfirmation Mail</text>
                        </g>
                    </g>
                    <g transform="translate(30, 310)">
                        <rect x="0" y="0" width="540" height="30" rx="3" stroke="rgba(0, 240, 255, 0.3)" fill="rgba(0, 240, 255, 0.05)" stroke-width="1" />
                        <text x="20" y="19" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold">TRANSACTION: PENDING STAFF VERIFICATION TO COMPLETE RESERVATION</text>
                    </g>
                </svg>
                `;
            }
        } else if (projectId === 'insightful') {
            if (slideIndex === 0) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <rect x="25" y="45" width="370" height="280" rx="4" stroke="rgba(0, 240, 255, 0.5)" stroke-width="1.5" fill="none" />
                    <path d="M 35 55 L 35 70 M 35 55 L 50 55" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <path d="M 385 55 L 385 70 M 385 55 L 370 55" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <path d="M 35 305 L 35 290 M 35 305 L 50 305" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <path d="M 385 305 L 385 290 M 385 305 L 370 305" stroke="var(--accent-color)" stroke-width="2.5" fill="none" />
                    <circle cx="210" cy="185" r="45" stroke="var(--accent-color)" stroke-width="1.2" stroke-dasharray="4 4" fill="none" class="bp-rotate" />
                    <circle cx="210" cy="185" r="15" stroke="var(--accent-color)" stroke-width="1" fill="none" />
                    <line x1="210" y1="130" x2="210" y2="240" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" />
                    <line x1="155" y1="185" x2="265" y2="185" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" />
                    <g transform="translate(60, 150)">
                        <rect x="0" y="0" width="80" height="100" rx="2" stroke="var(--accent-color)" stroke-width="1.5" fill="none" stroke-dasharray="4 2" />
                        <rect x="0" y="-18" width="65" height="18" fill="var(--accent-color)" />
                        <text x="5" y="-5" font-family="Courier, monospace" font-size="9" fill="#000" font-weight="bold">CUP 98%</text>
                    </g>
                    <g transform="translate(190, 210)">
                        <rect x="0" y="0" width="180" height="70" rx="2" stroke="var(--accent-secondary)" stroke-width="1.5" fill="none" stroke-dasharray="4 2" />
                        <rect x="0" y="-18" width="90" height="18" fill="var(--accent-secondary)" />
                        <text x="5" y="-5" font-family="Courier, monospace" font-size="9" fill="#000" font-weight="bold">KEYBOARD 91%</text>
                    </g>
                    <g transform="translate(415, 45)">
                        <rect x="0" y="0" width="160" height="280" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="12" y="25" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">VISION SYSTEM</text>
                        <line x1="12" y1="35" x2="148" y2="35" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="55" font-family="Courier, monospace" font-size="9" fill="#888" class="bp-pulse">STATUS: CAPTURING</text>
                        <text x="12" y="75" font-family="Courier, monospace" font-size="9" fill="#888">FPS: 30.0</text>
                        <text x="12" y="95" font-family="Courier, monospace" font-size="9" fill="#888">LATENCY: 12MS</text>
                        <line x1="12" y1="110" x2="148" y2="110" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="130" font-family="Courier, monospace" font-size="8" fill="var(--accent-color)">> OBJ_01: CUP</text>
                        <text x="12" y="145" font-family="Courier, monospace" font-size="8" fill="var(--accent-color)">  CONF: 0.9841</text>
                        <text x="12" y="165" font-family="Courier, monospace" font-size="8" fill="var(--accent-secondary)">> OBJ_02: KEYBD</text>
                        <text x="12" y="180" font-family="Courier, monospace" font-size="8" fill="var(--accent-secondary)">  CONF: 0.9125</text>
                        <line x1="12" y1="200" x2="148" y2="200" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="225" font-family="Courier, monospace" font-size="8" fill="#555">> RENDER OK</text>
                        <text x="12" y="240" font-family="Courier, monospace" font-size="8" fill="#555">> AUDIO_SYNCED</text>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">OPENCV_CORE_MODULE: ENABLED // CLASS_COUNT: 80</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">OCR_MATRIX // TEXT_EXTRACTOR</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <rect x="20" y="20" width="200" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="35" width="240" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="50" width="160" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="15" y="70" width="250" height="35" stroke="var(--accent-color)" stroke-width="1.5" fill="rgba(0,240,255,0.08)" />
                        <text x="25" y="91" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="2">STEEP ELEVATION AHEAD</text>
                        <rect x="20" y="125" width="220" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="140" width="180" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="155" width="240" height="6" fill="rgba(255,255,255,0.15)" />
                        <rect x="20" y="170" width="120" height="6" fill="rgba(255,255,255,0.15)" />
                        <line x1="5" y1="100" x2="275" y2="100" stroke="red" stroke-width="1" stroke-dasharray="2 2" opacity="0.7" />
                    </g>
                    <g transform="translate(330, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">EXTRACTED STRING</text>
                        <line x1="15" y1="32" x2="225" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <rect x="15" y="45" width="210" height="60" rx="3" stroke="rgba(0,240,255,0.15)" fill="rgba(0,240,255,0.02)" />
                        <text x="25" y="70" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold">"WARNING: STEEP ELEVATION</text>
                        <text x="25" y="88" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold"> AHEAD - PROCEED SLOWLY"</text>
                        <text x="15" y="135" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold">TTS AUDIO SYNTHESIZER</text>
                        <line x1="15" y1="142" x2="225" y2="142" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(20, 160)" fill="var(--accent-color)">
                            <rect x="0" y="10" width="6" height="25" rx="2" />
                            <rect x="12" y="5" width="6" height="35" rx="2" class="bp-pulse" />
                            <rect x="24" y="15" width="6" height="15" rx="2" />
                            <rect x="36" y="2" width="6" height="42" rx="2" />
                            <rect x="48" y="18" width="6" height="12" rx="2" />
                            <rect x="60" y="8" width="6" height="30" rx="2" class="bp-pulse" />
                            <rect x="72" y="2" width="6" height="40" rx="2" />
                            <rect x="84" y="14" width="6" height="18" rx="2" />
                            <rect x="96" y="20" width="6" height="8" rx="2" />
                            <rect x="108" y="5" width="6" height="35" rx="2" />
                            <rect x="120" y="10" width="6" height="25" rx="2" class="bp-pulse" />
                        </g>
                    </g>
                    <circle cx="345" cy="340" r="4" fill="var(--accent-color)" />
                    <text x="360" y="344" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">TTS_ENGINE: SYNTHESIZED_SUCCESS</text>
                </svg>
                `;
            } else if (slideIndex === 2) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">COLOR_MAPPER // RGB_HSL_ANALYSIS</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <circle cx="120" cy="107" r="75" stroke="rgba(0, 240, 255, 0.3)" stroke-width="1" fill="none" />
                        <circle cx="120" cy="107" r="50" stroke="rgba(0, 240, 255, 0.2)" stroke-width="1" fill="none" />
                        <line x1="45" y1="107" x2="195" y2="107" stroke="rgba(0, 240, 255, 0.15)" />
                        <line x1="120" y1="32" x2="120" y2="182" stroke="rgba(0, 240, 255, 0.15)" />
                        <line x1="120" y1="107" x2="85" y2="72" stroke="var(--accent-color)" stroke-width="2" />
                        <circle cx="85" cy="72" r="5" fill="none" stroke="var(--accent-color)" stroke-width="1.5" class="bp-pulse" />
                        <path d="M 175 107 A 55 55 0 0 1 120 162" stroke="var(--accent-secondary)" stroke-width="1.5" stroke-dasharray="4 4" fill="none" class="bp-rotate-reverse" />
                    </g>
                    <g transform="translate(290, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="5" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">HSL DETECT DETAILS</text>
                        <line x1="15" y1="32" x2="265" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <rect x="15" y="45" width="45" height="45" rx="4" fill="var(--accent-color)" stroke="#fff" stroke-width="1" class="bp-pulse" />
                        <g transform="translate(75, 45)" fill="#bbb" font-family="Courier, monospace" font-size="9">
                            <text x="0" y="10" font-weight="bold" fill="#fff">HEX CODE: #00F0FF (CYAN)</text>
                            <text x="0" y="24">HUE: ..... 180 DEG (CYAN)</text>
                            <text x="0" y="38">SAT: ..... 100%</text>
                            <text x="0" y="52">LIGHT: ... 50%</text>
                        </g>
                        <text x="15" y="125" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold">RGB DISTRIBUTION GAUGE</text>
                        <line x1="15" y1="132" x2="265" y2="132" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(15, 145)" font-family="Courier, monospace" font-size="8" fill="#999">
                            <text x="0" y="10">R: 0</text>
                            <rect x="40" y="2" width="200" height="8" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                            <rect x="40" y="2" width="5" height="8" rx="2" fill="red" />
                            <text x="0" y="25">G: 240</text>
                            <rect x="40" y="17" width="200" height="8" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                            <rect x="40" y="17" width="188" height="8" rx="2" fill="green" />
                            <text x="0" y="40">B: 255</text>
                            <rect x="40" y="32" width="200" height="8" rx="2" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" />
                            <rect x="40" y="32" width="200" height="8" rx="2" fill="blue" />
                        </g>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">COLOR_MAPPER_VERSION: 1.0.4 // MATCH_CONF: 99.42%</text>
                </svg>
                `;
            }
        } else if (projectId === 'spaswab') {
            if (slideIndex === 0) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">TELEMETRY_DASH // BIN_STATE_MONITOR</text>
                    <g transform="translate(30, 80)">
                        <rect x="0" y="0" width="250" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <g transform="translate(65, 80)">
                            <circle cx="0" cy="0" r="45" stroke="rgba(0,240,255,0.15)" stroke-width="6" fill="none" />
                            <path d="M -31.8 31.8 A 45 45 0 1 1 31.8 31.8" stroke="var(--accent-color)" stroke-width="6" fill="none" stroke-dasharray="200" stroke-dashoffset="35" />
                            <line x1="0" y1="0" x2="-10" y2="-32" stroke="var(--accent-color)" stroke-width="3.5" stroke-linecap="round" />
                            <circle cx="0" cy="0" r="5" fill="#fff" />
                            <text x="0" y="62" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold" text-anchor="middle">BATTERY 84%</text>
                        </g>
                        <g transform="translate(185, 80)">
                            <circle cx="0" cy="0" r="45" stroke="rgba(0,240,255,0.15)" stroke-width="6" fill="none" />
                            <path d="M -31.8 31.8 A 45 45 0 1 1 31.8 31.8" stroke="var(--accent-secondary)" stroke-width="6" fill="none" stroke-dasharray="200" stroke-dashoffset="65" />
                            <line x1="0" y1="0" x2="25" y2="-20" stroke="var(--accent-secondary)" stroke-width="3.5" stroke-linecap="round" />
                            <circle cx="0" cy="0" r="5" fill="#fff" />
                            <text x="0" y="62" font-family="Courier, monospace" font-size="10" fill="#fff" font-weight="bold" text-anchor="middle">SOLAR 18.2V</text>
                        </g>
                        <line x1="20" y1="160" x2="230" y2="160" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="182" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">SOLAR_CELL_STATUS: GENERATING</text>
                    </g>
                    <g transform="translate(300, 80)">
                        <rect x="0" y="0" width="270" height="200" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">WASTE VOL FILL MATRIX</text>
                        <line x1="15" y1="32" x2="255" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(25, 50)">
                            <rect x="0" y="0" width="35" height="120" rx="3" stroke="rgba(0,240,255,0.3)" fill="none" />
                            <rect x="3" y="66" width="29" height="51" rx="2" fill="var(--accent-color)" class="bp-pulse" />
                            <line x1="-5" y1="0" x2="0" y2="0" stroke="rgba(0,240,255,0.5)" />
                            <line x1="-5" y1="30" x2="0" y2="30" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="60" x2="0" y2="60" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="90" x2="0" y2="90" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="120" x2="0" y2="120" stroke="rgba(0,240,255,0.5)" />
                            <text x="-12" y="5" font-family="Courier, monospace" font-size="8" fill="#888">F</text>
                            <text x="-12" y="123" font-family="Courier, monospace" font-size="8" fill="#888">E</text>
                        </g>
                        <g transform="translate(85, 50)" font-family="Courier, monospace" font-size="9" fill="#bbb">
                            <text x="0" y="15" font-weight="bold" fill="var(--accent-color)">FILL STATUS: 45.4%</text>
                            <text x="0" y="32">DEPTH RADAR: OK</text>
                            <circle cx="5" cy="55" r="4" fill="green" />
                            <text x="18" y="59">WIFI: CONNECTED</text>
                            <circle cx="5" cy="75" r="4" fill="green" />
                            <text x="18" y="79">LID STATE: LOCKED</text>
                            <circle cx="5" cy="95" r="4" fill="green" />
                            <text x="18" y="99">GPS STACK: SYNC</text>
                            <circle cx="5" cy="115" r="4" fill="green" />
                            <text x="18" y="119">ARDUINO CORE: OK</text>
                        </g>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">SYSTEM_UPTIME: 142.4 HRS // GPS_COORDS: 7.0736 N, 125.5683 E</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">SERVO_PROXIMITY_DYNAMICS // REAL_TIME_LOG</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="310" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#fff" font-weight="bold">TRIGGER EVENT OSCILLOSCOPE</text>
                        <line x1="15" y1="32" x2="295" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(20, 50)" stroke="rgba(0,240,255,0.15)" stroke-width="1">
                            <line x1="0" y1="20" x2="260" y2="20" />
                            <line x1="0" y1="50" x2="260" y2="50" />
                            <line x1="0" y1="80" x2="260" y2="80" />
                            <line x1="0" y1="110" x2="260" y2="110" />
                            <line x1="0" y1="0" x2="0" y2="120" stroke="rgba(0,240,255,0.3)" stroke-width="1" />
                            <line x1="0" y1="120" x2="260" y2="120" stroke="rgba(0,240,255,0.3)" stroke-width="1" />
                            <path d="M 0 10 L 40 10 L 60 110 L 120 110 L 140 10 L 260 10" stroke="var(--accent-color)" stroke-width="2" fill="none" class="bp-dash-draw" />
                            <path d="M 0 110 L 50 110 L 55 10 L 125 10 L 130 110 L 260 110" stroke="var(--accent-secondary)" stroke-width="1.8" fill="none" />
                            <text x="10" y="-8" font-family="Courier, monospace" font-size="7" fill="var(--accent-color)" stroke="none">PROXIMITY_RADAR</text>
                            <text x="130" y="-8" font-family="Courier, monospace" font-size="7" fill="var(--accent-secondary)" stroke="none">SERVO_ANGLE_TRIP</text>
                        </g>
                    </g>
                    <g transform="translate(360, 75)">
                        <rect x="0" y="0" width="210" height="215" rx="4" stroke="rgba(0, 240, 255, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">TRIGGER LOGS</text>
                        <line x1="15" y1="32" x2="195" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(15, 45)" font-family="Courier, monospace" font-size="8" fill="#888">
                            <text x="0" y="10" fill="var(--accent-color)">> 08:14:02.103</text>
                            <text x="0" y="21">  RADAR: 10CM APPROACH</text>
                            <text x="0" y="38" fill="var(--accent-color)">> 08:14:02.245</text>
                            <text x="0" y="49" fill="var(--accent-secondary)">  SERVO_TRIP: OPEN (90D)</text>
                            <text x="0" y="66" fill="var(--accent-color)">> 08:14:02.260</text>
                            <text x="0" y="77">  LED_INDICATOR: PULSING</text>
                            <text x="0" y="94" fill="var(--accent-color)">> 08:14:07.412</text>
                            <text x="0" y="105">  RADAR: CLEAR (60CM)</text>
                            <text x="0" y="122" fill="var(--accent-color)">> 08:14:08.500</text>
                            <text x="0" y="133" fill="var(--accent-secondary)">  SERVO_TRIP: CLOSE (0D)</text>
                            <text x="0" y="150" fill="var(--accent-color)">> 08:14:08.610</text>
                            <text x="0" y="161">  SYSTEM: STANDBY_ON</text>
                        </g>
                    </g>
                    <text x="30" y="348" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" opacity="0.8">HC-SR04_MODULE: ONLINE // SG90_SERVO: CALIBRATED</text>
                </svg>
                `;
            }
        }
        return '';
    }

    // Projects Database
    const projectData = {
        phishvote: {
            title: "PhishVote",
            role: "Lead Researcher",
            year: "2026",
            desc: "Built a phishing detection browser extension utilizing ensemble machine learning models to identify malicious sites. Implemented weighted soft voting to combine model predictions and improve overall detection performance. Evaluated using Accuracy, Precision, Recall, F1-Score, ROC-AUC, and Precision-Recall metrics. Applied machine learning concepts related to classification, ensemble learning, feature engineering, and cybersecurity-focused threat detection.",
            tags: ["Python", "Scikit-Learn", "XGBoost", "CatBoost", "Machine Learning"],
            paperLink: "https://drive.google.com/file/d/1_wBtc5cBbFXaeuClkTXrShdQQcsFwYkr/view?usp=sharing",
            codeLink: "https://github.com/specertorduke/PhishVote/tree/main",
            slides: [
                {
                    imgSrc: "assets/img/PhishVote images/PV1.jpg",
                    caption: "Serving as a real-time testing environment for the proposed model, the extension instantly parses website features to validate the legitimacy of benign URLs with high confidence.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/PhishVote images/PV2.jpg",
                    caption: "Highlighting the advantage of soft-voting over binary classification, the extension alerts users to borderline threats where the ensemble detects suspicious features just below the definitive phishing threshold.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/PhishVote images/PV3.jpg",
                    caption: "Demonstrating the practical application of the research, the extension proactively warns users when the adaptive soft-voting ensemble confidently classifies a URL as a phishing threat.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/PhishVote images/PV4.jpg",
                    caption: "This analysis report visualizes the tree-based ensemble's decision-making process, detailing the specific structural and lexical feature importances that drive the model's final soft-voting probability.",
                    overlayText: ""
                }
            ]
        },
        furrytails: {
            title: "FurryTails",
            role: "Full-Stack Developer",
            year: "2025",
            desc: "A web-based management system for pet grooming and boarding reservations. Designed and implemented modules for user, pet, appointment, payment, service, and activity log management. Built CRUD functionalities, booking workflows, payment tracking, and role-based access controls using PHP, MySQL, HTML, CSS, and Bootstrap.",
            tags: ["PHP / Laravel", "MySQL", "JavaScript", "HTML/CSS", "Bootstrap"],
            codeLink: "https://github.com/specertorduke/furrytails_project",
            slides: [
                {
                    imgSrc: "assets/img/FurryTails images/landing page.jpg",
                    caption: "Public Landing Page: A welcoming homepage featuring introductory text, services, and clear calls-to-action for signing in and getting started.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/log in.jpg",
                    caption: "Login Page: A secure authentication gateway supporting standard credential entries and one-click Google OAuth sign-in integrations.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/sign up.jpg",
                    caption: "Sign Up Page: An account registration portal featuring real-time client-side inputs validation for user sign-ups.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/user dashboard.jpg",
                    caption: "User Dashboard Portal: An intuitive client dashboard showing today's upcoming appointments, active boardings, and registered pets with quick-action booking buttons.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/user pets.jpg",
                    caption: "User Pets Panel: A list view where pet owners can register, update, and manage the profiles of their active pets.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/user view pet modal.jpg",
                    caption: "Pet Detail Modal: A quick-view overlay displaying a specific pet's core characteristics, biological metrics, and immunization records.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/user add appointment modal.jpg",
                    caption: "Add Appointment Modal: An overlay dialog letting users select registered pets, scheduling dates, available 1-hour time slots, and target services.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/admin dashboard.jpg",
                    caption: "Admin Analytics Dashboard: A centralized administrative panel showcasing system metrics for total users, pets, appointments, and active boarding allocations.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/admin services.jpg",
                    caption: "Services Management Portal: An admin interface for creating, modifying, and categorizing boarding, grooming, veterinary, and training offerings.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/admin view service modal.jpg",
                    caption: "Service Details Modal: An admin popup containing description logs, pricing figures, and category tags for active catalog offerings.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/FurryTails images/admin system settings.jpg",
                    caption: "System Settings Panel: An administration dashboard for adjusting general clinic hours, appointment slot durations, and system-wide boarding capacity limits.",
                    overlayText: ""
                }
            ]
        },
        insightful: {
            title: "INSIGHTFUL",
            role: "Web Developer",
            year: "2024",
            desc: "A voice-first accessibility app that speaks everything it sees. Built a browser-based computer vision application for real-time object detection and text recognition. Implemented TensorFlow.js and COCO-SSD models to analyze live camera feeds, integrated Tesseract.js OCR and color detection features with accessibility-focused voice feedback through the Web Speech API.",
            tags: ["TensorFlow.js", "Tesseract.js", "Web Speech API", "JavaScript", "HTML/CSS"],
            codeLink: "https://github.com/specertorduke/insightful",
            slides: [
                {
                    imgSrc: "assets/img/Insightful images/splash screen.png",
                    caption: "Splash Screen: On launch, the app automatically speaks 'Welcome to Insightful!' — no visual reading needed. A single tap anywhere starts the camera and voice announces the active mode.",
                    overlayText: "🔊 Voice: \"Welcome to Insightful!\""
                },
                {
                    imgSrc: "assets/img/Insightful images/object detection.png",
                    caption: "Object Detection: After tapping to scan, the app speaks the results aloud — 'I see a laptop at 92%, a cup at 87%, a cell phone at 84%, and a potted plant at 78%.' Each detection triggers a haptic pulse and ascending audio chime.",
                    overlayText: "🔊 Voice: \"I see a laptop (92%), a cup (87%),\\na cell phone (84%), and a potted plant (78%).\""
                },
                {
                    imgSrc: "assets/img/Insightful images/text reader.png",
                    caption: "Text Reader: The OCR engine extracts printed text and the Web Speech API reads the full content aloud — 'Detected text: Chapter 4, The Path Forward...' at a 0.9× speech rate for clearer comprehension.",
                    overlayText: "🔊 Voice: \"Detected text: Chapter 4, The Path\\nForward. The intricate process of exploring...\""
                },
                {
                    imgSrc: "assets/img/Insightful images/color detection.png",
                    caption: "Color Detection: Points the camera at any surface and the app announces the dominant color — 'The dominant color is Red.' The HSL analyzer maps to 20+ descriptive names like 'Deep Teal' or 'Soft Amber', not just basic labels.",
                    overlayText: "🔊 Voice: \"The dominant color is Red.\""
                },
                {
                    imgSrc: "assets/img/Insightful images/menu navigation.png",
                    caption: "Mode Navigation: Swiping left or right switches modes with a voice announcement — 'Switched to Color Detection.' A long-press reads a description of what the current mode does. Every interaction has voice + vibration + audio feedback.",
                    overlayText: "🔊 Voice: \"Switched to Color Detection.\""
                }
            ]
        },
        pharmacytriage: {
            title: "Pharmacy Triage",
            role: "Lead Data Analyst & Simulation Engineer",
            year: "2026",
            desc: "Built a discrete-event simulation model analyzing patient flow data to optimize complex hospital pharmacy outpatient bottlenecks using Rockwell Arena. Performed statistical distribution and exploratory data analysis using industry-standard analytics workflows. Evaluated statistical variance using Wait Time, Value-Added Time, Transfer Time, and Total Time-in-System. Applied data analysis concepts related to descriptive statistics, trend visualization, queueing theory, and bottleneck detection.",
            tags: ["Rockwell Arena", "Python", "Matplotlib", "Pandas", "Data Analysis"],
            paperLink: "https://drive.google.com/file/d/1FBf05QALsgUDhYuSLVMW9MsMtSPuGmCb/view?usp=sharing",
            slides: [
                {
                    imgSrc: "assets/img/Pharmacy Triage images/Arena Logic Flowchart.png",
                    caption: "Arena Logic Flowchart: The logical structure relies on Rockwell Arena modules representing the Triage Desk, where patients are dynamically separated into Express or Regular streams based on prescription size using a 2-way by Condition logic.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/Pharmacy Triage images/Model Design Layout.png",
                    caption: "Model Design Layout: Visualizing the physical flow of outpatients through the pharmacy. Patients are actively triaged immediately upon arrival—those with 1-2 items are routed to a dedicated Express Lane, while complex orders of 3+ items are pooled into Regular lines.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/Pharmacy Triage images/System-Wide Performance Metrics.png",
                    caption: "System-Wide Performance Comparison: Empirical results derived from 100 simulation replications showing a massive 78.7% reduction in average wait times, dropping from 12.70 minutes in the Baseline FIFO model to just 2.70 minutes in the Proposed SPT model.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/Pharmacy Triage images/Queue-Specific Wait Time Distribution.png",
                    caption: "Average Wait Time by Queue Category: The queue dynamics demonstrate the success of the Shortest Processing Time triage logic. The Express Queue achieved a wait time of 0.64 minutes, drastically lowering the overall lobby density.",
                    overlayText: ""
                }
            ]
        },
        spaswab: {
            title: "SPASWAB",
            role: "Researcher & Programmer",
            year: "2023",
            desc: "Integrated Arduino Uno with capacitive, inductive, and ultrasonic sensors for material detection. Implemented C++ control logic to classify plastic, metal, and non-recyclable waste categories. Conducted experimental evaluation and statistical analysis, achieving 100% plastic accuracy, 66.67% for metals, and 93.57% for others — with a statistically significant p-value of 0.003. Powered entirely by solar energy.",
            tags: ["Arduino (C++)", "IoT Sensors", "HC-SR04 Ultrasonic", "Solar Energy", "Experimental Research"],
            slides: [
                {
                    imgSrc: "assets/img/SPASWAB images/me programming.jpg",
                    caption: "Hardware Assembly & Programming: Wiring and programming the Arduino microcontroller in the classroom, connecting the capacitive and inductive proximity sensors, HC-SR04 ultrasonic modules, and SG90 servo motors on a breadboard before final integration into the prototype.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/SPASWAB images/spaswab prototype.jpg",
                    caption: "Finished Prototype: The completed Solar-Powered Arduino-Based Smart Waste Bin featuring three segregation compartments for plastic, metal, and non-plastic/non-metal waste. Equipped with a corrugated solar panel roof, sensor arrays at each disposal slot, and labeled safety signage for deployment at the Mintal Comprehensive Senior High School canteen.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/SPASWAB images/won best presenter and best prototype.jpg",
                    caption: "Best Presenter & Best Prototype Award: Presenting the full research poster at the Work Immersion Culminating Program, showcasing the methodology, experimental results, and statistical analysis. Awarded Best Presenter and Best Prototype for the project.",
                    overlayText: ""
                }
            ]
        }
    };

    // 3D Carousel Engine Setup
    const cards = document.querySelectorAll('.carousel-card');
    const dotsContainer = document.querySelector('.carousel-dots');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    let activeIndex = 1; // Default to FurryTails (second card)

    // Render Carousel Dots
    if (dotsContainer) {
        dotsContainer.innerHTML = '';
        cards.forEach((card, idx) => {
            const dot = document.createElement('div');
            dot.className = `carousel-dot ${idx === activeIndex ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                activeIndex = idx;
                updateCarousel();
            });
            dotsContainer.appendChild(dot);
        });
    }

    function updateCarousel() {
        const isMobile = window.innerWidth <= 768;

        // Update active dot
        const dots = document.querySelectorAll('.carousel-dot');
        dots.forEach((dot, idx) => {
            if (idx === activeIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });

        cards.forEach((card, idx) => {
            card.classList.remove('active');

            if (isMobile) {
                // Remove inline transforms to let mobile CSS flex/scroll snap work cleanly
                gsap.killTweensOf(card);
                gsap.set(card, {
                    x: 0,
                    xPercent: 0,
                    yPercent: 0,
                    scale: 1,
                    rotationY: 0,
                    z: 0,
                    opacity: 1,
                    filter: 'none',
                    clearProps: "all"
                });
                return;
            }

            // Calculations for 3D depth spacing
            const diff = idx - activeIndex;

            let x = 0;
            let scale = 0.8;
            let rotationY = 0;
            let z = -200;
            let opacity = 0.6;
            let zIndex = 5;
            let filter = 'blur(2px)';

            if (diff === 0) {
                card.classList.add('active');
                x = 0;
                scale = 1.05;
                rotationY = 0;
                z = 0;
                opacity = 1;
                zIndex = 10;
                filter = 'blur(0px)';
            } else if (diff === -1) {
                x = -320;
                scale = 0.82;
                rotationY = 32;
                z = -150;
                opacity = 0.65;
                zIndex = 8;
                filter = 'blur(1.5px)';
            } else if (diff === 1) {
                x = 320;
                scale = 0.82;
                rotationY = -32;
                z = -150;
                opacity = 0.65;
                zIndex = 8;
                filter = 'blur(1.5px)';
            } else if (diff < -1) {
                x = -580;
                scale = 0.68;
                rotationY = 45;
                z = -300;
                opacity = 0.25;
                zIndex = 4;
                filter = 'blur(3px)';
            } else if (diff > 1) {
                x = 580;
                scale = 0.68;
                rotationY = -45;
                z = -300;
                opacity = 0.25;
                zIndex = 4;
                filter = 'blur(3px)';
            }

            // Animate using GSAP
            gsap.to(card, {
                x: x,
                scale: scale,
                rotationY: rotationY,
                z: z,
                opacity: opacity,
                filter: filter,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto",
                onStart: () => {
                    card.style.zIndex = zIndex;
                }
            });
        });
    }

    // Carousel Navigation Handlers
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            activeIndex = (activeIndex - 1 + cards.length) % cards.length;
            updateCarousel();
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            activeIndex = (activeIndex + 1) % cards.length;
            updateCarousel();
        });
    }

    // Direct Clicks on side cards to advance, or active card to explore
    cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            if (window.innerWidth > 768) {
                if (idx !== activeIndex) {
                    e.preventDefault();
                    e.stopPropagation();
                    activeIndex = idx;
                    updateCarousel();
                } else {
                    handleProjectClick(card.getAttribute('data-project-id'));
                }
            } else {
                handleProjectClick(card.getAttribute('data-project-id'));
            }
        });
    });

    // Drag/Swipe Interactivity on Desktop Viewport
    let startX = 0;
    let isDragging = false;
    const carouselViewport = document.querySelector('.projects-carousel');

    if (carouselViewport) {
        carouselViewport.addEventListener('mousedown', (e) => {
            if (window.innerWidth <= 768) return;
            startX = e.clientX;
            isDragging = true;
        });

        carouselViewport.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const diffX = e.clientX - startX;
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
                } else {
                    activeIndex = (activeIndex + 1) % cards.length;
                }
                updateCarousel();
                isDragging = false;
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch swipe fallback
        carouselViewport.addEventListener('touchstart', (e) => {
            if (window.innerWidth <= 768) return;
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        carouselViewport.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const diffX = e.touches[0].clientX - startX;
            if (Math.abs(diffX) > 60) {
                if (diffX > 0) {
                    activeIndex = (activeIndex - 1 + cards.length) % cards.length;
                } else {
                    activeIndex = (activeIndex + 1) % cards.length;
                }
                updateCarousel();
                isDragging = false;
            }
        });

        carouselViewport.addEventListener('touchend', () => {
            isDragging = false;
        });
    }

    // Project click routing
    function handleProjectClick(projectId) {
        openProjectPortal(projectId);
    }

    // Portal Interactive Controls
    const portal = document.getElementById('project-portal');
    const closeBtn = document.getElementById('portal-close-btn');
    const overlay = document.querySelector('.portal-overlay');

    let currentProjectId = '';
    let currentSlideIndex = 0;

    function openProjectPortal(projectId) {
        const data = projectData[projectId];
        if (!data) return;

        currentProjectId = projectId;
        currentSlideIndex = 0;

        // Populate text details
        const titleElem = document.getElementById('portal-title');
        titleElem.textContent = data.title;

        // Dynamically scale down font size for longer titles to prevent overflow/cutting
        if (data.title.length >= 9) {
            titleElem.style.fontSize = '2.0rem';
        } else if (data.title.length > 7) {
            titleElem.style.fontSize = '2.2rem';
        } else {
            titleElem.style.fontSize = '3.0rem';
        }
        document.getElementById('portal-meta-role').textContent = data.role;
        document.getElementById('portal-meta-year').textContent = data.year;
        document.getElementById('portal-desc').textContent = data.desc;

        // Populate tags
        const tagsContainer = document.getElementById('portal-tags');
        tagsContainer.innerHTML = '';
        data.tags.forEach(tag => {
            const span = document.createElement('span');
            span.className = 'tag hover-target';
            span.textContent = tag;
            tagsContainer.appendChild(span);
        });

        // Populate links
        const actionsContainer = document.getElementById('portal-actions');
        actionsContainer.innerHTML = '';
        if (data.codeLink || data.paperLink) {
            let actionsHTML = '<h3>Project Links</h3><div style="display: flex; flex-wrap: wrap; gap: 15px;">';
            if (data.paperLink) {
                actionsHTML += `
                    <a href="${data.paperLink}" target="_blank" class="portal-btn hover-target">
                        <i class="fa-solid fa-file-pdf"></i> Read Research Paper
                    </a>
                `;
            }
            if (data.codeLink) {
                actionsHTML += `
                    <a href="${data.codeLink}" target="_blank" class="portal-btn hover-target">
                        <i class="fa-brands fa-github"></i> View Repository
                    </a>
                `;
            }
            actionsHTML += '</div>';
            actionsContainer.innerHTML = actionsHTML;
        }

        // Populate slideshow tracks
        const track = document.getElementById('slideshow-track');
        track.innerHTML = '';

        data.slides.forEach((slide, idx) => {
            const slideDiv = document.createElement('div');
            slideDiv.className = `slideshow-slide ${idx === 0 ? 'active' : ''}`;

            let mediaContent = '';
            if (slide.imgSrc) {
                mediaContent = `<img src="${slide.imgSrc}" alt="${slide.caption}" class="portal-slide-img" />`;
            } else {
                mediaContent = getBlueprintSVG(projectId, idx);
            }

            let overlayHTML = '';
            if (slide.overlayText) {
                // Clean the text to remove the mock "Voice:" string for the actual spoken text
                let cleanText = slide.overlayText.replace('🔊 Voice: "', '').replace(/"$/, '');
                if (cleanText === slide.overlayText) cleanText = slide.overlayText; // fallback if no quotes
                
                overlayHTML = `
                <div class="blueprint-overlay">
                    <button class="tts-btn" aria-label="Play Voice" data-text="${cleanText.replace(/"/g, '&quot;')}">
                        <i class="fa-solid fa-volume-high"></i>
                    </button>
                    <span>${cleanText.replace(/\\n/g, '<br>')}</span>
                </div>`;
            }

            const slideHTML = `
                <div class="blueprint-mockup">
                    <div class="blueprint-grid"></div>
                    <div class="blueprint-scanline"></div>
                    ${mediaContent}
                    ${overlayHTML}
                </div>
                <div class="slideshow-caption">${slide.caption}</div>
            `;

            slideDiv.innerHTML = slideHTML;
            track.appendChild(slideDiv);
        });

        // Add delegated event listener for TTS buttons
        track.addEventListener('click', (e) => {
            const btn = e.target.closest('.tts-btn');
            if (btn) {
                // Cancel any ongoing speech
                window.speechSynthesis.cancel();
                const textToSpeak = btn.getAttribute('data-text');
                const utterance = new SpeechSynthesisUtterance(textToSpeak);
                utterance.rate = 1.0;
                utterance.pitch = 1.1;
                // Try to use a natural English voice if available
                const voices = window.speechSynthesis.getVoices();
                const englishVoice = voices.find(v => v.lang.startsWith('en-US') && v.name.includes('Google'));
                if (englishVoice) utterance.voice = englishVoice;
                
                window.speechSynthesis.speak(utterance);
                
                // Add temporary active class for visual feedback
                btn.classList.add('playing');
                utterance.onend = () => btn.classList.remove('playing');
            }
        });

        // Populate dots
        const pagination = document.getElementById('slideshow-pagination');
        pagination.innerHTML = '';
        data.slides.forEach((_, idx) => {
            const dot = document.createElement('div');
            dot.className = `slideshow-dot ${idx === 0 ? 'active' : ''}`;
            dot.addEventListener('click', () => {
                setSlide(idx);
            });
            pagination.appendChild(dot);
        });

        // Adjust control layouts
        updateSlideshowControlsVisibility(data.slides.length);

        // Trigger opening
        portal.classList.add('active');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('portal-open');
    }

    function updateSlideshowControlsVisibility(slideCount) {
        const prevSlideBtn = document.getElementById('prev-slide');
        const nextSlideBtn = document.getElementById('next-slide');
        const pagination = document.getElementById('slideshow-pagination');

        if (slideCount <= 1) {
            if (prevSlideBtn) prevSlideBtn.style.display = 'none';
            if (nextSlideBtn) nextSlideBtn.style.display = 'none';
            if (pagination) pagination.style.display = 'none';
        } else {
            if (prevSlideBtn) prevSlideBtn.style.display = 'flex';
            if (nextSlideBtn) nextSlideBtn.style.display = 'flex';
            if (pagination) pagination.style.display = 'flex';
        }
    }

    function setSlide(index) {
        const slides = document.querySelectorAll('.slideshow-slide');
        const dots = document.querySelectorAll('.slideshow-dot');
        if (index < 0 || index >= slides.length) return;

        currentSlideIndex = index;

        slides.forEach((slide, idx) => {
            if (idx === currentSlideIndex) slide.classList.add('active');
            else slide.classList.remove('active');
        });

        dots.forEach((dot, idx) => {
            if (idx === currentSlideIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    // Bind slide navigation listeners once
    const prevSlideBtn = document.getElementById('prev-slide');
    const nextSlideBtn = document.getElementById('next-slide');

    if (prevSlideBtn) {
        prevSlideBtn.addEventListener('click', () => {
            const slides = document.querySelectorAll('.slideshow-slide');
            if (slides.length <= 1) return;
            const newIdx = (currentSlideIndex - 1 + slides.length) % slides.length;
            setSlide(newIdx);
        });
    }

    if (nextSlideBtn) {
        nextSlideBtn.addEventListener('click', () => {
            const slides = document.querySelectorAll('.slideshow-slide');
            if (slides.length <= 1) return;
            const newIdx = (currentSlideIndex + 1) % slides.length;
            setSlide(newIdx);
        });
    }

    function closePortal() {
        portal.classList.remove('active');
        document.body.style.overflow = '';
        document.body.classList.remove('portal-open');
    }

    if (closeBtn) closeBtn.addEventListener('click', closePortal);
    if (overlay) overlay.addEventListener('click', closePortal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && portal.classList.contains('active')) {
            closePortal();
        }
    });

    // Initialize state & listen for scaling changes
    updateCarousel();
    window.addEventListener('resize', updateCarousel);

});
