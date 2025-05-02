class AquariumGame {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadGameState();
        this.displayTotGirls();
    }

    initializeElements() {
        this.totList = document.getElementById('tot-list');
        this.aquariumDetail = document.getElementById('aquarium-detail');
        this.detailImage = document.getElementById('detail-image');
        this.detailName = document.getElementById('detail-name');
        this.detailAffection = document.getElementById('detail-affection');
        this.affectionFill = document.getElementById('affection-fill');
        this.feedButton = document.getElementById('feed-button');
        this.playButton = document.getElementById('play-button');
        this.closeButton = document.getElementById('close-detail');
        this.foodCount = document.getElementById('food-count');
    }

    initializeEventListeners() {
        this.feedButton.addEventListener('click', () => this.feedTot());
        this.playButton.addEventListener('click', () => this.playWithTot());
        this.closeButton.addEventListener('click', () => this.hideDetail());
    }

    loadGameState() {
        // とと娘データの読み込み
        const savedTots = localStorage.getItem('caughtTots');
        this.tots = savedTots ? JSON.parse(savedTots) : [];
        
        // 餌の数を読み込む
        const savedFood = localStorage.getItem('foodCount');
        this.food = savedFood ? parseInt(savedFood) : 5;
        this.foodCount.textContent = this.food;

        // 所持金を読み込む
        const savedMoney = localStorage.getItem('money');
        this.money = savedMoney ? parseInt(savedMoney) : 1000;
    }

    saveGameState() {
        localStorage.setItem('caughtTots', JSON.stringify(this.tots));
        localStorage.setItem('foodCount', this.food.toString());
        localStorage.setItem('money', this.money.toString());
    }

    displayTotGirls() {
        this.totList.innerHTML = '';
        if (this.tots.length === 0) {
            // アイテムがない状態 → 空状態クラスを付与
            this.totList.classList.add('tot-list-empty');
            this.totList.innerHTML = `<p class="explanation" style="text-align: center; padding: 20px;">${TEXT.AQUARIUM.EMPTY_STATE}</p>`;
            return;
        } else {
            // アイテムがある状態 → クラスを外す
            this.totList.classList.remove('tot-list-empty');
        }

        this.tots.forEach((tot, index) => {
            const totItem = document.createElement('div');
            totItem.className = 'tot-item';
            totItem.innerHTML = `
                <div class="tot-info">
                    <img src="${tot.image}" alt="${tot.name}" style="cursor: pointer">
                    <h3>${tot.name}</h3>
                    <p>親密度: ${tot.affection || 0}</p>
                    <button class="action-button release-button">
                        放流する
                        <small>（報酬30円）</small>
                    </button>
                </div>
            `;
            
            // 詳細表示のイベントリスナー
            totItem.querySelector('img').addEventListener('click', () => this.showDetail(index));
            
            // 放流ボタンのイベントリスナー
            totItem.querySelector('.release-button').addEventListener('click', () => this.releaseTot(index));
            
            this.totList.appendChild(totItem);
        });
    }

    releaseTot(index) {
        const tot = this.tots[index];
        if (confirm(TEXT.AQUARIUM.RELEASE_CONFIRM.replace('{name}', tot.name))) {
            // とと娘を放流（配列から削除）
            this.tots.splice(index, 1);
            
            // 報酬を付与
            this.money += 30;
            
            // 状態を保存
            this.saveGameState();
            
            // リストを更新
            this.displayTotGirls();
            
            alert(TEXT.AQUARIUM.RELEASE_SUCCESS);
        }
    }

    showDetail(index) {
        this.currentTotIndex = index;
        const tot = this.tots[index];
        
        this.detailImage.src = tot.image;
        this.detailImage.alt = tot.name;
        this.detailName.textContent = tot.name;
        this.detailAffection.textContent = tot.affection || 0;
        
        // 親密度メーターの更新
        this.updateAffectionMeter(tot.affection || 0);
        
        this.aquariumDetail.classList.remove('hidden');
    }

    hideDetail() {
        this.aquariumDetail.classList.add('hidden');
        this.currentTotIndex = null;
    }

    calculateAffectionPercent(affection) {
        return Math.min(100, (affection / 100) * 100);
    }

    // 親密度メーターの更新ヘルパーメソッド
    updateAffectionMeter(affection) {
        const affectionPercent = this.calculateAffectionPercent(affection);
        this.affectionFill.style.width = `${affectionPercent}%`;
    }

    feedTot() {
        if (this.food <= 0) {
            alert(TEXT.AQUARIUM.NO_FOOD);
            return;
        }

        this.food--;
        this.foodCount.textContent = this.food;
        
        const tot = this.tots[this.currentTotIndex];
        tot.affection = (tot.affection || 0) + 1;
        this.detailAffection.textContent = tot.affection;
        
        // 親密度メーターの更新
        this.updateAffectionMeter(tot.affection);
        
        this.saveGameState();
        this.displayTotGirls();
    }

    playWithTot() {
        const tot = this.tots[this.currentTotIndex];
        tot.affection = (tot.affection || 0) + 2;
        this.detailAffection.textContent = tot.affection;
        
        // 親密度メーターの更新
        this.updateAffectionMeter(tot.affection);
        
        this.saveGameState();
        this.displayTotGirls();
    }
}

// ゲームの初期化
window.addEventListener('DOMContentLoaded', async () => {
    const { TEXT } = await import('./constants.js');
    new AquariumGame();
});
