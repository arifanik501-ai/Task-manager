// ====================================================================
// ষড়যন্ত্র - Game Engine
// ====================================================================

'use strict';

const STORAGE_KEY = 'shorojontro_v1';

// ============== STATE ==============
let state = null;
let ui = {
    playerCount: 3,
    selectedMode: 'casual',
    distribution: 'random',
    charSelectIndex: 0,
    charSelectPlayerIdx: 0,
    pendingCharChoices: []
};

const screens = ['splash','howto','leaderboard','setup','character','game','end'];

function $(sel, root=document) { return root.querySelector(sel); }
function $$(sel, root=document) { return Array.from(root.querySelectorAll(sel)); }

function showScreen(name) {
    screens.forEach(s => {
        const el = $('#screen-' + s);
        if (el) el.classList.toggle('active', s === name);
    });
    window.scrollTo(0,0);
}

// ============== INIT / EVENTS ==============
document.addEventListener('DOMContentLoaded', () => {
    bindGlobalEvents();
    renderSetup();
    refreshLeaderboard();
});

function bindGlobalEvents() {
    document.body.addEventListener('click', e => {
        const action = e.target.closest('[data-action]')?.dataset.action;
        if (action) handleAction(action, e.target);

        const tab = e.target.closest('.action-tab')?.dataset.tab;
        if (tab) openSheet(tab);
    });

    // Setup screen interactions
    document.body.addEventListener('click', e => {
        const delta = e.target.dataset.countDelta;
        if (delta !== undefined) {
            ui.playerCount = Math.max(2, Math.min(6, ui.playerCount + parseInt(delta)));
            renderSetup();
        }
    });

    // Mode select
    document.body.addEventListener('change', e => {
        if (e.target.name === 'mode') {
            ui.selectedMode = e.target.value;
            $$('.mode-card').forEach(c => c.classList.remove('selected'));
            e.target.closest('.mode-card').classList.add('selected');
        }
        if (e.target.name === 'dist') {
            ui.distribution = e.target.value;
            $$('.dist-option').forEach(c => c.classList.remove('selected'));
            e.target.closest('.dist-option').classList.add('selected');
        }
    });

    // Character nav
    $('#char-prev')?.addEventListener('click', () => {
        ui.charSelectIndex = (ui.charSelectIndex - 1 + CHARACTERS.length) % CHARACTERS.length;
        renderCharacterCard();
    });
    $('#char-next')?.addEventListener('click', () => {
        ui.charSelectIndex = (ui.charSelectIndex + 1) % CHARACTERS.length;
        renderCharacterCard();
    });
    $('#char-confirm')?.addEventListener('click', confirmCharacter);

    // Sheet close
    $('#sheet-close')?.addEventListener('click', closeSheet);
    $('#sheet-overlay')?.addEventListener('click', e => {
        if (e.target.id === 'sheet-overlay') closeSheet();
    });
}

function handleAction(action, target) {
    switch (action) {
        case 'goto-setup': showScreen('setup'); break;
        case 'goto-howto': showScreen('howto'); break;
        case 'goto-leaderboard': refreshLeaderboard(); showScreen('leaderboard'); break;
        case 'back-splash': showScreen('splash'); break;
        case 'start-game': startGame(); break;
        case 'play-again': showScreen('setup'); break;
    }
}

// ============== SETUP RENDERING ==============
function renderSetup() {
    $('#player-count').textContent = toBn(ui.playerCount);
    const hints = {
        2: '⚠️ সর্বনিম্ন, জোট খেলা সীমিত',
        3: '✅ ভালো, কৌশলী খেলা সম্ভব',
        4: '⭐ আদর্শ! সবচেয়ে সুষম',
        5: '⭐⭐ সেরা! জটিল জোট সম্ভব',
        6: '⚠️ সর্বোচ্চ, খেলা দীর্ঘ হবে'
    };
    $('#player-count-hint').textContent = hints[ui.playerCount];

    const list = $('#player-names-list');
    list.innerHTML = '';
    for (let i = 0; i < ui.playerCount; i++) {
        const wrap = document.createElement('div');
        wrap.className = 'player-name-row';
        const youTag = i === 0 ? ' <span class="you-tag">আপনি</span>' : ' <span class="cpu-tag">CPU</span>';
        wrap.innerHTML = `
            <label>খেলোয়াড় ${toBn(i+1)}${youTag}</label>
            <input type="text" class="player-name-input" data-idx="${i}" value="${DEFAULT_NAMES[i] || 'খেলোয়াড় ' + toBn(i+1)}" maxlength="15">
        `;
        list.appendChild(wrap);
    }
}

// ============== START GAME ==============
function startGame() {
    const names = $$('.player-name-input').map(inp => inp.value.trim() || 'খেলোয়াড়');
    const modeConfig = {
        casual:    { termMax: 3, roundMax: 3, winVotes: 30, winMinistries: 3, corruptionMax: 5, useCorruption: true },
        standard:  { termMax: 5, roundMax: 4, winVotes: 50, winMinistries: 5, corruptionMax: 5, useCorruption: true },
        hardcore:  { termMax: 6, roundMax: 5, winVotes: 100, winMinistries: 6, corruptionMax: 5, useCorruption: true, hardcore: true }
    }[ui.selectedMode];

    state = {
        mode: ui.selectedMode,
        config: modeConfig,
        term: 1,
        round: 1,
        phase: 'event',
        players: names.map((n, i) => ({
            id: i,
            name: n,
            isHuman: i === 0,
            character: null,
            fund: 500,
            votes: 0,
            popularity: 3,
            corruption: 0,
            ministries: [],
            hand: [],
            suspended: 0,
            actionsLeft: 3,
            actionUsedThisTurn: { ability: false }
        })),
        currentPlayerIdx: 0,
        ministryOwners: {},
        alliances: [],
        log: [],
        currentEvent: null,
        voteState: null,
        actionQueue: [],
        gameOver: false,
        winnerId: null
    };

    MINISTRIES.forEach(m => state.ministryOwners[m.id] = null);

    if (ui.distribution === 'random') {
        assignRandomCharacters();
        afterCharactersAssigned();
    } else {
        ui.charSelectIndex = 0;
        ui.charSelectPlayerIdx = 0;
        ui.pendingCharChoices = [];
        renderCharacterCard();
        showScreen('character');
    }
}

function assignRandomCharacters() {
    const pool = [...CHARACTERS].sort(() => Math.random() - 0.5);
    state.players.forEach((p, i) => {
        const c = pool[i % pool.length];
        applyCharacter(p, c);
    });
}

function applyCharacter(p, c) {
    p.character = c.id;
    p.fund = c.startFund;
    // Deal starting hand
    p.hand = [];
    for (let j = 0; j < c.startCards; j++) {
        p.hand.push(drawRandomCard(false));
    }
    for (let j = 0; j < c.bonusPower; j++) {
        p.hand.push(drawRandomCard(true));
    }
}

function drawRandomCard(powerOnly = false) {
    const pool = powerOnly ? POWER_CARDS : CONSPIRACY_CARDS;
    const base = pool[Math.floor(Math.random() * pool.length)];
    return { ...base, uid: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36) };
}

