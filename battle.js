class BattleGame {
    constructor() {
        this.initializeElements();
        this.initializeEventListeners();
        this.loadGameState();
        this.showPreparation();
    }

    initializeElements() {
        this.battlePreparation = document.querySelector('.battle-preparation');
        this.battleField = document.getElementById('battle-field');
        this.resultPopup = document.getElementById('battle-result');
        this.resultContent = document.getElementById('result-content');
        this.totSelection = document.getElementById('tot-selection');
        this.startButton = document.getElementById('start-battle');
        this.closeResult = document.getElementById('close-result');
        this.winCount = document.getElementById('win-count');
        
        // レース要素
        this.playerSwimmer = document.getElementById('player-swimmer');
        this.opponentSwimmer = document.getElementById('opponent-swimmer');
        this.playerName = document.getElementById('player-name');
        this.opponentName = document.getElementById('opponent-name');
        this.playerImage = document.getElementById('player-image');
        this.opponentImage = document.getElementById('opponent-image');
    }

    initializeEventListeners() {
        this.startButton.addEventListener('click', () => this.startRace());
        this.closeResult.addEventListener('click', () => this.hideResult());
    }

    loadGameState() {
        const savedWins = localStorage.getItem('battleWins');
        this.wins = savedWins ? parseInt(savedWins) : 0;
        this.updateWinCount();

        const savedTots = localStorage.getItem('caughtTots');
        this.tots = savedTots ? JSON.parse(savedTots) : [];
    }

    updateWinCount() {
        this.winCount.textContent = this.wins;
    }

    showPreparation() {
        this.totSelection.innerHTML = '';
        
        if (!this.tots || this.tots.length === 0) {
            this.totSelection.innerHTML = '<p style="text-align: center; padding: 20px;">まだとと娘が釣れていません。<br>釣りに行って、とと娘を見つけましょう！</p>';
            return;
        }

        this.tots.forEach((tot, index) => {
            const totItem = document.createElement('div');
            totItem.className = 'tot-select-item';
            totItem.innerHTML = `
                <img src="${tot.image}" alt="${tot.name}">
                <div>
                    <h3>${tot.name}</h3>
                    <p>親密度: ${tot.affection || 0}</p>
                </div>
            `;
            totItem.addEventListener('click', () => this.selectTot(index));
            this.totSelection.appendChild(totItem);
        });
    }

    selectTot(index) {
        this.selectedTot = this.tots[index];
        this.battlePreparation.classList.add('hidden');
        this.setupRace();
    }

    setupRace() {
        // プレイヤーとと娘の表示
        this.playerImage.src = this.selectedTot.image;
        this.playerName.textContent = this.selectedTot.name;
        
        // 対戦相手の生成
        const opponents = [
            { name: "速水さん", image: "images/seabass.PNG", level: 5 },
            { name: "紅葉さん", image: "images/madai.PNG", level: 10 },
            { name: "夜桜さん", image: "images/mebaru.PNG", level: 15 }
        ];
        
        this.opponent = opponents[Math.floor(Math.random() * opponents.length)];
        this.opponentImage.src = this.opponent.image;
        this.opponentName.textContent = this.opponent.name;
        
        // 初期位置に設定
        this.playerSwimmer.style.transform = 'translateX(0)';
        this.opponentSwimmer.style.transform = 'translateX(0)';
        
        this.battleField.classList.remove('hidden');
        this.startButton.disabled = false;
    }

    startRace() {
        this.startButton.disabled = true;
        
        // レース結果の計算
        const playerPower = (this.selectedTot.affection || 0) * 10;
        const opponentPower = this.opponent.level * 10;
        
        let playerProgress = 0;
        let opponentProgress = 0;
        const goalPosition = this.battleField.offsetWidth - 150; // ゴールラインまでの距離を調整
        
        const raceInterval = setInterval(() => {
            // ランダムな進行度を加算
            playerProgress += Math.random() * 5;
            opponentProgress += Math.random() * 5;
            
            // パワーに応じてボーナス進行度を加算
            playerProgress += playerPower / 100;
            opponentProgress += opponentPower / 100;
            
            // 位置の更新
            const playerPosition = Math.min(goalPosition, (playerProgress / 100) * goalPosition);
            const opponentPosition = Math.min(goalPosition, (opponentProgress / 100) * goalPosition);
            
            this.playerSwimmer.style.transform = `translateX(${playerPosition}px)`;
            this.opponentSwimmer.style.transform = `translateX(${opponentPosition}px)`;
            
            // レース終了判定
            if (playerPosition >= goalPosition || opponentPosition >= goalPosition) {
                clearInterval(raceInterval);
                setTimeout(() => {
                    this.showResult(playerPosition > opponentPosition);
                }, 500);
            }
        }, 50);
    }

    showResult(isWin) {
        if (isWin) {
            this.wins++;
            localStorage.setItem('battleWins', this.wins.toString());
            this.updateWinCount();

            // 勝利報酬の付与
            const reward = 500;
            const savedMoney = localStorage.getItem('money');
            const currentMoney = savedMoney ? parseInt(savedMoney) : 1000;
            const newMoney = currentMoney + reward;
            localStorage.setItem('money', newMoney.toString());
        }
        
        this.resultContent.innerHTML = `
            <h2>${isWin ? '優勝！' : '惜しい！'}</h2>
            <p>${isWin ? '見事な泳ぎでした！' : '良い勝負でした！'}</p>
            <p>${isWin ? `報酬として500円を獲得しました！` : 'また挑戦してください！'}</p>
        `;
        
        setTimeout(() => {
            this.resultPopup.classList.remove('hidden');
        }, 1000);
    }

    hideResult() {
        this.resultPopup.classList.add('hidden');
        this.battleField.classList.add('hidden');
        this.battlePreparation.classList.remove('hidden');
        this.showPreparation();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new BattleGame();
});
