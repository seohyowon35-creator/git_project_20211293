const resultElement = document.querySelector('#result');
const expressionElement = document.querySelector('#expression');
const panelElement = document.querySelector('#side-panel');
const historyListElement = document.querySelector('#history-list');
const memoryListElement = document.querySelector('#memory-list');
const koreanDigitNames = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

let currentValue = '0';
let storedValue = null;
let activeOperator = null;
let waitingForOperand = false;
let lastOperator = null;
let lastOperand = null;
let hasError = false;
let memoryValue = null;
let calculationHistory = [];
let activePanel = 'history';
let audioContext = null;
let musicTimer = null;
let musicStep = 0;
const musicNotes = [523, 659, 784, 659, 587, 698, 880, 698, 659, 784, 988, 784, 523, 587, 659, 587];

// 숫자 버튼을 누르면 해당 숫자를 한국어 음성으로 읽습니다.
function playKeySound(digit) {
  const speech = window.speechSynthesis;
  const Utterance = window.SpeechSynthesisUtterance;
  if (!speech || !Utterance) return playKeyTone(digit);
  try {
    const utterance = new Utterance(koreanDigitNames[Number(digit)]);
    utterance.lang = 'ko-KR';
    utterance.rate = 1.05;
    utterance.pitch = 1.15;
    utterance.volume = 0.8;
    speech.cancel();
    speech.speak(utterance);
  } catch {
    playKeyTone(digit);
  }
}

// 음성 합성을 지원하지 않는 환경에서 숫자 효과음을 대신 재생합니다.
function playKeyTone(digit) {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return;
  try {
    if (!audioContext) audioContext = new AudioContextConstructor();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    const startTime = audioContext.currentTime;
    const frequency = 520 + Number(digit) * 28;
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(frequency, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 1.35, startTime + 0.07);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * 0.9, startTime + 0.16);
    volume.gain.setValueAtTime(0.0001, startTime);
    volume.gain.exponentialRampToValueAtTime(0.045, startTime + 0.012);
    volume.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);
    oscillator.connect(volume);
    volume.connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.19);
  } catch {
    audioContext = null;
  }
}

// 배경 음악에 사용할 짧은 음표 하나를 재생합니다.
function playMusicNote(frequency, startTime, duration) {
  if (!audioContext || frequency === 0) return;
  const oscillator = audioContext.createOscillator();
  const volume = audioContext.createGain();
  oscillator.type = 'triangle';
  oscillator.frequency.setValueAtTime(frequency, startTime);
  volume.gain.setValueAtTime(0.0001, startTime);
  volume.gain.exponentialRampToValueAtTime(0.026, startTime + 0.025);
  volume.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
  oscillator.connect(volume);
  volume.connect(audioContext.destination);
  oscillator.start(startTime);
  oscillator.stop(startTime + duration + 0.01);
}

// 오리지널 8비트풍 멜로디의 다음 음을 재생합니다.
function playMusicStep() {
  if (!audioContext || musicTimer === null) return;
  const frequency = musicNotes[musicStep % musicNotes.length];
  playMusicNote(frequency, audioContext.currentTime + 0.015, 0.16);
  musicStep += 1;
}

// 배경 음악 버튼의 상태와 접근성 안내 문구를 갱신합니다.
function updateMusicButton(button, isPlaying) {
  button.textContent = isPlaying ? '♫' : '♪';
  button.classList.toggle('is-playing', isPlaying);
  button.setAttribute('aria-pressed', String(isPlaying));
  button.setAttribute('aria-label', isPlaying ? '배경 음악 끄기' : '배경 음악 켜기');
  button.title = isPlaying ? '배경 음악 끄기' : '배경 음악 켜기';
}

// 배경 음악을 시작하거나 정지합니다.
function toggleBackgroundMusic(button) {
  if (musicTimer !== null) {
    window.clearInterval(musicTimer);
    musicTimer = null;
    updateMusicButton(button, false);
    return;
  }
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) return;
  try {
    if (!audioContext) audioContext = new AudioContextConstructor();
    if (audioContext.state === 'suspended') audioContext.resume();
    musicStep = 0;
    musicTimer = window.setInterval(playMusicStep, 220);
    playMusicStep();
    updateMusicButton(button, true);
  } catch {
    musicTimer = null;
    updateMusicButton(button, false);
  }
}

