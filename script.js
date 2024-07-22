(function () {
    emailjs.init("9ckQHWPKQUV2yRMFM");
})();

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
            productDetailContainer.scrollTop = 0;
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

// Handle right-click events
document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('#product-detail-popup')) {
        e.preventDefault();
        closeProductDetail();
    }
});

// Handle ESC key events
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductDetail();
    }
});

function loadSection(event, section) {
    event.preventDefault();  // Prevent the default anchor behavior
    fetch(`sections/${section}.html`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error fetching section: ${response.statusText}`);
            }
            return response.text();
        })
        .then(data => {
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = data;
            mainContent.className = ''; // Reset to default class
            console.log(`Loaded section: ${section}`);
            
            // Initialize specific elements or functions if they exist in the loaded section
            setupContactForm();
            initializeOtherFeatures();
            revealOnScroll();
        })
        .catch(error => console.error('Error loading section:', error));
}

function setupContactForm() {
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(event) {
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

function initializeOtherFeatures() {
    // Placeholder for initializing any other features needed in the loaded section
    console.log('Initializing other features...');
}

let firstScroll = false;

function revealOnScroll() {
    if (!firstScroll) return;

    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const revealPoint = 100;
        if (elementTop < windowHeight - revealPoint) {
            reveals[i].classList.add('fade-in');
        } else {
            reveals[i].classList.remove('fade-in');
        }
    }

    const processCards = document.querySelectorAll('.process-card');
    for (let i = 0; i < processCards.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = processCards[i].getBoundingClientRect().top;
        const revealPoint = 100;
        if (elementTop < windowHeight - revealPoint) {
            processCards[i].classList.add('fade-in');
        } else {
            processCards[i].classList.remove('fade-in');
        }
    }
}

function onFirstScroll() {
    if (!firstScroll) {
        firstScroll = true;
        window.removeEventListener('scroll', onFirstScroll);
    }
}

window.addEventListener('scroll', onFirstScroll);
window.addEventListener('scroll', () => {
    window.requestAnimationFrame(revealOnScroll);
});

document.addEventListener('DOMContentLoaded', () => {
    loadSection({preventDefault: () => {}}, 'home');
});
