//Массив данных о всех кораблях
const shipDatas = [
  { size: 4, direction: "row", startX: 10, startY: 345 },
  { size: 3, direction: "row", startX: 10, startY: 390 },
  { size: 3, direction: "row", startX: 120, startY: 390 },
  { size: 2, direction: "row", startX: 10, startY: 435 },
  { size: 2, direction: "row", startX: 88, startY: 435 },
  { size: 2, direction: "row", startX: 167, startY: 435 },
  { size: 1, direction: "row", startX: 10, startY: 480 },
  { size: 1, direction: "row", startX: 55, startY: 480 },
  { size: 1, direction: "row", startX: 100, startY: 480 },
  { size: 1, direction: "row", startX: 145, startY: 480 },
];

class PreparationScene extends Scene {
  draggedShip = null; //Корабль который мы перетаскиваем при зажатии левой кнопкой мыши
  //Дефолтное смещение координат курсора мыши и корабля
  draggedOffsetX = 0;
  draggedOffestY = 0;

  eventsToRemove = [];

  constructor(name, app) {
    super(name, app);
  }

  init() {
    //Вызываем по дефолту способ размещения кораблей вручную
    this.manually();
  }

  manually() {
    const { player } = this.app;
    //Удаляем корабли с поля если они есть
    player.removeAllShips();
    //Перебираем массив кораблей, создаем корабль с данными из массива
    for (const { size, direction, startX, startY } of shipDatas) {
      const ship = new ShipView(size, direction, startX, startY);
      player.addShip(ship);
    }
  }
  placeRandomShips() {
    const { player } = this.app;
    player.randomize(ShipView);
    for (let i = 0; i < 10; i++) {
      player.ships[i].startX = shipDatas[i].startX;
      player.ships[i].startY = shipDatas[i].startY;
    }
  }

  start() {
    //Обнуляем массив с эвентами при старте сцены
    this.eventsToRemove = [];

    const { player, opponent } = this.app;
    opponent.clear();
    player.removeAllShots();
    player.ships.forEach((ship) => (ship.killed = false));

    document
      .querySelectorAll(".app-actions")
      .forEach((element) => element.classList.add("hidden"));

    document
      .querySelector('[data-scene="preparation"]')
      .classList.remove("hidden");
    const manuallyButton = document.querySelector('[data-action="manually"]');
    const randomizeButton = document.querySelector('[data-action="randomize"]');
    const simpleButton = document.querySelector('[data-computer="simple"]');
    const middleButton = document.querySelector('[data-computer="middle"]');
    const hardButton = document.querySelector('[data-computer="hard"]');

    //Расставить корабли вручную
    const addRemoveManually = addAndRemoveEventListener(
      manuallyButton,
      "click",
      (e) => {
        this.manually();
      }
    );

    //Расставить корабли автоматически
    const addRemoveRandomize = addAndRemoveEventListener(
      randomizeButton,
      "click",
      (e) => {
        this.placeRandomShips();
      }
    );

    const addRemoveSimpleButton = addAndRemoveEventListener(
      simpleButton,
      "click",
      (e) => {
        this.startComputerLevel("simple");
      }
    );
    const addRemoveMiddleButton = addAndRemoveEventListener(
      middleButton,
      "click",
      (e) => {
        this.startComputerLevel("middle");
      }
    );
    const addRemoveHardButton = addAndRemoveEventListener(
      hardButton,
      "click",
      (e) => {
        this.startComputerLevel("hard");
      }
    );

    this.eventsToRemove.push(
      addRemoveManually,
      addRemoveRandomize,
      addRemoveSimpleButton,
      addRemoveMiddleButton,
      addRemoveHardButton
    );
  }

  stop() {
    for (const eventToRemove of this.eventsToRemove) {
      eventToRemove();
    }
  }

  update() {
    const { mouse, player } = this.app;

    // Перетаскивание корабля
    if (!this.draggedShip && mouse.left && !mouse.pLeft) {
      const ship = player.ships.find((ship) => ship.isUnder(mouse));
      if (ship) {
        const shipRect = ship.div.getBoundingClientRect();
        this.draggedShip = ship;

        //Определяем смещение координат от указателя мыши при "поднятии корабля" до края корабля
        //-> draggedOffsetX и draggedOffsetY координаты смещения по х и у

        this.draggedOffsetX = mouse.x - shipRect.left;
        this.draggedOffsetY = mouse.y - shipRect.top;

        //При перетаскивании кнопки "Играть против слабого" ... и тп. становятся disabled
        ship.x = null;
        ship.y = null;
      }
    }

    if (mouse.left && this.draggedShip) {
      const { left, top } = player.root.getBoundingClientRect();

      const x = mouse.x - left - this.draggedOffsetX;
      const y = mouse.y - top - this.draggedOffsetY;

      this.draggedShip.div.style.left = `${x}px`;
      this.draggedShip.div.style.top = `${y}px`;
    }

    // Бросание корабля на поле после перемещения

    if (!mouse.left && this.draggedShip) {
      const ship = this.draggedShip;
      this.draggedShip = null;
      //Вычисляем точку, которая будет браться за отсчет при размещении корабля на поле
      //Точкой будет середина первого "квадратика" корабля (или просто центром корабля если он однопалубный)
      const { left, top } = ship.div.getBoundingClientRect();
      const { width, height } = player.cells[0][0].getBoundingClientRect();

      const point = {
        x: left + width / 2,
        y: top + height / 2,
      };

      //Поиск ячейки в массиве cells[] которая будет являться местом броска корабля(первой палубы)
      const cell = player.cells
        .flat()
        .find((cell) => isUnderPoint(point, cell));
      if (cell) {
        const x = parseInt(cell.dataset.x);
        const y = parseInt(cell.dataset.y);
        //Удаляем корабль из массива и добавляем корабль с координатами (это создает эффект магнитизма при отпускании корабля на поле)
        player.removeShip(ship);
        player.addShip(ship, x, y);
      } else {
        //Если бросаем корабль вне игрового поля
        player.removeShip(ship);
        player.addShip(ship);
      }
    }

    // Вращение корабля колесом мыши
    if (this.draggedShip && mouse.delta) {
      this.draggedShip.toggleDirection();
    }
    if (player.complete) {
      document.querySelector('[data-computer="simple"]').disabled = false;
      document.querySelector('[data-computer="middle"]').disabled = false;
      document.querySelector('[data-computer="hard"]').disabled = false;
    } else {
      document.querySelector('[data-computer="simple"]').disabled = true;
      document.querySelector('[data-computer="middle"]').disabled = true;
      document.querySelector('[data-computer="hard"]').disabled = true;
    }
  }

  startComputerLevel(level) {
    const matrix = this.app.player.matrix;

    //Получаем клетки поля, в которых нет кораблей

    const freeCells = matrix.flat().filter((cell) => !cell.ship);

    let untouchables = [];

    //В зависимости от количества свободных клеток выбирается уровень компьютера
    //Чем меньше клеток доступных для выстрела компьютера, тем выше уровень сложности

    if (level === "simple") {
      untouchables = getRandomSeveral(freeCells, 5);
    } else if (level === "middle") {
      untouchables = getRandomSeveral(freeCells, 25);
    } else if (level === "hard") {
      untouchables = getRandomSeveral(freeCells, 50);
    }

    this.app.start("computer", untouchables);
  }
}