// 상단 도구 모음에 배경 음악 제어 버튼을 만듭니다.
function createMusicButton() {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'icon-button music-button';
  button.dataset.action = 'toggle-music';
  button.textContent = '♪';
  button.setAttribute('aria-label', '배경 음악 켜기');
  button.setAttribute('aria-pressed', 'false');
  button.title = '배경 음악 켜기';
  document.querySelector('.header-actions').append(button);
}

// 현재 값과 메모리 버튼 상태를 화면에 반영합니다.
function render() {
  resultElement.textContent = hasError ? currentValue : formatDisplay(currentValue);
  resultElement.classList.toggle('is-error', hasError);
  document.querySelector('[data-action="memory-clear"]').disabled = memoryValue === null;
  document.querySelector('[data-action="memory-recall"]').disabled = memoryValue === null;
}

// 숫자 문자열을 천 단위 구분 기호가 포함된 표시용 문자열로 바꿉니다.
function formatDisplay(value) {
  if (value.includes('e') || value.includes('E')) return value;
  const [integerPart, decimalPart] = value.split('.');
  const groupedInteger = Number(integerPart).toLocaleString('en-US', { maximumFractionDigits: 0 });
  return decimalPart === undefined ? groupedInteger : `${groupedInteger}.${decimalPart}`;
}

// 계산 결과를 부동 소수점 오차가 드러나지 않는 문자열로 정리합니다.
function normalizeNumber(value) {
  if (!Number.isFinite(value)) throw new Error('계산할 수 없습니다.');
  return Number(value.toPrecision(12)).toString();
}

// 오류 메시지가 표시된 뒤 새 입력이 시작되도록 계산 상태를 초기화합니다.
function resetAfterError() {
  if (!hasError) return;
  currentValue = '0';
  storedValue = null;
  activeOperator = null;
  lastOperator = null;
  lastOperand = null;
  hasError = false;
}

// 숫자 키 입력을 현재 표시값에 반영합니다.
function inputDigit(digit) {
  resetAfterError();
  if (waitingForOperand) {
    currentValue = digit;
    waitingForOperand = false;
  } else if (currentValue.replace('-', '').replace('.', '').length < 15) {
    currentValue = currentValue === '0' ? digit : currentValue + digit;
  }
  render();
}

// 소수점 입력을 중복 없이 현재 숫자에 추가합니다.
function inputDecimal() {
  resetAfterError();
  if (waitingForOperand) {
    currentValue = '0.';
    waitingForOperand = false;
  } else if (!currentValue.includes('.')) {
    currentValue += '.';
  }
  render();
}

// 선택한 사칙 연산과 현재 값을 다음 계산을 위해 저장합니다.
function chooseOperator(operator) {
  resetAfterError();
  const inputValue = Number(currentValue);
  if (activeOperator && !waitingForOperand) {
    const intermediate = calculate(storedValue, inputValue, activeOperator);
    currentValue = normalizeNumber(intermediate);
    storedValue = intermediate;
  } else {
    storedValue = inputValue;
  }
  activeOperator = operator;
  waitingForOperand = true;
  lastOperator = null;
  lastOperand = null;
  expressionElement.textContent = `${formatDisplay(currentValue)} ${operator}`;
  render();
}

// 두 숫자와 연산자로 사칙 연산 결과를 계산합니다.
function calculate(left, right, operator) {
  if (operator === '+') return left + right;
  if (operator === '−') return left - right;
  if (operator === '×') return left * right;
  if (operator === '÷') {
    if (right === 0) throw new Error('0으로 나눌 수 없습니다.');
    return left / right;
  }
  throw new Error('지원하지 않는 연산입니다.');
}

// 현재 연산을 마치고 결과를 기록하며 반복 계산값을 보관합니다.
function evaluate() {
  if (hasError) return;
  let operator = activeOperator;
  let left = storedValue;
  let right = Number(currentValue);
  if (!operator && lastOperator) {
    operator = lastOperator;
    left = Number(currentValue);
    right = lastOperand;
  } else if (!operator) {
    return;
  }
  try {
    const expression = `${formatDisplay(normalizeNumber(left))} ${operator} ${formatDisplay(normalizeNumber(right))} =`;
    currentValue = normalizeNumber(calculate(left, right, operator));
    lastOperator = operator;
    lastOperand = right;
    storedValue = null;
    activeOperator = null;
    waitingForOperand = true;
    expressionElement.textContent = expression;
    addHistory(expression, currentValue);
  } catch (error) {
    showError(error.message);
  }
  render();
}

