// script.js

(function () {
    emailjs.init("9ckQHWPKQUV2yRMFM");
})();

document.addEventListener('DOMContentLoaded', () => {
    loadSection('home');
    setupAuthModal();
    setupForms();
});

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
            
            if (section === 'dashboard') {
                loadDashboard();
            }
            
            setupContactForm();
        })
        .catch(error => console.error('Error loading section:', error));
}

function loadDashboard() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('로그인이 필요합니다.');
        loadSection('home');
        return;
    }

    fetch('/api/users/profile', {
        headers: {
            'x-auth-token': token
        }
    })
    .then(response => response.json())
    .then(user => {
        document.getElementById('username').textContent = user.username;
        document.getElementById('user-email').textContent = user.email;
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
        alert('프로필을 불러오는데 실패했습니다.');
    });

    // 이벤트 리스너 설정
    document.getElementById('edit-profile').addEventListener('click', editProfile);
    document.getElementById('change-password').addEventListener('click', changePassword);
    document.getElementById('logout').addEventListener('click', logout);
}

function editProfile() {
    // 프로필 수정 로직 구현
    alert('프로필 수정 기능은 아직 구현되지 않았습니다.');
}

function changePassword() {
    // 비밀번호 변경 로직 구현
    alert('비밀번호 변경 기능은 아직 구현되지 않았습니다.');
}

function logout() {
    localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
    loadSection('home');
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

function setupAuthModal() {
    const authToggle = document.getElementById('auth-toggle');
    const authModal = document.getElementById('auth-modal');
    const closeBtn = authModal.querySelector('.close');
    const toggleAuthForm = document.getElementById('toggle-auth-form');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    authToggle.addEventListener('click', () => {
        authModal.style.display = 'block';
    });

    closeBtn.addEventListener('click', () => {
        authModal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    toggleAuthForm.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.toggle('hidden');
        registerForm.classList.toggle('hidden');
        toggleAuthForm.textContent = toggleAuthForm.textContent.includes('Register') 
            ? 'Switch to Login' 
            : 'Switch to Register';
    });
}

function setupForms() {
    document.querySelector('#login-form form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                alert('로그인 성공!');
                loadSection('dashboard');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            alert('로그인 실패. 다시 시도해주세요.');
        }
    });

    document.querySelector('#register-form form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password })
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                alert('회원가입 성공!');
                loadSection('dashboard');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('회원가입 실패. 다시 시도해주세요.');
        }
    });
}

loadSection('home');