// ============== CHARACTER SELECTION (manual mode) ==============
function renderCharacterCard() {
    const c = CHARACTERS[ui.charSelectIndex];
    const player = state.players[ui.charSelectPlayerIdx];
    $('#char-select-title').innerHTML = `${player.name}-এর চরিত্র বাছুন${player.isHuman ? ' <span class="you-tag">আপনি</span>' : ''}`;
    $('#char-pager').textContent = `${toBn(ui.charSelectIndex + 1)}/${toBn(CHARACTERS.length)}`;
    const wrap = $('#char-card-wrapper');
    wrap.innerHTML = `
        <div class="char-card">
            <div class="char-icon">${c.icon}</div>
            <h3 class="char-name">${c.name}</h3>
            <p class="char-quote">"${c.quote}"</p>
            <div class="char-section">
                <h4>💪 বিশেষ ক্ষমতা</h4>
                <p>${c.ability}</p>
            </div>
            <div class="char-section">
                <h4>⚠️ দুর্বলতা</h4>
                <p>${c.weakness}</p>
            </div>
            <div class="char-section">
                <h4>🎯 গোপন লক্ষ্য</h4>
                <p>${c.secret}</p>
            </div>
            <div class="char-meta">
                <span>💰 শুরুর ফান্ড: ${toBn(c.startFund)}</span>
                <span>🃏 কার্ড: ${toBn(c.startCards + c.bonusPower)}</span>
            </div>
        </div>
    `;
}

function confirmCharacter() {
    const c = CHARACTERS[ui.charSelectIndex];
    const player = state.players[ui.charSelectPlayerIdx];
    applyCharacter(player, c);
    ui.charSelectPlayerIdx++;
    if (ui.charSelectPlayerIdx >= state.players.length) {
        afterCharactersAssigned();
    } else {
        ui.charSelectIndex = 0;
        renderCharacterCard();
    }
}

function afterCharactersAssigned() {
    showScreen('game');
    addLog('🎮 খেলা শুরু হয়েছে! সবাই প্রস্তুত।');
    runPhase();
}

// ============== GAME LOOP / PHASES ==============
function runPhase() {
    renderStatusBar();
    renderPlayerStrip();
    if (state.gameOver) return;
    switch (state.phase) {
        case 'event':       phaseEvent();       break;
        case 'action':      phaseAction();      break;
        case 'negotiation': phaseNegotiation(); break;
        case 'voting':      phaseVoting();      break;
        case 'endround':    phaseEndRound();    break;
    }
}

function nextPhase() {
    const order = ['event','action','negotiation','voting','endround'];
    const idx = order.indexOf(state.phase);
    state.phase = order[(idx + 1) % order.length];
    if (state.phase === 'event') {
        // Next round/term
        state.round++;
        if (state.round > state.config.roundMax) {
            state.round = 1;
            state.term++;
            if (state.term > state.config.termMax) {
                endGame();
                return;
            }
            addLog(`🗓️ টার্ম ${toBn(state.term)} শুরু হয়েছে!`);
        }
        // Per-turn ministry bonuses if first round of new term
        if (state.round === 1) applyMinistryBonuses();
    }
    if (state.phase === 'action') {
        state.currentPlayerIdx = 0;
        state.players.forEach(p => { p.actionsLeft = 3; p.actionUsedThisTurn = { ability: false }; });
    }
    runPhase();
}

function applyMinistryBonuses() {
    Object.entries(state.ministryOwners).forEach(([mid, pid]) => {
        if (pid === null) return;
        const m = MINISTRIES.find(x => x.id === mid);
        const p = state.players[pid];
        m.bonusFn(p);
        addLog(`🏛️ ${p.name} ${m.icon} ${m.name} মন্ত্রণালয় থেকে বোনাস পেয়েছেন।`);
    });
}

// ============== EVENT PHASE ==============
function phaseEvent() {
    const card = randOf(EVENT_CARDS);
    state.currentEvent = card;
    applyEventEffect(card);

    const area = $('#game-area');
    area.innerHTML = `
        <div class="event-card">
            <div class="event-newspaper">🗞️ দৈনিক ষড়যন্ত্র</div>
            <h2 class="event-headline">${card.headline}</h2>
            <p class="event-body">${card.body}</p>
            <div class="event-impact" id="event-impact"></div>
            <button class="btn btn-primary btn-large" id="event-continue">বুঝেছি ✓</button>
        </div>
    `;
    renderEventImpact();
    $('#event-continue').addEventListener('click', () => nextPhase());
}

function applyEventEffect(card) {
    const e = card.effect;
    switch (e.type) {
        case 'lowestPopularityBoost': {
            const sortedAsc = [...state.players].sort((a,b) => a.popularity - b.popularity);
            const sortedDesc = [...state.players].sort((a,b) => b.popularity - a.popularity);
            sortedAsc[0].popularity = Math.min(10, sortedAsc[0].popularity + e.amount);
            sortedDesc[0].popularity = Math.max(0, sortedDesc[0].popularity + e.highestPenalty);
            addLog(`📰 ${sortedAsc[0].name} জনপ্রিয়তা +${toBn(e.amount)}, ${sortedDesc[0].name} ${toBn(e.highestPenalty)}`);
            break;
        }
        case 'electionBonus': {
            const winner = [...state.players].sort((a,b) => b.popularity - a.popularity)[0];
            const loser = [...state.players].sort((a,b) => a.popularity - b.popularity)[0];
            winner.votes += e.winnerVotes;
            loser.popularity = Math.max(0, loser.popularity + e.loserPopularity);
            addLog(`🗳️ নির্বাচনে ${winner.name} +${toBn(e.winnerVotes)} ভোট!`);
            break;
        }
        case 'corruptionPenalty':
            state.players.forEach(p => {
                if (p.corruption >= 2) {
                    p.votes = Math.max(0, p.votes - 5);
                    addLog(`🔍 ${p.name} দুর্নীতির জন্য ৫ ভোট হারিয়েছেন।`);
                }
            });
            break;
        case 'reliefChoice':
            state.players.forEach(p => {
                if (p.fund >= e.cost) {
                    p.fund -= e.cost;
                    p.popularity = Math.min(10, p.popularity + e.popReward);
                    addLog(`🌊 ${p.name} ত্রাণ দিয়েছেন। +${toBn(e.popReward)} জনপ্রিয়তা।`);
                } else {
                    p.popularity = Math.max(0, p.popularity + e.popPenalty);
                    addLog(`🌊 ${p.name} ত্রাণ দিতে পারেননি। ${toBn(e.popPenalty)} জনপ্রিয়তা।`);
                }
            });
            break;
        case 'richestCorruption': {
            const richest = [...state.players].sort((a,b) => b.fund - a.fund)[0];
            addCorruption(richest, 1);
            addLog(`📑 ${richest.name}-এর দুর্নীতি মার্কার +১`);
            break;
        }
        case 'allPopularity':
            state.players.forEach(p => p.popularity = Math.min(10, p.popularity + e.amount));
            addLog(`📣 সবার জনপ্রিয়তা +${toBn(e.amount)}`);
            break;
        case 'allFund':
            state.players.forEach(p => p.fund += e.amount);
            addLog(`💵 সবাই ${toBn(e.amount)} ফান্ড পেয়েছেন।`);
            break;
        case 'ministryHolderCorruption': {
            const pid = state.ministryOwners[e.ministryId];
            if (pid !== null) {
                addCorruption(state.players[pid], 1);
                addLog(`📺 ${state.players[pid].name}-এর দুর্নীতি মার্কার +১`);
            }
            break;
        }
        case 'randomMinistryClear': {
            const owned = Object.entries(state.ministryOwners).filter(([m,p]) => p !== null);
            if (owned.length > 0) {
                const [mid, pid] = owned[Math.floor(Math.random() * owned.length)];
                const m = MINISTRIES.find(x => x.id === mid);
                state.ministryOwners[mid] = null;
                state.players[pid].ministries = state.players[pid].ministries.filter(x => x !== mid);
                addLog(`🔄 ${state.players[pid].name} ${m.name} মন্ত্রণালয় হারিয়েছেন।`);
            }
            break;
        }
        case 'leaderPenalty': {
            const leader = [...state.players].sort((a,b) => b.votes - a.votes)[0];
            leader.votes = Math.max(0, leader.votes - 1);
            addLog(`📉 ${leader.name} বিরোধী জোটের কারণে -১ ভোট।`);
            break;
        }
    }
}

