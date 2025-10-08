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

const suits = ["Hearts", "Diamonds", "Clubs", "Spades"];
const types = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"];

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const type of types) {
      const value = type === "A" ? 11 : ["J","Q","K"].includes(type) ? 10 : parseInt(type);
      deck.push({ suit, type, value });
    }
  }
  return deck;
}

let deck = createDeck();
let userCards = [];
let dealerCards = [];
let userSum = 0;
let dealerSum = 0;
let bet = 0;
let winner = null;

function saveProgress() {
  if (money < 100) money = 100;
  localStorage.setItem("money", money);
  localStorage.setItem("wins", wins);
  localStorage.setItem("losses", losses);
  localStorage.setItem("lossStreak", lossStreak);
  balance.innerText = money;
}

function drawCard() {
  if (deck.length < 10) deck = createDeck();
  const card = deck.splice(Math.floor(Math.random() * deck.length), 1)[0];
  drawCardSound.play().catch(()=>{});
  return card;
}

function adjustForAces(cards) {
  let sum = cards.reduce((t, c) => t + c.value, 0);
  let aces = cards.filter(c => c.type === "A").length;
  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }
  return sum;
}

function updateValues() {
  userSum = adjustForAces(userCards);
  dealerSum = adjustForAces(dealerCards);
  document.querySelector("#valueU").innerText = userSum;
  document.querySelector("#valueD").innerText = dealerSum;
}

function showCards(player, cards) {
  const suit = document.querySelector(`#suit${player}`);
  const type = document.querySelector(`#type${player}`);
  const value = document.querySelector(`#value${player}`);
  const card = cards[cards.length - 1];
  suit.innerText = card.suit;
  type.innerText = card.type;
  value.innerText = adjustForAces(cards);
}

function betAmount(amount) {
  if (money < amount) return alert("Not enough money!");
  if (gameLive) return alert("Game already in progress!");

  money -= amount;
  bet = amount;
  balance.innerText = money;
  gameLive = true;
  textleft.style.color = "aliceblue";
  textleft.innerText = "Your Turn";
  textright.innerText = "Draw or Hold";
  userCards = [];
  dealerCards = [];
  yourcard.style.display = "block";
  dealercard.style.display = "block";

  userCards.push(drawCard(), drawCard());
  dealerCards.push(drawCard(), drawCard());
  showCards("U", userCards);
  showCards("D", dealerCards);
  updateValues();

  if (userSum === 21) checkWinnerAndFinishGame();
  saveProgress();
}

function drawUser() {
  if (!gameLive) return;
  const card = drawCard();
  userCards.push(card);
  showCards("U", userCards);
  updateValues();
  if (userSum >= 21) checkWinnerAndFinishGame();
}

function dealerPlay() {
  dealerSum = adjustForAces(dealerCards);
  let soft17 = dealerSum === 17 && dealerCards.some(c => c.type === "A" && c.value === 11);

  while (dealerSum < 17 || soft17) {
    dealerCards.push(drawCard());
    showCards("D", dealerCards);
    dealerSum = adjustForAces(dealerCards);
    soft17 = dealerSum === 17 && dealerCards.some(c => c.type === "A" && c.value === 11);
  }
}

function checkWinnerAndFinishGame() {
  if (!gameLive) return;
  gameLive = false;
  update(locations[0]);

  dealerPlay();
  userSum = adjustForAces(userCards);
  dealerSum = adjustForAces(dealerCards);

  if (userSum > 21) winner = "Dealer";
  else if (dealerSum > 21) winner = "Player";
  else if (userSum > dealerSum) winner = "Player";
  else if (dealerSum > userSum) winner = "Dealer";
  else winner = "Drawn";

  if (winner === "Player") {
    wins++;
    lossStreak = 0;
    money += Math.floor(bet * 1.9);
    textleft.innerText = "You Win!";
    textleft.style.color = "rgb(3,255,3)";
    playerWinSound.play().catch(()=>{});
  } else if (winner === "Dealer") {
    losses++;
    lossStreak++;
    textleft.innerText = "Dealer Wins";
    textleft.style.color = "red";
    dealerWinSound.play().catch(()=>{});
  } else {
    money += bet;
    textleft.innerText = "Push (Draw)";
    textleft.style.color = "#ffbd08";
    gameDrawnSound.play().catch(()=>{});
  }

  saveProgress();
}

function hold() {
  if (!gameLive) return;
  textleft.innerText = "Dealer's Turn...";
  dealerPlay();
  checkWinnerAndFinishGame();
}

function double() {
  if (!gameLive) return;
  if (money < bet) return alert("Not enough money!");
  money -= bet;
  bet *= 2;
  balance.innerText = money;
  textright.innerText = "Doubled Bet";
  drawUser();
  if (userSum <= 21) hold();
  saveProgress();
}

const locations = [
  {
    name: "Bet Menu",
    "button text": ["$100", "$500", "$1000"],
    "button functions": [() => betAmount(100), () => betAmount(500), () => betAmount(1000)],
    textleft: "Place Your Bet",
    textright: "Choose New Bet"
  },
  {
    name: "Game Menu",
    "button text": ["Draw", "Hold", "Double"],
    "button functions": [drawUser, hold, double],
    textleft: "Your Turn",
    textright: "Draw or Hold"
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
textleft.innerText = "Welcome to Blackjack";
textright.innerText = "Select a Bet";
saveProgress();
