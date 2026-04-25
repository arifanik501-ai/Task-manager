// ====================================================================
// ষড়যন্ত্র - Game Data
// Characters, cards (conspiracy/event/power), ministries, names
// ====================================================================

const BN_DIGITS = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
function toBn(n) {
    return String(n).split('').map(c => /\d/.test(c) ? BN_DIGITS[+c] : c).join('');
}

const DEFAULT_NAMES = [
    'রহিম','করিম','জামাল','সালমা','রূপা','মাহফুজ','তানিয়া','নাবিল','রিনা','ফয়সাল'
];

// ============== CHARACTERS ==============
const CHARACTERS = [
    {
        id: 'leader',
        name: 'নেতা',
        icon: '👔',
        quote: 'যার ক্ষমতা, তার দায়ও বেশি',
        ability: 'প্রতি টার্নে একবার অন্যের ভোট বাতিল করতে পারবেন। শুরুতে ১টি অতিরিক্ত পাওয়ার কার্ড।',
        weakness: 'সবার প্রধান টার্গেট। দুর্নীতি অভিযোগ ডাবল ড্যামেজ।',
        secret: '৫০ ভোট পয়েন্ট সংগ্রহ করুন অথবা ৩টি মন্ত্রণালয় দখল করুন।',
        startFund: 500,
        startCards: 5,
        bonusPower: 1
    },
    {
        id: 'businessman',
        name: 'ব্যবসায়ী',
        icon: '💼',
        quote: 'টাকাই আসল ক্ষমতা',
        ability: 'প্রতি টার্নে +১৫০ ফান্ড বোনাস। মন্ত্রণালয় দখলে ৫০% ছাড়।',
        weakness: 'জনপ্রিয়তা ধীরে বাড়ে।',
        secret: '২০০০ ফান্ড জমান অথবা ৪টি মন্ত্রণালয় দখল করুন।',
        startFund: 800,
        startCards: 4,
        bonusPower: 0
    },
    {
        id: 'journalist',
        name: 'সাংবাদিক',
        icon: '📰',
        quote: 'কলম তলোয়ারের চেয়ে শক্তিশালী',
        ability: 'প্রতি টার্নে একবার যেকোনো খেলোয়াড়ের হাতের ১টি কার্ড দেখতে পারবেন। গুজব কার্ড ডাবল প্রভাব।',
        weakness: 'স্বল্প ফান্ড দিয়ে শুরু।',
        secret: 'ক্রমাগত ৩ টার্ম সবচেয়ে বেশি জনপ্রিয়তা ধরে রাখুন।',
        startFund: 350,
        startCards: 6,
        bonusPower: 0
    },
    {
        id: 'general',
        name: 'জেনারেল',
        icon: '🎖️',
        quote: 'শৃঙ্খলাই শক্তি',
        ability: 'প্রতি টার্নে একবার অন্য খেলোয়াড়ের ১টি অ্যাকশন ব্লক করতে পারবেন।',
        weakness: 'কার্ড ব্যবহারে অতিরিক্ত ১০০ খরচ।',
        secret: 'হার্ডকোর মোডে Coup-এর মাধ্যমে ক্ষমতা দখল।',
        startFund: 600,
        startCards: 4,
        bonusPower: 1
    },
    {
        id: 'judge',
        name: 'বিচারক',
        icon: '⚖️',
        quote: 'ন্যায়বিচারই শেষ কথা',
        ability: 'দুর্নীতি মার্কার সর্বোচ্চ ৩-এ স্থির। স্ক্যান্ডাল ডাইস রোলে +২ বোনাস।',
        weakness: 'জোট গঠনে ১ টার্ন বিলম্ব।',
        secret: 'অন্তত ২ জন প্রতিদ্বন্দ্বীকে স্ক্যান্ডালে ফেলান।',
        startFund: 450,
        startCards: 5,
        bonusPower: 0
    }
];

// ============== MINISTRIES ==============
const MINISTRIES = [
    {
        id: 'finance', name: 'অর্থ', icon: '💰', cost: 400,
        bonus: 'প্রতি টার্নে +১৫০ ফান্ড',
        bonusFn: (player) => { player.fund += 150; }
    },
    {
        id: 'info', name: 'তথ্য', icon: '📱', cost: 300,
        bonus: 'প্রতি টার্নে +১ জনপ্রিয়তা',
        bonusFn: (player) => { player.popularity = Math.min(10, player.popularity + 1); }
    },
    {
        id: 'home', name: 'স্বরাষ্ট্র', icon: '🚔', cost: 600,
        bonus: 'প্রতি টার্নে +১ ভোট পয়েন্ট',
        bonusFn: (player) => { player.votes += 1; }
    },
    {
        id: 'foreign', name: 'পররাষ্ট্র', icon: '🌍', cost: 500,
        bonus: 'প্রতি টার্নে +১০০ ফান্ড + ১ কার্ড',
        bonusFn: (player) => { player.fund += 100; }
    },
    {
        id: 'education', name: 'শিক্ষা', icon: '📚', cost: 350,
        bonus: 'প্রতি টার্নে +২ জনপ্রিয়তা',
        bonusFn: (player) => { player.popularity = Math.min(10, player.popularity + 2); }
    },
    {
        id: 'health', name: 'স্বাস্থ্য', icon: '🏥', cost: 400,
        bonus: 'প্রতি টার্নে +১ জনপ্রিয়তা ও -১ দুর্নীতি মার্কার',
        bonusFn: (player) => {
            player.popularity = Math.min(10, player.popularity + 1);
            player.corruption = Math.max(0, player.corruption - 1);
        }
    }
];