function renderEventImpact() {
    const impact = $('#event-impact');
    if (!impact) return;
    impact.innerHTML = '<h4>বর্তমান স্থিতি:</h4>' +
        state.players.map(p => `
            <div class="impact-row">
                <span>${p.name}</span>
                <span>⭐ ${toBn(p.popularity)} | 💰 ${toBn(p.fund)} | 🗳️ ${toBn(p.votes)}</span>
            </div>
        `).join('');
}

// ============== ACTION PHASE ==============
function phaseAction() {
    const player = state.players[state.currentPlayerIdx];
    if (player.suspended > 0) {
        player.suspended--;
        addLog(`🚫 ${player.name} সাসপেন্ড — পালা স্কিপ।`);
        advanceToNextPlayer();
        return;
    }
    if (player.actionsLeft <= 0) {
        advanceToNextPlayer();
        return;
    }
    if (player.isHuman) {
        renderActionMenu(player);
    } else {
        // CPU thinking delay
        setTimeout(() => cpuTakeAction(player), 800);
        renderCpuThinking(player);
    }
}

function renderActionMenu(player) {
    const area = $('#game-area');
    area.innerHTML = `
        <div class="action-screen">
            <div class="action-header">
                <h3>🎯 ${player.name}, আপনার পালা</h3>
                <p>অবশিষ্ট অ্যাকশন: <strong>${toBn(player.actionsLeft)}</strong></p>
            </div>
            <div class="action-grid">
                <button class="action-btn" data-act="fund">
                    <span class="big-icon">💰</span>
                    <span>ফান্ড সংগ্রহ</span>
                </button>
                <button class="action-btn" data-act="campaign">
                    <span class="big-icon">🗳️</span>
                    <span>প্রচারণা</span>
                </button>
                <button class="action-btn" data-act="card">
                    <span class="big-icon">🃏</span>
                    <span>কার্ড খেলুন</span>
                </button>
                <button class="action-btn" data-act="ministry">
                    <span class="big-icon">🏛️</span>
                    <span>মন্ত্রণালয় দখল</span>
                </button>
                <button class="action-btn" data-act="negotiate">
                    <span class="big-icon">🤝</span>
                    <span>আলোচনা</span>
                </button>
                <button class="action-btn" data-act="pass">
                    <span class="big-icon">⏭️</span>
                    <span>পাস করুন</span>
                </button>
            </div>
        </div>
    `;
    area.querySelectorAll('[data-act]').forEach(btn => {
        btn.addEventListener('click', () => doHumanAction(btn.dataset.act, player));
    });
}

function renderCpuThinking(player) {
    const area = $('#game-area');
    area.innerHTML = `
        <div class="cpu-thinking">
            <div class="thinking-spinner"></div>
            <p><strong>${player.name}</strong> চিন্তা করছেন...</p>
            <p class="dim">অবশিষ্ট অ্যাকশন: ${toBn(player.actionsLeft)}</p>
        </div>
    `;
}

function doHumanAction(act, player) {
    switch (act) {
        case 'fund': showFundOptions(player); break;
        case 'campaign': showCampaignOptions(player); break;
        case 'card': showCardChooser(player); break;
        case 'ministry': showMinistryChooser(player); break;
        case 'negotiate': showNegotiationOptions(player); break;
        case 'pass': consumeAction(player); break;
    }
}

function consumeAction(player) {
    player.actionsLeft--;
    if (player.actionsLeft <= 0) {
        advanceToNextPlayer();
    } else {
        runPhase();
    }
}

function advanceToNextPlayer() {
    state.currentPlayerIdx++;
    if (state.currentPlayerIdx >= state.players.length) {
        nextPhase();
    } else {
        runPhase();
    }
}

// --- Fund options ---
function showFundOptions(player) {
    showModal('💰 ফান্ড সংগ্রহ', `
        <div class="option-list">
            <button class="option-btn" data-opt="govt">
                <h4>সরকারি বরাদ্দ</h4>
                <p>+২০০ ফান্ড | নিরাপদ</p>
            </button>
            <button class="option-btn" data-opt="business">
                <h4>ব্যবসায়ী ডোনেশন</h4>
                <p>+৪০০ ফান্ড | +১ দুর্নীতি ⚠️</p>
            </button>
            <button class="option-btn" data-opt="foreign">
                <h4>বিদেশি তহবিল</h4>
                <p>+৬০০ ফান্ড | +২ দুর্নীতি ⚠️⚠️</p>
            </button>
            <button class="option-btn" data-opt="public">
                <h4>জনগণের চাঁদা</h4>
                <p>+১০০ ফান্ড | +১ জনপ্রিয়তা ⭐</p>
            </button>
        </div>
    `, [{label:'বাতিল', cls:'btn-secondary', cb:closeModal}]);

    $('#modal-content').querySelectorAll('[data-opt]').forEach(btn => {
        btn.addEventListener('click', () => {
            const opt = btn.dataset.opt;
            applyFundOption(player, opt);
            closeModal();
            consumeAction(player);
        });
    });
}

function applyFundOption(p, opt) {
    switch (opt) {
        case 'govt': p.fund += 200; addLog(`💼 ${p.name} সরকারি বরাদ্দ থেকে +২০০ ফান্ড।`); break;
        case 'business': p.fund += 400; addCorruption(p, 1); addLog(`💼 ${p.name} ব্যবসায়ী ডোনেশন +৪০০ (দুর্নীতি +১)।`); break;
        case 'foreign': p.fund += 600; addCorruption(p, 2); addLog(`💼 ${p.name} বিদেশি তহবিল +৬০০ (দুর্নীতি +২)।`); break;
        case 'public': p.fund += 100; p.popularity = Math.min(10, p.popularity + 1); addLog(`💼 ${p.name} জনচাঁদা +১০০, +১ জনপ্রিয়তা।`); break;
    }
}

