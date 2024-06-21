// Smooth scroll reveal effect
function revealOnScroll() {
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

// Highlight active navigation link
function highlightActiveLink() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav ul li a');
    let current;
    for (let i = 0; i < sections.length; i++) {
        const sectionTop = sections[i].offsetTop;
        const sectionHeight = sections[i].clientHeight;
        if (window.pageYOffset >= sectionTop - 50) {
            current = sections[i].getAttribute('id');
        }
    }
    navLinks.forEach((link) => {
        link.classList.remove('active-link');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active-link');
        }
    });
}

// Add event listeners
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('scroll', highlightActiveLink);

// EmailJS form submission
document.getElementById('contact-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // Combine name, email, and message into one message
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const combinedMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

    // Create a new FormData object and append the combined message
    const formData = new FormData();
    formData.append('user_name', name);
    formData.append('user_email', email);
    formData.append('message', combinedMessage);

    emailjs.send('service_ex9470o', 'template_03yvv9m', {
        user_name: name,
        user_email: email,
        message: combinedMessage
    }).then(() => {
        alert('Message sent successfully!');
    }, (error) => {
        alert('Failed to send message. Please try again later.');
    });
});

// Drag-to-swap functionality for team section
const teamGrid = document.querySelector('.team-grid');
let isDown = false;
let startX;
let scrollLeft;

teamGrid.addEventListener('mousedown', (e) => {
    isDown = true;
    teamGrid.classList.add('active');
    startX = e.pageX - teamGrid.offsetLeft;
    scrollLeft = teamGrid.scrollLeft;
});

teamGrid.addEventListener('mouseleave', () => {
    isDown = false;
    teamGrid.classList.remove('active');
});

teamGrid.addEventListener('mouseup', () => {
    isDown = false;
    teamGrid.classList.remove('active');
});

teamGrid.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - teamGrid.offsetLeft;
    const walk = (x - startX) * 2; // scroll-fast
    teamGrid.scrollLeft = scrollLeft - walk;
});