// ============== CONSPIRACY CARDS (playable) ==============
const CONSPIRACY_CARDS = [
    {
        id: 'rumor', name: 'গুজব ছড়াও', icon: '🗣️',
        desc: 'একটি ভুয়া খবর ছড়িয়ে প্রতিপক্ষের ভাবমূর্তি নষ্ট করুন',
        cost: 100, target: 'opponent', type: 'conspiracy',
        effect: { popularity: -2 }
    },
    {
        id: 'defection', name: 'দলবদল', icon: '🔄',
        desc: 'একজন খেলোয়াড়কে টাকা দিয়ে তার ভোট কিনুন',
        cost: 300, target: 'opponent', type: 'conspiracy',
        effect: { stealVotes: 2, selfCorruption: 1 }
    },
    {
        id: 'strike', name: 'হরতাল ডাকুন', icon: '🚫',
        desc: 'সব কাজ থেমে যায়! সবাই ১ অ্যাকশন হারায়।',
        cost: 500, target: 'all', type: 'conspiracy',
        effect: { actionsLost: 1, selfPopularity: -3 }
    },
    {
        id: 'talkshow', name: 'টকশো আপিয়ারেন্স', icon: '📺',
        desc: 'জনপ্রিয় টিভি শোতে গিয়ে নিজের ভাবমূর্তি উজ্জ্বল করুন',
        cost: 200, target: 'self', type: 'conspiracy',
        effect: { selfPopularity: 3 }
    },
    {
        id: 'blackmail', name: 'ব্ল্যাকমেইল', icon: '🔒',
        desc: 'গোপন তথ্য ব্যবহার করে ৩০০ ফান্ড আদায় করুন',
        cost: 250, target: 'opponent', type: 'conspiracy',
        effect: { stealFund: 300 }
    },
    {
        id: 'apology', name: 'ক্ষমা প্রার্থনা', icon: '🙏',
        desc: 'জনসমক্ষে ক্ষমা চেয়ে দুর্নীতির দাগ মুছুন',
        cost: 150, target: 'self', type: 'conspiracy',
        effect: { selfCorruption: -2 }
    },
    {
        id: 'donation', name: 'দান গ্রহণ', icon: '💵',
        desc: 'ব্যবসায়ী থেকে বড় অংকের দান নিন',
        cost: 0, target: 'self', type: 'conspiracy',
        effect: { selfFund: 400, selfCorruption: 1 }
    },
    {
        id: 'rally', name: 'গণসমাবেশ', icon: '📣',
        desc: 'বড় আকারের জনসমাবেশ আয়োজন করুন',
        cost: 250, target: 'self', type: 'conspiracy',
        effect: { selfPopularity: 2, selfVotes: 2 }
    },
    {
        id: 'investigate', name: 'গোপন তদন্ত', icon: '🔍',
        desc: 'কাউকে দুর্নীতির অভিযোগে আনুন',
        cost: 200, target: 'opponent', type: 'conspiracy',
        effect: { corruption: 2 }
    },
    {
        id: 'sabotage', name: 'অন্তর্ঘাত', icon: '💣',
        desc: 'প্রতিপক্ষের কর্মকাণ্ডে বাধা সৃষ্টি করুন',
        cost: 350, target: 'opponent', type: 'conspiracy',
        effect: { fund: -300, popularity: -1 }
    }
];

// ============== POWER CARDS (rare) ==============
const POWER_CARDS = [
    {
        id: 'veto', name: 'ভেটো ক্ষমতা', icon: '🛑',
        desc: 'যেকোনো ভোটের ফলাফল উল্টে দিন!',
        cost: 800, target: 'vote', type: 'power',
        effect: { reverseVote: true }
    },
    {
        id: 'dissolve', name: 'সংসদ ভেঙে দাও', icon: '💥',
        desc: 'পুরো সিস্টেম রিসেট! সবার ভোট অর্ধেক, মন্ত্রণালয় খালি।',
        cost: 1000, target: 'all', type: 'power',
        effect: { halveVotes: true, clearMinistries: true, selfPopularity: -5 }
    },
    {
        id: 'media_blitz', name: 'মিডিয়া ব্লিৎজ', icon: '📡',
        desc: 'বিশাল মিডিয়া প্রচারণা — +৫ জনপ্রিয়তা',
        cost: 600, target: 'self', type: 'power',
        effect: { selfPopularity: 5 }
    }
];

