document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM loaded, attaching listeners');
    const profileLogo = document.getElementById('profile-logo-img');

    globalThis.updateCVDownloadTitle = function () {
        const downloadBtn = document.getElementById('download-cv-btn');
        if (!downloadBtn) return;

        const currentLang = localStorage.getItem("language") || "es";

        if (currentLang === "es") {
            downloadBtn.title = `Descargar CV`;
        } else {
            downloadBtn.title = `Download CV`;
        }
    };

    function updateLogo(isDark) {
        if (profileLogo) {
            if (isDark) {
                profileLogo.src = 'img/unlam_logo_white.png';
            } else {
                profileLogo.src = 'img/unlam_logo.png';
            }
        }
    }
    globalThis.setTheme = function (theme) {
        const darkLink = document.getElementById('ui-theme-dark');
        const html = document.documentElement;

        if (theme === 'dark') {
            html.classList.add('theme--dark');
            html.classList.remove('theme--light');
            if (darkLink) darkLink.disabled = false;
            updateLogo(true);
            localStorage.setItem('theme', 'dark');
        } else {
            html.classList.add('theme--light');
            html.classList.remove('theme--dark');
            if (darkLink) darkLink.disabled = true;
            updateLogo(false);
            localStorage.setItem('theme', 'light');
        }

        updateThemeSwitchUI(theme);
        updateCVDownloadTitle();
    };

    function updateThemeSwitchUI(theme) {
        document.querySelectorAll('.theme-switch').forEach(sw => {
            sw.querySelectorAll('.theme-option').forEach(opt => {
                if (opt.dataset.theme === theme) {
                    opt.classList.add('active');
                } else {
                    opt.classList.remove('active');
                }
            });
        });
    }

    // Initial theme setup
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
});

function copyEmail() {
    const email = "rodrigo@massiolo.com";
    navigator.clipboard.writeText(email).then(() => {
        const toastElement = document.getElementById('copyToast');
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
    });
}

/* istanbul ignore next */
function generatePDF(lang = 'es') {
    if (window.location.protocol !== 'file:') return;

    const originalLang = localStorage.getItem("language") || "es";
    const html = document.documentElement;
    const isDark = html.classList.contains('theme--dark');

    console.log(`Generando PDF en ${lang}...`);

    if (typeof setLanguage === 'function') {
        setLanguage(lang, true);
    }

    html.classList.remove('theme--dark');
    html.classList.add('theme--light');

    // window.print() bloquea hasta que se cierra el diálogo
    window.print();

    if (typeof setLanguage === 'function') {
        setLanguage(originalLang, false);
    }
    if (isDark) {
        html.classList.add('theme--dark');
        html.classList.remove('theme--light');
    } else {
        html.classList.remove('theme--dark');
        html.classList.add('theme--light');
    }
}

function downloadCV() {
    const currentLang = localStorage.getItem("language") || "es";

    const langSuffix = currentLang.toUpperCase();
    const filename = `${langSuffix}_CV_RodrigoMassiolo.pdf`;
    const filePath = `pdf/${filename}`;

    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}
if (typeof module !== 'undefined') {
    module.exports = { copyEmail, downloadCV, generatePDF };
}