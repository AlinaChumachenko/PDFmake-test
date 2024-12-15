fetch('./data.json')
  .then((response) => response.json())
  .then((data) => {
    const menuContainer = document.getElementById('menu');
  

    data.menu.forEach((section) => {
      // Створюємо розділ
      const sectionDiv = document.createElement('div');
      sectionDiv.className = 'mb-10';

      // Додаємо заголовок розділу
      const sectionTitle = document.createElement('h2');
      sectionTitle.className = 'text-2xl font-bold mb-4 ';
      sectionTitle.textContent = section.section;

      // Контейнер для карток
      const itemsDiv = document.createElement('div');
      itemsDiv.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ';

      section.items.forEach((item) => {
        // Створюємо картку
        const itemDiv = document.createElement('div');
        itemDiv.className = 'p-4 bg-white shadow-md rounded-lg ';

        // Наповнення картки
        itemDiv.innerHTML = `
          <h3 class="text-lg font-semibold mb-2">${item.title}</h3>
          <p class="text-sm text-red-600">${item.description}</p>
          <p class="text-sm text-red-500">${item.weight}</p>
          <p class="text-lg font-bold mt-2">${item.price}</p>
        `;

        itemsDiv.appendChild(itemDiv);
      });

      sectionDiv.appendChild(sectionTitle);
      sectionDiv.appendChild(itemsDiv);
      menuContainer.appendChild(sectionDiv);
    });
  });

  function generatePDF(menuData) {
    const docDefinition = {
      background: function(currentPage, pageSize) {
        return `page ${currentPage} with size ${pageSize.width} x ${pageSize.height}`
      },
      content: [
        // Додаємо текст меню
        ...menuData.menu.map((section) => [
          { text: section.section, style: 'header', margin: [0, 10, 0, 5] },
          ...section.items.map((item) => ({
            text: `${item.title} (${item.weight}) — ${item.price}\n${item.description}`,
            style: 'itemContent',
            margin: [0, 10]
          }))
        ]).flat(),
      ],
      styles: {
        header: { 
          fontSize: 18, 
          bold: true, 
          color: '#000000', 
          margin: [0, 10] 
        },
        itemContent: { 
          fontSize: 12, 
          color: '#000000', 
          margin: [0, 10] 
        },
      },
      pageMargins: [20, 20, 20, 20], // Відступи для кожної сторінки
      pageSize: 'A4',
    };
  
    // Створюємо та завантажуємо PDF
    pdfMake.createPdf(docDefinition).download('menu.pdf');
  }
  
  document.getElementById('downloadPDF').addEventListener('click', () => {
    fetch('./data.json')
      .then((response) => response.json())
      .then((data) => {
        generatePDF(data);
      });
  });
    
  

  // function generatePDF(menuData) {
  //   const docDefinition = {
  //     content: menuData.menu.map((section) => [
  //       { text: section.section, style: 'header', margin: [0, 10, 0, 5] },
  //       ...section.items.map((item) => ({
  //         text: `${item.title} (${item.weight}) — ${item.price}\n${item.description}`,
  //         margin: [0, 0, 0, 10]
  //       }))
  //     ]).flat(),
  //     styles: {
  //       header: { fontSize: 18, bold: true }
  //     }
  //   };
  
  //   pdfMake.createPdf(docDefinition).download('menu.pdf');
  // }
  
  // document.getElementById('downloadPDF').addEventListener('click', () => {
  //   fetch('./data.json')
  //     .then((response) => response.json())
  //     .then((data) => {
  //       generatePDF(data);
  //     });
  // });