// --- Campaign options ---
function showCampaignOptions(player) {
    showModal('🗳️ প্রচারণা', `
        <div class="option-list">
            <button class="option-btn" data-opt="door">
                <h4>দ্বার-দ্বার প্রচারণা</h4>
                <p>খরচ ১০০ | +১ ভোট পয়েন্ট</p>
            </button>
            <button class="option-btn" data-opt="rally">
                <h4>জনসমাবেশ</h4>
                <p>খরচ ৩০০ | +৩ ভোট পয়েন্ট</p>
            </button>
            <button class="option-btn" data-opt="ad">
                <h4>মিডিয়া বিজ্ঞাপন</h4>
                <p>খরচ ৫০০ | +৫ ভোট, +১ জনপ্রিয়তা</p>
            </button>
        </div>
    `, [{label:'বাতিল', cls:'btn-secondary', cb:closeModal}]);

    $('#modal-content').querySelectorAll('[data-opt]').forEach(btn => {
        btn.addEventListener('click', () => {
            const opt = btn.dataset.opt;
            const costs = { door: 100, rally: 300, ad: 500 };
            const gains = { door: {votes:1}, rally: {votes:3}, ad: {votes:5, pop:1} };
            if (player.fund < costs[opt]) {
                toast('পর্যাপ্ত ফান্ড নেই!');
                return;
            }
            player.fund -= costs[opt];
            player.votes += gains[opt].votes;
            if (gains[opt].pop) player.popularity = Math.min(10, player.popularity + gains[opt].pop);
            addLog(`🗳️ ${player.name} প্রচারণায় +${toBn(gains[opt].votes)} ভোট।`);
            closeModal();
            consumeAction(player);
        });
    });
}

// --- Card chooser ---
function showCardChooser(player) {
    if (player.hand.length === 0) {
        toast('আপনার হাতে কোনো কার্ড নেই!');
        return;
    }
    const cardsHTML = player.hand.map((c, i) => `
        <div class="hand-card" data-card-idx="${i}">
            <div class="card-icon">${c.icon}</div>
            <h4>${c.name}</h4>
            <p>${c.desc}</p>
            <div class="card-meta">
                <span>💵 ${toBn(c.cost)}</span>
                <span class="card-type ${c.type}">${c.type === 'power' ? 'পাওয়ার' : 'ষড়যন্ত্র'}</span>
            </div>
            <button class="btn btn-primary btn-small" data-play="${i}">খেলুন</button>
        </div>
    `).join('');

    showModal('🃏 আপনার কার্ড', `<div class="card-grid">${cardsHTML}</div>`,
        [{label:'বাতিল', cls:'btn-secondary', cb:closeModal}]);

    $('#modal-content').querySelectorAll('[data-play]').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.play);
            const card = player.hand[idx];
            if (player.fund < card.cost) {
                toast('পর্যাপ্ত ফান্ড নেই!');
                return;
            }
            closeModal();
            playCard(player, idx);
        });
    });
}

function playCard(player, cardIdx) {
    const card = player.hand[cardIdx];
    if (card.target === 'opponent') {
        // pick target
        const opps = state.players.filter(p => p.id !== player.id);
        const html = opps.map(p => `
            <button class="option-btn" data-target="${p.id}">
                <h4>${p.name}</h4>
                <p>⭐ ${toBn(p.popularity)} | 💰 ${toBn(p.fund)} | 🗳️ ${toBn(p.votes)}</p>
            </button>
        `).join('');
        showModal(`কার উপর ব্যবহার করবেন?`, `<div class="option-list">${html}</div>`,
            [{label:'বাতিল', cls:'btn-secondary', cb:closeModal}]);
        $('#modal-content').querySelectorAll('[data-target]').forEach(btn => {
            btn.addEventListener('click', () => {
                const targetId = parseInt(btn.dataset.target);
                applyCardEffect(player, card, state.players[targetId]);
                player.fund -= card.cost;
                player.hand.splice(cardIdx, 1);
                closeModal();
                consumeAction(player);
            });
        });
    } else {
        applyCardEffect(player, card, player);
        player.fund -= card.cost;
        player.hand.splice(cardIdx, 1);
        consumeAction(player);
    }
}

function applyCardEffect(player, card, target) {
    const e = card.effect;
    if (e.popularity) target.popularity = Math.max(0, Math.min(10, target.popularity + e.popularity));
    if (e.fund) target.fund = Math.max(0, target.fund + e.fund);
    if (e.corruption) addCorruption(target, e.corruption);
    if (e.selfPopularity) player.popularity = Math.max(0, Math.min(10, player.popularity + e.selfPopularity));
    if (e.selfFund) player.fund += e.selfFund;
    if (e.selfVotes) player.votes += e.selfVotes;
    if (e.selfCorruption) addCorruption(player, e.selfCorruption);
    if (e.stealVotes) {
        const amt = Math.min(target.votes, e.stealVotes);
        target.votes -= amt;
        player.votes += amt;
    }
    if (e.stealFund) {
        const amt = Math.min(target.fund, e.stealFund);
        target.fund -= amt;
        player.fund += amt;
    }
    if (e.actionsLost) {
        state.players.forEach(p => { if (p.id !== player.id) p.actionsLeft = Math.max(0, p.actionsLeft - e.actionsLost); });
    }
    if (e.halveVotes) {
        state.players.forEach(p => { if (p.id !== player.id) p.votes = Math.floor(p.votes / 2); });
    }
    if (e.clearMinistries) {
        Object.keys(state.ministryOwners).forEach(k => state.ministryOwners[k] = null);
        state.players.forEach(p => p.ministries = []);
    }
    addLog(`${card.icon} ${player.name} "${card.name}" খেলেছেন${target && target.id !== player.id ? ' → ' + target.name : ''}।`);
    checkScandal(player);
    if (target && target.id !== player.id) checkScandal(target);
}

// --- Ministry chooser ---
function showMinistryChooser(player) {
    const html = MINISTRIES.map(m => {
        const ownerId = state.ministryOwners[m.id];
        const owner = ownerId !== null ? state.players[ownerId] : null;
        const cost = m.cost;
        const canAfford = player.fund >= cost;
        const isOwn = ownerId === player.id;
        return `
            <div class="ministry-card ${isOwn ? 'mine' : ''} ${owner && owner.id !== player.id ? 'theirs' : ''}">
                <div class="ministry-icon">${m.icon}</div>
                <h4>${m.name}</h4>
                <p class="ministry-bonus">${m.bonus}</p>
                <div class="ministry-status">
                    ${owner ? `নিয়ন্ত্রক: <strong>${owner.name}</strong>` : '<em>খালি</em>'}
                </div>
                ${isOwn ? '<p class="dim">আপনার দখলে</p>' :
                  `<button class="btn ${canAfford ? 'btn-primary' : 'btn-disabled'} btn-small"
                       data-ministry="${m.id}" ${canAfford ? '' : 'disabled'}>
                       ${owner ? 'দখল নিন' : 'নিন'} - ${toBn(cost)} 💰
                   </button>`}
            </div>
        `;
    }).join('');

    showModal('🏛️ মন্ত্রণালয়', `<div class="ministry-grid">${html}</div>`,
        [{label:'বাতিল', cls:'btn-secondary', cb:closeModal}]);

    $('#modal-content').querySelectorAll('[data-ministry]').forEach(btn => {
        btn.addEventListener('click', () => {
            const mid = btn.dataset.ministry;
            const m = MINISTRIES.find(x => x.id === mid);
            if (player.fund < m.cost) { toast('পর্যাপ্ত ফান্ড নেই!'); return; }
            const oldOwnerId = state.ministryOwners[mid];
            if (oldOwnerId !== null) {
                state.players[oldOwnerId].ministries = state.players[oldOwnerId].ministries.filter(x => x !== mid);
                addLog(`⚔️ ${state.players[oldOwnerId].name} ${m.name} মন্ত্রণালয় হারিয়েছেন!`);
            }
            player.fund -= m.cost;
            state.ministryOwners[mid] = player.id;
            player.ministries.push(mid);
            addLog(`🏛️ ${player.name} ${m.icon} ${m.name} মন্ত্রণালয় দখল করেছেন!`);
            closeModal();
            checkInstantWin(player);
            consumeAction(player);
        });
    });
}