// 계산 기록에 결과를 추가하고 최대 30개까지만 유지합니다.
function addHistory(expression, value) {
  calculationHistory.unshift({ expression, value });
  calculationHistory = calculationHistory.slice(0, 30);
  renderHistory();
}

// 계산 기록 목록을 안전한 텍스트 노드로 다시 그립니다.
function renderHistory() {
  historyListElement.replaceChildren();
  document.querySelector('#history-empty').hidden = calculationHistory.length > 0;
  document.querySelector('#clear-history').hidden = calculationHistory.length === 0;
  calculationHistory.forEach(renderHistoryItem);
}

// 기록 패널에 계산 항목 하나를 추가합니다.
function renderHistoryItem(item) {
  const listItem = document.createElement('li');
  const expression = document.createElement('p');
  const value = document.createElement('p');
  listItem.className = 'history-item';
  expression.className = 'history-expression';
  value.className = 'history-result';
  expression.textContent = item.expression;
  value.textContent = formatDisplay(item.value);
  listItem.append(expression, value);
  historyListElement.append(listItem);
}

// 백분율, 역수, 제곱, 제곱근 연산을 현재 숫자에 적용합니다.
function applyUnary(action) {
  resetAfterError();
  const value = Number(currentValue);
  let result;
  let label;
  if (action === 'percent') {
    result = activeOperator && storedValue !== null ? storedValue * value / 100 : value / 100;
    label = `${formatDisplay(currentValue)}%`;
  } else if (action === 'reciprocal') {
    if (value === 0) return showError('0의 역수는 계산할 수 없습니다.');
    result = 1 / value;
    label = `1/(${formatDisplay(currentValue)})`;
  } else if (action === 'square') {
    result = value * value;
    label = `sqr(${formatDisplay(currentValue)})`;
  } else if (action === 'square-root') {
    if (value < 0) return showError('음수의 제곱근은 계산할 수 없습니다.');
    result = Math.sqrt(value);
    label = `√(${formatDisplay(currentValue)})`;
  } else {
    return;
  }
  try {
    currentValue = normalizeNumber(result);
    expressionElement.textContent = label;
    waitingForOperand = false;
  } catch (error) {
    showError(error.message);
  }
  render();
}

// 현재 숫자의 부호를 바꿉니다.
function toggleSign() {
  resetAfterError();
  if (Number(currentValue) !== 0) {
    currentValue = currentValue.startsWith('-') ? currentValue.slice(1) : `-${currentValue}`;
  }
  render();
}

// 현재 숫자만 초기화하고 진행 중인 연산은 유지합니다.
function clearEntry() {
  currentValue = '0';
  hasError = false;
  waitingForOperand = false;
  render();
}

// 표시값과 진행 중인 연산을 모두 초기화합니다.
function clearAll() {
  currentValue = '0';
  storedValue = null;
  activeOperator = null;
  waitingForOperand = false;
  lastOperator = null;
  lastOperand = null;
  hasError = false;
  expressionElement.textContent = '';
  render();
}

// 현재 숫자의 마지막 문자를 지웁니다.
function backspace() {
  resetAfterError();
  if (waitingForOperand) return;
  currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : '0';
  if (currentValue === '-') currentValue = '0';
  render();
}

// 계산 오류를 표시하고 다음 입력에서 새 계산을 시작하도록 합니다.
function showError(message) {
  currentValue = message;
  hasError = true;
  storedValue = null;
  activeOperator = null;
  waitingForOperand = true;
  expressionElement.textContent = '';
  render();
}

// 메모리 값을 목록에 표시하고 비어 있음 상태를 갱신합니다.
function renderMemory() {
  memoryListElement.replaceChildren();
  document.querySelector('#memory-empty').hidden = memoryValue !== null;
  if (memoryValue === null) return;
  const listItem = document.createElement('li');
  const value = document.createElement('p');
  listItem.className = 'memory-item';
  value.className = 'memory-value';
  value.textContent = formatDisplay(normalizeNumber(memoryValue));
  listItem.append(value);
  memoryListElement.append(listItem);
}

// 현재 표시값을 메모리에 저장합니다.
function memoryStore() {
  if (hasError) return;
  memoryValue = Number(currentValue);
  renderMemory();
  render();
}

// 메모리에 저장된 숫자를 현재 표시값으로 불러옵니다.
function memoryRecall() {
  if (memoryValue === null) return;
  currentValue = normalizeNumber(memoryValue);
  waitingForOperand = false;
  hasError = false;
  render();
}