const ALL_PLAYABLE_CARDS = [...CONSPIRACY_CARDS, ...POWER_CARDS];

// ============== EVENT CARDS (drawn at event phase) ==============
const EVENT_CARDS = [
    {
        id: 'viral', headline: 'সোশ্যাল মিডিয়ায় ট্রেন্ডিং!',
        body: 'একটি ভাইরাল পোস্ট রাজনীতিতে তোলপাড় সৃষ্টি করেছে।',
        effect: { type: 'lowestPopularityBoost', amount: 2, highestPenalty: -1 }
    },
    {
        id: 'election', headline: 'হঠাৎ নির্বাচন ঘোষণা!',
        body: 'আকস্মিক উপ-নির্বাচন। যার সর্বোচ্চ জনপ্রিয়তা সে +৫ ভোট পয়েন্ট পান।',
        effect: { type: 'electionBonus', winnerVotes: 5, loserPopularity: -2 }
    },
    {
        id: 'corruption_probe', headline: 'দুর্নীতি তদন্ত কমিশন!',
        body: 'যাদের দুর্নীতি মার্কার ২+, তাদের জন্য কঠিন সময়।',
        effect: { type: 'corruptionPenalty' }
    },
    {
        id: 'flood', headline: 'দেশে বড় বন্যা!',
        body: 'সবার সামনে সেবার সুযোগ। ত্রাণ দেওয়া বাধ্যতামূলক বা জনপ্রিয়তা হারান।',
        effect: { type: 'reliefChoice', cost: 200, popReward: 4, popPenalty: -3 }
    },
    {
        id: 'scandal_leak', headline: 'গোপন নথি ফাঁস!',
        body: 'যার সবচেয়ে বেশি ফান্ড, তার দুর্নীতি মার্কার +১।',
        effect: { type: 'richestCorruption' }
    },
    {
        id: 'rally_day', headline: 'জাতীয় সমাবেশ দিবস!',
        body: 'সবাই +১ জনপ্রিয়তা পান।',
        effect: { type: 'allPopularity', amount: 1 }
    },
    {
        id: 'foreign_aid', headline: 'বিদেশি সাহায্য এসেছে!',
        body: 'সবাই +২০০ ফান্ড পান।',
        effect: { type: 'allFund', amount: 200 }
    },
    {
        id: 'media_freedom', headline: 'মিডিয়া স্বাধীনতা সংকট!',
        body: 'তথ্য মন্ত্রণালয় নিয়ন্ত্রকের দুর্নীতি মার্কার +১।',
        effect: { type: 'ministryHolderCorruption', ministryId: 'info' }
    },
    {
        id: 'cabinet_reshuffle', headline: 'মন্ত্রিসভা পুনর্গঠন!',
        body: 'একটি র‍্যান্ডম মন্ত্রণালয় খালি হয়ে গেছে।',
        effect: { type: 'randomMinistryClear' }
    },
    {
        id: 'opposition_unite', headline: 'বিরোধী জোট গঠন!',
        body: 'যার সর্বোচ্চ ভোট পয়েন্ট, তার বিরুদ্ধে সবাই -১ ভোট।',
        effect: { type: 'leaderPenalty' }
    }
];

// ============== VOTE PROPOSALS (random ones) ==============
const VOTE_PROPOSALS = [
    p => ({
        text: `${p.name}-কে ${randMinistry().name} মন্ত্রণালয় থেকে সরিয়ে দেওয়া হবে?`,
        type: 'remove_ministry', target: p.id, ministry: randMinistry().id
    }),
    p => ({
        text: `${p.name}-কে অনাস্থা ভোটে দাঁড় করানো হবে?`,
        type: 'no_confidence', target: p.id
    }),
    p => ({
        text: `${p.name}-কে অতিরিক্ত ৩০০ ফান্ড বরাদ্দ দেওয়া হবে?`,
        type: 'grant_fund', target: p.id, amount: 300
    }),
    p => ({
        text: `${p.name}-কে দুর্নীতির অভিযোগে সতর্কতা দেওয়া হবে?`,
        type: 'corruption_warn', target: p.id
    })
];

function randMinistry() {
    return MINISTRIES[Math.floor(Math.random() * MINISTRIES.length)];
}
function randOf(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
