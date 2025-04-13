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
        this.fishShadow = document.getElementById('fish-shadow');
        this.fishingButton = document.getElementById('fishing-button');
        this.resultPopup = document.getElementById('result-popup');
        this.catchResult = document.getElementById('catch-result');
        this.continueButton = document.getElementById('continue-button');
        this.fishCount = document.getElementById('fish-count');
        this.playerLevel = document.getElementById('player-level');
        this.weatherInfo = document.getElementById('weather-info');
    }

    initializeEventListeners() {
        this.fishingButton.addEventListener('click', () => this.startFishing());
        this.continueButton.addEventListener('click', () => this.hideCatchResult());
    }

    initializeWeather() {
        const weathers = ['sunny', 'cloudy', 'rainy'];
        this.currentWeather = weathers[Math.floor(Math.random() * weathers.length)];
        
        const weatherEmoji = {
            sunny: '☀️',
            cloudy: '☁️',
            rainy: '🌧️'
        };
        
        const weatherText = {
            sunny: '晴れ',
            cloudy: '曇り',
            rainy: '雨'
        };
        
        this.weatherInfo.textContent = `${weatherEmoji[this.currentWeather]} ${weatherText[this.currentWeather]}`;
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

    startFishing() {
        if (this.gameState !== 'waiting') return;
        
        const lureChoice = this.showLureDialog();
        if (!lureChoice) return;

        this.currentLure = lureChoice;
        this.gameState = 'fishing';
        this.fishingButton.disabled = true;
        
        const lineLength = 500;
        this.fishingLine.style.height = `${lineLength}px`;
        
        const catchTime = 3000 + Math.random() * 2000;
        setTimeout(() => {
            this.checkCatch(this.currentLure);
        }, catchTime);
    }

    showLureDialog() {
        const lures = [
            { name: '通常の釣り', baseRate: 20, type: 'normal' },
            { name: 'キラキラミノー（赤）', baseRate: 45, type: 'red', count: this.items['キラキラミノー（赤）'] },
            { name: 'キラキラミノー（緑）', baseRate: 45, type: 'green', count: this.items['キラキラミノー（緑）'] },
            { name: 'キラキラミノー（金）', baseRate: 60, type: 'gold', count: this.items['キラキラミノー（金）'] },
            { name: 'ドリームワーム（赤）', baseRate: 45, type: 'red', count: this.items['ドリームワーム（赤）'] },
            { name: 'ドリームワーム（緑）', baseRate: 45, type: 'green', count: this.items['ドリームワーム（緑）'] },
            { name: 'ドリームワーム（金）', baseRate: 60, type: 'gold', count: this.items['ドリームワーム（金）'] },
            { name: 'ふわとろオキアミ団子', baseRate: 50, type: 'bait', count: this.items['ふわとろオキアミ団子'] }
        ];

        let message = '使用する釣具を選んでください：\n\n';
        message += '0: 通常の釣り\n';
        lures.slice(1).forEach((lure, index) => {
            if (lure.count > 0) {
                message += `${index + 1}: ${lure.name} (所持数: ${lure.count})\n`;
            }
        });

        const choice = prompt(message, '0');
        if (choice === null) return null;
        
        const selectedIndex = parseInt(choice);
        if (isNaN(selectedIndex) || selectedIndex < 0 || selectedIndex >= lures.length) {
            alert('無効な選択です。通常の釣りを行います。');
            return lures[0];
        }

        const selectedLure = lures[selectedIndex];
        if (selectedIndex > 0 && selectedLure.count <= 0) {
            alert('選択した釣具を所持していません。通常の釣りを行います。');
            return lures[0];
        }

        if (selectedIndex > 0) {
            this.items[selectedLure.name]--;
            this.saveGameState();
        }

        return selectedLure;
    }

    calculateCatchRate(lure) {
        let rate = lure.baseRate;

        // 天気による補正
        switch (this.currentWeather) {
            case 'sunny':
                if (lure.type === 'green') rate *= 1.5;
                break;
            case 'cloudy':
                if (lure.type === 'red') rate *= 1.5;
                break;
            case 'rainy':
                rate *= 0.7;
                break;
        }

        // 金色のルアーは天気の影響を受けない
        if (lure.type === 'gold') {
            rate = lure.baseRate;
        }

        // 餌は天気の影響を受けないが、基本確率が低い
        if (lure.type === 'bait') {
            rate = lure.baseRate;
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
            affection: 0
        });
        
        localStorage.setItem('caughtTots', JSON.stringify(tots));
    }

    showCatchResult(caught) {
        const resultTitle = document.getElementById('result-title');
        resultTitle.textContent = '釣れた！';
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
        resultTitle.textContent = '残念！';
        this.catchResult.innerHTML = `
            <p>何も釣れませんでした。</p>
            <p>違う釣具を試してみましょう。</p>
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