// --- Negotiation ---
function showNegotiationOptions(player) {
    const opps = state.players.filter(p => p.id !== player.id);
    const html = opps.map(p => `
        <button class="option-btn" data-opp="${p.id}">
            <h4>${p.name}</h4>
            <p>${getCharacter(p).icon} ${getCharacter(p).name} | 🗳️ ${toBn(p.votes)} | ⭐ ${toBn(p.popularity)}</p>
        </button>
    `).join('');
    showModal('🤝 কার সাথে আলোচনা?', `<div class="option-list">${html}</div>`,
        [{label:'বাতিল', cls:'btn-secondary', cb:closeModal}]);
    $('#modal-content').querySelectorAll('[data-opp]').forEach(btn => {
        btn.addEventListener('click', () => {
            const oppId = parseInt(btn.dataset.opp);
            negotiate(player, state.players[oppId]);
        });
    });
}

function negotiate(player, opp) {
    const html = `
        <div class="chat-window">
            <div class="chat-header">${opp.name}-এর সাথে আলোচনা</div>
            <div class="chat-bubbles">
                <div class="bubble theirs">আমাকে কী প্রস্তাব দিচ্ছেন?</div>
            </div>
            <div class="chat-options">
                <button class="chat-opt" data-prop="alliance">🤝 জোট প্রস্তাব করি</button>
                <button class="chat-opt" data-prop="bribe">💰 ২০০ টাকা দেব, পরের ভোটে সমর্থন</button>
                <button class="chat-opt" data-prop="threat">😤 আমার বিরুদ্ধে গেলে পস্তাবেন!</button>
                <button class="chat-opt" data-prop="break">💔 জোট ভাঙছি!</button>
            </div>
        </div>
    `;
    showModal('💬 আলোচনা', html, [{label:'বন্ধ', cls:'btn-secondary', cb:closeModal}]);

    $('#modal-content').querySelectorAll('[data-prop]').forEach(btn => {
        btn.addEventListener('click', () => {
            const prop = btn.dataset.prop;
            handleNegotiationProp(player, opp, prop);
            closeModal();
            consumeAction(player);
        });
    });
}

function handleNegotiationProp(player, opp, prop) {
    switch (prop) {
        case 'alliance': {
            const accept = Math.random() < 0.6 + (player.popularity - opp.popularity) * 0.05;
            if (accept) {
                addAlliance(player.id, opp.id);
                addLog(`🤝 ${player.name} ↔️ ${opp.name} জোট গঠিত!`);
                toast(`${opp.name} জোট গ্রহণ করেছেন!`);
            } else {
                addLog(`❌ ${opp.name} জোট প্রস্তাব ফিরিয়ে দিয়েছেন।`);
                toast(`${opp.name} জোট প্রস্তাব ফিরিয়ে দিয়েছেন।`);
            }
            break;
        }
        case 'bribe': {
            if (player.fund < 200) { toast('পর্যাপ্ত ফান্ড নেই!'); return; }
            player.fund -= 200;
            opp.fund += 200;
            addAlliance(player.id, opp.id);
            addLog(`💰 ${player.name} ${opp.name}-কে ২০০ ফান্ড দিয়ে জোট করেছেন।`);
            break;
        }
        case 'threat':
            opp.popularity = Math.max(0, opp.popularity - 1);
            player.popularity = Math.max(0, player.popularity - 1);
            addLog(`😤 ${player.name} ও ${opp.name} উভয়ের জনপ্রিয়তা কমেছে।`);
            break;
        case 'break':
            removeAlliance(player.id, opp.id);
            addLog(`💔 ${player.name} ${opp.name}-এর সাথে জোট ভেঙেছেন।`);
            opp.popularity = Math.max(0, opp.popularity);
            break;
    }
}

function addAlliance(a, b) {
    if (state.alliances.find(x => (x.a===a && x.b===b) || (x.a===b && x.b===a))) return;
    state.alliances.push({ a, b, trust: 80 });
}
function removeAlliance(a, b) {
    state.alliances = state.alliances.filter(x => !((x.a===a && x.b===b) || (x.a===b && x.b===a)));
}
function isAllied(a, b) {
    return state.alliances.some(x => (x.a===a && x.b===b) || (x.a===b && x.b===a));
}

// ============== CPU AI ==============
function cpuTakeAction(player) {
    if (player.actionsLeft <= 0) { advanceToNextPlayer(); return; }
    const choices = [];
    if (player.fund < 300) choices.push('fund');
    if (player.fund > 200) choices.push('campaign');
    if (player.hand.length > 0 && player.fund > 150) choices.push('card');
    if (player.fund > 400 && player.ministries.length < 2) choices.push('ministry');
    if (state.alliances.filter(a => a.a === player.id || a.b === player.id).length === 0 && state.players.length > 2) choices.push('negotiate');
    choices.push('pass');

    const choice = randOf(choices);
    cpuExecute(player, choice);
}

function cpuExecute(player, choice) {
    switch (choice) {
        case 'fund': {
            const opt = randOf(['govt','business','public','govt']);
            applyFundOption(player, opt);
            break;
        }
        case 'campaign': {
            if (player.fund >= 500) { player.fund -= 500; player.votes += 5; player.popularity = Math.min(10, player.popularity + 1); addLog(`🗳️ ${player.name} মিডিয়া বিজ্ঞাপন +৫ ভোট।`); }
            else if (player.fund >= 300) { player.fund -= 300; player.votes += 3; addLog(`🗳️ ${player.name} জনসমাবেশ +৩ ভোট।`); }
            else if (player.fund >= 100) { player.fund -= 100; player.votes += 1; addLog(`🗳️ ${player.name} দ্বার-দ্বার +১ ভোট।`); }
            break;
        }
        case 'card': {
            const playable = player.hand.filter(c => player.fund >= c.cost);
            if (playable.length > 0) {
                const card = randOf(playable);
                const idx = player.hand.indexOf(card);
                let target = player;
                if (card.target === 'opponent') {
                    const opps = state.players.filter(p => p.id !== player.id && !isAllied(player.id, p.id));
                    target = opps.length > 0 ? randOf(opps) : randOf(state.players.filter(p => p.id !== player.id));
                }
                applyCardEffect(player, card, target);
                player.fund -= card.cost;
                player.hand.splice(idx, 1);
            }
            break;
        }
        case 'ministry': {
            const avail = MINISTRIES.filter(m => state.ministryOwners[m.id] === null && player.fund >= m.cost);
            if (avail.length > 0) {
                const m = randOf(avail);
                player.fund -= m.cost;
                state.ministryOwners[m.id] = player.id;
                player.ministries.push(m.id);
                addLog(`🏛️ ${player.name} ${m.icon} ${m.name} মন্ত্রণালয় দখল করেছেন।`);
                checkInstantWin(player);
            }
            break;
        }
        case 'negotiate': {
            const opps = state.players.filter(p => p.id !== player.id && !isAllied(player.id, p.id));
            if (opps.length > 0) {
                const opp = randOf(opps);
                if (Math.random() < 0.7) {
                    addAlliance(player.id, opp.id);
                    addLog(`🤝 ${player.name} ${opp.name}-এর সাথে জোট করেছেন।`);
                }
            }
            break;
        }
        case 'pass':
            addLog(`⏭️ ${player.name} এই অ্যাকশন পাস করেছেন।`);
            break;
    }
    player.actionsLeft--;
    setTimeout(() => {
        if (state.gameOver) return;
        if (player.actionsLeft > 0) runPhase();
        else advanceToNextPlayer();
    }, 600);
}

