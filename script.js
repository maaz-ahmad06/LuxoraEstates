document.addEventListener("DOMContentLoaded", () => {

    // ==========================================
    // 0. GSAP & SCROLLTRIGGER FALLBACK
    // ==========================================
    const preloader = document.getElementById("preloader");
    const loaderContent = document.querySelector(".loader-content");

    if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
        console.warn("GSAP or ScrollTrigger CDN load failed. Applying static layout fallback.");
        setTimeout(() => {
            if (preloader) preloader.style.display = "none";
            // Reveal all elements hidden by initial GSAP styles
            const hiddenEls = document.querySelectorAll(
                ".gsap-hero-fade, .gsap-hero-panel, .gsap-stat-card, .gsap-about-text, .gsap-about-badge, .gsap-about-feature, .gsap-service-header, .gsap-service-card, .gsap-prop-header, .gsap-prop-card, .gsap-test-anim, #gsap-contact-info, #gsap-contact-form"
            );
            hiddenEls.forEach(el => {
                el.style.opacity = "1";
                el.style.transform = "none";
            });
        }, 2500);
        return;
    }

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger);
    console.log("GSAP and ScrollTrigger successfully initialized!");

    // ==========================================
    // 1. PAGE LOADER & ENTRY SEQUENCE
    // ==========================================
    const leftPanel = document.querySelector(".left-panel");
    const rightPanel = document.querySelector(".right-panel");

    // Hold loader for 2.5 seconds to build preloader logo animation
    setTimeout(() => {
        const loaderTimeline = gsap.timeline({
            onComplete: () => {
                if (preloader) preloader.style.display = "none";
            }
        });

        // 1. Fade out the text & progress bars
        loaderTimeline.to(loaderContent, {
            opacity: 0,
            scale: 0.8,
            y: -50,
            duration: 0.5,
            ease: "power2.in"
        });

        // 2. Slide the panels apart like double doors (HEAVY premium animation)
        loaderTimeline.to(leftPanel, {
            xPercent: -100,
            duration: 1.2,
            ease: "power4.inOut"
        }, "-=0.2");

        loaderTimeline.to(rightPanel, {
            xPercent: 100,
            duration: 1.2,
            ease: "power4.inOut"
        }, "-=1.2");

        // 3. Trigger the Hero page entrance timeline
        loaderTimeline.add(triggerHeroEntrance(), "-=0.6");

    }, 2500);

    // ==========================================
    // 2. HERO PAGE ENTRANCE TIMELINE
    // ==========================================
    function triggerHeroEntrance() {
        const heroTimeline = gsap.timeline();

        // Reveal header navigation bar dropping down
        heroTimeline.fromTo(".header", 
            { y: -80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: "power4.out" }
        );

        // Slow cinematic zoom-out of the hero background image
        heroTimeline.fromTo("#hero-bg-img",
            { scale: 1.15 },
            { scale: 1, duration: 2.2, ease: "power2.out" },
            "-=1"
        );

        // Staggered reveal of hero content (Badge, title, description)
        heroTimeline.fromTo(".gsap-hero-fade",
            { y: 50, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, ease: "power4.out", stagger: 0.15 },
            "-=1.8"
        );

        // Elastic pop up of the search and filter panel
        heroTimeline.fromTo(".gsap-hero-panel",
            { y: 80, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.4, ease: "back.out(1.2)" },
            "-=1.4"
        );

        return heroTimeline;
    }

    // ==========================================
    // 3. STICKY HEADER & NAV STATE
    // ==========================================
    const header = document.getElementById("header");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("sticky");
        } else {
            header.classList.remove("sticky");
        }
    });

    // ==========================================
    // 4. MOBILE MENU HAMBURGER TOGGLE
    // ==========================================
    const navToggle = document.getElementById("nav-toggle");
    const navMenu = document.getElementById("nav-menu");
    const navLinks = document.querySelectorAll(".nav-link");

    if (navToggle && navMenu) {
        navToggle.addEventListener("click", () => {
            navToggle.classList.toggle("active");
            navMenu.classList.toggle("active");
        });

        // Close menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navToggle.classList.remove("active");
                navMenu.classList.remove("active");
            });
        });
    }

    // Active indicator triggers moved to bottom of file for ScrollTrigger calculations order

    // ==========================================
    // 6. SEARCH & FILTER INTERACTIVES (Buy / Rent Switcher)
    // ==========================================
    const searchTabs = document.querySelectorAll(".search-tab");
    let currentSearchType = "buy"; // Default

    searchTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            e.preventDefault();
            searchTabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            currentSearchType = tab.dataset.type;
        });
    });

    const searchForm = document.getElementById("search-form");
    if (searchForm) {
        searchForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const location = document.getElementById("search-location").value;
            const type = document.getElementById("property-type").value;
            const price = document.getElementById("price-range").value;
            
            showSuccessNotification(`Searching for ${currentSearchType.toUpperCase()} listings in "${location || 'Any location'}" matching type "${type}" and price "${price}"`);
        });
    }

    // ==========================================
    // 7. PROPERTY GRID FILTERING (Removed - Simplified layout)
    // ==========================================

    // Wishlist Heart Interaction
    const wishlistBtns = document.querySelectorAll(".wishlist-btn");
    wishlistBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            btn.classList.toggle("active");
            const icon = btn.querySelector("i");
            if (btn.classList.contains("active")) {
                icon.classList.replace("fa-regular", "fa-solid");
                gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
                showToastNotification("Property added to your Favorites!");
            } else {
                icon.classList.replace("fa-solid", "fa-regular");
                gsap.fromTo(btn, { scale: 0.8 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
                showToastNotification("Property removed from Favorites.");
            }
        });
    });

    // ==========================================
    // 8. STATS SCROLLTRIGGER & COUNT-UP
    // ==========================================
    // 1. Stat cards card entrance stagger
    gsap.fromTo(".gsap-stat-card",
        { y: 50, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: "#stats-section",
                start: "top 85%"
            }
        }
    );

    // 2. Count-up statistics using GSAP tween triggers (HEAVY premium counting)
    const statNumbers = document.querySelectorAll(".stat-number");
    statNumbers.forEach(stat => {
        const target = parseInt(stat.getAttribute("data-target"), 10);
        const countObj = { val: 0 };
        
        gsap.to(countObj, {
            val: target,
            duration: 2.2,
            ease: "power2.out",
            snap: { val: 1 },
            scrollTrigger: {
                trigger: "#stats-section",
                start: "top 85%"
            },
            onUpdate: function() {
                stat.innerText = countObj.val;
            }
        });
    });

    // ==========================================
    // 9. ABOUT SECTION SCROLLTRIGGER & PARALLAX
    // ==========================================
    // Parallax scrolling for about section images (opposing shifts)
    gsap.to(".parallax-img-primary", {
        yPercent: -12,
        ease: "none",
        scrollTrigger: {
            trigger: ".about-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    gsap.to(".parallax-img-secondary", {
        yPercent: 12,
        ease: "none",
        scrollTrigger: {
            trigger: ".about-section",
            start: "top bottom",
            end: "bottom top",
            scrub: true
        }
    });

    // Experience badge pop up
    gsap.fromTo(".gsap-about-badge",
        { scale: 0.7, opacity: 0 },
        {
            scale: 1,
            opacity: 1,
            duration: 1,
            ease: "back.out(1.5)",
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 70%"
            }
        }
    );

    // Staggered reveal of text details
    gsap.fromTo(".gsap-about-text",
        { x: 50, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 70%"
            }
        }
    );

    // Staggered bullet items sliding in
    gsap.fromTo(".gsap-about-feature",
        { x: 50, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.2,
            scrollTrigger: {
                trigger: ".about-section",
                start: "top 60%"
            }
        }
    );

    // ==========================================
    // 10. SERVICES STAGGER POP UP
    // ==========================================
    gsap.fromTo(".gsap-service-header",
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".services-section",
                start: "top 80%"
            }
        }
    );

    gsap.fromTo(".gsap-service-card",
        { y: 60, opacity: 0, scale: 0.95 },
        {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.2,
            ease: "back.out(1.2)",
            stagger: 0.2,
            scrollTrigger: {
                trigger: ".services-section",
                start: "top 75%"
            }
        }
    );

    // ==========================================
    // 11. PROPERTIES HORIZONTAL PIN SCROLL
    // ==========================================
    gsap.fromTo(".gsap-prop-header",
        { y: 30, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".properties-section",
                start: "top 80%"
            }
        }
    );

    const grid = document.getElementById("properties-grid");
    const scrollContainer = document.querySelector(".properties-scroll-container");

    if (grid && scrollContainer) {
        // Set up responsive media queries using GSAP matchMedia
        let mm = gsap.matchMedia();

        // 1. DESKTOP: Row horizontal pin scroll
        mm.add("(min-width: 1025px)", () => {
            gsap.set(".gsap-prop-card", { opacity: 1 });
            gsap.set(grid, { opacity: 0 });

            // Fade in grid on entry
            gsap.to(grid, {
                opacity: 1,
                duration: 0.6,
                scrollTrigger: {
                    trigger: ".properties-section",
                    start: "top 75%"
                }
            });

            // Horizontal pin scroll timeline (pinned to top of screen)
            gsap.to(grid, {
                x: () => -(grid.scrollWidth - scrollContainer.clientWidth),
                ease: "none",
                scrollTrigger: {
                    trigger: ".properties-section",
                    pin: true,
                    scrub: 1,
                    start: "top top",
                    end: () => `+=${grid.scrollWidth - scrollContainer.clientWidth}`,
                    invalidateOnRefresh: true,
                    onToggle: (self) => {
                        const navLinkEl = document.querySelector(`.nav-menu a[href*="properties"]`);
                        if (navLinkEl) {
                            if (self.isActive) {
                                navLinks.forEach(l => l.classList.remove("active"));
                                navLinkEl.classList.add("active");
                            } else {
                                navLinkEl.classList.remove("active");
                            }
                        }
                    }
                }
            });
        });

        // 2. TABLET/MOBILE: Swipe layout with vertical stagger reveal
        mm.add("(max-width: 1024px)", () => {
            // Clear inline desktop translations to maintain layout
            gsap.set(grid, { clearProps: "all" });
            gsap.set(".gsap-prop-card", { clearProps: "opacity,transform" });

            gsap.fromTo(".gsap-prop-card",
                { y: 50, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power3.out",
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: ".properties-section",
                        start: "top 75%"
                    }
                }
            );

            // Active indicator trigger for mobile
            ScrollTrigger.create({
                trigger: ".properties-section",
                start: "top 50%",
                end: "bottom 50%",
                onEnter: () => {
                    const navLinkEl = document.querySelector(`.nav-menu a[href*="properties"]`);
                    if (navLinkEl) {
                        navLinks.forEach(l => l.classList.remove("active"));
                        navLinkEl.classList.add("active");
                    }
                },
                onEnterBack: () => {
                    const navLinkEl = document.querySelector(`.nav-menu a[href*="properties"]`);
                    if (navLinkEl) {
                        navLinks.forEach(l => l.classList.remove("active"));
                        navLinkEl.classList.add("active");
                    }
                }
            });
        });
    }

    // ==========================================
    // 12. TESTIMONIALS SLIDE-IN & ROTATION
    // ==========================================
    gsap.fromTo(".gsap-test-anim",
        { y: 40, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            stagger: 0.15,
            scrollTrigger: {
                trigger: ".testimonials-section",
                start: "top 80%"
            }
        }
    );

    const slides = document.querySelectorAll(".testimonial-slide");
    const prevBtn = document.getElementById("prev-testimonial");
    const nextBtn = document.getElementById("next-testimonial");
    const indicatorsContainer = document.getElementById("carousel-indicators");
    let currentSlide = 0;

    // Create dot indicators
    if (indicatorsContainer && slides.length > 0) {
        slides.forEach((_, index) => {
            const dot = document.createElement("div");
            dot.classList.add("indicator");
            if (index === 0) dot.classList.add("active");
            dot.addEventListener("click", () => goToSlide(index));
            indicatorsContainer.appendChild(dot);
        });
    }

    function goToSlide(n) {
        if (slides.length === 0) return;
        const prevSlide = slides[currentSlide];
        currentSlide = (n + slides.length) % slides.length;
        const nextSlide = slides[currentSlide];

        // GSAP Cross-fade sliding translation (Heavy premium transition)
        gsap.to(prevSlide, {
            opacity: 0,
            x: -20,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
                prevSlide.classList.remove("active");
            }
        });

        nextSlide.classList.add("active");
        gsap.fromTo(nextSlide,
            { opacity: 0, x: 20 },
            { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }
        );

        // Update indicators active dot
        const dots = document.querySelectorAll(".indicator");
        dots.forEach((dot, index) => {
            if (index === currentSlide) {
                dot.classList.add("active");
            } else {
                dot.classList.remove("active");
            }
        });
    }

    if (prevBtn && nextBtn && slides.length > 0) {
        prevBtn.addEventListener("click", () => goToSlide(currentSlide - 1));
        nextBtn.addEventListener("click", () => goToSlide(currentSlide + 1));
        
        // Auto slider rotation
        let autoPlay = setInterval(() => {
            goToSlide(currentSlide + 1);
        }, 6000);

        // Reset timer on click
        [prevBtn, nextBtn].forEach(btn => {
            btn.addEventListener("click", () => {
                clearInterval(autoPlay);
                autoPlay = setInterval(() => {
                    goToSlide(currentSlide + 1);
                }, 6000);
            });
        });
    }

    // ==========================================
    // 13. CONTACT & NEWSLETTER SCROLL SLIDE-INS
    // ==========================================
    gsap.fromTo("#gsap-contact-info",
        { x: -50, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 75%"
            }
        }
    );

    gsap.fromTo("#gsap-contact-form",
        { x: 50, opacity: 0 },
        {
            x: 0,
            opacity: 1,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: ".contact-section",
                start: "top 75%"
            }
        }
    );

    // ==========================================
    // 14. FORMS SUBMISSIONS (Contact & Newsletter)
    // ==========================================
    const contactForm = document.getElementById("contact-form-el");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const name = document.getElementById("contact-name").value;
            const email = document.getElementById("contact-email").value;
            const interest = document.getElementById("contact-interest").options[document.getElementById("contact-interest").selectedIndex].text;
            
            showSuccessNotification(`Thank you, ${name}! Your consultation request regarding "${interest}" has been successfully sent. A concierge agent will contact you at ${email} shortly.`);
            contactForm.reset();
        });
    }

    const newsletterForm = document.getElementById("newsletter-form");
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = newsletterForm.querySelector("input[type='email']");
            showSuccessNotification(`Successfully subscribed! Market updates and VIP alerts will be sent to ${emailInput.value}.`);
            newsletterForm.reset();
        });
    }

    // ==========================================
    // 15. PREMIUM TOASTS & NOTIFICATIONS SYSTEM
    // ==========================================
    function showToastNotification(message) {
        const existingToast = document.querySelector(".toast-notification");
        if (existingToast) existingToast.remove();

        const toast = document.createElement("div");
        toast.className = "toast-notification";
        toast.innerHTML = `<i class="fa-solid fa-bell"></i> <span>${message}</span>`;
        
        Object.assign(toast.style, {
            position: "fixed",
            bottom: "2rem",
            right: "2rem",
            backgroundColor: "var(--primary)",
            color: "var(--white)",
            padding: "1rem 1.5rem",
            borderRadius: "var(--radius-md)",
            boxShadow: "var(--shadow-lg)",
            display: "flex",
            alignItems: "center",
            gap: "0.8rem",
            zIndex: "10000",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: "600",
            fontSize: "0.95rem",
            transform: "translateY(100px)",
            opacity: "0",
            transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        });

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.transform = "translateY(0)";
            toast.style.opacity = "1";
        }, 50);

        setTimeout(() => {
            toast.style.transform = "translateY(100px)";
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 400);
        }, 3500);
    }

    function showSuccessNotification(htmlMessage) {
        const overlay = document.createElement("div");
        overlay.className = "notification-overlay";
        
        Object.assign(overlay.style, {
            position: "fixed",
            top: "0",
            left: "0",
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(8px)",
            webkitBackdropFilter: "blur(8px)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: "20000",
            opacity: "0",
            transition: "opacity 0.4s ease"
        });

        const card = document.createElement("div");
        card.className = "notification-card";
        card.innerHTML = `
            <div class="notif-badge"><i class="fa-solid fa-circle-check"></i></div>
            <h3>Success</h3>
            <p>${htmlMessage}</p>
            <button class="btn btn-primary btn-sm notif-close-btn">Continue</button>
        `;

        Object.assign(card.style, {
            backgroundColor: "var(--white)",
            borderRadius: "var(--radius-lg)",
            padding: "2.5rem 2rem",
            maxWidth: "480px",
            width: "90%",
            textAlign: "center",
            boxShadow: "var(--shadow-premium)",
            transform: "scale(0.9)",
            transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
        });

        const notifBadge = card.querySelector(".notif-badge");
        Object.assign(notifBadge.style, {
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(34, 197, 94, 0.1)",
            color: "#22C55E",
            fontSize: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            margin: "0 auto 1.2rem auto"
        });

        const title = card.querySelector("h3");
        Object.assign(title.style, {
            fontSize: "1.6rem",
            marginBottom: "0.8rem",
            color: "var(--text-dark)"
        });

        const desc = card.querySelector("p");
        Object.assign(desc.style, {
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            marginBottom: "1.8rem",
            lineHeight: "1.5"
        });

        const closeBtn = card.querySelector(".notif-close-btn");
        Object.assign(closeBtn.style, {
            width: "100%"
        });

        overlay.appendChild(card);
        document.body.appendChild(overlay);

        setTimeout(() => {
            overlay.style.opacity = "1";
            card.style.transform = "scale(1)";
        }, 50);

        const closeNotification = () => {
            overlay.style.opacity = "0";
            card.style.transform = "scale(0.9)";
            setTimeout(() => overlay.remove(), 400);
        };

        closeBtn.addEventListener("click", closeNotification);
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeNotification();
        });
    }

    // ==========================================
    // 5. SCROLL SECTIONS ACTIVE LINK INDICATOR (using ScrollTrigger)
    // ==========================================
    const sections = document.querySelectorAll("section[id]");

    sections.forEach(section => {
        const sectionId = section.getAttribute("id");
        if (sectionId === "properties") return; // Handled inside properties horizontal pin ScrollTrigger
        const navLinkEl = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);
        
        if (navLinkEl) {
            ScrollTrigger.create({
                trigger: section,
                start: "top 50%",   // Trigger active state when section top crosses screen center
                end: "bottom 50%",  // Clear active state when section bottom leaves screen center
                onEnter: () => {
                    navLinks.forEach(l => l.classList.remove("active"));
                    navLinkEl.classList.add("active");
                },
                onEnterBack: () => {
                    navLinks.forEach(l => l.classList.remove("active"));
                    navLinkEl.classList.add("active");
                }
            });
        }
    });
});
