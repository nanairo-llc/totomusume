class ShopGame {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadGameState();
    }

    initializeElements() {
        this.gachaButton = document.getElementById('gacha-button');
        this.money = document.getElementById('money');
        this.resultPopup = document.getElementById('gacha-result');
        this.resultContent = document.getElementById('result-content');
        this.closeResult = document.getElementById('close-result');
    }

    initializeEventListeners() {
        this.gachaButton.addEventListener('click', () => this.drawGacha());
        this.closeResult.addEventListener('click', () => this.hideResult());
    }

    loadGameState() {
        // 所持金の読み込み
        const savedMoney = localStorage.getItem('money');
        this.moneyAmount = savedMoney ? parseInt(savedMoney) : 1000;
        this.updateMoneyDisplay();

        // アイテムの読み込み
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

        // 所持アイテムの表示を更新
        this.updateItemList();
    }

    updateItemList() {
        const itemGrid = document.getElementById('item-grid');
        if (!itemGrid) return;

        let html = '';
        for (const [itemName, count] of Object.entries(this.items)) {
            if (count > 0) {
                html += `
                    <div class="item-card">
                        <h4>${itemName}</h4>
                        <p>所持数: ${count}</p>
                    </div>
                `;
            }
        }

        itemGrid.innerHTML = html || '<p class="explanation">空っぽです<br>ガチャを引きましょう！</p>';
    }

    saveGameState() {
        localStorage.setItem('money', this.moneyAmount.toString());
        localStorage.setItem('items', JSON.stringify(this.items));
    }

    updateMoneyDisplay() {
        this.money.textContent = this.moneyAmount;
    }

    drawGacha() {
        if (this.moneyAmount < 100) {
            alert('所持金が足りません！');
            return;
        }

        this.moneyAmount -= 100;
        this.updateMoneyDisplay();

        const items = [
            { name: 'キラキラミノー（金）', rarity: 'UR', rate: 5, description: 'どんな天気でも釣れやすい金色のミノー' },
            { name: 'キラキラミノー（赤）', rarity: 'SR', rate: 15, description: '曇りの日に効果的な赤色のミノー' },
            { name: 'キラキラミノー（緑）', rarity: 'SR', rate: 15, description: '晴れの日に効果的な緑色のミノー' },
            { name: 'ドリームワーム（金）', rarity: 'UR', rate: 5, description: 'どんな天気でも釣れやすい金色のワーム' },
            { name: 'ドリームワーム（赤）', rarity: 'SR', rate: 15, description: '曇りの日に効果的な赤色のワーム' },
            { name: 'ドリームワーム（緑）', rarity: 'SR', rate: 15, description: '晴れの日に効果的な緑色のワーム' },
            { name: 'ふわとろオキアミ団子', rarity: 'N', rate: 30, description: '天気に左右されない餌。基本の釣果は低め' }
        ];

        // 抽選処理
        const rand = Math.random() * 100;
        let sumRate = 0;
        let drawnItem = null;

        for (const item of items) {
            sumRate += item.rate;
            if (rand < sumRate) {
                drawnItem = item;
                break;
            }
        }

        // アイテム獲得処理
        this.items[drawnItem.name]++;
        this.saveGameState();

        // 結果表示
        this.showResult(drawnItem);
    }

    showResult(item) {
        let rarityColor;
        switch (item.rarity) {
            case 'UR':
                rarityColor = '#FFD700';
                break;
            case 'SR':
                rarityColor = '#FFA500';
                break;
            default:
                rarityColor = '#BDBDBD';
        }

        this.resultContent.innerHTML = `
            <h3 style="color: ${rarityColor}; margin-bottom: 10px;">${item.name}</h3>
            <p style="color: ${rarityColor}; font-size: 20px; margin-bottom: 10px;">${item.rarity}</p>
            <p>${item.description}</p>
            <p style="margin-top: 10px;">所持数: ${this.items[item.name]}</p>
        `;
        this.resultPopup.classList.remove('hidden');
        this.updateItemList(); // 所持アイテムリストを更新
    }

    hideResult() {
        this.resultPopup.classList.add('hidden');
    }
}

// ゲームの初期化
window.addEventListener('DOMContentLoaded', () => {
    new ShopGame();
});