// ============== NEGOTIATION PHASE (open) ==============
function phaseNegotiation() {
    const area = $('#game-area');
    let timeLeft = 8;
    area.innerHTML = `
        <div class="negotiation-screen">
            <h3>🗣️ উন্মুক্ত আলোচনার সময়</h3>
            <p>সবাই মুক্তভাবে আলোচনা করতে পারেন। CPU-রা নিজেদের মধ্যে কৌশল আলোচনা করছে...</p>
            <div class="timer-display" id="neg-timer">⏱️ ${toBn(timeLeft)} সেকেন্ড</div>
            <div class="cpu-chats" id="cpu-chats"></div>
            <button class="btn btn-secondary" id="skip-neg">⏭️ স্কিপ করুন</button>
        </div>
    `;

    // Generate fake CPU chats
    const chats = generateCpuChats();
    const chatBox = $('#cpu-chats');
    let chatIdx = 0;
    const showNext = () => {
        if (chatIdx < chats.length) {
            const div = document.createElement('div');
            div.className = 'cpu-chat-msg';
            div.innerHTML = chats[chatIdx];
            chatBox.appendChild(div);
            chatIdx++;
        }
    };
    showNext();
    const chatTimer = setInterval(showNext, 1500);

    const timerEl = $('#neg-timer');
    const interval = setInterval(() => {
        timeLeft--;
        if (timerEl) timerEl.textContent = `⏱️ ${toBn(timeLeft)} সেকেন্ড`;
        if (timeLeft <= 0) {
            clearInterval(interval);
            clearInterval(chatTimer);
            nextPhase();
        }
    }, 1000);

    $('#skip-neg').addEventListener('click', () => {
        clearInterval(interval);
        clearInterval(chatTimer);
        // Apply random alliances among CPUs
        applyCpuAlliances();
        nextPhase();
    });
}

function generateCpuChats() {
    const cpus = state.players.filter(p => !p.isHuman);
    if (cpus.length < 2) return [`<em>আলোচনার জন্য পর্যাপ্ত খেলোয়াড় নেই।</em>`];
    const out = [];
    for (let i = 0; i < 4; i++) {
        const a = randOf(cpus);
        const b = randOf(cpus.filter(c => c.id !== a.id));
        if (!b) continue;
        const lines = [
            `<strong>${a.name}</strong> → <strong>${b.name}</strong>: "চলো ${randOf(state.players.filter(p=>p.id!==a.id&&p.id!==b.id))?.name || 'ওনার'}-এর বিরুদ্ধে জোট করি।"`,
            `<strong>${a.name}</strong>: "${b.name}-কে আমি বিশ্বাস করি না।"`,
            `<strong>${a.name}</strong> → সবাই: "আমার সাথে যে আছেন, তিনি জিতবেন!"`,
            `<strong>${a.name}</strong>: "${randOf(state.players).name}-এর কাছে অনেক ফান্ড আছে, সাবধান!"`,
        ];
        out.push(randOf(lines));
    }
    return out;
}

function applyCpuAlliances() {
    const cpus = state.players.filter(p => !p.isHuman);
    if (cpus.length >= 2 && Math.random() < 0.4) {
        const a = randOf(cpus);
        const b = randOf(cpus.filter(c => c.id !== a.id));
        if (b) addAlliance(a.id, b.id);
    }
}

// ============== VOTING PHASE ==============
function phaseVoting() {
    // Pick random target (not human always — random)
    const target = randOf(state.players);
    const propGen = randOf(VOTE_PROPOSALS);
    const proposal = propGen(target);
    state.voteState = { proposal, votes: {}, needHuman: true };

    const area = $('#game-area');
    area.innerHTML = `
        <div class="voting-screen">
            <h3>🗳️ ভোটিং সময়</h3>
            <div class="proposal-card">
                <h4>প্রস্তাব:</h4>
                <p class="proposal-text">"${proposal.text}"</p>
            </div>
            <div class="vote-buttons">
                <button class="vote-btn yes" data-vote="yes">👍 হ্যাঁ</button>
                <button class="vote-btn no" data-vote="no">👎 না</button>
                <button class="vote-btn abstain" data-vote="abstain">🤐 বিরত</button>
            </div>
        </div>
    `;
    area.querySelectorAll('[data-vote]').forEach(btn => {
        btn.addEventListener('click', () => castHumanVote(btn.dataset.vote));
    });
}

function castHumanVote(vote) {
    state.voteState.votes[0] = vote;
    // CPU votes
    state.players.slice(1).forEach(p => {
        if (p.suspended > 0) { state.voteState.votes[p.id] = 'abstain'; return; }
        const isAlliedWithTarget = isAllied(p.id, state.voteState.proposal.target);
        const targetIsHuman = state.voteState.proposal.target === 0;
        let v;
        if (isAlliedWithTarget) v = 'no';
        else if (targetIsHuman && Math.random() < 0.5) v = 'yes';
        else v = randOf(['yes','no','no','abstain']);
        state.voteState.votes[p.id] = v;
    });
    showVoteResults();
}

function showVoteResults() {
    const votes = state.voteState.votes;
    const yes = Object.values(votes).filter(v => v === 'yes').length;
    const no = Object.values(votes).filter(v => v === 'no').length;
    const abstain = Object.values(votes).filter(v => v === 'abstain').length;
    const passed = yes > no;

    if (passed) applyVoteResult(state.voteState.proposal);

    const area = $('#game-area');
    const breakdown = state.players.map(p => {
        const v = votes[p.id];
        const icon = v === 'yes' ? '👍' : v === 'no' ? '👎' : '🤐';
        return `<div class="vote-row">${icon} ${p.name}</div>`;
    }).join('');

    area.innerHTML = `
        <div class="vote-results">
            <h3>📊 ভোটের ফলাফল</h3>
            <p class="proposal-recall">"${state.voteState.proposal.text}"</p>
            <div class="vote-counts">
                <div>👍 হ্যাঁ: <strong>${toBn(yes)}</strong></div>
                <div>👎 না: <strong>${toBn(no)}</strong></div>
                <div>🤐 বিরত: <strong>${toBn(abstain)}</strong></div>
            </div>
            <div class="vote-breakdown">${breakdown}</div>
            <div class="result-banner ${passed ? 'pass' : 'fail'}">
                ${passed ? '✅ প্রস্তাব পাস হয়েছে!' : '❌ প্রস্তাব ব্যর্থ।'}
            </div>
            <button class="btn btn-primary btn-large" id="vote-continue">পরবর্তী →</button>
        </div>
    `;
    $('#vote-continue').addEventListener('click', () => nextPhase());
}

