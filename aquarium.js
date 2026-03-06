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

        // 放流確認モーダル
        this.releaseConfirmPopup = document.getElementById('release-confirm-popup');
        this.releaseConfirmMessage = document.getElementById('release-confirm-message');
        this.releaseYesButton = document.getElementById('release-yes-button');
        this.releaseNoButton = document.getElementById('release-no-button');

        // トースト通知
        this.toastDiv = document.getElementById('toast-message');
    }

    initializeEventListeners() {
        this.feedButton.addEventListener('click', () => this.feedTot());
        this.playButton.addEventListener('click', () => this.playWithTot());
        this.closeButton.addEventListener('click', () => this.hideDetail());
    }

    loadGameState() {
        const savedTots = localStorage.getItem('caughtTots');
        this.tots = savedTots ? JSON.parse(savedTots) : [];

        const savedFood = localStorage.getItem('foodCount');
        this.food = savedFood ? parseInt(savedFood) : 5;
        this.foodCount.textContent = this.food;

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
            this.totList.classList.add('tot-list-empty');
            this.totList.innerHTML = '<p class="explanation" style="text-align: center; padding: 20px;">まだとと娘が釣れていません。<br>釣りに行って、とと娘を見つけましょう！</p>';
            return;
        }
        this.totList.classList.remove('tot-list-empty');

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

            totItem.querySelector('img').addEventListener('click', () => this.showDetail(index));
            totItem.querySelector('.release-button').addEventListener('click', () => this.releaseTot(index));

            this.totList.appendChild(totItem);
        });
    }

    releaseTot(index) {
        const tot = this.tots[index];

        // confirm() の代わりにカスタムモーダルを使用
        this.releaseConfirmMessage.textContent = `${tot.name}を放流しますか？ 報酬として30円を獲得できます。`;
        this.releaseConfirmPopup.classList.remove('hidden');

        const yesHandler = () => {
            this.tots.splice(index, 1);
            this.money += 30;
            this.saveGameState();
            this.displayTotGirls();
            this.releaseConfirmPopup.classList.add('hidden');
            this.showToast('放流しました。報酬として30円を獲得しました！');
            cleanup();
        };

        const noHandler = () => {
            this.releaseConfirmPopup.classList.add('hidden');
            cleanup();
        };

        const cleanup = () => {
            this.releaseYesButton.removeEventListener('click', yesHandler);
            this.releaseNoButton.removeEventListener('click', noHandler);
        };

        this.releaseYesButton.addEventListener('click', yesHandler);
        this.releaseNoButton.addEventListener('click', noHandler);
    }

    showDetail(index) {
        this.currentTotIndex = index;
        const tot = this.tots[index];

        this.detailImage.src = tot.image;
        this.detailImage.alt = tot.name;
        this.detailName.textContent = tot.name;
        this.detailAffection.textContent = tot.affection || 0;

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

    // 親密度メーターの更新ヘルパーメソッド（リモートから統合）
    updateAffectionMeter(affection) {
        const affectionPercent = this.calculateAffectionPercent(affection);
        this.affectionFill.style.width = `${affectionPercent}%`;
    }

    feedTot() {
        if (this.food <= 0) {
            // alert() の代わりにトーストを使用。メッセージも実際の商品名に修正
            this.showToast('餌がありません！ 釣具店で餌セットを購入できます。');
            return;
        }

        this.food--;
        this.foodCount.textContent = this.food;

        const tot = this.tots[this.currentTotIndex];
        tot.affection = (tot.affection || 0) + 1;
        this.detailAffection.textContent = tot.affection;

        this.updateAffectionMeter(tot.affection);

        this.saveGameState();
        this.displayTotGirls();
    }

    playWithTot() {
        const tot = this.tots[this.currentTotIndex];
        tot.affection = (tot.affection || 0) + 2;
        this.detailAffection.textContent = tot.affection;

        this.updateAffectionMeter(tot.affection);

        this.saveGameState();
        this.displayTotGirls();
    }

    // トースト通知（alert/confirm の代替）
    showToast(message, duration = 2500) {
        this.toastDiv.textContent = message;
        this.toastDiv.classList.remove('hidden');
        clearTimeout(this._toastTimer);
        this._toastTimer = setTimeout(() => {
            this.toastDiv.classList.add('hidden');
        }, duration);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new AquariumGame();
});
