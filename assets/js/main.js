// Wait for DOM to load
document.addEventListener("DOMContentLoaded", () => {

    // Register ScrollTrigger
    gsap.registerPlugin(ScrollTrigger);

    // Toast notification placeholder to show when page is revealed
    let showBrushToast = null;

    // 1. Apple iPadOS/VisionOS Snapping Cursor & Spotlight Tracking
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    const cursorReveal = document.querySelector('.cursor-image-reveal');
    const revealImg = document.getElementById('reveal-img');
    const hoverTargets = document.querySelectorAll('.hover-target, a, button, .project-slide-card');
    const projectItems = document.querySelectorAll('.project-slide-card');

    // Setup for mouse coordinates tracking on spotlight elements
    const spotlightElements = document.querySelectorAll('.navbar, .btn, .social-link, .btn-explore');
    spotlightElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            el.style.setProperty('--mouse-x', `${x}px`);
            el.style.setProperty('--mouse-y', `${y}px`);
        });
    });

    if (window.matchMedia("(pointer: fine)").matches) {
        let mouseX = 0, mouseY = 0;
        let followerX = 0, followerY = 0;
        let currentSnapEl = null;

        // Ensure GSAP tracks relative transforms from center
        gsap.set(cursorDot, { xPercent: -50, yPercent: -50 });
        gsap.set(cursorOutline, { xPercent: -50, yPercent: -50 });

        // Show custom cursor on first mouse movement to avoid freezing/getting stuck on load
        window.addEventListener('mousemove', () => {
            if (cursorDot) cursorDot.style.display = 'block';
            if (cursorOutline) cursorOutline.style.display = 'block';
        }, { once: true });

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // If not currently snapped, standard position tracking
            if (!currentSnapEl) {
                gsap.set(cursorDot, { x: mouseX, y: mouseY });
            }
            gsap.set(cursorReveal, { x: mouseX, y: mouseY, xPercent: -50, yPercent: -50 });

            // Set grid spotlight variables
            const bgBg = document.querySelector('.mesh-background');
            if (bgBg) {
                bgBg.style.setProperty('--bg-mouse-x', `${e.clientX}px`);
                bgBg.style.setProperty('--bg-mouse-y', `${e.clientY}px`);
            }
        });

        // Honors & Certifications Card Hover Reveal State
        const certPreview = document.getElementById('cert-preview');
        const cardTitle = document.getElementById('cert-card-title');
        const cardIssuer = document.getElementById('cert-card-issuer');
        const cardYear = document.getElementById('cert-card-year');
        const cardIcon = document.getElementById('cert-card-icon');
        const cardBadge = certPreview ? certPreview.querySelector('.cert-card-badge') : null;
        
        let isHoveringCert = false;
        let certCardX = 0;
        let certCardY = 0;

        if (certPreview) {
            gsap.set(certPreview, { xPercent: -50, yPercent: -50, transformOrigin: "center center" });
        }

        // Outer ring 3D glass orb tracking (stays a constant perfect circle)
        gsap.ticker.add(() => {
            if (!currentSnapEl) {
                const dx = (mouseX - followerX);
                const dy = (mouseY - followerY);
                
                followerX += dx * 0.22;
                followerY += dy * 0.22;

                gsap.set(cursorOutline, { 
                    x: followerX, 
                    y: followerY,
                    rotation: 0,
                    scaleX: 1,
                    scaleY: 1
                });
            }

            // Cert card tracking with inertia and 3D tilt
            if (isHoveringCert && certPreview) {
                certCardX += (mouseX - certCardX) * 0.12;
                certCardY += (mouseY - certCardY) * 0.12;
                
                const diffX = mouseX - certCardX;
                const diffY = mouseY - certCardY;
                
                const tiltX = -diffY * 0.15;
                const tiltY = diffX * 0.15;
                
                const maxTilt = 15;
                const clampedTiltX = Math.max(-maxTilt, Math.min(maxTilt, tiltX));
                const clampedTiltY = Math.max(-maxTilt, Math.min(maxTilt, tiltY));
                
                gsap.set(certPreview, {
                    x: certCardX,
                    y: certCardY,
                    transformPerspective: 1000,
                    rotationX: clampedTiltX,
                    rotationY: clampedTiltY
                });
            }
        });

        // VisionOS snapping/morphing interaction for buttons, links, etc.
        const snapElements = document.querySelectorAll('#portal-close-btn, .slideshow-nav-btn, .carousel-btn, .slider-dot');

        snapElements.forEach(elem => {
            elem.addEventListener('mouseenter', () => {
                currentSnapEl = elem;
                
                // Get element coordinates and shape
                const rect = elem.getBoundingClientRect();
                const centerValX = rect.left + rect.width / 2;
                const centerValY = rect.top + rect.height / 2;
                const borderRad = window.getComputedStyle(elem).borderRadius;

                // Make cursor snap exactly to center behind the element, and match its size/shape
                gsap.to(cursorDot, {
                    x: centerValX,
                    y: centerValY,
                    width: rect.width,
                    height: rect.height,
                    borderRadius: borderRad,
                    backgroundColor: 'rgba(255, 255, 255, 0.55)',
                    border: '1px solid rgba(255, 255, 255, 0.65)',
                    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
                    backdropFilter: 'blur(12px)',
                    zIndex: 5, // Put behind element but above background
                    duration: 0.35,
                    ease: "power3.out"
                });

                // Set parent target high z-index and hide outer outline ring
                elem.style.zIndex = '99901';
                cursorOutline.classList.add('snapped');
                gsap.to(cursorOutline, { opacity: 0, duration: 0.2 });
            });

            elem.addEventListener('mousemove', (e) => {
                if (currentSnapEl === elem) {
                    const rect = elem.getBoundingClientRect();
                    const centerX = rect.left + rect.width / 2;
                    const centerY = rect.top + rect.height / 2;

                    // Magnetic pull values (pull elements slightly toward mouse)
                    const pullX = (e.clientX - centerX) * 0.25;
                    const pullY = (e.clientY - centerY) * 0.25;

                    // Pull button container
                    gsap.to(elem, {
                        x: pullX,
                        y: pullY,
                        duration: 0.2,
                        ease: "power2.out"
                    });

                    // Snap cursor tracks behind the button center but moves with a dampening factor
                    gsap.to(cursorDot, {
                        x: centerX + pullX * 0.5,
                        y: centerY + pullY * 0.5,
                        duration: 0.2,
                        ease: "power2.out"
                    });

                    // Pull button inner text/icon (slight parallax shift)
                    const innerText = elem.querySelector('.btn-text, i, span');
                    if (innerText) {
                        gsap.to(innerText, {
                            x: pullX * 0.4,
                            y: pullY * 0.4,
                            duration: 0.2,
                            ease: "power2.out"
                        });
                    }
                }
            });

            elem.addEventListener('mouseleave', () => {
                currentSnapEl = null;

                // Reset cursor dot back to floating circle dot
                gsap.to(cursorDot, {
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(12, 12, 12, 0.12)',
                    border: 'none',
                    boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 99999,
                    duration: 0.35,
                    ease: "power3.out"
                });

                // Reset elements back to flat/center
                gsap.to(elem, {
                    x: 0,
                    y: 0,
                    duration: 0.5,
                    ease: "elastic.out(1, 0.35)",
                    clearProps: "zIndex"
                });

                const innerText = elem.querySelector('.btn-text, i, span');
                if (innerText) {
                    gsap.to(innerText, {
                        x: 0,
                        y: 0,
                        duration: 0.5,
                        ease: "elastic.out(1, 0.35)"
                    });
                }

                // Fade outer outline ring back in
                cursorOutline.classList.remove('snapped');
                gsap.to(cursorOutline, { opacity: 1, duration: 0.3 });
            });
        });

        // Hide custom pointer on navbar links to avoid cluttering
        const occludedElements = document.querySelectorAll('.nav-link, .nav-logo a, .btn-explore, .social-link');
        occludedElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                gsap.to(cursorOutline, { opacity: 0, duration: 0.2, overwrite: "auto" });
                gsap.to(cursorDot, { opacity: 0, duration: 0.2, overwrite: "auto" });
            });
            el.addEventListener('mouseleave', () => {
                gsap.to(cursorOutline, { opacity: 1, duration: 0.3, overwrite: "auto" });
                gsap.to(cursorDot, { opacity: 1, duration: 0.3, overwrite: "auto" });
            });
        });

        let isCertPreviewActiveMobile = false;
        let lastClickedCertItem = null;

        // Honors & Certifications list interaction - Only for data-verify="true" certifications
        function bindCertHoverListeners() {
            const items = document.querySelectorAll('.cert-item[data-verify="true"]');
            if (!certPreview) return;
            
            items.forEach(item => {
                item.addEventListener('mouseenter', (e) => {
                    if (window.innerWidth <= 992) return;
                    isHoveringCert = true;
                    
                    // Prevent large jumps when card is first revealed
                    if (certCardX === 0 && certCardY === 0) {
                        certCardX = e.clientX;
                        certCardY = e.clientY;
                    }
                    
                    // Update content
                    if (cardTitle) cardTitle.textContent = item.getAttribute('data-title') || '';
                    if (cardIssuer) cardIssuer.textContent = item.getAttribute('data-issuer') || '';
                    if (cardYear) cardYear.textContent = item.getAttribute('data-year') || '';
                    if (cardIcon) {
                        const iconClass = item.getAttribute('data-icon') || 'fa-award';
                        cardIcon.className = `fa-solid ${iconClass} cert-card-icon`;
                    }
                    if (cardBadge) {
                        cardBadge.innerHTML = '<i class="fa-brands fa-linkedin"></i> CLICK TO VERIFY CREDENTIAL';
                        cardBadge.style.color = '#00b4d8'; /* custom blue/cyan tint */
                        cardBadge.style.borderColor = 'rgba(0, 180, 216, 0.4)';
                    }
                    
                    // Animate card entrance
                    gsap.to(certPreview, {
                        opacity: 1,
                        scale: 1,
                        duration: 0.4,
                        ease: "power3.out",
                        overwrite: "auto"
                    });
                    
                    // Hide the custom cursor completely so it does not block the card details
                    gsap.to(cursorOutline, { opacity: 0, duration: 0.2, overwrite: "auto" });
                    gsap.to(cursorDot, { opacity: 0, duration: 0.2, overwrite: "auto" });
                });
                
                item.addEventListener('mouseleave', () => {
                    if (window.innerWidth <= 992) return;
                    isHoveringCert = false;
                    
                    // Animate card exit
                    gsap.to(certPreview, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        ease: "power3.inOut",
                        overwrite: "auto"
                    });
                    
                    // Restore custom cursor visibility
                    gsap.to(cursorOutline, { opacity: 1, duration: 0.3, overwrite: "auto" });
                    gsap.to(cursorDot, { opacity: 1, duration: 0.3, overwrite: "auto" });
                });

                // Direct click to verify credential
                item.addEventListener('click', () => {
                    const url = item.getAttribute('data-url') || 'https://www.linkedin.com/in/zander-duhaylungsod-308846315/';
                    window.open(url, '_blank');
                });
            });
        }
        
        // Initial binding
        bindCertHoverListeners();

        // True optical magnifying loupe triggers for text elements
        const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, .editorial-subtitle, .lead');
        textElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                // Ignore snapping targets and cert items to avoid conflicts
                if (el.closest('.btn, .nav-link, .social-link, #portal-close-btn, .slideshow-nav-btn, .carousel-btn, .clean-list li')) return;

                cursorOutline.classList.add('text-magnifying');
                gsap.to(cursorDot, {
                    scale: 0.7,
                    backgroundColor: 'var(--accent-color)',
                    duration: 0.3,
                    overwrite: "auto"
                });
            });
            el.addEventListener('mouseleave', () => {
                if (el.closest('.btn, .nav-link, .social-link, #portal-close-btn, .slideshow-nav-btn, .carousel-btn, .clean-list li')) return;

                cursorOutline.classList.remove('text-magnifying');
                gsap.to(cursorDot, {
                    scale: 1,
                    backgroundColor: 'rgba(12, 12, 12, 0.12)',
                    duration: 0.3,
                    overwrite: "auto"
                });
            });
        });

        // Project Cards custom cursor hover styling
        projectItems.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (card.classList.contains('active')) {
                    cursorOutline.classList.add('text-magnifying');
                    gsap.to(cursorDot, {
                        scale: 0.5,
                        backgroundColor: 'var(--accent-color)',
                        duration: 0.3,
                        overwrite: "auto"
                    });
                }
            });
            card.addEventListener('mouseleave', () => {
                cursorOutline.classList.remove('text-magnifying');
                gsap.to(cursorDot, {
                    scale: 1,
                    backgroundColor: 'rgba(12, 12, 12, 0.12)',
                    duration: 0.3,
                    overwrite: "auto"
                });
            });
        });
    }

    // 2. Magnetic effect for specific elements (supports touch snap back)
    const magneticElements = document.querySelectorAll('.magnetic');

    magneticElements.forEach((elem) => {
        // Desktop mouse movement triggers magnetic displacement
        elem.addEventListener('mousemove', function (e) {
            const rect = this.getBoundingClientRect();
            const strength = this.getAttribute('data-strength') || 20;

            // Get pointer position relative to element center
            const x = e.clientX - (rect.left + rect.width / 2);
            const y = e.clientY - (rect.top + rect.height / 2);

            gsap.to(this, {
                x: x / rect.width * strength,
                y: y / rect.height * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        // Touch triggers basic touchmove mapping
        elem.addEventListener('touchmove', function (e) {
            const rect = this.getBoundingClientRect();
            const strength = this.getAttribute('data-strength') || 20;
            const touch = e.touches[0];

            const x = touch.clientX - (rect.left + rect.width / 2);
            const y = touch.clientY - (rect.top + rect.height / 2);

            gsap.to(this, {
                x: x / rect.width * strength,
                y: y / rect.height * strength,
                duration: 0.3,
                ease: "power2.out"
            });
        });

        // Common reset trigger function
        const resetPosition = function () {
            gsap.to(this, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: "elastic.out(1, 0.3)"
            });
        };

        // Reset elements back to center on pointer leave / touch lift
        elem.addEventListener('mouseleave', resetPosition);
        elem.addEventListener('touchend', resetPosition);
        elem.addEventListener('touchcancel', resetPosition);
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

            // Temporarily set display to inline-block so offsetWidth measures the exact text width
            line.style.display = "inline-block";
            line.style.fontSize = "";
            let size = parseFloat(getComputedStyle(line).fontSize);

            // Shrink until the actual element's width fits inside maxWidth (down to 8px if needed)
            // Measuring offsetWidth on inline-block handles kerning and spacing variations accurately
            while (line.offsetWidth > maxWidth && size > 8) {
                size -= 0.5;
                line.style.fontSize = size + "px";
            }

            // Restore default block display style
            line.style.display = "";
        });
    }

    document.fonts.ready.then(() => {
        fitTextElements();
        if (typeof updateActiveBubble === 'function') updateActiveBubble();
        if (typeof updateCredentialsActivePill === 'function') updateCredentialsActivePill();
    });
    window.addEventListener("resize", () => {
        fitTextElements();
        if (typeof updateActiveBubble === 'function') updateActiveBubble();
        if (typeof updateCredentialsActivePill === 'function') updateCredentialsActivePill();
    });

    // Set initial states for main page elements to prevent flashing
    gsap.set(".navbar", { y: -30, opacity: 0 });
    gsap.set(".subtitle", { y: 80, opacity: 0 });
    gsap.set(".hero-name-line .char", { opacity: 0, y: 60, rotationX: -80 });
    gsap.set(".hero-desc", { y: 80, opacity: 0 });
    gsap.set(".hero-cta", { y: 80, opacity: 0 });
    gsap.set(".scroll-indicator", { opacity: 0 });

    // 3. Cinematic Minimal Loader (Apple Boot Loader style)
    const counterObj = { val: 0 };
    const progressEl = document.querySelector(".intro-progress-bar");

    function revealLockscreenNotifications() {
        const notifications = document.querySelectorAll('.apple-notification');
        if (notifications.length > 0) {
            gsap.fromTo(notifications, 
                { y: 30, opacity: 0, scale: 0.95 },
                {
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    duration: 0.8,
                    stagger: 0.2,
                    ease: "back.out(1.2)",
                    delay: 0.4
                }
            );
        }
    }

    const introTl = gsap.timeline({
        onComplete: () => {
            document.body.classList.remove("loading");
            const overlay = document.querySelector(".intro-overlay");
            if (overlay) overlay.remove();

            // Check if lockscreen is active
            const lockscreenPortal = document.getElementById('lockscreen-portal');
            if (!lockscreenPortal) {
                // If lockscreen isn't present, unlock content and reveal main page immediately
                document.body.classList.remove('lockscreen-locked');
                runMainReveal();
                if (typeof showBrushToast === 'function') showBrushToast();
            } else {
                // Stagger reveal recruiter notifications
                revealLockscreenNotifications();
            }
        }
    });

    introTl.to(counterObj, {
        val: 100,
        duration: 2.2,
        ease: "expo.inOut",
        onUpdate: () => {
            if (progressEl) progressEl.style.width = counterObj.val + "%";
        }
    });

    introTl.to(".intro-loader-content", {
        y: -50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.in"
    }, "+=0.2");

    introTl.to(".intro-overlay", {
        opacity: 0,
        duration: 0.6,
        ease: "power2.inOut"
    }, "-=0.4");

    // Page Reveal Timeline
    function runMainReveal() {
        const mainTl = gsap.timeline({
            onComplete: () => {
                if (typeof updateActiveBubble === 'function') updateActiveBubble();
            }
        });

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

    // Profile Scrub Text Reveal
    const scrubText = document.getElementById('scrub-text');
    if (scrubText) {
        // Split text into words safely using textContent to ensure it works even if hidden on initial render
        const text = scrubText.textContent.trim();
        scrubText.innerHTML = '';
        text.split(/\s+/).forEach(word => {
            if (word !== '') {
                const span = document.createElement('span');
                span.classList.add('scrub-word');
                span.innerText = word + ' ';
                scrubText.appendChild(span);
            }
        });

        const words = scrubText.querySelectorAll('.scrub-word');
        gsap.to(words, {
            opacity: 1,
            stagger: 0.1,
            ease: "none",
            scrollTrigger: {
                trigger: scrubText,
                start: "top 85%",
                end: "bottom 60%",
                scrub: 0.3
            }
        });
    }

    // 3D Interactive Glass Panels (Awwwards effect with settle-down mechanism)
    const glassPanels = document.querySelectorAll('.glass-panel:not(.navbar)');
    glassPanels.forEach(panel => {
        let tiltTimeout;
        const eventTarget = panel.parentElement.classList.contains('portal-wrapper') ? panel.parentElement : panel;
        
        eventTarget.addEventListener('mousemove', (e) => {
            panel.style.transition = `transform 0.1s ease-out`;
            const rect = eventTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            // Calculate tilt (reduced max tilt from 6 to 3 degrees for a gentler, more premium shift)
            const rotateX = ((y - centerY) / centerY) * -3;
            const rotateY = ((x - centerX) / centerX) * 3;
            
            panel.style.transform = `perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.005, 1.005, 1.005)`;
            
            clearTimeout(tiltTimeout);
            tiltTimeout = setTimeout(() => {
                panel.style.transition = `transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)`;
                panel.style.transform = `perspective(1200px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            }, 800); // Settle back to flat after 800ms of no movement
        });
        
        eventTarget.addEventListener('mouseleave', () => {
            clearTimeout(tiltTimeout);
            panel.style.transition = `transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)`;
            panel.style.transform = `perspective(1200px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
        });
        
        eventTarget.addEventListener('mouseenter', () => {
            panel.style.transition = `transform 0.1s ease-out`;
        });
    });

    // List Items (Credentials active tab on scroll) Staggered Reveal
    gsap.fromTo(".credentials-tab-content.active li",
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".credentials-section",
                start: "top 85%"
            }
        }
    );

    // Credentials Segmented Control Tab Switcher Logic
    const credentialsActivePill = document.querySelector('.credentials-active-pill');
    const credentialsTabBtns = document.querySelectorAll('.credentials-tab-btn');

    function updateCredentialsActivePill(instantly = false) {
        const activeBtn = document.querySelector('.credentials-tab-btn.active');
        if (activeBtn && credentialsActivePill) {
            gsap.killTweensOf(credentialsActivePill);
            gsap.to(credentialsActivePill, {
                left: activeBtn.offsetLeft,
                top: activeBtn.offsetTop,
                width: activeBtn.offsetWidth,
                height: activeBtn.offsetHeight,
                duration: instantly ? 0 : 0.4,
                ease: "power3.out"
            });
        }
    }

    if (credentialsTabBtns.length > 0) {
        credentialsTabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (btn.classList.contains('active')) return;

                // Update active button class
                credentialsTabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Animate active indicator pill
                updateCredentialsActivePill();

                // Switch active content tab
                const tabName = btn.getAttribute('data-tab');
                const currentActiveContent = document.querySelector('.credentials-tab-content.active');
                const targetContent = document.getElementById(`tab-${tabName}`);

                if (currentActiveContent && targetContent && currentActiveContent !== targetContent) {
                    const currentItems = currentActiveContent.querySelectorAll('li');
                    
                    if (currentItems.length > 0) {
                        gsap.killTweensOf(currentItems);
                        gsap.to(currentItems, {
                            opacity: 0,
                            y: -15,
                            duration: 0.25,
                            stagger: 0.02,
                            ease: "power2.in",
                            onComplete: () => {
                                currentActiveContent.classList.remove('active');
                                targetContent.classList.add('active');
                                
                                const targetItems = targetContent.querySelectorAll('li');
                                if (targetItems.length > 0) {
                                    gsap.killTweensOf(targetItems);
                                    gsap.set(targetItems, { opacity: 0, y: 20 });
                                    gsap.to(targetItems, {
                                        opacity: 1,
                                        y: 0,
                                        duration: 0.4,
                                        stagger: 0.04,
                                        ease: "power3.out"
                                    });
                                }
                            }
                        });
                    } else {
                        currentActiveContent.classList.remove('active');
                        targetContent.classList.add('active');
                        const targetItems = targetContent.querySelectorAll('li');
                        if (targetItems.length > 0) {
                            gsap.killTweensOf(targetItems);
                            gsap.set(targetItems, { opacity: 0, y: 20 });
                            gsap.to(targetItems, {
                                opacity: 1,
                                y: 0,
                                duration: 0.4,
                                stagger: 0.04,
                                ease: "power3.out"
                            });
                        }
                    }
                }
            });
        });

        // Initialize active tab pill layout immediately and also on resize / delays
        updateCredentialsActivePill(true);
        setTimeout(() => {
            updateCredentialsActivePill(true);
        }, 150);
        setTimeout(() => {
            updateCredentialsActivePill();
        }, 500);
    }

    // Nav link scroll spy — glow active section link
    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll("section[id]");

    // Active bubble logic for iOS-style selector switcher
    const activeBubble = document.querySelector('.nav-active-bubble');
    const navLinksContainer = document.querySelector('.nav-links');

    function updateActiveBubble(targetEl) {
        const target = targetEl || document.querySelector('.nav-link.active');
        if (target) {
            if (activeBubble) {
                activeBubble.style.left = `${target.offsetLeft}px`;
                activeBubble.style.top = `${target.offsetTop}px`;
                activeBubble.style.width = `${target.offsetWidth}px`;
                activeBubble.style.height = `${target.offsetHeight}px`;
                activeBubble.style.opacity = '1';
            }
        } else {
            if (activeBubble) activeBubble.style.opacity = '0';
        }
    }

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        let hasChanged = false;
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute("id");
                navLinks.forEach(link => {
                    if (link.getAttribute("href") === `#${id}`) {
                        if (!link.classList.contains("active")) {
                            navLinks.forEach(l => l.classList.remove("active"));
                            link.classList.add("active");
                            hasChanged = true;
                        }
                    }
                });
            }
        });
        if (hasChanged) {
            updateActiveBubble();
        }
    }, {
        threshold: 0,
        rootMargin: "-40% 0px -50% 0px"
    });

    sections.forEach(section => scrollSpyObserver.observe(section));

    // Listen to hover events for active bubble selector
    if (navLinksContainer) {
        navLinks.forEach(link => {
            link.addEventListener('mouseenter', () => {
                updateActiveBubble(link);
            });
        });

        navLinksContainer.addEventListener('mouseleave', () => {
            updateActiveBubble();
        });
    }

    // Initialize active bubble layout after animations/loads
    setTimeout(() => {
        updateActiveBubble();
    }, 200);

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
                        <rect x="0" y="0" width="220" height="200" rx="4" stroke="rgba(0, 119, 182, 0.4)" stroke-width="1" fill="none" />
                        <text x="10" y="25" font-family="Courier, monospace" font-size="11" fill="#0f172a">APPOINTMENT SCHEDULER</text>
                        <line x1="10" y1="35" x2="210" y2="35" stroke="rgba(0, 119, 182, 0.2)" stroke-width="1" />
                        
                        <g transform="translate(15, 50)" font-family="Courier, monospace" font-size="9" fill="#334155">
                            <text x="0" y="10">09:00 AM [BOOKED]</text>
                            <rect x="145" y="0" width="45" height="12" rx="2" fill="rgba(255, 0, 0, 0.15)" stroke="red" stroke-width="0.5" />
                            <text x="148" y="9" font-size="7" fill="red">UNAVAIL</text>

                            <text x="0" y="30">10:00 AM [PENDING]</text>
                            <rect x="145" y="20" width="45" height="12" rx="2" fill="rgba(255, 165, 0, 0.15)" stroke="orange" stroke-width="0.5" />
                            <text x="148" y="29" font-size="7" fill="orange">PENDING</text>

                            <text x="0" y="50">11:00 AM [AVAILABLE]</text>
                            <rect x="145" y="40" width="45" height="12" rx="2" fill="rgba(0, 119, 182, 0.15)" stroke="var(--accent-color)" stroke-width="0.5" class="bp-pulse" />
                            <text x="148" y="49" font-size="7" fill="var(--accent-color)">SELECT</text>

                            <text x="0" y="70">12:00 PM [AVAILABLE]</text>
                            <rect x="145" y="60" width="45" height="12" rx="2" fill="rgba(0, 119, 182, 0.05)" stroke="rgba(0, 119, 182, 0.3)" stroke-width="0.5" />
                            <text x="148" y="69" font-size="7" fill="#64748b">SELECT</text>
                            
                            <text x="0" y="90">01:00 PM [AVAILABLE]</text>
                            <rect x="145" y="80" width="45" height="12" rx="2" fill="rgba(0, 119, 182, 0.05)" stroke="rgba(0, 119, 182, 0.3)" stroke-width="0.5" />
                            <text x="148" y="89" font-size="7" fill="#64748b">SELECT</text>
                        </g>
                        <text x="15" y="180" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" opacity="0.8">SLOT_INTERVAL: 60 MIN</text>
                    </g>
                    <g transform="translate(280, 80)">
                        <rect x="0" y="0" width="290" height="200" rx="4" stroke="rgba(0, 119, 182, 0.4)" stroke-width="1" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#0f172a">APPOINTMENT SUMMARY</text>
                        <line x1="15" y1="35" x2="275" y2="35" stroke="rgba(0, 119, 182, 0.2)" stroke-width="1" />
                        <rect x="15" y="50" width="260" height="25" rx="3" stroke="rgba(0, 119, 182, 0.2)" fill="rgba(0, 119, 182, 0.03)" />
                        <text x="25" y="66" font-family="Courier, monospace" font-size="9" fill="#475569">PET: Rocky (G. Shepherd)</text>
                        
                        <rect x="15" y="85" width="260" height="25" rx="3" stroke="rgba(0, 119, 182, 0.2)" fill="rgba(0, 119, 182, 0.03)" />
                        <text x="25" y="101" font-family="Courier, monospace" font-size="9" fill="#475569">SERVICE: Anti-Rabies Vaccine</text>
                        
                        <g transform="translate(15, 122)">
                            <text x="0" y="12" font-family="Courier, monospace" font-size="9" fill="#64748b">SERVICE BASE FEE ............. $35.00</text>
                            <text x="0" y="27" font-family="Courier, monospace" font-size="9" fill="#64748b">SCHEDULING TARIFF ............ $0.00</text>
                            <line x1="0" y1="35" x2="260" y2="35" stroke="rgba(0,240,255,0.15)" stroke-width="1" stroke-dasharray="3 3" />
                            <text x="0" y="52" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">TOTAL DUE: $35.00</text>
                        </g>
                    </g>
                    <path d="M 30 310 L 570 310" stroke="rgba(0, 119, 182, 0.2)" stroke-width="1" />
                    <circle cx="45" cy="330" r="4" fill="var(--accent-color)" class="bp-pulse" />
                    <text x="60" y="334" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" opacity="0.8">TIMESLOT_VALIDATOR: STABLE</text>
                    <rect x="460" y="320" width="110" height="22" rx="3" stroke="var(--accent-color)" fill="rgba(0, 119, 182, 0.05)" />
                    <text x="475" y="335" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">SUBMIT_APPT</text>
                </svg>
                `;
            } else if (slideIndex === 1) {
                return `
                <svg class="blueprint-svg" viewBox="0 0 600 380">
                    <rect x="10" y="10" width="580" height="360" rx="6" stroke="var(--accent-color)" stroke-width="1" stroke-dasharray="10 5" fill="none" opacity="0.3" />
                    <text x="30" y="45" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="1">PET_BOARDING_LODGING // CAPACITY_CHECK</text>
                    <g transform="translate(30, 75)">
                        <rect x="0" y="0" width="540" height="210" rx="4" stroke="rgba(0, 119, 182, 0.4)" stroke-width="1" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="var(--accent-secondary)" font-weight="bold">LODGING SCHEDULER & CAPACITY</text>
                        <line x1="15" y1="35" x2="525" y2="35" stroke="rgba(0, 119, 182, 0.2)" stroke-width="1" />
                        
                        <g transform="translate(20, 50)" font-family="Courier, monospace" font-size="10" fill="#334155">
                            <text x="0" y="15">BOARDING TYPE: [OVERNIGHT]</text>
                            <rect x="240" y="2" width="260" height="20" rx="3" stroke="rgba(0, 119, 182, 0.2)" fill="rgba(0, 119, 182, 0.03)" />
                            <text x="250" y="15" fill="#64748b">Daycare | *Overnight* | Extended</text>
                            
                            <text x="0" y="50">START DATE: [JUNE 15, 2025]</text>
                            <text x="270" y="50">END DATE: [JUNE 18, 2025] (3 DAYS)</text>
                            
                            <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(0, 119, 182, 0.15)" stroke-width="1" />
                            
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
                        <rect x="0" y="0" width="240" height="215" rx="5" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="20" y="25" font-family="Courier, monospace" font-size="11" fill="#0f172a" font-weight="bold">BILLING DETAILS</text>
                        <line x1="20" y1="35" x2="220" y2="35" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="60" font-family="Courier, monospace" font-size="9" fill="#64748b">PAYEE ID: .... USER_ID#0482</text>
                        <text x="20" y="80" font-family="Courier, monospace" font-size="9" fill="#64748b">PAYABLE TYPE: . App\\\\Models\\\\Boarding</text>
                        <text x="20" y="100" font-family="Courier, monospace" font-size="9" fill="#64748b">TOTAL BILL: ... $135.00</text>
                        <line x1="20" y1="120" x2="220" y2="120" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="145" font-family="Courier, monospace" font-size="9" fill="#0f172a">METHOD: GCash</text>
                        <text x="20" y="165" font-family="Courier, monospace" font-size="9" fill="#0f172a">TYPE: 30% Deposit ($40.50)</text>
                        <text x="20" y="190" font-family="Courier, monospace" font-size="9" fill="var(--accent-secondary)" font-weight="bold">REF NO: 2025091512345</text>
                    </g>
                    <g transform="translate(290, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="5" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#0f172a" font-weight="bold">STAFF VERIFICATION QUEUE</text>
                        <line x1="15" y1="32" x2="265" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <text x="15" y="55" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">STATUS: PENDING STAFF SIGN-OFF</text>
                        
                        <g transform="translate(15, 80)" font-family="Courier, monospace" font-size="9" fill="#334155">
                            <text x="0" y="10">GCash Ref Format ..... [13 Digits] OK</text>
                            <text x="0" y="30">User Verification ... [Google Sign-in] OK</text>
                            <text x="0" y="50">Polymorphic Link .... [BoardingID #12] OK</text>
                        </g>
                        
                        <g transform="translate(15, 160)">
                            <text x="0" y="12" font-family="Courier, monospace" font-size="9" fill="#0f172a">EMAIL NOTIFIER TRIGGERS:</text>
                            <rect x="0" y="22" width="10" height="10" stroke="var(--accent-color)" fill="rgba(0,240,255,0.2)" />
                            <path d="M 2 27 L 4 29 L 8 23" stroke="var(--accent-color)" stroke-width="1.5" fill="none" />
                            <text x="18" y="31" font-family="Courier, monospace" font-size="9" fill="#334155">BookingConfirmation Mail</text>
                        </g>
                    </g>
                    <g transform="translate(30, 310)">
                        <rect x="0" y="0" width="540" height="30" rx="3" stroke="rgba(0, 119, 182, 0.3)" fill="rgba(0, 119, 182, 0.05)" stroke-width="1" />
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
                    <line x1="210" y1="130" x2="210" y2="240" stroke="rgba(0, 119, 182, 0.3)" stroke-width="1" />
                    <line x1="155" y1="185" x2="265" y2="185" stroke="rgba(0, 119, 182, 0.3)" stroke-width="1" />
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
                        <rect x="0" y="0" width="160" height="280" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="12" y="25" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">VISION SYSTEM</text>
                        <line x1="12" y1="35" x2="148" y2="35" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="55" font-family="Courier, monospace" font-size="9" fill="#64748b" class="bp-pulse">STATUS: CAPTURING</text>
                        <text x="12" y="75" font-family="Courier, monospace" font-size="9" fill="#64748b">FPS: 30.0</text>
                        <text x="12" y="95" font-family="Courier, monospace" font-size="9" fill="#64748b">LATENCY: 12MS</text>
                        <line x1="12" y1="110" x2="148" y2="110" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="130" font-family="Courier, monospace" font-size="8" fill="var(--accent-color)">> OBJ_01: CUP</text>
                        <text x="12" y="145" font-family="Courier, monospace" font-size="8" fill="var(--accent-color)">  CONF: 0.9841</text>
                        <text x="12" y="165" font-family="Courier, monospace" font-size="8" fill="var(--accent-secondary)">> OBJ_02: KEYBD</text>
                        <text x="12" y="180" font-family="Courier, monospace" font-size="8" fill="var(--accent-secondary)">  CONF: 0.9125</text>
                        <line x1="12" y1="200" x2="148" y2="200" stroke="rgba(0,240,255,0.2)" />
                        <text x="12" y="225" font-family="Courier, monospace" font-size="8" fill="#64748b">> RENDER OK</text>
                        <text x="12" y="240" font-family="Courier, monospace" font-size="8" fill="#64748b">> AUDIO_SYNCED</text>
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
                        <rect x="0" y="0" width="280" height="215" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <rect x="20" y="20" width="200" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <rect x="20" y="35" width="240" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <rect x="20" y="50" width="160" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <rect x="15" y="70" width="250" height="35" stroke="var(--accent-color)" stroke-width="1.5" fill="rgba(0,240,255,0.08)" />
                        <text x="25" y="91" font-family="Courier, monospace" font-size="13" fill="var(--accent-color)" font-weight="bold" letter-spacing="2">STEEP ELEVATION AHEAD</text>
                        <rect x="20" y="125" width="220" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <rect x="20" y="140" width="180" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <rect x="20" y="155" width="240" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <rect x="20" y="170" width="120" height="6" fill="rgba(0, 119, 182, 0.08)" />
                        <line x1="5" y1="100" x2="275" y2="100" stroke="red" stroke-width="1" stroke-dasharray="2 2" opacity="0.7" />
                    </g>
                    <g transform="translate(330, 75)">
                        <rect x="0" y="0" width="240" height="215" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#0f172a" font-weight="bold">EXTRACTED STRING</text>
                        <line x1="15" y1="32" x2="225" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <rect x="15" y="45" width="210" height="60" rx="3" stroke="rgba(0,240,255,0.15)" fill="rgba(0,240,255,0.02)" />
                        <text x="25" y="70" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold">"WARNING: STEEP ELEVATION</text>
                        <text x="25" y="88" font-family="Courier, monospace" font-size="10" fill="var(--accent-color)" font-weight="bold"> AHEAD - PROCEED SLOWLY"</text>
                        <text x="15" y="135" font-family="Courier, monospace" font-size="10" fill="#0f172a" font-weight="bold">TTS AUDIO SYNTHESIZER</text>
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
                        <rect x="0" y="0" width="240" height="215" rx="5" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <circle cx="120" cy="107" r="75" stroke="rgba(0, 119, 182, 0.3)" stroke-width="1" fill="none" />
                        <circle cx="120" cy="107" r="50" stroke="rgba(0, 119, 182, 0.2)" stroke-width="1" fill="none" />
                        <line x1="45" y1="107" x2="195" y2="107" stroke="rgba(0, 119, 182, 0.15)" />
                        <line x1="120" y1="32" x2="120" y2="182" stroke="rgba(0, 119, 182, 0.15)" />
                        <line x1="120" y1="107" x2="85" y2="72" stroke="var(--accent-color)" stroke-width="2" />
                        <circle cx="85" cy="72" r="5" fill="none" stroke="var(--accent-color)" stroke-width="1.5" class="bp-pulse" />
                        <path d="M 175 107 A 55 55 0 0 1 120 162" stroke="var(--accent-secondary)" stroke-width="1.5" stroke-dasharray="4 4" fill="none" class="bp-rotate-reverse" />
                    </g>
                    <g transform="translate(290, 75)">
                        <rect x="0" y="0" width="280" height="215" rx="5" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#0f172a" font-weight="bold">HSL DETECT DETAILS</text>
                        <line x1="15" y1="32" x2="265" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <rect x="15" y="45" width="45" height="45" rx="4" fill="var(--accent-color)" stroke="#fff" stroke-width="1" class="bp-pulse" />
                        <g transform="translate(75, 45)" fill="#475569" font-family="Courier, monospace" font-size="9">
                            <text x="0" y="10" font-weight="bold" fill="#0f172a">HEX CODE: #00F0FF (OCEAN BLUE)</text>
                            <text x="0" y="24">HUE: ..... 180 DEG (OCEAN BLUE)</text>
                            <text x="0" y="38">SAT: ..... 100%</text>
                            <text x="0" y="52">LIGHT: ... 50%</text>
                        </g>
                        <text x="15" y="125" font-family="Courier, monospace" font-size="10" fill="#0f172a" font-weight="bold">RGB DISTRIBUTION GAUGE</text>
                        <line x1="15" y1="132" x2="265" y2="132" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(15, 145)" font-family="Courier, monospace" font-size="8" fill="#475569">
                            <text x="0" y="10">R: 0</text>
                            <rect x="40" y="2" width="200" height="8" rx="2" fill="rgba(0, 119, 182, 0.05)" stroke="rgba(0, 119, 182, 0.1)" />
                            <rect x="40" y="2" width="5" height="8" rx="2" fill="red" />
                            <text x="0" y="25">G: 240</text>
                            <rect x="40" y="17" width="200" height="8" rx="2" fill="rgba(0, 119, 182, 0.05)" stroke="rgba(0, 119, 182, 0.1)" />
                            <rect x="40" y="17" width="188" height="8" rx="2" fill="green" />
                            <text x="0" y="40">B: 255</text>
                            <rect x="40" y="32" width="200" height="8" rx="2" fill="rgba(0, 119, 182, 0.05)" stroke="rgba(0, 119, 182, 0.1)" />
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
                        <rect x="0" y="0" width="250" height="200" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <g transform="translate(65, 80)">
                            <circle cx="0" cy="0" r="45" stroke="rgba(0,240,255,0.15)" stroke-width="6" fill="none" />
                            <path d="M -31.8 31.8 A 45 45 0 1 1 31.8 31.8" stroke="var(--accent-color)" stroke-width="6" fill="none" stroke-dasharray="200" stroke-dashoffset="35" />
                            <line x1="0" y1="0" x2="-10" y2="-32" stroke="var(--accent-color)" stroke-width="3.5" stroke-linecap="round" />
                            <circle cx="0" cy="0" r="5" fill="#0f172a" />
                            <text x="0" y="62" font-family="Courier, monospace" font-size="10" fill="#0f172a" font-weight="bold" text-anchor="middle">BATTERY 84%</text>
                        </g>
                        <g transform="translate(185, 80)">
                            <circle cx="0" cy="0" r="45" stroke="rgba(0,240,255,0.15)" stroke-width="6" fill="none" />
                            <path d="M -31.8 31.8 A 45 45 0 1 1 31.8 31.8" stroke="var(--accent-secondary)" stroke-width="6" fill="none" stroke-dasharray="200" stroke-dashoffset="65" />
                            <line x1="0" y1="0" x2="25" y2="-20" stroke="var(--accent-secondary)" stroke-width="3.5" stroke-linecap="round" />
                            <circle cx="0" cy="0" r="5" fill="#0f172a" />
                            <text x="0" y="62" font-family="Courier, monospace" font-size="10" fill="#0f172a" font-weight="bold" text-anchor="middle">SOLAR 18.2V</text>
                        </g>
                        <line x1="20" y1="160" x2="230" y2="160" stroke="rgba(0,240,255,0.2)" />
                        <text x="20" y="182" font-family="Courier, monospace" font-size="9" fill="var(--accent-color)">SOLAR_CELL_STATUS: GENERATING</text>
                    </g>
                    <g transform="translate(300, 80)">
                        <rect x="0" y="0" width="270" height="200" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="15" y="25" font-family="Courier, monospace" font-size="11" fill="#0f172a" font-weight="bold">WASTE VOL FILL MATRIX</text>
                        <line x1="15" y1="32" x2="255" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(25, 50)">
                            <rect x="0" y="0" width="35" height="120" rx="3" stroke="rgba(0,240,255,0.3)" fill="none" />
                            <rect x="3" y="66" width="29" height="51" rx="2" fill="var(--accent-color)" class="bp-pulse" />
                            <line x1="-5" y1="0" x2="0" y2="0" stroke="rgba(0,240,255,0.5)" />
                            <line x1="-5" y1="30" x2="0" y2="30" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="60" x2="0" y2="60" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="90" x2="0" y2="90" stroke="rgba(0,240,255,0.3)" />
                            <line x1="-5" y1="120" x2="0" y2="120" stroke="rgba(0,240,255,0.5)" />
                            <text x="-12" y="5" font-family="Courier, monospace" font-size="8" fill="#64748b">F</text>
                            <text x="-12" y="123" font-family="Courier, monospace" font-size="8" fill="#64748b">E</text>
                        </g>
                        <g transform="translate(85, 50)" font-family="Courier, monospace" font-size="9" fill="#475569">
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
                        <rect x="0" y="0" width="310" height="215" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="#0f172a" font-weight="bold">TRIGGER EVENT OSCILLOSCOPE</text>
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
                        <rect x="0" y="0" width="210" height="215" rx="4" stroke="rgba(0, 119, 182, 0.4)" fill="none" />
                        <text x="15" y="22" font-family="Courier, monospace" font-size="11" fill="var(--accent-color)" font-weight="bold">TRIGGER LOGS</text>
                        <line x1="15" y1="32" x2="195" y2="32" stroke="rgba(0,240,255,0.2)" />
                        <g transform="translate(15, 45)" font-family="Courier, monospace" font-size="8" fill="#64748b">
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
        },
        physicslegends: {
            title: "Physics Legends",
            role: "Lead Developer",
            year: "2026",
            desc: "Developed a gamified educational web application to teach high school and college-level physics. Players solve real-time physics equations—such as free fall kinematics, projectile motion coordinates, and work-energy formulas—to launch attacks and defeat conceptual bosses. Implemented interactive parameter inputs, math equation parsing, dynamic canvas animation logic, real-time health updates, scoring mechanics, and formula helpers to make physics intuitive and engaging.",
            tags: ["JavaScript", "HTML5 Canvas", "CSS3", "Gamification", "Educational Software"],
            codeLink: "https://github.com/specertorduke/physics-game-v3",
            slides: [
                {
                    imgSrc: "assets/img/Physics Legends images/main menu.jpg",
                    caption: "Main Menu Interface: Features an interactive, retro-themed retro game dashboard with options to start the game, read how to play instructions, view formula reference sheets, and check project credits.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/Physics Legends images/select battle.jpg",
                    caption: "Battle Selection Screen: Players progress through six specialized levels covering Free Fall, Projectile Motion, Work & Energy, Power & Efficiency, 2D Motion, and Combined Physics.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/Physics Legends images/gameplay.jpg",
                    caption: "Gameplay Mechanics: Conceptual challenges require calculating formulas (e.g. free fall duration) to execute attacks. Features interactive UI feedback, custom hints, hero/boss health meters, and combo multipliers.",
                    overlayText: ""
                }
            ]
        },
        umintramurals: {
            title: "UM Intramurals",
            role: "Web Developer",
            year: "2025",
            desc: "A modern, interactive website for the University of Mindanao Intramurals program featuring stunning animations, responsive design, and comprehensive user management. Features a stunning hero section with animated text/floating elements, interactive sports cards, live tournament dashboards with real-time score updates, dynamic podium leaderboards, smooth navigation, and a robust authentication system (login/registration) with real-time field validation, password toggles, and countdown redirects.",
            tags: ["HTML5", "CSS3", "Vanilla JavaScript", "Font Awesome", "Google Fonts (Poppins)"],
            slides: [
                {
                    imgSrc: "assets/img/UM Intramurals images/landing.jpg",
                    caption: "Landing Page: A visually striking portal for the sports program featuring cozy gradients, animated navigation, and quick access buttons to start the journey or view scheduling matrices.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/UM Intramurals images/sports.jpg",
                    caption: "Sports Selection Module: An interactive sports hub displaying individual athletic categories (Basketball, Volleyball, Football, E-Sports, Table Tennis, Cheerdance) with dynamic card hover animations showing active teams and registered players.",
                    overlayText: ""
                },
                {
                    imgSrc: "assets/img/UM Intramurals images/leaderboard.jpg",
                    caption: "Hall of Fame Leaderboard: A real-time scoring dashboard featuring a custom animated 3D podium layout for the top 3 colleges (CCE, CEE, CBAE) and a detailed grid view for general rankings.",
                    overlayText: ""
                }
            ]
        }
    };

    // Projects 3D Coverflow Slider implementation
    const sliderTrack = document.getElementById('projects-slider-track');
    const sliderCards = Array.from(sliderTrack ? sliderTrack.children : []);
    const sliderPrevBtn = document.getElementById('projects-prev-btn');
    const sliderNextBtn = document.getElementById('projects-next-btn');
    const sliderPagination = document.getElementById('projects-slider-pagination');
    
    let activeSliderIndex = 3; // Default to Pharmacy Triage in the center

    // Build pagination dots
    if (sliderPagination) {
        sliderPagination.innerHTML = '';
        
        // Append active pill first
        const activePill = document.createElement('div');
        activePill.className = 'slider-dot-active-pill';
        sliderPagination.appendChild(activePill);

        sliderCards.forEach((card, index) => {
            const dot = document.createElement('span');
            dot.className = `slider-dot ${index === activeSliderIndex ? 'active' : ''}`;
            dot.setAttribute('data-index', index);
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                setActiveSliderIndex(index);
            });
            sliderPagination.appendChild(dot);
        });
        
        window.lastActiveSliderIndex = activeSliderIndex;
    }

    function setActiveSliderIndex(index) {
        if (index < 0) index = 0;
        if (index >= sliderCards.length) index = sliderCards.length - 1;
        
        activeSliderIndex = index;
        updateProjectsSlider();
    }

    function updateProjectsSlider() {
        const dots = sliderPagination ? Array.from(sliderPagination.querySelectorAll('.slider-dot')) : [];
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === activeSliderIndex);
        });

        // Sliding Active Pill logic
        const activeDot = dots[activeSliderIndex];
        const activePill = sliderPagination ? sliderPagination.querySelector('.slider-dot-active-pill') : null;
        if (activeDot && activePill) {
            const targetLeft = activeDot.offsetLeft;
            window.lastActiveSliderIndex = activeSliderIndex;
            
            gsap.killTweensOf(activePill);
            gsap.to(activePill, {
                left: targetLeft - 8,
                width: 24,
                duration: 0.4,
                ease: "power3.out",
                overwrite: "auto"
            });
        }

        sliderCards.forEach((card, index) => {
            const offset = index - activeSliderIndex;
            
            card.classList.toggle('active', index === activeSliderIndex);
            
            let xVal = 0;
            let scaleVal = 1;
            let rotYVal = 0;
            let zVal = 0;
            let opacityVal = 0;
            let zIndexVal = 0;
            let pointerEvents = 'none';

            const isMobile = window.innerWidth <= 768;

            if (offset === 0) {
                xVal = 0;
                scaleVal = isMobile ? 1.0 : 1.15;
                rotYVal = 0;
                zVal = isMobile ? 0 : 120;
                opacityVal = 1;
                zIndexVal = 10;
                pointerEvents = 'auto';
            } else if (offset === -1) {
                xVal = isMobile ? -130 : -210;
                scaleVal = isMobile ? 0.82 : 0.88;
                rotYVal = isMobile ? 10 : 20;
                zVal = isMobile ? -50 : 0;
                opacityVal = 0.65;
                zIndexVal = 5;
                pointerEvents = 'auto';
            } else if (offset === 1) {
                xVal = isMobile ? 130 : 210;
                scaleVal = isMobile ? 0.82 : 0.88;
                rotYVal = isMobile ? -10 : -20;
                zVal = isMobile ? -50 : 0;
                opacityVal = 0.65;
                zIndexVal = 5;
                pointerEvents = 'auto';
            } else if (offset === -2) {
                xVal = isMobile ? -230 : -390;
                scaleVal = isMobile ? 0.68 : 0.72;
                rotYVal = isMobile ? 15 : 35;
                zVal = isMobile ? -100 : -80;
                opacityVal = 0.25;
                zIndexVal = 2;
                pointerEvents = 'auto';
            } else if (offset === 2) {
                xVal = isMobile ? 230 : 390;
                scaleVal = isMobile ? 0.68 : 0.72;
                rotYVal = isMobile ? -15 : -35;
                zVal = isMobile ? -100 : -80;
                opacityVal = 0.25;
                zIndexVal = 2;
                pointerEvents = 'auto';
            } else if (offset < -2) {
                xVal = -500;
                scaleVal = 0.55;
                rotYVal = 45;
                zVal = -150;
                opacityVal = 0;
                zIndexVal = 1;
            } else if (offset > 2) {
                xVal = 500;
                scaleVal = 0.55;
                rotYVal = -45;
                zVal = -150;
                opacityVal = 0;
                zIndexVal = 1;
            }

            gsap.killTweensOf(card);
            
            let transformString = `translateX(${xVal}px) scale(${scaleVal}) rotateY(${rotYVal}deg) translateZ(${zVal}px)`;
            
            gsap.to(card, {
                transform: transformString,
                opacity: opacityVal,
                duration: 0.8,
                ease: "power4.out",
                overwrite: "auto",
                onStart: () => {
                    card.style.zIndex = zIndexVal;
                    card.style.pointerEvents = pointerEvents;
                }
            });
        });
    }

    // Event listeners for prev/next buttons
    if (sliderPrevBtn) {
        sliderPrevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeSliderIndex > 0) {
                setActiveSliderIndex(activeSliderIndex - 1);
            } else {
                setActiveSliderIndex(sliderCards.length - 1);
            }
        });
    }

    if (sliderNextBtn) {
        sliderNextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (activeSliderIndex < sliderCards.length - 1) {
                setActiveSliderIndex(activeSliderIndex + 1);
            } else {
                setActiveSliderIndex(0);
            }
        });
    }

    // Allow clicking on any card to bring it to center or open modal
    sliderCards.forEach((card, index) => {
        card.addEventListener('click', (e) => {
            if (index === activeSliderIndex) {
                const projectId = card.getAttribute('data-project-id');
                if (projectId) openProjectPortal(projectId);
            } else {
                e.preventDefault();
                e.stopPropagation();
                setActiveSliderIndex(index);
            }
        });
    });

    // Touch support for swiping
    if (sliderTrack) {
        let sliderStartX = 0;
        let isSliderSwiping = false;
        
        sliderTrack.addEventListener('touchstart', (e) => {
            sliderStartX = e.touches[0].clientX;
            isSliderSwiping = true;
        }, { passive: true });

        sliderTrack.addEventListener('touchmove', (e) => {
            if (!isSliderSwiping) return;
            const diffX = e.touches[0].clientX - sliderStartX;
            
            if (Math.abs(diffX) > 60) { // Threshold
                if (diffX > 0) {
                    setActiveSliderIndex(activeSliderIndex - 1);
                } else {
                    setActiveSliderIndex(activeSliderIndex + 1);
                }
                isSliderSwiping = false;
            }
        }, { passive: true });

        sliderTrack.addEventListener('touchend', () => {
            isSliderSwiping = false;
        });
    }

    // Initialize slider position
    updateProjectsSlider();
    window.addEventListener('resize', updateProjectsSlider);

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

        // Dynamically scale down font size for longer titles to prevent wrapping/overflow
        const titleLen = data.title.length;
        if (titleLen > 12) {
            titleElem.style.fontSize = '1.7rem';
        } else if (titleLen >= 9) {
            titleElem.style.fontSize = '2.1rem';
        } else {
            titleElem.style.fontSize = '2.8rem';
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

        // Animate tags immediately on portal load
        gsap.fromTo("#portal-tags .tag",
            { scale: 0.8, opacity: 0 },
            {
                scale: 1,
                opacity: 1,
                duration: 0.4,
                stagger: 0.05,
                ease: "back.out(1.7)"
            }
        );

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
                let svgStr = getBlueprintSVG(projectId, idx);
                if (svgStr) {
                    svgStr = svgStr
                        .replace(/fill="#0f172a"/g, 'fill="var(--text-color)"')
                        .replace(/fill="#334155"/g, 'fill="var(--portal-desc-color)"')
                        .replace(/fill="#475569"/g, 'fill="var(--portal-desc-color)"')
                        .replace(/fill="#64748b"/g, 'fill="var(--portal-desc-color)"');
                }
                mediaContent = svgStr;
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
        
        // Clear inline transforms on the portal container to reset it for the next open animation
        const portalContainer = portal.querySelector('.portal-container');
        if (portalContainer) {
            portalContainer.style.transform = '';
            portalContainer.style.transition = '';
        }
    }

    if (closeBtn) closeBtn.addEventListener('click', closePortal);
    if (overlay) overlay.addEventListener('click', closePortal);

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && portal.classList.contains('active')) {
            closePortal();
        }
    });

    // ==========================================
    // 7. LIQUID GLASS LOCKSCREEN LOGIC (iOS STYLE)
    // ==========================================
    const lockscreenPortal = document.getElementById('lockscreen-portal');
    const lockscreenGlass = document.querySelector('.lockscreen-glass');
    const sketchLeft = document.querySelector('.sketch-left');
    const sketchRight = document.querySelector('.sketch-right');
 
    if (lockscreenPortal && lockscreenGlass) {
        // Clock and Date updates
        function updateLockscreenClock() {
            const clockEl = document.getElementById('lockscreen-clock');
            const dateEl = document.getElementById('lockscreen-date');
            const statusTimeEl = document.getElementById('status-time');
            if (!clockEl) return;
            
            const now = new Date();
            let hours = now.getHours();
            let minutes = now.getMinutes();
            hours = hours < 10 ? '0' + hours : hours;
            minutes = minutes < 10 ? '0' + minutes : minutes;
            
            clockEl.textContent = `${hours}:${minutes}`;
            if (statusTimeEl) statusTimeEl.textContent = `${hours}:${minutes}`;
            
            const options = { weekday: 'long', month: 'long', day: 'numeric' };
            if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options);
        }
        updateLockscreenClock();
        setInterval(updateLockscreenClock, 1000);
 
        // Language cycling greeting
        const greetings = [
            "Hi, I am Zander",
            "Hola, soy Zander",
            "Bonjour, je suis Zander",
            "Ciao, sono Zander"
        ];
        let greetingIndex = 0;
        const greetingEl = document.getElementById('lockscreen-greeting');
        
        if (greetingEl) {
            greetingEl.textContent = greetings[0];
            greetingEl.classList.add('active');
            
            setInterval(() => {
                greetingEl.classList.remove('active');
                greetingEl.classList.add('fade-out');
                
                setTimeout(() => {
                    greetingIndex = (greetingIndex + 1) % greetings.length;
                    greetingEl.textContent = greetings[greetingIndex];
                    greetingEl.classList.remove('fade-out');
                    greetingEl.classList.add('active');
                }, 500);
            }, 2000);
        }
 
        // Swipe up gesture mechanics
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        let lockscreenHeight = window.innerHeight;
        
        window.addEventListener('resize', () => {
            lockscreenHeight = window.innerHeight;
        });
        
        const startDrag = (y) => {
            startY = y;
            currentY = y; // Fix auto-unlock: initialize currentY on mousedown/touchstart
            isDragging = true;
            lockscreenGlass.style.transition = 'none';
            if (sketchLeft) sketchLeft.style.transition = 'none';
            if (sketchRight) sketchRight.style.transition = 'none';
        };
        
        const moveDrag = (y) => {
            if (!isDragging) return;
            currentY = y;
            let diffY = currentY - startY;
            
            // Only allow dragging UP
            if (diffY > 0) diffY = 0;
            
            lockscreenGlass.style.transform = `translateY(${diffY}px)`;
 
            // Calculate swipe progress relative to 25% height threshold
            const maxDistance = lockscreenHeight * 0.25;
            let progress = Math.min(Math.abs(diffY) / maxDistance, 1);
 
            // Animate sketches based on progress
            if (sketchLeft && sketchRight) {
                sketchLeft.style.transform = `translateX(${-progress * 150}px)`;
                sketchLeft.style.opacity = `${0.85 - progress * 0.85}`;
                
                sketchRight.style.transform = `translateX(${progress * 150}px)`;
                sketchRight.style.opacity = `${0.85 - progress * 0.85}`;
            }
        };
        
        const endDrag = () => {
            if (!isDragging) return;
            isDragging = false;
            let diffY = currentY - startY;
            
            // Threshold is 25% of the screen height
            const threshold = -lockscreenHeight * 0.25;
            if (diffY < threshold) {
                // Unlock: slide away completely off screen
                lockscreenGlass.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                lockscreenGlass.style.transform = 'translateY(-105vh)';
                lockscreenPortal.style.pointerEvents = 'none';
                
                // Animate sketches out of view completely
                if (sketchLeft) {
                    sketchLeft.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    sketchLeft.style.transform = 'translateX(-350px)';
                    sketchLeft.style.opacity = '0';
                }
                if (sketchRight) {
                    sketchRight.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
                    sketchRight.style.transform = 'translateX(350px)';
                    sketchRight.style.opacity = '0';
                }
 
                // Unlock main page content
                document.body.classList.remove('lockscreen-locked');
                
                // Trigger the main page content animations on unlock!
                runMainReveal();
                if (typeof showBrushToast === 'function') showBrushToast();
                
                // Hide custom pointer occlusion blocks if any
                setTimeout(() => {
                    lockscreenPortal.remove();
                }, 600);
            } else {
                // Snap back down
                lockscreenGlass.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                lockscreenGlass.style.transform = 'translateY(0)';
 
                // Snap sketches back to resting state
                if (sketchLeft) {
                    sketchLeft.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                    sketchLeft.style.transform = 'translateX(0)';
                    sketchLeft.style.opacity = '0.85';
                }
                if (sketchRight) {
                    sketchRight.style.transition = 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
                    sketchRight.style.transform = 'translateX(0)';
                    sketchRight.style.opacity = '0.85';
                }
            }
        };
        
        // Prevent notification scrolling from bubbling up and dragging the lockscreen
        const notificationsContainer = document.querySelector('.lockscreen-notifications');
        if (notificationsContainer) {
            const stopPropagation = (e) => e.stopPropagation();
            notificationsContainer.addEventListener('touchstart', stopPropagation, { passive: true });
            notificationsContainer.addEventListener('touchmove', stopPropagation, { passive: true });
            notificationsContainer.addEventListener('touchend', stopPropagation);
            notificationsContainer.addEventListener('mousedown', stopPropagation);
        }

        // Prevent theme selector widget clicks from dragging the lockscreen
        const widgets = document.querySelectorAll('.lockscreen-widget');
        widgets.forEach(widget => {
            const stopPropagation = (e) => e.stopPropagation();
            widget.addEventListener('touchstart', stopPropagation, { passive: true });
            widget.addEventListener('touchmove', stopPropagation, { passive: true });
            widget.addEventListener('touchend', stopPropagation);
            widget.addEventListener('mousedown', stopPropagation);
        });

        // Touch events
        lockscreenGlass.addEventListener('touchstart', (e) => {
            startDrag(e.touches[0].clientY);
        }, { passive: true });
        
        lockscreenGlass.addEventListener('touchmove', (e) => {
            moveDrag(e.touches[0].clientY);
        }, { passive: true });
        
        lockscreenGlass.addEventListener('touchend', endDrag);
        
        // Mouse events
        lockscreenGlass.addEventListener('mousedown', (e) => {
            startDrag(e.clientY);
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                moveDrag(e.clientY);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDragging) {
                endDrag();
            }
        });
    }

    // 8. INTERACTIVE 3D PARALLAX BACKGROUND SKETCH ELEMENTS
    const decorTracks = document.querySelectorAll('.decor-track');
    const decorItems = document.querySelectorAll('.decor-item');

    if (decorTracks.length > 0) {
        // Activate Scroll Parallax using ScrollTrigger
        decorTracks.forEach(track => {
            const speed = parseFloat(track.getAttribute('data-speed')) || 0.1;
            
            gsap.to(track, {
                y: () => -window.scrollY * speed * 2.2,
                ease: "none",
                scrollTrigger: {
                    trigger: "body",
                    start: "top top",
                    end: "bottom bottom",
                    scrub: 0.5
                }
            });
        });

        // Activate Mouse Tracking Parallax (only for fine pointers/desktop)
        if (window.matchMedia("(pointer: fine)").matches) {
            window.addEventListener('mousemove', (e) => {
                const offsetX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
                const offsetY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);

                decorItems.forEach((item, index) => {
                    const factorX = (index % 2 === 0 ? 35 : -45) * (1 + (index * 0.15));
                    const factorY = (index % 2 === 0 ? -35 : 45) * (1 + (index * 0.15));
                    const rotateFactor = (index % 2 === 0 ? 12 : -12);

                    gsap.to(item, {
                        x: offsetX * factorX,
                        y: offsetY * factorY,
                        rotation: offsetX * rotateFactor,
                        duration: 1.4,
                        ease: "power2.out"
                    });
                });
            });
        }
    }

    // 9. DISSOLVING PURE BLACK PAINT BRUSH SYSTEM
    const rippleCanvas = document.getElementById('ripple-canvas');
    if (rippleCanvas) {
        const ctx = rippleCanvas.getContext('2d');
        let ripples = []; // tracks active paint stroke points
        let mouseX = 0;
        let mouseY = 0;
        let lastX = 0;
        let lastY = 0;
        let lastTime = Date.now();

        // Brush Customizer State
        let isDrawModeEnabled = false;
        const brushConfig = {
            width: 8,
            colorTemplate: 'rgba(12, 12, 12, opacity)',
            fadeSpeed: 0.95 / (6 * 65) // Default based on fade slider value 65 (~0.002435)
        };

        // Query DOM elements
        const brushToggleBtn = document.getElementById('brush-toggle-btn');
        const brushPanel = document.getElementById('brush-panel');
        const brushPanelClose = document.getElementById('brush-panel-close');
        const brushEnableChk = document.getElementById('brush-enable-chk');
        const brushWidthSlider = document.getElementById('brush-width-slider');
        const brushWidthVal = document.getElementById('brush-width-val');
        const brushFadeSlider = document.getElementById('brush-fade-slider');
        const brushFadeVal = document.getElementById('brush-fade-val');
        const presetButtons = document.querySelectorAll('.color-preset-btn');
        const colorPicker = document.getElementById('brush-color-picker');
        const customColorWrap = document.querySelector('.custom-color-wrap');
        const navBrushBadge = document.querySelector('.nav-brush-badge');
        const brushToast = document.getElementById('brush-toast');

        // Conversion helper from hex color to RGBA Template
        function hexToRgbaTemplate(hex) {
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            if (result) {
                const r = parseInt(result[1], 16);
                const g = parseInt(result[2], 16);
                const b = parseInt(result[3], 16);
                return `rgba(${r}, ${g}, ${b}, opacity)`;
            }
            return 'rgba(12, 12, 12, opacity)';
        }

        // Display Welcoming Toast
        showBrushToast = function() {
            if (brushToast) {
                brushToast.classList.add('show');
                setTimeout(() => {
                    brushToast.classList.remove('show');
                }, 6000);
            }
        };

        // Sync initial state values
        if (brushWidthSlider && brushWidthVal) {
            brushWidthVal.textContent = `${brushWidthSlider.value}px`;
            brushConfig.width = parseInt(brushWidthSlider.value, 10);
        }
        if (brushFadeSlider && brushFadeVal) {
            brushFadeVal.textContent = `${(brushFadeSlider.value / 10).toFixed(1)}s`;
            brushConfig.fadeSpeed = 0.95 / (6 * brushFadeSlider.value);
        }

        // Toggle draw customizer panel
        if (brushToggleBtn && brushPanel) {
            brushToggleBtn.addEventListener('click', () => {
                const isOpening = !brushPanel.classList.contains('active');
                brushPanel.classList.toggle('active');

                // Close theme panel if opening brush panel
                if (isOpening) {
                    const themePanel = document.getElementById('theme-panel');
                    const themeToggleBtn = document.getElementById('theme-toggle-btn');
                    if (themePanel) themePanel.classList.remove('active');
                    if (themeToggleBtn) themeToggleBtn.classList.remove('active-mode');
                }

                // If opening panel and drawing is disabled, turn it on automatically for better UX
                if (isOpening && !isDrawModeEnabled) {
                    isDrawModeEnabled = true;
                    if (brushEnableChk) brushEnableChk.checked = true;
                    brushToggleBtn.classList.add('active-mode');
                }

                // Remove the "NEW" badge on first click
                if (navBrushBadge) {
                    gsap.to(navBrushBadge, {
                        opacity: 0,
                        scale: 0.8,
                        duration: 0.3,
                        onComplete: () => navBrushBadge.remove()
                    });
                }
            });
        }

        // Close panel button
        if (brushPanelClose && brushPanel) {
            brushPanelClose.addEventListener('click', () => {
                brushPanel.classList.remove('active');
            });
        }

        // Draw mode checkbox switch
        if (brushEnableChk) {
            brushEnableChk.addEventListener('change', () => {
                isDrawModeEnabled = brushEnableChk.checked;
                if (isDrawModeEnabled) {
                    if (brushToggleBtn) brushToggleBtn.classList.add('active-mode');
                } else {
                    if (brushToggleBtn) brushToggleBtn.classList.remove('active-mode');
                }
            });
        }

        // Width slider change
        if (brushWidthSlider && brushWidthVal) {
            brushWidthSlider.addEventListener('input', () => {
                const val = brushWidthSlider.value;
                brushWidthVal.textContent = `${val}px`;
                brushConfig.width = parseInt(val, 10);
            });
        }

        // Fade speed slider change
        if (brushFadeSlider && brushFadeVal) {
            brushFadeSlider.addEventListener('input', () => {
                const val = brushFadeSlider.value;
                brushFadeVal.textContent = `${(val / 10).toFixed(1)}s`;
                brushConfig.fadeSpeed = 0.95 / (6 * val);
            });
        }

        // Preset color buttons selection
        presetButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                if (customColorWrap) customColorWrap.classList.remove('active');
                btn.classList.add('active');

                const color = btn.getAttribute('data-color');
                brushConfig.colorTemplate = color;

                // Sync custom color picker value
                if (colorPicker) {
                    if (color.includes('12, 12, 12')) {
                        colorPicker.value = '#0c0c0c';
                    } else if (color.includes('0, 119, 182')) {
                        colorPicker.value = '#0077b6';
                    } else if (color.includes('0, 180, 216')) {
                        colorPicker.value = '#00b4d8';
                    } else if (color.includes('239, 35, 60')) {
                        colorPicker.value = '#ef233c';
                    }
                }
            });
        });

        // Custom color picker input
        if (colorPicker) {
            colorPicker.addEventListener('input', () => {
                presetButtons.forEach(b => b.classList.remove('active'));
                if (customColorWrap) customColorWrap.classList.add('active');
                const hex = colorPicker.value;
                brushConfig.colorTemplate = hexToRgbaTemplate(hex);
            });
        }

        function resizeCanvas() {
            const container = rippleCanvas.parentElement;
            if (container) {
                rippleCanvas.width = container.clientWidth;
                rippleCanvas.height = container.clientHeight;
            }
        }
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const startDrawing = (clientX, clientY) => {
            const rect = rippleCanvas.getBoundingClientRect();
            lastX = clientX - rect.left;
            lastY = clientY - rect.top;
            lastTime = Date.now();
        };

        const drawStroke = (clientX, clientY) => {
            const rect = rippleCanvas.getBoundingClientRect();
            mouseX = clientX - rect.left;
            mouseY = clientY - rect.top;

            const now = Date.now();
            const timeDiff = Math.max(now - lastTime, 1);
            const dist = Math.hypot(mouseX - lastX, mouseY - lastY);
            
            // Tight 2.5px threshold makes the stroke solid and connected
            if (dist > 2.5 && ripples.length < 850) {
                const speed = dist / timeDiff;
                
                // Velocity-sensitive width scaling: slower = thicker, faster = thinner
                const speedFactor = Math.min(speed * 1.5, 5) * (brushConfig.width / 8);
                const maxRadius = brushConfig.width * 1.2;
                const minRadius = brushConfig.width * 0.4;
                const radius = Math.max(minRadius, maxRadius - speedFactor);

                ripples.push({
                    x: mouseX,
                    y: mouseY,
                    radius: radius,
                    opacity: 0.95, // High initial opacity for solid paint look
                    fadeSpeed: brushConfig.fadeSpeed,
                    colorTemplate: brushConfig.colorTemplate
                });

                lastX = mouseX;
                lastY = mouseY;
                lastTime = now;
            }
        };

        // Track pointer coordinates and draw a continuous, speed-sensitive brush stroke
        window.addEventListener('mousemove', (e) => {
            // Only spawn paint points if drawing mode is active
            if (!isDrawModeEnabled) return;
            drawStroke(e.clientX, e.clientY);
        });

        // Initialize drag coordinates on mousedown to avoid speed jumps
        window.addEventListener('mousedown', (e) => {
            if (!isDrawModeEnabled) return;
            startDrawing(e.clientX, e.clientY);
        });

        // Mobile touch events support
        window.addEventListener('touchstart', (e) => {
            if (!isDrawModeEnabled) return;
            const touch = e.touches[0];
            startDrawing(touch.clientX, touch.clientY);
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            if (!isDrawModeEnabled) return;
            // Prevent standard mobile scrolling so user can draw smoothly
            e.preventDefault();
            const touch = e.touches[0];
            drawStroke(touch.clientX, touch.clientY);
        }, { passive: false });

        // Paint rendering loop
        function animateInk() {
            requestAnimationFrame(animateInk);

            ctx.clearRect(0, 0, rippleCanvas.width, rippleCanvas.height);

            for (let i = ripples.length - 1; i >= 0; i--) {
                const ink = ripples[i];
                ink.opacity -= ink.fadeSpeed;

                // Remove point if fully dissolved
                if (ink.opacity <= 0) {
                    ripples.splice(i, 1);
                    continue;
                }

                // Draw solid paint stroke circles using saved color template
                ctx.save();
                ctx.beginPath();
                ctx.fillStyle = ink.colorTemplate.replace('opacity', ink.opacity);
                ctx.arc(ink.x, ink.y, ink.radius, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }

        animateInk();
    }

    // ==========================================
    // 8. iOS EYE PROTECTION SYSTEM LOGIC
    // ==========================================
    let activeTheme = localStorage.getItem('portfolio-theme') || 'normal';
    let eyecareIntensity = parseInt(localStorage.getItem('eyecare-intensity') || '100', 10);

    const eyeOverlay = document.getElementById('eye-protection-overlay');
    const intensitySlider = document.getElementById('eyecare-intensity-slider');
    const intensityVal = document.getElementById('eyecare-intensity-val');
    const themePanel = document.getElementById('theme-panel');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themePanelClose = document.getElementById('theme-panel-close');
    const brushPanel = document.getElementById('brush-panel');

    function updateOverlayTint() {
        if (!eyeOverlay) return;
        const opacity = eyecareIntensity / 100;
        
        if (activeTheme === 'truetone') {
            eyeOverlay.style.backgroundColor = `rgba(216, 125, 32, ${0.08 * opacity})`;
        } else if (activeTheme === 'nightshift') {
            eyeOverlay.style.backgroundColor = `rgba(227, 100, 20, ${0.16 * opacity})`;
        } else {
            eyeOverlay.style.backgroundColor = 'transparent';
        }
    }

    function updateSegmentPills() {
        // Recalculate lockscreen widget active pill layout
        const activeLockBtn = document.querySelector('.theme-segment-btn.active');
        const lockPill = document.querySelector('.theme-active-pill');
        if (activeLockBtn && lockPill) {
            lockPill.style.left = `${activeLockBtn.offsetLeft}px`;
            lockPill.style.top = `${activeLockBtn.offsetTop}px`;
            lockPill.style.width = `${activeLockBtn.offsetWidth}px`;
            lockPill.style.height = `${activeLockBtn.offsetHeight}px`;
        }

        // Recalculate Control Center active pill layout
        const activePanelBtn = document.querySelector('.panel-theme-btn.active');
        const panelPill = document.querySelector('.panel-active-pill');
        if (activePanelBtn && panelPill) {
            panelPill.style.left = `${activePanelBtn.offsetLeft}px`;
            panelPill.style.top = `${activePanelBtn.offsetTop}px`;
            panelPill.style.width = `${activePanelBtn.offsetWidth}px`;
            panelPill.style.height = `${activePanelBtn.offsetHeight}px`;
        }
    }

    function setTheme(themeName) {
        document.body.classList.remove('theme-normal', 'theme-truetone', 'theme-nightshift', 'theme-dark');
        document.body.classList.add(`theme-${themeName}`);

        // Update active class on lockscreen picker buttons
        document.querySelectorAll('.theme-segment-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
        });

        // Update active class on settings drawer segment buttons
        document.querySelectorAll('.panel-theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.getAttribute('data-theme') === themeName);
        });

        activeTheme = themeName;
        localStorage.setItem('portfolio-theme', themeName);

        updateOverlayTint();
        setTimeout(updateSegmentPills, 40);
    }

    // Initialize state
    setTheme(activeTheme);
    
    if (intensitySlider) {
        intensitySlider.value = eyecareIntensity;
        if (intensityVal) intensityVal.textContent = `${eyecareIntensity}%`;
        
        intensitySlider.addEventListener('input', () => {
            eyecareIntensity = parseInt(intensitySlider.value, 10);
            if (intensityVal) intensityVal.textContent = `${eyecareIntensity}%`;
            localStorage.setItem('eyecare-intensity', eyecareIntensity);
            updateOverlayTint();
        });
    }

    // Segment button click listeners on Lockscreen Widget
    document.querySelectorAll('.theme-segment-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering swipe/lock events on clicking buttons
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    // Segment button click listeners on settings CC drawer
    document.querySelectorAll('.panel-theme-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const theme = btn.getAttribute('data-theme');
            setTheme(theme);
        });
    });

    // Show/hide Display customizer drawer panel
    if (themeToggleBtn && themePanel) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = themePanel.classList.toggle('active');
            themeToggleBtn.classList.toggle('active-mode', isOpen);

            // Close drawing customize panel if display settings is open
            if (isOpen && brushPanel) {
                brushPanel.classList.remove('active');
                const brushToggleBtn = document.getElementById('brush-toggle-btn');
                if (brushToggleBtn) brushToggleBtn.classList.remove('active-mode');
            }

            setTimeout(updateSegmentPills, 40);
        });
    }

    if (themePanelClose) {
        themePanelClose.addEventListener('click', () => {
            themePanel.classList.remove('active');
            if (themeToggleBtn) themeToggleBtn.classList.remove('active-mode');
        });
    }

    // Realign pills on screen resizing / display changes
    window.addEventListener('resize', () => {
        updateSegmentPills();
        updateCredentialsActivePill(true);
    });
    
    // Initial realign once the fonts and animations load/reveal
    setTimeout(() => {
        updateSegmentPills();
        updateCredentialsActivePill(true);
    }, 500);

    // Done initializing
});
