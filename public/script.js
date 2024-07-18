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
            productDetailContainer.innerHTML = data;
            
            // 팝업 표시
            const popup = document.getElementById('product-detail-popup');
            popup.style.display = 'block';
            popup.classList.add('fade-in');
            
            // 스크롤 방지
            document.body.style.overflow = 'hidden';

            // 팝업이 열릴 때 항상 맨 위로 스크롤
            productDetailContainer.scrollTop = 0;

            // 스크롤 버튼 설정
            setupScrollToTopButton();
        })
        .catch(error => console.error('Error loading product detail:', error));
}


function closeProductDetail() {
    const popup = document.getElementById('product-detail-popup');
    popup.style.display = 'none';
    popup.classList.remove('fade-in');
    
    // 스크롤 허용
    document.body.style.overflow = 'auto';

    // 스크롤 버튼 숨기기
    document.getElementById('scroll-to-top').style.display = 'none';
}



// 우클릭 이벤트 처리
document.addEventListener('contextmenu', function(e) {
    if (e.target.closest('#product-detail-popup')) {
        e.preventDefault();
        closeProductDetail();
    }
});

// ESC 키 이벤트 처리
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeProductDetail();
    }
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
            const mainContent = document.getElementById('main-content');
            mainContent.innerHTML = data;
            mainContent.className = ''; // 기본 클래스로 리셋
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
            'x-auth-token': token,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('토큰이 유효하지 않습니다.');
        }
        return response.json();
    })
    .then(data => {
        if (data.msg) {
            throw new Error(data.msg);
        }
        document.getElementById('username').textContent = data.username;
        document.getElementById('user-email').textContent = data.email;
        document.getElementById('edit-username').value = data.username;
        document.getElementById('edit-email').value = data.email;
    })
    .catch(error => {
        console.error('Error loading user profile:', error);
        alert('프로필을 불러오는데 실패했습니다: ' + error.message);
    });

    document.getElementById('edit-profile-btn').addEventListener('click', toggleEditProfileForm);
    document.getElementById('change-password-btn').addEventListener('click', toggleChangePasswordForm);
    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('profile-form').addEventListener('submit', updateProfile);
    document.getElementById('password-form').addEventListener('submit', changePassword);
}

function toggleEditProfileForm() {
    const form = document.getElementById('edit-profile-form');
    form.classList.toggle('hidden');
}

function toggleChangePasswordForm() {
    const form = document.getElementById('change-password-form');
    form.classList.toggle('hidden');
}

function updateProfile(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const username = document.getElementById('edit-username').value;
    const email = document.getElementById('edit-email').value;

    fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ username, email })
    })
    .then(response => response.json())
    .then(data => {
        alert('프로필이 성공적으로 업데이트되었습니다.');
        document.getElementById('username').textContent = data.username;
        document.getElementById('user-email').textContent = data.email;
        toggleEditProfileForm();
    })
    .catch(error => {
        console.error('Error updating profile:', error);
        alert('프로필 업데이트에 실패했습니다.');
    });
}

function changePassword(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (newPassword !== confirmPassword) {
        alert('새 비밀번호가 일치하지 않습니다.');
        return;
    }

    fetch('/api/users/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
        },
        body: JSON.stringify({ currentPassword, newPassword })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('비밀번호 변경 실패');
        }
        return response.json();
    })
    .then(data => {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        document.getElementById('password-form').reset();
        toggleChangePasswordForm();
    })
    .catch(error => {
        console.error('Error changing password:', error);
        alert('비밀번호 변경 실패');
    });
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
                console.log('Received token after login:', data.token);
                localStorage.setItem('token', data.token);
                alert('로그인 성공!');
                document.getElementById('auth-modal').style.display = 'none'; // Hide auth modal
                loadSection('dashboard'); // Load dashboard section
            } else {
                throw new Error(data.error || '로그인 실패');
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
                document.getElementById('auth-modal').style.display = 'none'; // Hide auth modal
                loadSection('dashboard'); // Load dashboard section
            } else {
                throw new Error(data.error || '회원가입 실패');
            }
        } catch (error) {
            console.error('회원가입 오류:', error);
            alert('회원가입 실패. 다시 시도해주세요.');
        }
    });
}

function logout() {
    localStorage.removeItem('token');
    alert('로그아웃 되었습니다.');
    loadSection('home');
}

document.addEventListener('DOMContentLoaded', () => {
    loadSection('home');
    setupAuthModal();
    setupForms();
});