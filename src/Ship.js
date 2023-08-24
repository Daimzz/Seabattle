class Ship {
  size = null; //Размер корабля
  direction = null; // Расположение корабля (row/column)
  killed = false; // Уничтожен ли корабль

  x = null;
  y = null;

  //Метод устанавливает дефолтное размещение кораблей в "доке"
  //Размещен ли корабль в игровом поле
  get placed() {
    return this.x !== null && this.y !== null;
  }

  constructor(size, direction) {
    this.size = size;
    this.direction = direction;
  }
}
