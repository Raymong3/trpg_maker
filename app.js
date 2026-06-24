// ==========================================================================
// 🌈 무지개 열쇠 모험단 Playful & Premium App Logic (1P/2P Mode & Detailed GM Guide)
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  lucide.createIcons();

  // ================= TAB SYSTEM =================
  const navBtns = document.querySelectorAll('.nav-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      navBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));

      btn.classList.add('active');
      const activeTabEl = document.getElementById(targetTab);
      if (activeTabEl) {
        activeTabEl.classList.add('active');
      }

      // Re-trigger icon rendering if needed
      lucide.createIcons();
    });
  });

  // ================= CHARACTER CREATOR STATE =================
  const characters = [
    {
      name: '초록 토끼',
      class: '🐰 토끼 기사',
      emoji: '🐰',
      color: 'var(--green-pastel)',
      hearts: 3,
      maxHearts: 5,
      stats: {
        sturdy: 3, // 튼튼이
        agile: 2,  // 날쌘이
        smart: 2,  // 척척이
        charm: 1   // 상냥이
      },
      items: [
        '요술 리본 지팡이',
        '달콤한 딸기 사탕',
        '반짝이는 돌멩이'
      ]
    },
    {
      name: '분홍 요정',
      class: '🧚 요정 마법사',
      emoji: '🧚',
      color: 'var(--pink-pastel)',
      hearts: 3,
      maxHearts: 5,
      stats: {
        sturdy: 1, // 튼튼이
        agile: 2,  // 날쌘이
        smart: 3,  // 척척이
        charm: 2   // 상냥이
      },
      items: [
        '별가루 마법봉',
        '달콤한 보름달 과자',
        '따뜻한 비눗방울 비스킷'
      ]
    }
  ];

  let playMode = '1';      // '1' = 1 Player, '2' = 2 Players
  let activeEditIndex = 0; // index of character currently being edited (0 or 1)
  let activeRollIndex = 0; // index of character whose stats are used for rolling (0 or 1)

  // Select DOM Elements
  const inputName = document.getElementById('char-name');
  const presetBtns = document.querySelectorAll('.preset-btn');
  const customClassInput = document.getElementById('char-class-custom');
  const colorBtns = document.querySelectorAll('.color-btn');
  const starRatings = document.querySelectorAll('.star-rating');
  const itemInputs = [
    document.getElementById('item-0'),
    document.getElementById('item-1'),
    document.getElementById('item-2')
  ];

  // Mode buttons & panels
  const modeBtns = document.querySelectorAll('.mode-btn');
  const creatorSwitcher = document.querySelector('.creator-switcher');
  const cardsContainer = document.querySelector('.card-display-panel.dual-cards');
  const cardElement1 = document.getElementById('char-card-element-1');
  const btnPrint1 = document.getElementById('btn-print-1');
  const diceCharSelectorPanel = document.querySelector('.dice-char-selector');

  // ================= PLAY MODE APPLICATION =================
  function applyPlayMode() {
    if (playMode === '1') {
      // 1-Player Mode adjustments
      creatorSwitcher.style.display = 'none';
      activeEditIndex = 0; // Lock to Player 1 edit
      
      cardElement1.style.display = 'none';
      cardsContainer.classList.add('single-mode'); // Stretch Card 1 center
      
      btnPrint1.style.display = 'none';
      
      diceCharSelectorPanel.style.display = 'none'; // Hide dice char switcher
      activeRollIndex = 0; // Lock roll to Player 1
      
      // Update switcher active tab states
      document.querySelectorAll('.switcher-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-char-idx') === '0');
      });
      document.querySelectorAll('.dice-char-btn').forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-char-idx') === '0');
      });
    } else {
      // 2-Player Mode adjustments
      creatorSwitcher.style.display = 'flex';
      
      cardElement1.style.display = 'block';
      cardsContainer.classList.remove('single-mode'); // Side-by-side grid
      
      btnPrint1.style.display = 'block';
      
      diceCharSelectorPanel.style.display = 'flex'; // Show dice char switcher
    }

    loadActiveCharacterToForm();
    updateCardPreviews();
    syncActiveDiceQty();
  }

  // Play Mode Click Listeners
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      modeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playMode = btn.getAttribute('data-mode');
      applyPlayMode();
    });
  });

  // ================= LOAD ACTIVE CHARACTER TO FORM =================
  function loadActiveCharacterToForm() {
    const char = characters[activeEditIndex];
    inputName.value = char.name;
    customClassInput.value = char.class;

    // Sync Preset Class Buttons
    let matchedPreset = false;
    presetBtns.forEach(btn => {
      const cls = btn.getAttribute('data-class');
      if (cls === char.class) {
        btn.classList.add('active');
        matchedPreset = true;
      } else {
        btn.classList.remove('active');
      }
    });

    if (!matchedPreset && char.class) {
      // Select Custom button if name didn't match presets
      presetBtns.forEach(btn => {
        if (btn.getAttribute('data-class') === '직접 입력') {
          btn.classList.add('active');
        }
      });
      customClassInput.style.display = 'block';
    } else {
      customClassInput.style.display = 'none';
    }

    // Sync Colors pickers
    colorBtns.forEach(btn => {
      const color = btn.getAttribute('data-color');
      if (color === char.color) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Sync Star Rating inputs
    starRatings.forEach(ratingContainer => {
      const statKey = ratingContainer.getAttribute('data-stat');
      const val = char.stats[statKey];
      const stars = ratingContainer.querySelectorAll('.star-icon');
      
      stars.forEach(s => {
        const starVal = parseInt(s.getAttribute('data-value'));
        s.classList.toggle('active', starVal <= val);
      });
    });

    // Sync Items inputs
    itemInputs.forEach((input, index) => {
      input.value = char.items[index] || '';
    });

    // Update point counter
    const totalUsed = Object.values(char.stats).reduce((a, b) => a + b, 0);
    document.getElementById('stat-points-left').textContent = 8 - totalUsed;
  }

  // ================= SYNC ALL PREVIEWS =================
  function updateCardPreviews() {
    characters.forEach((char, index) => {
      // Set name & class & avatar emoji
      document.getElementById(`card-name-${index}`).textContent = char.name || '이름 없음';
      document.getElementById(`card-class-${index}`).textContent = char.class || '직업 없음';
      document.getElementById(`card-avatar-emoji-${index}`).textContent = char.emoji;
      document.getElementById(`card-avatar-bg-${index}`).style.backgroundColor = char.color;

      // Set header color
      const cardEl = document.getElementById(`char-card-element-${index}`);
      cardEl.style.setProperty('--card-header-bg', char.color);

      // Set stats stars
      for (const [key, value] of Object.entries(char.stats)) {
        const statLabel = document.getElementById(`card-${key}-${index}`);
        if (statLabel) {
          statLabel.textContent = '★'.repeat(value) + '☆'.repeat(3 - value);
        }
      }

      // Set Items
      const itemsList = document.getElementById(`card-items-${index}`);
      itemsList.innerHTML = '';
      char.items.forEach(item => {
        if (item && item.trim()) {
          const li = document.createElement('li');
          li.textContent = `✨ ${item}`;
          itemsList.appendChild(li);
        }
      });

      // Render hearts
      renderHearts(index);
    });

    // Sync dice roller star counts in dice tab
    syncDiceTabStarLabels();
  }

  // Render Hearts dynamically
  function renderHearts(charIndex) {
    const char = characters[charIndex];
    const heartsContainer = document.getElementById(`card-hearts-${charIndex}`);
    heartsContainer.innerHTML = '';

    for (let i = 0; i < char.maxHearts; i++) {
      const heart = document.createElement('i');
      heart.setAttribute('data-lucide', 'heart');
      heart.classList.add('heart-icon');
      heart.setAttribute('data-index', i);

      if (i < char.hearts) {
        heart.classList.add('active');
      }

      heart.addEventListener('click', (e) => {
        const clickedIdx = parseInt(e.currentTarget.getAttribute('data-index'));
        if (char.hearts === clickedIdx + 1) {
          char.hearts = clickedIdx;
        } else {
          char.hearts = clickedIdx + 1;
        }
        renderHearts(charIndex);
      });

      heartsContainer.appendChild(heart);
    }
    lucide.createIcons();
  }

  // Sync dice roller skill star counts labels
  function syncDiceTabStarLabels() {
    const char = characters[activeRollIndex];
    for (const [key, value] of Object.entries(char.stats)) {
      const labelEl = document.getElementById(`roll-${key}-stars`);
      if (labelEl) {
        labelEl.textContent = '★'.repeat(value) + '☆'.repeat(3 - value);
      }
    }
  }

  // ================= EDITORS / INPUT HANDLERS =================

  // Editor Character Switcher Tab
  const switcherBtns = document.querySelectorAll('.switcher-btn');
  switcherBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      switcherBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeEditIndex = parseInt(btn.getAttribute('data-char-idx'));
      loadActiveCharacterToForm();
    });
  });

  // Name change listener
  inputName.addEventListener('input', (e) => {
    characters[activeEditIndex].name = e.target.value;
    updateCardPreviews();
  });

  // Preset Class buttons listener
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedClass = btn.getAttribute('data-class');
      const selectedIcon = btn.getAttribute('data-icon');
      const char = characters[activeEditIndex];

      if (selectedClass === '직업 입력') {
        customClassInput.style.display = 'block';
        customClassInput.focus();
        char.class = customClassInput.value || '모험가';
        char.emoji = '✏️';
      } else {
        customClassInput.style.display = 'none';
        char.class = selectedClass;

        // Pick emojis
        if (selectedIcon === 'rabbit') char.emoji = '🐰';
        else if (selectedIcon === 'wizard') char.emoji = '🧚';
        else if (selectedIcon === 'squirrel') char.emoji = '🐿️';
        else if (selectedIcon === 'dragon') char.emoji = '🦖';
      }
      updateCardPreviews();
    });
  });

  // Custom class text input listener
  customClassInput.addEventListener('input', (e) => {
    characters[activeEditIndex].class = e.target.value || '모험가';
    updateCardPreviews();
  });

  // Color picker listener
  colorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      colorBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      characters[activeEditIndex].color = btn.getAttribute('data-color');
      updateCardPreviews();
    });
  });

  // Items inputs listener
  itemInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      characters[activeEditIndex].items[index] = e.target.value;
      updateCardPreviews();
    });
  });

  // Star Ratings allocation logic
  starRatings.forEach(ratingContainer => {
    const statKey = ratingContainer.getAttribute('data-stat');
    const stars = ratingContainer.querySelectorAll('.star-icon');

    stars.forEach(star => {
      star.addEventListener('click', () => {
        const clickedValue = parseInt(star.getAttribute('data-value'));
        const char = characters[activeEditIndex];
        
        // Calculate hypothetic sum if change is made
        const currentVal = char.stats[statKey];
        const currentSum = Object.values(char.stats).reduce((a, b) => a + b, 0);
        const newSum = currentSum - currentVal + clickedValue;

        if (newSum <= 8) {
          char.stats[statKey] = clickedValue;
          
          // Toggle UI star activation
          stars.forEach(s => {
            const val = parseInt(s.getAttribute('data-value'));
            s.classList.toggle('active', val <= clickedValue);
          });

          updateCardPreviews();
          syncActiveDiceQty(); // update active roller qty if necessary
        } else {
          // Play a slight shake/error effect on points left label
          const counter = document.getElementById('stat-points-left');
          counter.style.color = 'var(--red-dark)';
          counter.style.fontWeight = 'bold';
          setTimeout(() => {
            counter.style.color = '';
            counter.style.fontWeight = '';
          }, 500);
        }
      });
    });
  });


  // ================= DICE ROLLER LOGIC =================
  let activeRollerSkill = 'sturdy'; // default
  let diceQty = 3; // default based on active roll char sturdy stat

  const diceCharBtns = document.querySelectorAll('.dice-char-btn');
  const skillSelectBtns = document.querySelectorAll('.skill-select-btn');
  const diceQtyText = document.getElementById('dice-qty');
  const qtyMinus = document.getElementById('qty-minus');
  const qtyPlus = document.getElementById('qty-plus');
  const btnHelpDice = document.getElementById('btn-help-dice');
  const btnResetDice = document.getElementById('btn-reset-dice');
  const btnRollDice = document.getElementById('btn-roll-dice');

  const resultPlaceholder = document.getElementById('result-placeholder');
  const resultDisplay = document.getElementById('result-display');
  const diceFacesContainer = document.getElementById('dice-faces');
  const resultVerdict = document.getElementById('result-verdict');

  // Switch Character in Dice tab listener
  diceCharBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      diceCharBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRollIndex = parseInt(btn.getAttribute('data-char-idx'));

      syncDiceTabStarLabels();
      syncActiveDiceQty();
    });
  });

  // Set dice qty based on active skill rating
  function syncActiveDiceQty() {
    const char = characters[activeRollIndex];
    const activeSkillRating = char.stats[activeRollerSkill];
    diceQty = activeSkillRating;
    updateDiceQtyDisplay();
  }

  function updateDiceQtyDisplay() {
    diceQtyText.textContent = diceQty;
  }

  // Skill button listener
  skillSelectBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      skillSelectBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRollerSkill = btn.getAttribute('data-stat');
      syncActiveDiceQty();
    });
  });

  // Dice Qty adjusters
  qtyMinus.addEventListener('click', () => {
    if (diceQty > 1) {
      diceQty--;
      updateDiceQtyDisplay();
    }
  });

  qtyPlus.addEventListener('click', () => {
    if (diceQty < 6) {
      diceQty++;
      updateDiceQtyDisplay();
    }
  });

  // Add Help Die (+1)
  btnHelpDice.addEventListener('click', () => {
    if (diceQty < 6) {
      diceQty++;
      updateDiceQtyDisplay();
      btnHelpDice.classList.add('pulse');
      setTimeout(() => btnHelpDice.classList.remove('pulse'), 400);
    }
  });

  // Reset to original rating
  btnResetDice.addEventListener('click', () => {
    syncActiveDiceQty();
  });

  // Core Rolling Action
  btnRollDice.addEventListener('click', () => {
    resultPlaceholder.classList.add('hidden');
    resultDisplay.classList.remove('hidden');

    diceFacesContainer.innerHTML = '';
    resultVerdict.classList.add('hidden');

    const rolledValues = [];
    for (let i = 0; i < diceQty; i++) {
      const val = Math.floor(Math.random() * 6) + 1;
      rolledValues.push(val);

      const die = document.createElement('div');
      die.classList.add('dice-block', 'rolling');
      die.textContent = '?';
      diceFacesContainer.appendChild(die);
    }

    let animationTicks = 0;
    const interval = setInterval(() => {
      const diceBlocks = document.querySelectorAll('.dice-block');
      diceBlocks.forEach(block => {
        block.textContent = Math.floor(Math.random() * 6) + 1;
      });
      animationTicks++;
      if (animationTicks > 8) {
        clearInterval(interval);
        finalizeRollResults(rolledValues);
      }
    }, 60);
  });

  // Finalize roll results
  function finalizeRollResults(values) {
    const diceBlocks = document.querySelectorAll('.dice-block');
    const rollerName = characters[activeRollIndex].name || '모험가';
    let successes = 0;

    values.forEach((val, idx) => {
      const isSuccess = val >= 4;
      if (isSuccess) successes++;

      const block = diceBlocks[idx];
      block.classList.remove('rolling');
      block.textContent = val;
      block.classList.add(isSuccess ? 'success-die' : 'fail-die');
    });

    resultVerdict.innerHTML = '';
    resultVerdict.classList.remove('hidden');

    const banner = document.createElement('div');
    banner.classList.add('verdict-banner');

    const emojiSpan = document.createElement('span');
    emojiSpan.classList.add('verdict-emoji');

    const textDiv = document.createElement('div');
    textDiv.classList.add('verdict-text');
    
    const title = document.createElement('h3');
    const desc = document.createElement('p');

    if (successes > 0) {
      banner.classList.add('success');
      
      if (successes >= 2) {
        emojiSpan.textContent = '👑';
        title.textContent = `${rollerName} 대성공!`;
        desc.textContent = `주사위 ${successes}개가 성공했어요! 완벽하게 해내고 보너스 기분 좋은 일이 일어나요!`;
      } else {
        emojiSpan.textContent = '⭐';
        title.textContent = `${rollerName} 성공!`;
        desc.textContent = `주사위 1개가 성공했어요! 하려던 행동을 멋지게 마쳤어요.`;
      }
    } else {
      banner.classList.add('twist');
      emojiSpan.textContent = '🌀';
      title.textContent = `${rollerName} 어라라? 반전 발생!`;
      desc.textContent = '모든 주사위가 실패했지만 다치지 않아요. 신기하고 코믹한 일이 발생합니다! (하트 1개 차감, 아빠 GM의 재미난 설명 듣기)';
    }

    textDiv.appendChild(title);
    textDiv.appendChild(desc);
    banner.appendChild(emojiSpan);
    banner.appendChild(textDiv);
    resultVerdict.appendChild(banner);
  }


  // ================= ADVENTURE EPISODE TOGGLE =================
  const episodeBtns = document.querySelectorAll('.episode-btn');
  const episodeContents = document.querySelectorAll('.episode-content');

  episodeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      episodeBtns.forEach(b => b.classList.remove('active'));
      episodeContents.forEach(ec => ec.classList.remove('active'));

      btn.classList.add('active');
      const targetEp = btn.getAttribute('data-episode');
      const activeEpEl = document.getElementById(targetEp);
      if (activeEpEl) {
        activeEpEl.classList.add('active');
      }
    });
  });


  // ================= PRINT HANDLERS =================
  const btnPrint0 = document.getElementById('btn-print-0');
  const btnPrint1 = document.getElementById('btn-print-1');

  function printCharacter(charIdx) {
    const char = characters[charIdx];
    
    // Fill the print sheet data
    document.getElementById('print-name-val').textContent = char.name || '____________________';
    document.getElementById('print-class-val').textContent = char.class || '____________________';
    
    document.getElementById('print-sturdy-stars').textContent = '★'.repeat(char.stats.sturdy) + '☆'.repeat(3 - char.stats.sturdy);
    document.getElementById('print-agile-stars').textContent = '★'.repeat(char.stats.agile) + '☆'.repeat(3 - char.stats.agile);
    document.getElementById('print-smart-stars').textContent = '★'.repeat(char.stats.smart) + '☆'.repeat(3 - char.stats.smart);
    document.getElementById('print-charm-stars').textContent = '★'.repeat(char.stats.charm) + '☆'.repeat(3 - char.stats.charm);

    for (let i = 0; i < 3; i++) {
      const itemVal = char.items[i] || '';
      const printItemEl = document.getElementById(`print-item-${i}-val`);
      if (printItemEl) {
        printItemEl.textContent = itemVal ? `${i + 1}. ${itemVal}` : `${i + 1}. ________________________________`;
      }
    }

    // Trigger print
    window.print();
  }

  btnPrint0.addEventListener('click', () => printCharacter(0));
  btnPrint1.addEventListener('click', () => printCharacter(1));


  // ================= INITIALIZATION =================
  applyPlayMode(); // Apply default (1-Player) mode
});
