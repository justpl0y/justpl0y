const button1 = document.querySelector("#button1");
const button2 = document.querySelector("#button2");
const button3 = document.querySelector("#button3");
const textright = document.querySelector("#textright");
const textleft = document.querySelector("#textleft");
const balance = document.querySelector("#balance");
const dealercard = document.querySelector("#dealercard");
const yourcard = document.querySelector("#yourcard");

let drawCardSound = new Audio('Sounds/drawcard.mp3');
let dealerWinSound = new Audio('Sounds/dealerwin.wav');
let playerWinSound = new Audio('Sounds/playerwin.mp3');
let gameDrawnSound = new Audio('Sounds/gamedrawsound.wav');
drawCardSound.volume = dealerWinSound.volume = playerWinSound.volume = gameDrawnSound.volume = 0.1;

let money = parseInt(localStorage.getItem("money")) || 100;
let wins = parseInt(localStorage.getItem("wins")) || 0;
let losses = parseInt(localStorage.getItem("losses")) || 0;
let lossStreak = parseInt(localStorage.getItem("lossStreak")) || 0;
let gameLive = false;
balance.innerText = money;

const deck = [];
["Hearts", "Diamonds", "Clubs", "Spades"].forEach(suit => {
  for (let type of ["2","3","4","5","6","7","8","9","10","J","Q","K","A"]) {
    const value = type === "A" ? 11 : ["J","Q","K"].includes(type) ? 10 : parseInt(type);
    deck.push({ suit, type, value });
  }
});

let userCardCount = 0;
let userSum = 0;
let dealerSum = 0;
let winner;
let bet;

function saveProgress() {
  if (money < 100) money = 100;
  localStorage.setItem("money", money);
  localStorage.setItem("wins", wins);
  localStorage.setItem("losses", losses);
  localStorage.setItem("lossStreak", lossStreak);
  balance.innerText = money;
}

function drawCard() {
  drawCardSound.play();
  const card = deck[Math.floor(Math.random() * deck.length)];
  return card;
}

function adjustForAces(sum, cards) {
  let aceCount = cards.filter(c => c.type === "A").length;
  while (sum > 21 && aceCount > 0) {
    sum -= 10;
    aceCount--;
  }
  return sum;
}

const userCards = [];
const dealerCards = [];

function drawUser() {
  const card = drawCard();
  userCards.push(card);
  const suitU = document.querySelector("#suitU");
  const typeU = document.querySelector("#typeU");
  const valueU = document.querySelector("#valueU");
  userCardCount++;
  textleft.style.color = "aliceblue";
  suitU.innerText = card.suit;
  typeU.innerText = card.type;
  userSum += card.value;
  userSum = adjustForAces(userSum, userCards);
  valueU.innerText = userSum;
  if (userSum < 21) drawDealer();
  else checkWinnerAndFinishGame();
}

function drawDealer() {
  const difficulty = Math.floor(wins / 2);
  let dealerTarget = 18 + Math.min(difficulty, 5);
  if (dealerSum < dealerTarget && dealerSum < userSum) {
    const card = drawCard();
    dealerCards.push(card);
    const suitD = document.querySelector("#suitD");
    const typeD = document.querySelector("#typeD");
    const valueD = document.querySelector("#valueD");
    suitD.innerText = card.suit;
    typeD.innerText = card.type;
    dealerSum += card.value;
    dealerSum = adjustForAces(dealerSum, dealerCards);
    valueD.innerText = dealerSum;
    if (dealerSum >= 21) checkWinnerAndFinishGame();
  } else checkWinnerAndFinishGame();
}

function betAmount(amount) {
  if (money >= amount && !gameLive) {
    money -= amount;
    bet = amount;
    balance.innerText = money;
    update(locations[1]);
    gameLive = true;
    showDealerCard();
    userCards.length = 0;
    dealerCards.length = 0;
    userSum = 0;
    dealerSum = 0;
    drawUser();
    saveProgress();
  } else if (gameLive) alert("Game ongoing, finish this round first!");
  else alert("Not enough money!");
}

function checkWinnerAndFinishGame() {
  gameLive = false;
  update(locations[0]);
  if (dealerSum > 21) winner = 'Player';
  else if (userSum > 21) winner = 'Dealer';
  else if (userSum === dealerSum) winner = 'Drawn';
  else winner = userSum > dealerSum ? 'Player' : 'Dealer';

  if (winner === 'Player') {
    wins++;
    lossStreak = 0;
    money += Math.floor(bet * 1.6);
    textleft.innerText = 'You Win';
    textleft.style.color = "rgb(3,255,3)";
    playerWinSound.play();
  } else if (winner === 'Dealer') {
    losses++;
    lossStreak++;
    textleft.innerText = "Dealer Wins";
    textleft.style.color = "red";
    dealerWinSound.play();
  } else {
    money += bet;
    textleft.innerText = 'Game Drawn';
    textleft.style.color = "#ffbd08";
    gameDrawnSound.play();
  }

  userCardCount = 0;
  userSum = 0;
  dealerSum = 0;
  saveProgress();
}

function hold() {
  if (gameLive && userCardCount >= 2) {
    drawDealer();
    checkWinnerAndFinishGame();
  } else alert('You must draw at least two cards before holding.');
}

function double() {
  if (money >= bet && gameLive) {
    money -= bet;
    bet *= 2;
    balance.innerText = money;
    textright.innerText = "Doubled Bet";
    drawUser();
    saveProgress();
  } else alert("Not enough money to double!");
}

function showDealerCard() {
  if (gameLive) {
    setTimeout(() => {
      yourcard.style.display = "block";
      textleft.style.animationName = '';
      textleft.style.borderRight = 'none';
      setTimeout(() => {
        dealercard.style.display = "block";
      }, 1000);
    }, 1000);
  } else {
    dealercard.style.display = "none";
    yourcard.style.display = "none";
  }
}

const locations = [
  {
    name: "Bet Menu",
    "button text": ["$100","$500","$1000"],
    "button functions": [() => betAmount(100), () => betAmount(500), () => betAmount(1000)],
    textleft: "Choose your bet",
    textright: "Choose New Bet"
  },
  {
    name: "Game Menu",
    "button text": ["Draw","Hold","Double"],
    "button functions": [drawUser, hold, double],
    textleft: "Dealing...",
    textright: "Choose"
  }
];

function update(location) {
  button1.innerText = location["button text"][0];
  button2.innerText = location["button text"][1];
  button3.innerText = location["button text"][2];
  button1.onclick = location["button functions"][0];
  button2.onclick = location["button functions"][1];
  button3.onclick = location["button functions"][2];
  textright.innerText = location.textright;
  textleft.innerText = location.textleft;
}

update(locations[0]);
showDealerCard();
textleft.innerText = 'Welcome to Hard Mode Blackjack';
textright.innerText = 'Choose Bet';
saveProgress();
