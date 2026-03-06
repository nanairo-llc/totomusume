class FishingGame {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadGameState();
        this.initializeWeather();
        this.gameState = 'waiting';
    }

    initializeElements() {
        this.fishingLine = document.getElementById('fishing-line');
        this.fishingButton = document.getElementById('fishing-button');
        this.resultPopup = document.getElementById('result-popup');
        this.catchResult = document.getElementById('catch-result');
        this.continueButton = document.getElementById('continue-button');
        this.fishCount = document.getElementById('fish-count');
        this.playerLevel = document.getElementById('player-level');
        this.weatherInfo = document.getElementById('weather-info');

        // ルアー選択モーダル
        this.lurePopup = document.getElementById('lure-popup');
        this.lureOptions = document.getElementById('lure-options');
        this.lureCancelButton = document.getElementById('lure-cancel-button');
    }

    initializeEventListeners() {
        this.fishingButton.addEventListener('click', () => this.startFishing());
        this.continueButton.addEventListener('click', () => this.hideCatchResult());
    }

    initializeWeather() {
        const weathers = ['sunny', 'cloudy', 'rainy'];

        // 天気を日次でlocalStorageに保存（ページ遷移しても当日は同じ天気）
        const today = new Date().toDateString();
        const savedDate = localStorage.getItem('weatherDate');
        const savedWeather = localStorage.getItem('weather');

        if (savedDate === today && savedWeather) {
            this.currentWeather = savedWeather;
        } else {
            this.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
            localStorage.setItem('weather', this.currentWeather);
            localStorage.setItem('weatherDate', today);
        }

        // game-constants.js で定義された定数を使用
        this.weatherInfo.textContent = `${WEATHER_EMOJI[this.currentWeather]} ${TEXT.WEATHER[this.currentWeather.toUpperCase()]}`;
    }

    loadGameState() {
        const savedTotalCatch = localStorage.getItem('totalCatch');
        this.totalCatch = savedTotalCatch ? parseInt(savedTotalCatch) : 0;

        const savedItems = localStorage.getItem('items');
        this.items = savedItems ? JSON.parse(savedItems) : {
            'キラキラミノー（赤）': 0,
            'キラキラミノー（緑）': 0,
            'キラキラミノー（金）': 0,
            'ドリームワーム（赤）': 0,
            'ドリームワーム（緑）': 0,
            'ドリームワーム（金）': 0,
            'ふわとろオキアミ団子': 0
        };

        this.updateStats();
    }

    async startFishing() {
        if (this.gameState !== 'waiting') return;

        // ボタンを先に無効化してからモーダルを表示
        this.fishingButton.disabled = true;
        const lureChoice = await this.showLureDialog();

        if (!lureChoice) {
            // キャンセルされた場合はボタンを戻す
            this.fishingButton.disabled = false;
            return;
        }

        this.currentLure = lureChoice;
        this.gameState = 'fishing';

        const lineLength = 500;
        this.fishingLine.style.height = `${lineLength}px`;

        const catchTime = 3000 + Math.random() * 2000;
        setTimeout(() => {
            this.checkCatch(this.currentLure);
        }, catchTime);
    }

    showLureDialog() {
        return new Promise((resolve) => {
            const lures = [
                { name: TEXT.FISHING.NORMAL_FISHING, baseRate: 20, type: 'normal' },
                { name: 'キラキラミノー（赤）', baseRate: 45, type: 'red', count: this.items['キラキラミノー（赤）'] },
                { name: 'キラキラミノー（緑）', baseRate: 45, type: 'green', count: this.items['キラキラミノー（緑）'] },
                { name: 'キラキラミノー（金）', baseRate: 60, type: 'gold', count: this.items['キラキラミノー（金）'] },
                { name: 'ドリームワーム（赤）', baseRate: 45, type: 'red', count: this.items['ドリームワーム（赤）'] },
                { name: 'ドリームワーム（緑）', baseRate: 45, type: 'green', count: this.items['ドリームワーム（緑）'] },
                { name: 'ドリームワーム（金）', baseRate: 60, type: 'gold', count: this.items['ドリームワーム（金）'] },
                { name: 'ふわとろオキアミ団子', baseRate: 50, type: 'bait', count: this.items['ふわとろオキアミ団子'] }
            ];

            // 天気ヒントのマッピング
            const weatherHints = {
                red: '☁️ 曇りの日に◎',
                green: '☀️ 晴れの日に◎',
                gold: '🌟 天気問わず安定',
                bait: '⚓ 天気問わず',
                normal: ''
            };

            this.lureOptions.innerHTML = '';

            lures.forEach((lure, index) => {
                // 所持していないルアーは表示しない（通常釣りは常に表示）
                if (index > 0 && lure.count <= 0) return;

                const btn = document.createElement('button');
                btn.className = 'lure-option-button';

                const hint = weatherHints[lure.type] || '';
                const countHTML = index > 0
                    ? `<span class="lure-count">所持数: ${lure.count}</span>`
                    : '';

                btn.innerHTML = `
                    <span class="lure-name">${lure.name}</span>
                    ${hint ? `<span class="lure-hint">${hint}</span>` : ''}
                    ${countHTML}
                `;

                btn.addEventListener('click', () => {
                    if (index > 0) {
                        this.items[lure.name]--;
                        this.saveGameState();
                    }
                    this.lurePopup.classList.add('hidden');
                    this.lureCancelButton.removeEventListener('click', cancelHandler);
                    resolve(lure);
                });

                this.lureOptions.appendChild(btn);
            });

            const cancelHandler = () => {
                this.lurePopup.classList.add('hidden');
                this.lureCancelButton.removeEventListener('click', cancelHandler);
                resolve(null);
            };

            this.lureCancelButton.addEventListener('click', cancelHandler);
            this.lurePopup.classList.remove('hidden');
        });
    }

    calculateCatchRate(lure) {
        // 金色のルアーと餌は天気の影響を受けない
        if (lure.type === 'gold' || lure.type === 'bait') {
            return lure.baseRate;
        }

        let rate = lure.baseRate;

        // 天気による補正（オブジェクトで一元管理）
        const weatherModifiers = {
            sunny:  { type: 'green', modifier: 1.5 },
            cloudy: { type: 'red',   modifier: 1.5 },
            rainy:  {                modifier: 0.7 }
        };

        const weatherEffect = weatherModifiers[this.currentWeather];
        if (weatherEffect) {
            if (weatherEffect.type && lure.type === weatherEffect.type) {
                rate *= weatherEffect.modifier;
            } else if (!weatherEffect.type) {
                rate *= weatherEffect.modifier;
            }
        }

        return rate;
    }

    checkCatch(lure) {
        const totGirls = [
            {
                name: "シーバス",
                rarity: "ノーマル",
                description: "クールでミステリアスな都会派お姉さん。誰にも媚びず、どこか影を感じさせるが、実は人知れず努力家",
                image: "images/seabass.PNG"
            },
            {
                name: "真鯛",
                rarity: "レア",
                description: "優雅でおっとりしたお嬢様。礼儀正しく上品だが、芯の強さを持っている。みんなのまとめ役",
                image: "images/madai.PNG"
            },
            {
                name: "メバル",
                rarity: "ノーマル",
                description: "小柄で元気な探検少女タイプ。暗い場所が好きで、ナイトスイマーとして活躍。友達想いで怖がりな一面も",
                image: "images/mebaru.PNG"
            }
        ];

        const catchRate = this.calculateCatchRate(lure);
        const result = Math.random() * 100;

        if (result <= catchRate) {
            let weightedTotGirls = totGirls.map(tot => {
                let weight = 1;
                if (lure.target && tot.name === lure.target) {
                    weight = 3;
                }
                return { tot, weight };
            });

            const totalWeight = weightedTotGirls.reduce((sum, { weight }) => sum + weight, 0);
            let random = Math.random() * totalWeight;

            let caught = null;
            for (const { tot, weight } of weightedTotGirls) {
                random -= weight;
                if (random <= 0) {
                    caught = tot;
                    break;
                }
            }

            this.totalCatch++;
            this.addToAquarium(caught);
            this.showCatchResult(caught);
        } else {
            this.showFailResult();
        }

        this.updateStats();
        this.saveGameState();

        this.fishingLine.style.height = '0';
        this.gameState = 'waiting';
        this.fishingButton.disabled = false;
    }

    addToAquarium(caught) {
        const savedTots = localStorage.getItem('caughtTots');
        const tots = savedTots ? JSON.parse(savedTots) : [];

        tots.push({
            name: caught.name,
            rarity: caught.rarity,
            description: caught.description,
            image: caught.image,
            affection: 0   // 親密度は明示的に0から開始
        });

        localStorage.setItem('caughtTots', JSON.stringify(tots));
    }

    showCatchResult(caught) {
        const resultTitle = document.getElementById('result-title');
        resultTitle.textContent = TEXT.FISHING.CATCH_SUCCESS;
        this.catchResult.innerHTML = `
            <img src="${caught.image}" alt="${caught.name}" class="catch-image">
            <h3>${caught.name}</h3>
            <p>レアリティ: ${caught.rarity}</p>
            <p>${caught.description}</p>
        `;
        this.resultPopup.classList.remove('hidden');
    }

    showFailResult() {
        const resultTitle = document.getElementById('result-title');
        resultTitle.textContent = TEXT.FISHING.CATCH_FAIL;
        this.catchResult.innerHTML = `
            <p>${TEXT.FISHING.CATCH_FAIL_MESSAGE}</p>
        `;
        this.resultPopup.classList.remove('hidden');
    }

    hideCatchResult() {
        this.resultPopup.classList.add('hidden');
    }

    updateStats() {
        this.fishCount.textContent = this.totalCatch;
        this.playerLevel.textContent = Math.floor(this.totalCatch / 5) + 1;
    }

    saveGameState() {
        localStorage.setItem('totalCatch', this.totalCatch.toString());
        localStorage.setItem('items', JSON.stringify(this.items));
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new FishingGame();
});