function applyVoteResult(prop) {
    const target = state.players[prop.target];
    switch (prop.type) {
        case 'remove_ministry':
            if (state.ministryOwners[prop.ministry] === target.id) {
                state.ministryOwners[prop.ministry] = null;
                target.ministries = target.ministries.filter(x => x !== prop.ministry);
                addLog(`⚒️ ${target.name} ${MINISTRIES.find(m => m.id === prop.ministry).name} মন্ত্রণালয় হারিয়েছেন (ভোটে)।`);
            }
            break;
        case 'no_confidence':
            target.popularity = Math.max(0, target.popularity - 3);
            target.votes = Math.max(0, target.votes - 5);
            addLog(`📉 ${target.name} অনাস্থা ভোটে হেরেছেন।`);
            break;
        case 'grant_fund':
            target.fund += prop.amount;
            addLog(`💵 ${target.name} ${toBn(prop.amount)} ফান্ড পেয়েছেন (ভোটে)।`);
            break;
        case 'corruption_warn':
            addCorruption(target, 1);
            addLog(`🚨 ${target.name} দুর্নীতির সতর্কতা পেয়েছেন।`);
            break;
    }
}

// ============== END ROUND PHASE ==============
function phaseEndRound() {
    const sorted = [...state.players].sort((a, b) => b.votes - a.votes || b.popularity - a.popularity);
    const area = $('#game-area');
    area.innerHTML = `
        <div class="endround-screen">
            <h3>📋 রাউন্ড ${toBn(state.round)} সমাপ্ত</h3>
            <div class="leaderboard">
                ${sorted.map((p, i) => {
                    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '  ';
                    return `
                        <div class="lb-row">
                            <span class="lb-medal">${medal}</span>
                            <span class="lb-name">${getCharacter(p).icon} ${p.name}</span>
                            <span class="lb-stats">💰 ${toBn(p.fund)} | 🗳️ ${toBn(p.votes)} | ⭐ ${toBn(p.popularity)}</span>
                        </div>
                    `;
                }).join('')}
            </div>
            <button class="btn btn-primary btn-large" id="endround-continue">পরবর্তী →</button>
        </div>
    `;
    // Draw a card for each player at end of round
    state.players.forEach(p => {
        if (p.hand.length < 7) p.hand.push(drawRandomCard(false));
    });
    // Check win
    if (checkAllWinConditions()) return;
    $('#endround-continue').addEventListener('click', () => nextPhase());
}

// ============== WIN CONDITIONS ==============
function checkInstantWin(player) {
    if (player.ministries.length >= state.config.winMinistries) {
        endGame(player.id, 'সব মন্ত্রণালয় দখল!');
        return true;
    }
    if (player.votes >= state.config.winVotes) {
        endGame(player.id, `${toBn(state.config.winVotes)} ভোট পয়েন্ট অর্জন!`);
        return true;
    }
    return false;
}

function checkAllWinConditions() {
    for (const p of state.players) {
        if (checkInstantWin(p)) return true;
    }
    return false;
}

// ============== SCANDAL ==============
function addCorruption(p, n) {
    if (getCharacter(p)?.id === 'judge') {
        p.corruption = Math.min(3, p.corruption + n);
    } else {
        p.corruption += n;
    }
    if (p.corruption >= state.config.corruptionMax) {
        triggerScandal(p);
    }
}
function checkScandal(p) {
    if (p.corruption >= state.config.corruptionMax) triggerScandal(p);
}
function triggerScandal(p) {
    if (p.scandalTriggered) return;
    p.scandalTriggered = true;
    const roll = Math.floor(Math.random() * 6) + 1 + (getCharacter(p).id === 'judge' ? 2 : 0);
    p.popularity = Math.max(0, p.popularity - 5);
    let msg = `💥 ${p.name} বড় স্ক্যান্ডালে! জনপ্রিয়তা -৫`;
    if (roll <= 2) {
        // bhokshikar -- expulsion only in hardcore
        if (state.mode === 'hardcore') {
            p.suspended = 999;
            msg += ', বহিষ্কৃত! ❌';
        } else {
            p.fund = Math.floor(p.fund / 2);
            msg += `, ফান্ড অর্ধেক`;
        }
    } else if (roll <= 4) {
        p.fund = Math.floor(p.fund * 0.7);
        msg += ', ৩০% ফান্ড জরিমানা';
    } else {
        p.suspended = 1;
        msg += ', ১ টার্ন সাসপেন্ড';
    }
    p.corruption = 0;
    addLog(msg);
    toast(msg);
}

// ============== END GAME ==============
function endGame(winnerId = null, reason = 'সব টার্ম শেষ') {
    state.gameOver = true;
    if (winnerId === null) {
        const sorted = [...state.players].sort((a,b) => 
            (b.votes + b.popularity * 2 + b.ministries.length * 5) -
            (a.votes + a.popularity * 2 + a.ministries.length * 5)
        );
        winnerId = sorted[0].id;
    }
    state.winnerId = winnerId;
    saveGameToHistory(winnerId, reason);
    renderEndScreen(reason);
    showScreen('end');
}

function renderEndScreen(reason) {
    const winner = state.players[state.winnerId];
    $('#end-winner').innerHTML = `
        <div class="winner-icon">${getCharacter(winner).icon}</div>
        <h1 class="winner-name">${winner.name}</h1>
        <p class="winner-title">${getCharacter(winner).name} বিজয়ী!</p>
        <p class="winner-reason">${reason}</p>
    `;

    const sorted = [...state.players].sort((a,b) =>
        (b.votes + b.popularity * 2 + b.ministries.length * 5) -
        (a.votes + a.popularity * 2 + a.ministries.length * 5)
    );

    $('#end-podium').innerHTML = sorted.slice(0, 3).map((p, i) => {
        const medal = ['🥇','🥈','🥉'][i];
        return `
            <div class="podium-step podium-${i+1}">
                <div class="podium-medal">${medal}</div>
                <div class="podium-icon">${getCharacter(p).icon}</div>
                <div class="podium-name">${p.name}</div>
                <div class="podium-score">${toBn(p.votes + p.popularity * 2 + p.ministries.length * 5)}</div>
            </div>
        `;
    }).join('');

    $('#end-stats').innerHTML = `
        <h3>সম্পূর্ণ পরিসংখ্যান</h3>
        <table class="stats-table">
            <thead>
                <tr><th>খেলোয়াড়</th><th>চরিত্র</th><th>💰</th><th>🗳️</th><th>⭐</th><th>🏛️</th></tr>
            </thead>
            <tbody>
                ${sorted.map(p => `
                    <tr>
                        <td>${p.name}${p.id === state.winnerId ? ' 👑' : ''}</td>
                        <td>${getCharacter(p).icon} ${getCharacter(p).name}</td>
                        <td>${toBn(p.fund)}</td>
                        <td>${toBn(p.votes)}</td>
                        <td>${toBn(p.popularity)}</td>
                        <td>${toBn(p.ministries.length)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function saveGameToHistory(winnerId, reason) {
    let history = [];
    try { history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}
    history.unshift({
        date: new Date().toISOString(),
        mode: state.mode,
        winner: state.players[winnerId].name,
        winnerChar: getCharacter(state.players[winnerId]).name,
        reason,
        scores: state.players.map(p => ({
            name: p.name, character: getCharacter(p).name,
            score: p.votes + p.popularity * 2 + p.ministries.length * 5,
            fund: p.fund, votes: p.votes, popularity: p.popularity,
            ministries: p.ministries.length
        }))
    });
    history = history.slice(0, 20);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(history)); } catch (e) {}
}

