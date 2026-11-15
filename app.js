// حالة التعلّم والمظهر تُحفظ محليًا على جهاز المستخدم.
const STORAGE_KEY = 'smartAcademyProgressV1';
const DEFAULT_STATE = { completed: [], bestScore: null, studentName: '' };
const QUESTIONS = [
  { q: 'ما الفكرة الأساسية للذكاء الاصطناعي؟', options: ['جعل الأجهزة تتعلم أنماطًا من البيانات', 'زيادة سرعة الإنترنت دائمًا', 'استبدال جميع البرامج بالروبوتات', 'حفظ الملفات في مجلدات فقط'], answer: 0 },
  { q: 'ما الذي يحتاج إليه نموذج تعلّم الآلة كي يتدرّب؟', options: ['شاشة كبيرة', 'بيانات وأمثلة', 'طابعة ملونة', 'اتصال لاسلكي فقط'], answer: 1 },
  { q: 'أي مثال يستخدم الذكاء الاصطناعي؟', options: ['قلم رصاص', 'مصباح عادي', 'اقتراح مقاطع قد تعجبك', 'دفتر ورقي'], answer: 2 },
  { q: 'ما الدور الأساسي للغة HTML؟', options: ['تنسيق ألوان الصفحة فقط', 'إضافة مؤثرات صوتية', 'تخزين الصور على الإنترنت', 'بناء هيكل ومحتوى صفحة الويب'], answer: 3 },
  { q: 'أي لغة تُستخدم لتنسيق ألوان وتصميم صفحة الويب؟', options: ['HTML', 'CSS', 'JavaScript', 'SQL'], answer: 1 },
  { q: 'ماذا تضيف JavaScript إلى صفحة الويب غالبًا؟', options: ['التفاعل والسلوك', 'الكهرباء للجهاز', 'اتصالًا مجانيًا', 'صورًا تلقائيًا'], answer: 0 },
  { q: 'ما الوسم المناسب لعنوان رئيسي في HTML؟', options: ['<img>', '<p>', '<h1>', '<br>'], answer: 2 },
  { q: 'كيف تساعد البيانات الجيدة نموذج الذكاء الاصطناعي؟', options: ['تجعل الجهاز أصغر حجمًا', 'تساعده على اكتشاف الأنماط بدقة أفضل', 'تمنع تشغيل البرامج', 'تستبدل الحاجة إلى التعلّم'], answer: 1 },
  { q: 'ما المقصود بتعلّم الآلة؟', options: ['تعلم استخدام لوحة المفاتيح', 'تغيير شكل الحاسوب', 'طريقة لطباعة البيانات', 'تعلم الأنظمة أنماطًا من الأمثلة'], answer: 3 },
  { q: 'ما التصرف الأفضل عند استخدام إجابة من أداة ذكية؟', options: ['التحقق منها ومراجعة مصادر موثوقة', 'مشاركتها فورًا دون قراءة', 'اعتبارها صحيحة دائمًا', 'إيقاف الجهاز'], answer: 0 }
];

function readState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      completed: Array.isArray(saved.completed) ? saved.completed.filter(id => ['ai', 'coding', 'quiz'].includes(id)) : [],
      bestScore: Number.isInteger(saved.bestScore) && saved.bestScore >= 0 && saved.bestScore <= 10 ? saved.bestScore : null,
      studentName: typeof saved.studentName === 'string' && saved.studentName.trim()
        ? saved.studentName.slice(0, 60)
        : 'زايد طلال خلف العنيزي'
    };
  } catch (error) {
    console.warn('تعذر قراءة تقدم التعلّم المحفوظ.', error);
    return { ...DEFAULT_STATE };
  }
}

let state = readState();

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('تعذر حفظ تقدم التعلّم على هذا الجهاز.', error);
  }
}

const arabicNumber = value => new Intl.NumberFormat('ar').format(value);

function updateDashboard() {
  const completed = state.completed.length;
  const progress = Math.round(completed / 3 * 100);
  document.querySelector('#completed-count').textContent = arabicNumber(completed);
  document.querySelector('#best-score').textContent = state.bestScore === null ? '—' : arabicNumber(state.bestScore);
  document.querySelector('#score-unit').textContent = state.bestScore === null ? '' : ' / ١٠';
  document.querySelector('#progress-label').textContent = `${arabicNumber(progress)}٪`;
  document.querySelector('#hero-progress').textContent = `${arabicNumber(progress)}٪`;
  document.querySelector('#progress-fill').style.width = `${progress}%`;
  document.querySelector('#progress-bar').setAttribute('aria-valuenow', String(progress));
  document.querySelectorAll('.lesson-button').forEach(button => {
    const done = state.completed.includes(button.dataset.lesson);
    button.classList.toggle('is-complete', done);
    button.innerHTML = done ? 'تم إكمال الدرس <span aria-hidden="true">✓</span>' : 'إكمال الدرس <span aria-hidden="true">✓</span>';
    button.setAttribute('aria-pressed', String(done));
  });
  document.querySelector('#student-name').value = state.studentName;
  updateCertificate();
}

