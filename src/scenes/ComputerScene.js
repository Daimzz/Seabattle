class ComputerScene extends Scene {
  untouchables = []; //Клетки в которые компьютер не будет стрелять
  playerTurn = true;
  status = null;
  computerLevel = null;
  eventsToRemove = [];

  init() {
    this.status = document.querySelector(".battlefield-status");
  }

  start() {
    this.eventsToRemove = [];
    this.init();
    const { opponent } = this.app;

    document
      .querySelectorAll(".app-actions")
      .forEach((element) => element.classList.add("hidden"));

    document
      .querySelector('[data-scene="computer"]')
      .classList.remove("hidden");

    const againBtn = document.querySelector('[data-action="again"]');

    againBtn.classList.add("hidden");
    const giveUpBtn = document.querySelector('[data-action="giveup"]');
    giveUpBtn.classList.remove("hidden");

    const addRemoveAgainBtn = addAndRemoveEventListener(
      againBtn,
      "click",
      () => {
        this.app.start("preparation");
      }
    );
    const addRemoveGiveUpBtn = addAndRemoveEventListener(
      giveUpBtn,
      "click",
      () => {
        this.app.start("preparation");
      }
    );

    this.eventsToRemove.push(addRemoveAgainBtn, addRemoveGiveUpBtn);

    opponent.clear();
    opponent.randomize(ShipView);
  }
  update() {
    const { player, opponent, mouse } = this.app;

    const isEnd = player.lose || opponent.lose;

    const cells = opponent.cells.flat();
    cells.forEach((cell) => cell.classList.remove("battlefield-item__active"));

    if (isEnd) {
      const againBtn = document.querySelector('[data-action="again"]');
      againBtn.classList.remove("hidden");
      const giveUpBtn = document.querySelector('[data-action="giveup"]');
      giveUpBtn.classList.add("hidden");

      if (opponent.lose) {
        this.status.textContent = "Вы победили!";
      } else {
        this.status.textContent = "Компьютер победил";
      }

      this.stop();
      return;
    }

    const cell = cells.find((cell) => {
      return isUnderPoint(mouse, cell);
    });
    if (isUnderPoint(mouse, opponent.table)) {
      if (cell) {
        cell.classList.add("battlefield-item__active");

        //Логика хода игрока

        if (this.playerTurn && mouse.left && !mouse.pLeft) {
          const x = parseInt(cell.dataset.x);
          const y = parseInt(cell.dataset.y);

          const shot = new ShotView(x, y);

          const result = opponent.addShot(shot);

          if (result) {
            if (shot.variant === "wounded" || shot.variant === "killed") {
              this.playerTurn = true;
            } else {
              this.playerTurn = false;
            }
          }
        }
      }
    }

    //Логика хода компьютера

    if (!this.playerTurn) {
      if (opponent.lose) {
        console.log("Opponent is loser");
      }
      const x = getRandomBetween(0, 9);
      const y = getRandomBetween(0, 9);

      let inUntouchables = false;

      for (const item of this.untouchables) {
        if (item.x === x && item.y === y) {
          inUntouchables = true;
          break;
        }
      }
      if (!inUntouchables) {
        const shot = new ShotView(x, y);
        const result = player.addShot(shot);

        if (result) {
          if (shot.variant === "wounded" || shot.variant === "killed") {
            this.playerTurn = false;
          } else {
            this.playerTurn = true;
          }
        }
      }
    }
    if (this.playerTurn) {
      this.status.textContent = "Ваш ход";
    } else {
      this.status.textContent = "Ход соперника";
    }
  }

  stop() {
    //  for (const eventToRemove of this.eventsToRemove) {
    //    eventToRemove();
    //  }

    const againBtn = document.querySelector('[data-action="again"]');

    const giveUpBtn = document.querySelector('[data-action="giveup"]');

    const addRemoveAgainBtn = addAndRemoveEventListener(
      againBtn,
      "click",
      () => {
        this.app.start("preparation");
      }
    );
    const addRemoveGiveUpBtn = addAndRemoveEventListener(
      giveUpBtn,
      "click",
      () => {
        this.app.start("preparation");
      }
    );

    this.eventsToRemove.push(addRemoveAgainBtn, addRemoveGiveUpBtn);
  }
}