function refreshLeaderboard() {
    let history = [];
    try { history = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) {}
    const list = $('#leaderboard-list');
    if (history.length === 0) {
        list.innerHTML = '<p class="empty-state">এখনও কোনো খেলা সম্পন্ন হয়নি। প্রথম খেলা খেলুন!</p>';
        return;
    }
    list.innerHTML = history.map((h, i) => `
        <div class="lb-card">
            <div class="lb-card-header">
                <span class="lb-rank">${toBn(i+1)}</span>
                <span class="lb-winner">👑 ${h.winner}</span>
                <span class="lb-mode">${h.mode}</span>
            </div>
            <div class="lb-card-body">
                <p>${h.winnerChar} • ${h.reason}</p>
                <p class="lb-date dim">${new Date(h.date).toLocaleString('bn-BD')}</p>
            </div>
        </div>
    `).join('');
}

// ============== UI HELPERS ==============
function renderStatusBar() {
    if (!state) return;
    $('#status-term').textContent = toBn(state.term);
    $('#status-term-max').textContent = toBn(state.config.termMax);
    $('#status-round').textContent = toBn(state.round);
    $('#status-round-max').textContent = toBn(state.config.roundMax);
    const phaseNames = {event:'ইভেন্ট', action:'অ্যাকশন', negotiation:'আলোচনা', voting:'ভোটিং', endround:'রাউন্ড শেষ'};
    $('#status-phase').textContent = phaseNames[state.phase];
    const cur = state.players[state.currentPlayerIdx];
    $('#status-current-player').textContent = state.phase === 'action' && cur ? cur.name : '—';
}

function renderPlayerStrip() {
    if (!state) return;
    const strip = $('#player-strip');
    strip.innerHTML = state.players.map((p, i) => {
        const c = getCharacter(p);
        const isCur = state.phase === 'action' && i === state.currentPlayerIdx;
        return `
            <div class="player-card ${p.isHuman ? 'human' : ''} ${isCur ? 'current' : ''} ${p.suspended > 0 ? 'suspended' : ''}">
                <div class="pc-top">
                    <span class="pc-icon">${c.icon}</span>
                    <span class="pc-name">${p.name}${p.isHuman ? ' (আপনি)' : ''}</span>
                </div>
                <div class="pc-stats">
                    <span title="ফান্ড">💰${toBn(p.fund)}</span>
                    <span title="ভোট">🗳️${toBn(p.votes)}</span>
                    <span title="জনপ্রিয়তা">⭐${toBn(p.popularity)}</span>
                </div>
                <div class="pc-meta">
                    <span title="দুর্নীতি">⚠️${toBn(p.corruption)}</span>
                    <span title="মন্ত্রণালয়">🏛️${toBn(p.ministries.length)}</span>
                    <span title="হাত">🃏${toBn(p.hand.length)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getCharacter(p) {
    return CHARACTERS.find(c => c.id === p.character) || CHARACTERS[0];
}

// ============== MODAL ==============
function showModal(title, contentHTML, actions = []) {
    const overlay = $('#modal-overlay');
    $('#modal-content').innerHTML = `<h3 class="modal-title">${title}</h3>${contentHTML}`;
    const actionsEl = $('#modal-actions');
    actionsEl.innerHTML = '';
    actions.forEach(a => {
        const btn = document.createElement('button');
        btn.className = `btn ${a.cls || 'btn-secondary'}`;
        btn.textContent = a.label;
        btn.addEventListener('click', a.cb);
        actionsEl.appendChild(btn);
    });
    overlay.classList.add('show');
}
function closeModal() {
    $('#modal-overlay').classList.remove('show');
}

// ============== SHEET (bottom) ==============
function openSheet(tab) {
    if (!state) return;
    const titles = { hand: '🃏 আপনার কার্ড', ministry: '🏛️ মন্ত্রণালয় মানচিত্র', alliance: '🤝 জোট', log: '📜 গেম লগ', menu: '⚙️ মেনু' };
    $('#sheet-title').textContent = titles[tab] || tab;
    const body = $('#sheet-body');

    if (tab === 'hand') {
        const human = state.players[0];
        body.innerHTML = human.hand.length === 0 ? '<p class="empty-state">কোনো কার্ড নেই।</p>' :
            `<div class="card-grid">${human.hand.map(c => `
                <div class="hand-card">
                    <div class="card-icon">${c.icon}</div>
                    <h4>${c.name}</h4>
                    <p>${c.desc}</p>
                    <div class="card-meta">
                        <span>💵 ${toBn(c.cost)}</span>
                        <span class="card-type ${c.type}">${c.type === 'power' ? 'পাওয়ার' : 'ষড়যন্ত্র'}</span>
                    </div>
                </div>
            `).join('')}</div>`;
    } else if (tab === 'ministry') {
        body.innerHTML = `<div class="ministry-grid">${MINISTRIES.map(m => {
            const ownerId = state.ministryOwners[m.id];
            const owner = ownerId !== null ? state.players[ownerId] : null;
            return `
                <div class="ministry-card ${owner ? 'occupied' : ''}">
                    <div class="ministry-icon">${m.icon}</div>
                    <h4>${m.name}</h4>
                    <p class="ministry-bonus">${m.bonus}</p>
                    <div class="ministry-status">${owner ? `নিয়ন্ত্রক: <strong>${owner.name}</strong>` : '<em>খালি</em>'}</div>
                </div>
            `;
        }).join('')}</div>`;
    } else if (tab === 'alliance') {
        if (state.alliances.length === 0) {
            body.innerHTML = '<p class="empty-state">কোনো জোট নেই।</p>';
        } else {
            body.innerHTML = '<div class="alliance-list">' + state.alliances.map(al => `
                <div class="alliance-row">
                    <strong>${state.players[al.a].name}</strong> ↔️ <strong>${state.players[al.b].name}</strong>
                    <div class="trust-bar"><div class="trust-fill" style="width:${al.trust}%"></div></div>
                    <span class="dim">বিশ্বাস: ${toBn(al.trust)}%</span>
                </div>
            `).join('') + '</div>';
        }
    } else if (tab === 'log') {
        body.innerHTML = state.log.length === 0 ? '<p class="empty-state">এখনও কিছু ঘটেনি।</p>' :
            '<ul class="log-list">' + state.log.slice(-30).reverse().map(l => `<li>${l}</li>`).join('') + '</ul>';
    } else if (tab === 'menu') {
        body.innerHTML = `
            <div class="menu-list">
                <button class="btn btn-secondary" id="menu-restart">🔄 খেলা পুনরায় শুরু</button>
                <button class="btn btn-secondary" id="menu-quit">🚪 মূল মেনুতে ফিরুন</button>
            </div>
        `;
        $('#menu-restart').addEventListener('click', () => { closeSheet(); showScreen('setup'); });
        $('#menu-quit').addEventListener('click', () => { closeSheet(); showScreen('splash'); });
    }

    $('#sheet-overlay').classList.add('show');
}
function closeSheet() {
    $('#sheet-overlay').classList.remove('show');
}

// ============== TOAST ==============
function toast(msg) {
    const c = $('#toast-container');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    c.appendChild(el);
    setTimeout(() => el.classList.add('show'), 10);
    setTimeout(() => {
        el.classList.remove('show');
        setTimeout(() => el.remove(), 300);
    }, 3000);
}

// ============== LOG ==============
function addLog(msg) {
    if (!state) return;
    state.log.push(msg);
}