function updateCertificate() {
  const hasCertificate = state.bestScore !== null && state.bestScore >= 7;
  const section = document.querySelector('#certificate');
  section.hidden = !hasCertificate;
  if (!hasCertificate) return;
  document.querySelector('#certificate-name').textContent = state.studentName || 'طالب الأكاديمية';
  document.querySelector('#certificate-score').textContent = `${arabicNumber(state.bestScore)} / ١٠`;
  const date = new Intl.DateTimeFormat('ar', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date());
  document.querySelector('#certificate-date').textContent = date;
}

function renderQuestions() {
  const container = document.querySelector('#quiz-questions');
  container.innerHTML = QUESTIONS.map((question, index) => `
    <fieldset class="question-card">
      <legend><span class="question-number">${arabicNumber(index + 1)}</span><span>${question.q}</span></legend>
      <div class="answer-options">
        ${question.options.map((option, optionIndex) => `
          <label class="answer-option">
            <input type="radio" name="question-${index}" value="${optionIndex}" required>
            <span class="answer-letter">${arabicNumber(optionIndex + 1)}</span><span>${option.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</span>
          </label>`).join('')}
      </div>
    </fieldset>`).join('');
}

function showAnswers(answers, score) {
  const review = document.querySelector('#answer-review');
  review.hidden = false;
  review.innerHTML = `<h3>مراجعة الإجابات</h3><p>درجتك ${arabicNumber(score)} من ١٠. تظهر الإجابة الصحيحة بخلفية خضراء.</p>` + QUESTIONS.map((question, index) => {
    const chosen = answers[index];
    const isCorrect = chosen === question.answer;
    return `<div class="review-item ${isCorrect ? 'review-correct' : 'review-wrong'}">
      <span class="review-status" aria-hidden="true">${isCorrect ? '✓' : '×'}</span>
      <div><strong>${arabicNumber(index + 1)}. ${question.q}</strong>
      <span>إجابتك: ${chosen === null ? 'لم تجب' : question.options[chosen].replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</span>
      ${!isCorrect ? `<span class="correct-answer">الإجابة الصحيحة: ${question.options[question.answer].replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</span>` : ''}</div>
    </div>`;
  }).join('');
}

renderQuestions();
updateDashboard();

document.querySelectorAll('.lesson-button').forEach(button => {
  button.addEventListener('click', () => {
    const id = button.dataset.lesson;
    if (!state.completed.includes(id)) state.completed.push(id);
    saveState();
    updateDashboard();
  });
});

document.querySelector('#quiz-form').addEventListener('submit', event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const answers = QUESTIONS.map((_, index) => Number(new FormData(form).get(`question-${index}`)));
  const score = answers.reduce((total, answer, index) => total + (answer === QUESTIONS[index].answer ? 1 : 0), 0);
  const studentName = document.querySelector('#student-name').value.trim();
  if (!studentName) {
    document.querySelector('#student-name').focus();
    return;
  }
  state.studentName = studentName;
  state.bestScore = Math.max(state.bestScore === null ? 0 : state.bestScore, score);
  if (!state.completed.includes('quiz')) state.completed.push('quiz');
  saveState();
  updateDashboard();
  const result = document.querySelector('#quiz-result');
  result.hidden = false;
  result.className = `quiz-result ${score >= 7 ? 'result-pass' : 'result-retry'}`;
  result.textContent = score >= 7
    ? `أحسنت يا ${studentName}! اجتزت الاختبار بنتيجة ${arabicNumber(score)} من ١٠، وأصبحت شهادتك جاهزة.`
    : `نتيجتك ${arabicNumber(score)} من ١٠. تحتاج إلى ٧ درجات للاجتياز؛ راجع الإجابات وحاول مرة أخرى.`;
  showAnswers(answers, score);
  if (score >= 7) document.querySelector('#certificate').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#print-certificate').addEventListener('click', () => window.print());

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
