// يظهر هذا الاختبار سؤالًا واحدًا في كل مرة، ويحفظ أفضل نتيجة محليًا.
const STORAGE_KEY = 'smartAcademyProgressV1';
const THEME_KEY = 'smartAcademyTheme';
const DEFAULT_NAME = 'زايد طلال خلف العنزي';
const QUESTIONS = [
  { category: 'الذكاء الاصطناعي', text: 'ما الفكرة الأساسية للذكاء الاصطناعي؟', options: ['تعلّم الأنظمة أنماطًا من البيانات', 'زيادة سرعة الإنترنت دائمًا', 'تخزين الملفات في مجلدات', 'تشغيل الحاسوب دون كهرباء'], answer: 0 },
  { category: 'الذكاء الاصطناعي', text: 'ما الذي يحتاج إليه نموذج تعلّم الآلة كي يتدرّب؟', options: ['شاشة كبيرة', 'بيانات وأمثلة', 'طابعة ملونة', 'كلمة مرور واحدة'], answer: 1 },
  { category: 'الذكاء الاصطناعي', text: 'ما التصرف الأفضل عند استخدام إجابة من أداة ذكية؟', options: ['مشاركتها فورًا دون قراءة', 'اعتبارها صحيحة دائمًا', 'التحقق منها ومراجعة مصادر موثوقة', 'إيقاف الجهاز'], answer: 2 },
  { category: 'الذكاء الاصطناعي', text: 'أي مما يلي مثال على استخدام الذكاء الاصطناعي؟', options: ['قلم رصاص', 'دفتر ورقي', 'مصباح عادي', 'اقتراح مقاطع قد تعجبك'], answer: 3 },
  { category: 'البرمجة', text: 'ما الدور الأساسي للغة HTML؟', options: ['بناء هيكل ومحتوى صفحة الويب', 'تشفير البريد الإلكتروني', 'حماية الجهاز من الفيروسات', 'إدارة قواعد البيانات فقط'], answer: 0 },
  { category: 'البرمجة', text: 'أي لغة تُستخدم لتنسيق ألوان وتصميم صفحة الويب؟', options: ['Java', 'CSS', 'HTML', 'SQL'], answer: 1 },
  { category: 'البرمجة', text: 'ماذا تضيف JavaScript إلى صفحة الويب غالبًا؟', options: ['الهيكل الأساسي فقط', 'تنسيق الألوان فقط', 'التفاعل والسلوك', 'اتصالًا مجانيًا بالإنترنت'], answer: 2 },
  { category: 'الأمن السيبراني', text: 'أي كلمة مرور تُعدّ أقوى لحسابك؟', options: ['12345678', 'password', 'اسمك وتاريخ ميلادك', 'عبارة طويلة وفريدة تجمع أنواعًا مختلفة من الرموز'], answer: 3 },
  { category: 'الأمن السيبراني', text: 'وصلتك رسالة تطلب كلمة مرورك عبر رابط غير مألوف، ماذا تفعل؟', options: ['لا تضغط الرابط، وتتحقق من المرسل عبر قناة رسمية', 'ترسل كلمة المرور بسرعة', 'تعيد توجيهها إلى أصدقائك', 'تدخل بياناتك لتتأكد من الرسالة'], answer: 0 },
  { category: 'الأمن السيبراني', text: 'ما فائدة تفعيل التحقق بخطوتين؟', options: ['يجعل كلمة المرور غير ضرورية', 'يضيف خطوة تحقق أخرى لحماية الحساب', 'يسمح للجميع بدخول الحساب', 'يحذف الملفات تلقائيًا'], answer: 1 }
];

const arabicNumber = value => new Intl.NumberFormat('ar').format(value);
const studentNameInput = document.querySelector('#student-name');
const currentQuestion = document.querySelector('#current-question');
const nextButton = document.querySelector('#next-question');
const questionHint = document.querySelector('#question-hint');
const questionProgress = document.querySelector('.question-progress');
const finishSection = document.querySelector('#quiz-finish');
const certificateSection = document.querySelector('#certificate');
let currentIndex = 0;
const answers = Array(QUESTIONS.length).fill(null);

function readProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      completed: Array.isArray(saved.completed) ? saved.completed.filter(id => ['ai', 'coding', 'quiz'].includes(id)) : [],
      bestScore: Number.isInteger(saved.bestScore) && saved.bestScore >= 0 && saved.bestScore <= 10 ? saved.bestScore : null,
      studentName: typeof saved.studentName === 'string' && saved.studentName.trim() ? saved.studentName.slice(0, 60) : DEFAULT_NAME
    };
  } catch (error) {
    console.warn('تعذر قراءة تقدم الاختبار المحفوظ.', error);
    return { completed: [], bestScore: null, studentName: DEFAULT_NAME };
  }
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (error) {
    console.warn('تعذر حفظ نتيجة الاختبار على هذا الجهاز.', error);
  }
}

function renderQuestion() {
  const question = QUESTIONS[currentIndex];
  document.querySelector('#question-position').textContent = `السؤال ${arabicNumber(currentIndex + 1)} من ${arabicNumber(QUESTIONS.length)}`;
  questionProgress.setAttribute('aria-valuenow', String(currentIndex + 1));
  document.querySelector('#question-progress-fill').style.width = `${(currentIndex + 1) / QUESTIONS.length * 100}%`;
  currentQuestion.replaceChildren();

  const fieldset = document.createElement('fieldset');
  fieldset.className = 'question-card current-question-card';
  const legend = document.createElement('legend');
  const category = document.createElement('span');
  category.className = 'question-category';
  category.textContent = question.category;
  const text = document.createElement('span');
  text.className = 'current-question-text';
  text.textContent = question.text;
  legend.append(category, text);
  const options = document.createElement('div');
  options.className = 'answer-options';

  question.options.forEach((option, optionIndex) => {
    const label = document.createElement('label');
    label.className = 'answer-option';
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'current-answer';
    radio.value = String(optionIndex);
    radio.addEventListener('change', () => {
      answers[currentIndex] = optionIndex;
      nextButton.disabled = false;
      if (currentIndex === QUESTIONS.length - 1) {
        nextButton.innerHTML = 'عرض النتيجة <span aria-hidden="true">←</span>';
      }
      questionHint.textContent = 'تم اختيار إجابتك. يمكنك المتابعة.';
    });
    const letter = document.createElement('span');
    letter.className = 'answer-letter-visible';
    letter.textContent = arabicNumber(optionIndex + 1);
    const labelText = document.createElement('span');
    labelText.textContent = option;
    label.append(radio, letter, labelText);
    options.append(label);
  });

  fieldset.append(legend, options);
  currentQuestion.append(fieldset);
  nextButton.disabled = answers[currentIndex] === null;
  nextButton.innerHTML = currentIndex === QUESTIONS.length - 1 && answers[currentIndex] !== null
    ? 'عرض النتيجة <span aria-hidden="true">←</span>'
    : 'التالي <span aria-hidden="true">←</span>';
  questionHint.textContent = answers[currentIndex] === null ? 'اختر إجابة للمتابعة.' : 'تم اختيار إجابتك. يمكنك المتابعة.';
}

