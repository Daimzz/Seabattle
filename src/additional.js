function getRandomBetween(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function getRandomFrom(...args) {
  const index = Math.floor(Math.random() * args.length);
  return args[index];
}

//Если point находится внутри объекта element то возвращается true

function isUnderPoint(point, element) {
  const { left, top, width, height } = element.getBoundingClientRect();
  const { x, y } = point;
  return left <= x && x <= left + width && top <= y && y <= top + height;
}

//Устанавливаем слушатель события. Функция возвращает другую функцию которая удаляет данное событие

function addAndRemoveEventListener(element, ...args) {
  element.addEventListener(...args);
  return () => element.removeEventListener(...args);
}

//Генерация случайного количества чисел из массива по длине size

function getRandomSeveral(array, size) {
  if (size > array.length) {
    size = array.length;
  }
  let result = [];
  for (let i = 0; i < size; i++) {
    let randomIndex = Math.floor(Math.random() * array.length);
    result.push(array[randomIndex]);
  }
  return result;
}
