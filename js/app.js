// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

class Card {
  constructor(id, symbolClass) {
    this.id = id;
    this.symbolClass = symbolClass;
    this.open = false;
  }
  static getPrefix() { return 'card'; }
  static getIdFromAttribute(idAttribute) { return Number(idAttribute.substr(Card.getPrefix().length)); }
  getIdAttribute() { return Card.getPrefix() + this.id; }
  getCardElement() { return $(`#${this.getIdAttribute()}`); }
  flip() {
    const cardElement = this.getCardElement();
    cardElement.toggleClass('opened');
    cardElement.removeClass('nomatch');
    this.open = !this.open;
  }
  setMatched(val) {
    // shake effect / uses 'jQuery UI' from index.html:
    this.getCardElement().effect(val ? "highlight" : "shake", { times: 2 }, 1000);
    this.getCardElement().toggleClass(val ? 'match' : 'nomatch');
  }
}

class Game {
  constructor() {
    this.cards = [];
    this.openCards = [];
    this.moves = 0;
    this.stars = 3;
    this.totalSeconds = 0;
    this.timerId = 0;
    this.updateCounters();
    this.updateTimer();
  }
  updateCounters() {
    $('.moves').text(this.moves);
    const self = this;
    $('.stars').children().each(function(index) {
      $(this).css('visibility', index >= self.stars ? 'hidden' : 'visible');
    });
  }
  addMove() {
    ++this.moves;
    const nbCards = this.cards.length;
    if (this.moves > nbCards)
      this.stars = 1;
    else if (this.moves > (nbCards / 2))
      this.stars = 2;
    this.updateCounters();
  }
  isFinished() {
    let count = 0;
    for (const card of this.cards) {
      if (card.open)
        ++count;
    }
    return count === this.cards.length;
  }
  openModal() {
    $('#stars').text(this.stars);
    $('#finishedModal').modal('toggle');
  }
  static pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
      return "0" + valString;
    } else {
      return valString;
    }
  }
  updateTimer() {
    $('.minutes').text(Game.pad(parseInt(this.totalSeconds / 60)));
    $('.seconds').text(Game.pad(this.totalSeconds % 60));
  }
  startTimer() {
    this.timerId = setInterval(() => {
      ++this.totalSeconds;
      this.updateTimer();
    }, 1000);
  }
  stopTimer() {
    clearInterval(this.timerId);
    this.timerId = 0;
  }
}

const buildGame = () => {
  const deck = $('.deck');
  deck.children().remove();
  //
  /*
   * Create a list that holds all of your cards
   */
  const symbols = [
    'fa-diamond',
    'fa-paper-plane-o',
    'fa-anchor',
    'fa-bolt',
    'fa-cube',
    'fa-leaf',
    'fa-bicycle',
    'fa-bomb',
  ];
  const cardSymbols = shuffle(symbols.concat(symbols));
  /*
   * Display the cards on the page
   *   - shuffle the list of cards using the provided "shuffle" method below
   *   - loop through each card and create its HTML
   *   - add each card's HTML to the page
   */
  const game = new Game();
  for (let i = 0; i < cardSymbols.length; ++i) {
    const card = new Card(i + 1, cardSymbols[i]);
    deck.append(`<li id="${card.getIdAttribute()}" class="card"><i class="fa ${card.symbolClass}"></i></li>`);
    game.cards.push(card);
  }
  /*
   * set up the event listener for a card. If a card is clicked:
   *  - display the card's symbol (put this functionality in another function that you call from this one)
   *  - add the card to a *list* of "open" cards (put this functionality in another function that you call from this one)
   *  - if the list already has another card, check to see if the two cards match
   *    + if the cards do match, lock the cards in the open position (put this functionality in another function that you call from this one)
   *    + if the cards do not match, remove the cards from the list and hide the card's symbol (put this functionality in another function that you call from this one)
   *    + increment the move counter and display it on the page (put this functionality in another function that you call from this one)
   *    + if all cards have matched, display a message with the final score (put this functionality in another function that you call from this one)
   */
  $('.card').click(event => {
    if (!game.timerId)
      game.startTimer();
    const idAttr = $(event.currentTarget).attr('id');
    const cardId = Card.getIdFromAttribute(idAttr);
    const card = game.cards[cardId - 1]; // cardId starts at 1
    if (card.open)
      return;
    if (game.openCards.length == 2)
      return;
    //
    card.flip();
    const openCards = game.openCards;
    openCards.push(card);
    if (openCards.length == 2) {
      game.addMove();
      const first = openCards[0];
      const second = openCards[1];
      const matched = first.symbolClass === second.symbolClass;
      first.setMatched(matched);
      second.setMatched(matched);
      setTimeout(() => {
        if (!matched) {
          first.flip();
          second.flip();
        }
        game.openCards = [];
        if (game.isFinished()) {
          game.stopTimer();
          game.openModal();
        }
      }, 1000);
    }
  });
  return game;
};

/*
provide a function to the jQuery object:
the body of the function is executed after the DOM is built
so it is safe to manipulate DOM elements in the body of this function
*/
$(() => {
  let game = buildGame();
  $('.restart').click(event => {
    game.stopTimer();
    game = buildGame();
  });
});