function renderReview() {
  const review = document.querySelector('#answer-review');
  const heading = document.createElement('h3');
  heading.textContent = 'مراجعة الإجابات';
  const intro = document.createElement('p');
  intro.textContent = 'إليك إجابتك والإجابة الصحيحة لكل سؤال.';
  review.replaceChildren(heading, intro);

  QUESTIONS.forEach((question, index) => {
    const correct = answers[index] === question.answer;
    const item = document.createElement('div');
    item.className = `review-item ${correct ? 'review-correct' : 'review-wrong'}`;
    const status = document.createElement('span');
    status.className = 'review-status';
    status.setAttribute('aria-hidden', 'true');
    status.textContent = correct ? '✓' : '×';
    const details = document.createElement('div');
    const prompt = document.createElement('strong');
    prompt.textContent = `${arabicNumber(index + 1)}. ${question.text}`;
    const selected = document.createElement('span');
    selected.textContent = `إجابتك: ${question.options[answers[index]]}`;
    details.append(prompt, selected);
    if (!correct) {
      const expected = document.createElement('span');
      expected.className = 'correct-answer';
      expected.textContent = `الإجابة الصحيحة: ${question.options[question.answer]}`;
      details.append(expected);
    }
    item.append(status, details);
    review.append(item);
  });
}

function showResult() {
  const score = answers.reduce((total, answer, index) => total + (answer === QUESTIONS[index].answer ? 1 : 0), 0);
  const percent = score * 10;
  const studentName = studentNameInput.value.trim();
  const progress = readProgress();
  progress.studentName = studentName;
  progress.bestScore = Math.max(progress.bestScore === null ? 0 : progress.bestScore, score);
  if (!progress.completed.includes('quiz')) progress.completed.push('quiz');
  saveProgress(progress);

  document.querySelector('#score-out-of-ten').textContent = `${arabicNumber(score)} / ١٠`;
  document.querySelector('#score-percentage').textContent = `${arabicNumber(percent)}٪`;
  document.querySelector('#finish-title').textContent = score >= 7 ? `أحسنت يا ${studentName}!` : 'انتهى الاختبار';
  document.querySelector('#finish-summary').textContent = score >= 7
    ? 'اجتزت الاختبار بنجاح، وشهادة إنجازك جاهزة أدناه.'
    : 'راجع الإجابات الصحيحة، ثم أعد الاختبار لتحسين نتيجتك.';
  renderReview();
  document.querySelector('#single-question-area').hidden = true;
  finishSection.hidden = false;

  if (progress.bestScore >= 7) {
    certificateSection.hidden = false;
    document.querySelector('#certificate-name').textContent = studentName;
    document.querySelector('#certificate-score').textContent = `${arabicNumber(progress.bestScore)} / ١٠`;
    document.querySelector('#certificate-date').textContent = new Intl.DateTimeFormat('ar', {
      year: 'numeric', month: 'long', day: 'numeric'
    }).format(new Date());
  } else {
    certificateSection.hidden = true;
  }
  finishSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

const savedProgress = readProgress();
studentNameInput.value = savedProgress.studentName;
renderQuestion();

nextButton.addEventListener('click', () => {
  if (!studentNameInput.value.trim()) {
    studentNameInput.reportValidity();
    studentNameInput.focus();
    return;
  }
  if (answers[currentIndex] === null) return;
  if (currentIndex === QUESTIONS.length - 1) {
    showResult();
    return;
  }
  currentIndex += 1;
  renderQuestion();
});

document.querySelector('#retry-quiz').addEventListener('click', () => {
  currentIndex = 0;
  answers.fill(null);
  document.querySelector('#quiz-form').reset();
  studentNameInput.value = readProgress().studentName;
  finishSection.hidden = true;
  certificateSection.hidden = true;
  document.querySelector('#single-question-area').hidden = false;
  renderQuestion();
  document.querySelector('#main').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

document.querySelector('#print-certificate').addEventListener('click', () => window.print());

const themeToggle = document.querySelector('.theme-toggle');
function setTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggle.setAttribute('aria-label', theme === 'dark' ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي');
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch (error) {
    console.warn('تعذر حفظ إعداد المظهر.', error);
  }
}
try {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'light' || savedTheme === 'dark') setTheme(savedTheme);
} catch (error) {
  console.warn('تعذر قراءة إعداد المظهر.', error);
}
themeToggle.addEventListener('click', () => setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'));
