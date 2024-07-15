document.addEventListener('DOMContentLoaded', () => {

    (function () {
        emailjs.init("9ckQHWPKQUV2yRMFM");
    })();
    // Flag to track if the first scroll event has occurred
    let firstScroll = false;

    // Smooth scroll reveal effect with optimization
    function revealOnScroll() {
        if (!firstScroll) return; // Skip if first scroll hasn't occurred

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

    // Function to handle the first scroll event
    function onFirstScroll() {
        if (!firstScroll) {
            firstScroll = true;
            window.removeEventListener('scroll', onFirstScroll);
        }
    }

    // Add event listeners with requestAnimationFrame for optimization
    window.addEventListener('scroll', onFirstScroll);
    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(revealOnScroll);
        window.requestAnimationFrame(highlightActiveLink);
    });

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

    // Function to load section dynamically
    function loadSection(section) {
        fetch(`sections/${section}.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Error fetching section: ${response.statusText}`);
                }
                return response.text();
            })
            .then(data => {
                document.getElementById('main-content').innerHTML = data;
                console.log(`Loaded section: ${section}`);
                if (section === 'home') {
                    initializeDragAndArrows(); // Initialize drag and arrow functionality after loading the home section
                }
            })
            .catch(error => console.error('Error loading section:', error));
    }

    // Initialize the first section on page load
    loadSection('home');
});
