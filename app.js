// يحفظ هذا الملف تقدم لوحة التعلم ونمط الألوان محليًا.
const STORAGE_KEY = 'smartAcademyProgressV1';
const DEFAULT_NAME = 'زايد طلال خلف العنزي';

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      completed: Array.isArray(saved.completed) ? saved.completed.filter(id => ['ai', 'coding', 'quiz'].includes(id)) : [],
      bestScore: Number.isInteger(saved.bestScore) && saved.bestScore >= 0 && saved.bestScore <= 10 ? saved.bestScore : null,
      studentName: typeof saved.studentName === 'string' && saved.studentName.trim() ? saved.studentName.slice(0, 60) : DEFAULT_NAME
    };
  } catch (error) {
    console.warn('تعذر قراءة تقدم التعلّم المحفوظ.', error);
    return { completed: [], bestScore: null, studentName: DEFAULT_NAME };
  }
}

let progress = readProgress();
const arabicNumber = value => new Intl.NumberFormat('ar').format(value);

function saveProgress() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('تعذر حفظ تقدم التعلّم على هذا الجهاز.', error);
  }
}

function updateDashboard() {
  const completed = progress.completed.length;
  const percent = Math.round(completed / 3 * 100);
  document.querySelector('#completed-count').textContent = arabicNumber(completed);
  document.querySelector('#best-score').textContent = progress.bestScore === null ? '—' : arabicNumber(progress.bestScore);
  document.querySelector('#score-unit').textContent = progress.bestScore === null ? '' : ' / ١٠';
  document.querySelector('#progress-label').textContent = `${arabicNumber(percent)}٪`;
  document.querySelector('#hero-progress').textContent = `${arabicNumber(percent)}٪`;
  document.querySelector('#progress-fill').style.width = `${percent}%`;
  document.querySelector('#progress-bar').setAttribute('aria-valuenow', String(percent));
  document.querySelectorAll('.lesson-button').forEach(button => {
    const done = progress.completed.includes(button.dataset.lesson);
    button.classList.toggle('is-complete', done);
    button.innerHTML = done ? 'تم إكمال الدرس <span aria-hidden="true">✓</span>' : 'إكمال الدرس <span aria-hidden="true">✓</span>';
    button.setAttribute('aria-pressed', String(done));
  });
}

updateDashboard();

document.querySelectorAll('.lesson-button').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.lesson;
    if (!progress.completed.includes(id)) progress.completed.push(id);
    saveProgress();
    updateDashboard();
  });
});

document.querySelector('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;
  const name = document.querySelector('#contact-name').value.trim();
  const message = document.querySelector('#contact-message');
  message.hidden = false;
  message.textContent = `شكرًا ${name}، وصلت رسالتك التجريبية بنجاح. لم يتم إرسال أي بيانات.`;
  event.currentTarget.reset();
});

const themeToggle = document.querySelector('.theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
  try {
    localStorage.setItem('smartAcademyTheme', theme);
  } catch (error) {
    console.warn('تعذر حفظ إعداد المظهر.', error);
  }
}

try {
  const savedTheme = localStorage.getItem('smartAcademyTheme');
  if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
} catch (error) {
  console.warn('تعذر قراءة إعداد المظهر.', error);
}
themeToggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('#primary-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  menuToggle.setAttribute('aria-expanded', String(!isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'فتح قائمة التنقل' : 'إغلاق قائمة التنقل');
  mainNav.classList.toggle('nav-open', !isOpen);
});
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mainNav.classList.remove('nav-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'فتح قائمة التنقل');
}));

// يستخدم المراقب الحركة عند ظهور العناصر فقط لتقليل العمل أثناء التمرير.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else {
  document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
}
