const currencySymbol = '฿';
const supportedCurrencySymbol = 'THB';

// Заменяем символ, если он не поддерживается
const processedCurrency = currencySymbol === '฿' ? supportedCurrencySymbol : currencySymbol;

const fonts = {
  Inter: {
        normal: '../fonts/Inter_18pt-Regular.ttf',
        bold: '../fonts/Inter_18pt-Bold.ttf',
        italics: '../fonts/Inter_18pt-Italic.ttf',
        
      },
}
// Функция для преобразования данных в плоскую структуру
function flattenMenuData(menuData) {
  const flatData = [];

  if (menuData.content && Array.isArray(menuData.content)) {
    const categories = menuData.content[0].subItems; // Извлекаем массив категорий

    categories.forEach((category) => {
      const categoryName = category.catName;

      category.subItems.forEach((subCategory) => {
        const subCategoryName = subCategory.subcatName;

        subCategory.subItems.forEach((item) => {
          flatData.push({
            category: categoryName,
            subCategory: subCategoryName,
            itemName: item.itemName,
            price: item.price,
            description: item.description || '',
          });
        });
      });
    });
  }

  return flatData;
}

// Функция для отображения меню в браузере
function displayMenu(menuData) {
  const flatMenu = flattenMenuData(menuData);
  const menuContainer = document.getElementById('menu');
  menuContainer.innerHTML = ''; // Очищаем контейнер

  let currentCategory = '';
  let currentSubCategory = '';

  flatMenu.forEach((item) => {
    if (currentCategory !== item.category) {
      currentCategory = item.category;
      menuContainer.innerHTML += `<h2 class="text-2xl font-bold mt-6">${currentCategory}</h2>`;
    }

    if (currentSubCategory !== item.subCategory) {
      currentSubCategory = item.subCategory;
      menuContainer.innerHTML += `<h3 class="text-xl font-semibold mt-4">${currentSubCategory}</h3>`;
    }

    menuContainer.innerHTML += `
      <div class="mb-2">
        <p class="text-sm font-medium">${item.itemName} — ${item.price} ฿</p>
        <p class="text-xs text-gray-600">${item.description}</p>
      </div>
    `;
  });
}

// Функция для генерации PDF
function generatePDF(menuData) {
  pdfMake.fonts = {
    Inter: {
      normal: 'Inter_18pt-Regular.ttf',
      bold: 'Inter_18pt-Bold.ttf',
      italics: 'Inter_18pt-Italic.ttf',
    },
  };

  const flatMenu = flattenMenuData(menuData);

  const content = [];
  let currentCategory = '';
  let currentSubCategory = '';
  let currentColumn = 'left'; // Текущая колонка: left или right
  let columns = { left: [], right: [] }; // Колонки для заполнения

  flatMenu.forEach((item, index) => {
    // Если новая категория, добавляем заголовок и линию
    if (currentCategory !== item.category) {
      if (columns.left.length > 0 || columns.right.length > 0) {
        // Добавляем заполненные колонки в контент
        content.push({
          columns: [
            { stack: columns.left, width: '50%' },
            { stack: columns.right, width: '50%' },
          ],
          margin: [0, 0, 0, 20],
          columnGap: 20,
        });

        columns = { left: [], right: [] }; // Сбрасываем колонки
      }

      currentCategory = item.category;
      currentSubCategory = '';
      currentColumn = 'left'; // Начинаем с левой колонки

      // Заголовок категории и подчеркивание
      content.push(
        { text: currentCategory, style: 'header', pageBreak: index !== 0 ? 'before' : '' },
        {
          canvas: [
            { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#CBCBCB' },
          ],
          margin: [0, 5, 0, 10],
        }
      );
    }

    // Если новая подкатегория, добавляем её заголовок в текущую колонку
    if (currentSubCategory !== item.subCategory) {
      currentSubCategory = item.subCategory;

      const subcategoryContent = [
        { text: currentSubCategory, style: 'subheader', margin: [0, 10, 0, 5] },
        { text: `${item.itemName} — ${item.price} ${currencySymbol}`, style: 'itemContent' },
        item.description
          ? { text: item.description, style: 'description', margin: [0, 0, 0, 5] }
          : null,
      ].filter(Boolean);

      // Проверяем, куда добавить контент: в левую или правую колонку
      if (currentColumn === 'left') {
        if (columns.left.length + subcategoryContent.length > 30) {
          currentColumn = 'right';
          columns.right.push(...subcategoryContent);
          
        } else {
          columns.left.push(...subcategoryContent);
        }
      } else {
        columns.right.push(...subcategoryContent);
        
      }
    } else {
      // Добавляем элементы меню в текущую колонку
      const menuItem = [
        { text: `${item.itemName} — ${item.price} ${currencySymbol}`, style: 'itemContent' },
        item.description
          ? { text: item.description, style: 'description', margin: [0, 0, 0, 5] }
          : null,
      ].filter(Boolean);

      if (currentColumn === 'left') {
        columns.left.push(...menuItem);
      } else {
        columns.right.push(...menuItem);
      }
    }
  });

  // Добавляем последние колонки в контент
  if (columns.left.length > 0 || columns.right.length > 0) {
    content.push({
      columns: [
        { stack: columns.left, width: '50%' },
        { stack: columns.right, width: '50%' },
      ],
      columnGap: 20,
      margin: [0, 0, 0, 20],
    });
  }

  // Генерация PDF-документа
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40], // Паддинги по 40 пикселей
    content: content,
    styles: {
      header: { fontSize: 18, bold: true, margin: [0, 10, 0, 5] },
      subheader: { fontSize: 16, bold: true, margin: [0, 5, 0, 5] },
      itemContent: { fontSize: 12 },
      description: { fontSize: 10, italics: true },
    },
    defaultStyle: {
      font: 'Inter',
    },
  };

  pdfMake.createPdf(docDefinition).download('menu.pdf');
}

// Загрузка данных из файла JSON и запуск функций
fetch('./data.json')
  .then((response) => response.json())
  .then((data) => {
    console.log("Загруженные данные:", data);
    displayMenu(data); // Отображаем меню в браузере

    document.getElementById('downloadPDF').addEventListener('click', () => {
      generatePDF(data); // Генерация PDF по клику
    });
  })
  .catch((error) => console.error('Ошибка при загрузке данных:', error));

