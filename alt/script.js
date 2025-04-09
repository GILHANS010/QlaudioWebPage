document.addEventListener('DOMContentLoaded', () => {

    // --- Element Selections ---
    const header = document.getElementById('header');
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-links a');
    const allLinks = document.querySelectorAll('a[href^="#"]'); // For smooth scroll
    const sections = document.querySelectorAll('main section[id]');
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    const modal = document.getElementById('portfolio-modal');
    const modalContent = document.querySelector('.modal-content');
    const modalMediaContent = document.getElementById('modal-media-content');
    const closeModalBtn = document.querySelector('.close-modal');
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const currentYearSpan = document.getElementById('current-year');
    const fadeInSections = document.querySelectorAll('.fade-in-section'); // For Intersection Observer

    // --- Header Scroll Effect ---
    const handleScroll = () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        updateActiveNav(); // Update active nav link on scroll
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check in case the page loads scrolled

    // --- Mobile Navigation Toggle ---
    const toggleMobileNav = () => {
        navLinksContainer.classList.toggle('mobile-active');
        const icon = mobileNavToggle.querySelector('i');
        if (navLinksContainer.classList.contains('mobile-active')) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark'); // Change to 'X' icon
        } else {
            icon.classList.remove('fa-xmark');
            icon.classList.add('fa-bars');
        }
    };

    if (mobileNavToggle && navLinksContainer) {
        mobileNavToggle.addEventListener('click', toggleMobileNav);

        // Close mobile menu when a link is clicked
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navLinksContainer.classList.contains('mobile-active')) {
                    toggleMobileNav();
                }
            });
        });
    }

    // --- Smooth Scrolling for All Anchor Links ---
    allLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            // Only prevent default for internal links
            if (targetId.startsWith('#') && targetId.length > 1) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    // Calculate offset if header is fixed
                    const headerOffset = header ? header.offsetHeight : 0;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });

                     // Close mobile nav if open after clicking a link
                    if (navLinksContainer.classList.contains('mobile-active')) {
                        toggleMobileNav();
                    }
                }
            }
        });
    });


    // --- Active Navigation Link Highlighting ---
    const updateActiveNav = () => {
        let currentSectionId = '';
        const scrollPosition = window.scrollY + (header ? header.offsetHeight : 0) + 50; // Add offset

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Handle edge case for the top of the page or very bottom
        if (currentSectionId === '' && window.scrollY < sections[0]?.offsetTop) {
             // Optionally highlight 'home' or nothing
             currentSectionId = 'hero'; // Assuming 'hero' is the first section
        } else if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
            // If scrolled to the very bottom, activate the last section's link (e.g., contact)
             const lastSection = sections[sections.length - 1];
             if (lastSection) currentSectionId = lastSection.id;
        }


        navLinks.forEach(link => {
            link.classList.remove('active');
            // Check if the link's href matches the current section ID (ignoring the '#')
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    };

    // Initial call and on scroll (already handled in handleScroll)
    updateActiveNav();

    // --- Portfolio Modal Logic ---
    const openModal = (mediaUrl) => {
        if (!modal || !modalMediaContent) return;

        let mediaElement = '';
        // Basic check for media type based on extension
        if (mediaUrl.match(/\.(mp4|webm|ogg)$/i)) {
            mediaElement = `<video controls autoplay src="${mediaUrl}" style="max-width: 100%; max-height: 70vh; display: block; margin: auto;">Your browser does not support the video tag.</video>`;
        } else if (mediaUrl.match(/\.(mp3|wav|aac)$/i)) {
            mediaElement = `<audio controls autoplay src="${mediaUrl}" style="width: 100%;">Your browser does not support the audio element.</audio>`;
        } else if (mediaUrl) { // Assume it's an image or other link if not recognized
             mediaElement = `<p>미디어 형식(${mediaUrl})을 재생할 수 없거나 링크입니다. <a href="${mediaUrl}" target="_blank">링크 열기</a></p>`;
             // Or display an image: `<img src="${mediaUrl}" alt="Portfolio Media" style="max-width: 100%; max-height: 70vh; display: block; margin: auto;">`;
        } else {
            mediaElement = `<p>미디어 URL이 제공되지 않았습니다.</p>`;
        }

        modalMediaContent.innerHTML = mediaElement;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent background scrolling
    };

    const closeModal = () => {
        if (!modal || !modalMediaContent) return;

        modal.style.display = 'none';
        modalMediaContent.innerHTML = ''; // Clear content
        document.body.style.overflow = ''; // Restore background scrolling

        // Stop any playing media
        const media = modalMediaContent.querySelector('video, audio');
        if (media) {
            media.pause();
            media.currentTime = 0;
        }
    };

    portfolioItems.forEach(item => {
        const playButton = item.querySelector('.play-button');
        if (playButton) {
            playButton.addEventListener('click', (e) => {
                e.stopPropagation(); // Prevent triggering item click if nested
                const mediaUrl = playButton.getAttribute('data-media');
                 if (mediaUrl && mediaUrl !== "[오디오/비디오_URL_]") { // Check if placeholder wasn't replaced
                     openModal(mediaUrl);
                 } else {
                    alert("미리듣기 링크가 아직 설정되지 않았습니다.");
                 }
            });
        }
        // Optional: Make the whole item clickable
        // item.addEventListener('click', () => {
        //     const playButton = item.querySelector('.play-button');
        //     if (playButton) {
        //         const mediaUrl = playButton.getAttribute('data-media');
        //         openModal(mediaUrl);
        //     }
        // });
    });

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeModal);
    }

    // Close modal if clicking outside the content area
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) { // Check if the click is on the modal background itself
                closeModal();
            }
        });
    }

    // Close modal with Escape key
     document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });


    // --- Contact Form Submission (EmailJS) ---
    if (contactForm && typeof emailjs !== 'undefined') {
         // --- IMPORTANT: Replace placeholders below with your actual EmailJS IDs! ---
         const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID'; // Replace with your Service ID
         const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // Replace with your Template ID
         const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';  // Replace with your Public Key (User ID)
         // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

         // Initialize EmailJS (Ensure the init function in HTML is also configured or do it here)
         // emailjs.init(EMAILJS_PUBLIC_KEY); // Uncomment and use if not initialized in HTML

        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent the default form submission

            // Basic check if placeholder IDs were replaced
            if (EMAILJS_SERVICE_ID === 'YOUR_SERVICE_ID' || EMAILJS_TEMPLATE_ID === 'YOUR_TEMPLATE_ID' || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
                 if (formStatus) formStatus.textContent = 'EmailJS 설정이 필요합니다. (ID를 확인하세요)';
                 formStatus.style.color = 'red';
                 console.error('EmailJS is not configured. Please replace placeholder IDs in script.js');
                 return; // Stop submission if not configured
            }

            if (formStatus) {
                formStatus.textContent = '메시지를 보내는 중...';
                formStatus.style.color = 'var(--text-medium)'; // Or your desired sending color
            }
            const submitButton = contactForm.querySelector('button[type="submit"]');
            if(submitButton) submitButton.disabled = true; // Disable button while sending


            // Send the form data using EmailJS
            emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, this, EMAILJS_PUBLIC_KEY)
                .then(() => {
                    if (formStatus) {
                        formStatus.textContent = '메시지가 성공적으로 전송되었습니다!';
                        formStatus.style.color = 'var(--accent-blue)'; // Success color
                    }
                    contactForm.reset(); // Clear the form fields
                }, (error) => {
                    if (formStatus) {
                        formStatus.textContent = '메시지 전송에 실패했습니다. 다시 시도해주세요.';
                        formStatus.style.color = 'red'; // Error color
                    }
                    console.error('EmailJS Error:', JSON.stringify(error));
                })
                .finally(() => {
                     if(submitButton) submitButton.disabled = false; // Re-enable button
                    // Optional: Clear status message after a few seconds
                    setTimeout(() => {
                        if (formStatus) formStatus.textContent = '';
                    }, 5000);
                });
        });
    } else if (contactForm) {
         console.warn('EmailJS library not found or form element missing. Contact form submission disabled.');
         if(formStatus) formStatus.textContent = '폼 전송 기능이 비활성화되었습니다.';
    }


    // --- Footer Current Year ---
    if (currentYearSpan) {
        currentYearSpan.textContent = new Date().getFullYear();
    }

    // --- Intersection Observer for Fade-in Animations ---
    if ('IntersectionObserver' in window && fadeInSections.length > 0) {
        const sectionObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target); // Optional: Stop observing once visible
                }
            });
        }, {
            root: null, // Use the viewport as the root
            threshold: 0.1 // Trigger when 10% of the element is visible
            // rootMargin: '0px 0px -50px 0px' // Optional: Adjust trigger point
        });

        fadeInSections.forEach(section => {
            sectionObserver.observe(section);
        });
    } else if (fadeInSections.length > 0) {
         // Fallback for older browsers: just make them visible
        fadeInSections.forEach(section => {
            section.classList.add('visible');
        });
    }

}); // End DOMContentLoaded