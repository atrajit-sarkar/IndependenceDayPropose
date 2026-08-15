const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const message = document.getElementById('message');
const questionText = document.getElementById('questionText');
const nameInput = document.getElementById('nameInput');

const GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbyLi_RNPD9BaYFACx67OQk8IsxvlK4oRaNmoYvq6hanZTIjG1aQct5b8Gm8v2jKT9f0Fg/exec';

const questions = [
  'Want to go on a date with me?',
  'Will you be my girlfriend?'
];

let currentQuestion = 0;

const getResponderName = () => {
  const value = nameInput.value.trim();
  return value || 'Anonymous';
};

const submitAnswer = async (questionTextValue, answerText) => {
  const now = new Date();
  const payload = {
    name: getResponderName(),
    question: questionTextValue || questions[currentQuestion] || 'Question not recorded',
    answer: answerText,
    date: now.toLocaleDateString('en-GB'),
    time: now.toLocaleTimeString('en-GB')
  };

  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL !== 'PASTE_YOUR_GOOGLE_APPS_SCRIPT_URL_HERE') {
    try {
      const formData = new URLSearchParams(payload).toString();
      const response = await fetch(GOOGLE_SHEET_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: formData
      });

      const responseText = await response.text();
      console.log('Submitted to Google Apps Script:', payload);
      console.log('Server response:', responseText);

      if (!response.ok) {
        throw new Error(`Sheet submit failed: ${response.status} ${responseText}`);
      }
    } catch (error) {
      console.error('Submission failed:', error);
    }
    return;
  }

  console.log('Google sheet URL not configured. Local payload:', payload);
};

const resetNoButton = () => {
  const optionBox = document.querySelector('.option-box');
  if (!optionBox) return;

  const boxRect = optionBox.getBoundingClientRect();
  const buttonWidth = noBtn.offsetWidth || 90;
  const safeLeft = Math.min(Math.max(16, boxRect.width * 0.58 - buttonWidth / 2), boxRect.width - buttonWidth - 10);

  noBtn.style.left = `${safeLeft}px`;
  noBtn.style.top = '10px';
  noBtn.style.transform = 'translateX(0)';
  noBtn.style.display = 'block';
};

const moveNoButton = () => {
  const optionBox = document.querySelector('.option-box');
  if (!optionBox) return;

  const boxRect = optionBox.getBoundingClientRect();
  const buttonWidth = noBtn.offsetWidth || 96;
  const buttonHeight = noBtn.offsetHeight || 52;
  const padding = 10;

  const safeWidth = Math.max(80, boxRect.width - buttonWidth - padding * 2);
  const safeHeight = Math.max(40, boxRect.height - buttonHeight - padding * 2);

  const yesBtnRect = yesBtn.getBoundingClientRect();
  const yesCenterX = yesBtnRect.left - boxRect.left + yesBtnRect.width / 2;
  const yesCenterY = yesBtnRect.top - boxRect.top + yesBtnRect.height / 2;

  let nextX = 0;
  let nextY = 0;
  let foundSpot = false;

  for (let i = 0; i < 18; i++) {
    const x = padding + Math.random() * safeWidth;
    const y = padding + Math.random() * safeHeight;
    const centerX = x + buttonWidth / 2;
    const centerY = y + buttonHeight / 2;
    const distance = Math.hypot(centerX - yesCenterX, centerY - yesCenterY);

    if (distance > Math.max(yesBtnRect.width, yesBtnRect.height) + 30) {
      nextX = x;
      nextY = y;
      foundSpot = true;
      break;
    }
  }

  if (!foundSpot) {
    nextX = Math.min(Math.max(padding, boxRect.width * 0.5 - buttonWidth / 2), boxRect.width - buttonWidth - padding);
    nextY = Math.min(Math.max(padding, boxRect.height * 0.4), boxRect.height - buttonHeight - padding);
  }

  noBtn.style.left = `${nextX}px`;
  noBtn.style.top = `${nextY}px`;
  noBtn.style.transform = 'translateX(0)';
  noBtn.classList.add('escaped');
};

const showQuestion = (index) => {
  currentQuestion = index;
  questionText.textContent = questions[index];
  questionText.classList.toggle('flash', index === 1);

  if (index === 0) {
    message.textContent = 'I hope the answer is yes ✨';
    message.style.color = '#ffe29a';
  } else {
    message.textContent = 'I’m waiting for that sweet yes 💖';
    message.style.color = '#ffd6e0';
  }

  resetNoButton();
};

const handleYes = () => {
  if (currentQuestion === 0) {
    void submitAnswer(questions[0], 'Yes');
    showQuestion(1);
    return;
  }

  void submitAnswer(questions[1], 'Yes');
  message.textContent = 'Yay! You just made my whole day 💖';
  message.style.color = '#9ef5c0';
  yesBtn.textContent = 'Yes! ❤️';
  yesBtn.disabled = true;
  yesBtn.style.filter = 'saturate(1.1)';
  noBtn.style.display = 'none';
  questionText.classList.remove('flash');
};

noBtn.addEventListener('pointerenter', moveNoButton);
noBtn.addEventListener('pointermove', moveNoButton);
noBtn.addEventListener('focus', moveNoButton);
noBtn.addEventListener('touchstart', (event) => {
  event.preventDefault();
  moveNoButton();
}, { passive: false });

yesBtn.addEventListener('click', handleYes);

noBtn.addEventListener('click', (event) => {
  event.preventDefault();
  event.stopPropagation();

  if (currentQuestion === 0) {
    void submitAnswer(questions[0], 'No');
    moveNoButton();
    return;
  }

  void submitAnswer(questions[1], 'No');
  moveNoButton();
});

showQuestion(0);

window.addEventListener('resize', resetNoButton);

setTimeout(moveNoButton, 120);
