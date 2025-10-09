const {program} = require('commander');
const fs = require('fs');

program 
  .requiredOption('-i, --input <file>', 'Input file JSON')
  .option('-o, --output <file>', 'Way to file where save results')
  .option('-d, --display', 'Output in console')
  .option('-f, --furnished', 'Furnished house')
  .option('-p, --price <number>', 'price less then:', parseInt);

program.exitOverride();

try {
  program.parse(process.argv);
} catch (err) {
  // Якщо не вказано обов'язкову опцію
  if (err.code === 'commander.missingMandatoryOptionValue' || 
      err.message.includes('required option')) {
    console.error('ERROR: Please, specify input file -i');
    process.exit(1);
  }
  throw err;
}


const options = program.opts();

// Перевірка існування файлу
if (!fs.existsSync(options.input)) {
  console.error('Cannot find input file');
  process.exit(1);
}

// Перевірка чи є хоч одна опція обробки
if (!options.output && !options.display && !options.furnished && !options.price) {
  process.exit(0);
}

// Читання та парсинг JSON
let houses;
try {
  const rawData = fs.readFileSync(options.input, 'utf8');
  houses = JSON.parse(rawData);
} catch (error) {
  console.error('Cannot find input file');
  process.exit(1);
}

let filteredHouses = houses;

// Фільтрація по furnished
if (options.furnished) {
  filteredHouses = filteredHouses.filter(h => h.furnishingstatus === 'furnished');
}

// Фільтрація по ціні
if (options.price) {
  filteredHouses = filteredHouses.filter(h => h.price < options.price);
}

// Вивід в консоль
if (options.display) {
  filteredHouses.forEach(house => {
    console.log(`${house.price} ${house.area}`);
  });
}

// Запис у файл
if (options.output) {
  try {
    const outputData = filteredHouses.map(h => `${h.price} ${h.area}`);
    fs.writeFileSync(options.output, outputData.join("\n"), "utf8");
    console.log(`Результат записано у файл ${options.output}`);
  } catch (error) {
    console.error(`Помилка запису у файл: ${error.message}`);
    process.exit(1);
  }
}