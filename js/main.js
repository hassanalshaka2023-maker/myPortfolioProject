const toggleBtn = document.getElementById('toggleThemeBtn');

if (toggleBtn) {
    toggleBtn.addEventListener('click', function() {
        if (document.documentElement.classList.contains('dark-mode')) {
            document.documentElement.classList.remove('dark-mode');
            localStorage.setItem('theme', 'light');
            toggleBtn.innerHTML = '<i class="fas fa-moon"></i> تغيير الوضع (ليلي)';
        } else {
            document.documentElement.classList.add('dark-mode');
            localStorage.setItem('theme', 'light');
            toggleBtn.innerHTML = '<i class="fas fa-sun"></i> تغيير الوضع (نهاري)';
        }
    });
    
    // استرجاع الوضع المخزن
    if (localStorage.getItem('theme') === 'dark') {
        document.documentElement.classList.add('dark-mode');
        toggleBtn.innerHTML = '<i class="fas fa-sun"></i> تغيير الوضع (نهاري)';
    }
}

// دارك مود بسيط وموثوق
const darkModeToggle = document.getElementById('darkModeToggle');

function enableDarkMode() {
    document.body.style.backgroundColor = '#1a1a2e';
    document.body.style.color = '#ffffff';
    
    // كل البطاقات
    document.querySelectorAll('.card').forEach(card => {
        card.style.backgroundColor = '#16213e';
        card.style.color = '#ffffff';
    });
    
    // كل النصوص في البطاقات
    document.querySelectorAll('.card-title, .card-text').forEach(text => {
        text.style.color = '#ffffff';
    });
    
    // كل المهارات
    document.querySelectorAll('.skill-card').forEach(skill => {
        skill.style.backgroundColor = '#0f3460';
        skill.style.color = '#ffffff';
    });
    
    localStorage.setItem('darkMode', 'enabled');
    darkModeToggle.innerHTML = '☀️ الوضع النهاري';
}

function disableDarkMode() {
    document.body.style.backgroundColor = '';
    document.body.style.color = '';
    
    document.querySelectorAll('.card').forEach(card => {
        card.style.backgroundColor = '';
        card.style.color = '';
    });
    
    document.querySelectorAll('.card-title, .card-text').forEach(text => {
        text.style.color = '';
    });
    
    document.querySelectorAll('.skill-card').forEach(skill => {
        skill.style.backgroundColor = '';
        skill.style.color = '';
    });
    
    localStorage.setItem('darkMode', 'disabled');
    darkModeToggle.innerHTML = '🌙 الوضع الليلي';
}

// تشغيل وإيقاف
darkModeToggle.addEventListener('click', () => {
    if (localStorage.getItem('darkMode') === 'enabled') {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
});

// تحقق عند تحميل الصفحة
if (localStorage.getItem('darkMode') === 'enabled') {
    enableDarkMode();
}