// 현재 표시값을 메모리 값에 더합니다.
function memoryAdd() {
  if (hasError) return;
  memoryValue = (memoryValue ?? 0) + Number(currentValue);
  renderMemory();
  render();
}

// 현재 표시값을 메모리 값에서 뺍니다.
function memorySubtract() {
  if (hasError) return;
  memoryValue = (memoryValue ?? 0) - Number(currentValue);
  renderMemory();
  render();
}

// 메모리에 저장된 값을 삭제합니다.
function memoryClear() {
  memoryValue = null;
  renderMemory();
  render();
}

// 화면에 표시된 계산 기록을 모두 지웁니다.
function clearHistory() {
  calculationHistory = [];
  renderHistory();
}

// 보조 패널을 열거나 선택한 탭으로 전환합니다.
function openPanel(panelName) {
  activePanel = panelName;
  panelElement.hidden = false;
  document.querySelector('#history-content').hidden = panelName !== 'history';
  document.querySelector('#memory-content').hidden = panelName !== 'memory';
  document.querySelectorAll('[data-panel-tab]').forEach(updatePanelTab);
  document.querySelectorAll('[data-action="toggle-panel"]').forEach(updatePanelButton);
}

// 패널 탭의 선택 상태와 접근성 속성을 갱신합니다.
function updatePanelTab(button) {
  const selected = button.dataset.panelTab === activePanel;
  button.classList.toggle('is-active', selected);
  button.setAttribute('aria-selected', String(selected));
}

// 상단 패널 버튼의 활성 상태를 갱신합니다.
function updatePanelButton(button) {
  const selected = !panelElement.hidden && button.dataset.panel === activePanel;
  button.setAttribute('aria-pressed', String(selected));
}

// 보조 패널을 닫습니다.
function closePanel() {
  panelElement.hidden = true;
  document.querySelectorAll('[data-action="toggle-panel"]').forEach(updatePanelButton);
}

// 버튼 동작을 data-action 값에 따라 실행합니다.
function handleCalculatorClick(event) {
  const button = event.target.closest('button');
  if (!button) return;
  if (button.dataset.panelTab) return openPanel(button.dataset.panelTab);
  const action = button.dataset.action;
  if (action === 'toggle-panel') {
    if (!panelElement.hidden && activePanel === button.dataset.panel) return closePanel();
    return openPanel(button.dataset.panel);
  }
  if (action === 'close-panel') return closePanel();
  if (action === 'toggle-music') return toggleBackgroundMusic(button);
  if (action === 'digit') {
    playKeySound(button.dataset.value);
    return inputDigit(button.dataset.value);
  }
  if (action === 'decimal') return inputDecimal();
  if (action === 'operator') return chooseOperator(button.dataset.operator);
  if (action === 'equals') return evaluate();
  if (action === 'clear-entry') return clearEntry();
  if (action === 'clear') return clearAll();
  if (action === 'backspace') return backspace();
  if (action === 'sign') return toggleSign();
  if (action === 'percent' || action === 'reciprocal' || action === 'square' || action === 'square-root') return applyUnary(action);
  if (action === 'memory-clear') return memoryClear();
  if (action === 'memory-recall') return memoryRecall();
  if (action === 'memory-add') return memoryAdd();
  if (action === 'memory-subtract') return memorySubtract();
  if (action === 'memory-store') return memoryStore();
  if (action === 'clear-history') return clearHistory();
}

// 키보드 숫자와 연산 키를 버튼 입력과 동일하게 처리합니다.
function handleKeyboard(event) {
  const key = event.key;
  if (/^[0-9]$/.test(key)) return inputDigit(key);
  if (key === '.' || key === ',') return inputDecimal();
  if (key === '+') return chooseOperator('+');
  if (key === '-') return chooseOperator('−');
  if (key === '*') return chooseOperator('×');
  if (key === '/') {
    event.preventDefault();
    return chooseOperator('÷');
  }
  if (key === 'Enter' || key === '=') {
    event.preventDefault();
    return evaluate();
  }
  if (key === 'Backspace') return backspace();
  if (key === 'Escape' || key === 'Delete') return clearAll();
  if (key === '%') return applyUnary('percent');
}

// 버튼과 키보드 이벤트를 연결하고 초기 화면을 그립니다.
function initializeCalculator() {
  createMusicButton();
  document.querySelector('.calculator').addEventListener('click', handleCalculatorClick);
  panelElement.addEventListener('click', handleCalculatorClick);
  document.addEventListener('keydown', handleKeyboard);
  renderHistory();
  renderMemory();
  render();
}

initializeCalculator();
