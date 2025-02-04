(function() {
    // Инициализация Flatpickr для выбора диапазона дат
    flatpickr("#dateRange", {
        mode: "range",
        dateFormat: "Y-m-d",
        allowInput: true
    });

    // Данные пользователей
    const users = [
        { username: "JohnDoe", email: "john@example.com", date: "2023-01-15" },
        { username: "AliceSmith", email: "alice@example.com", date: "2023-02-20" },
        { username: "BobWilson", email: "bob@example.com", date: "2023-03-10" },
        { username: "EvaBrown", email: "eva@example.com", date: "2023-04-05" }
    ];

    // Состояние сортировки и фильтрации
    let currentSort = { field: 'username', order: 'asc' };
    let currentFilter = null;

    // Кэширование DOM-элементов
    const usersTable = document.getElementById('usersTable');
    const dataTable = document.getElementById('dataTable');
    const dataInput = document.getElementById('dataInput');
    const connectButton = document.getElementById('connectButton');
    const connectText = document.getElementById('connectText');
    const browseButton = document.getElementById('browseButton');
    const exportButton = document.getElementById('exportButton');
    const sortButton = document.getElementById('sortButton');
    const filterButton = document.getElementById('filterButton');

    // Модальные окна и их кнопки
    const sortModal = document.getElementById('sortModal');
    const filterModal = document.getElementById('filterModal');
    const applySortButton = document.getElementById('applySortButton');
    const cancelSortButton = document.getElementById('cancelSortButton');
    const applyFilterButton = document.getElementById('applyFilterButton');
    const clearFilterButton = document.getElementById('clearFilterButton');
    const cancelFilterButton = document.getElementById('cancelFilterButton');

    // Инициализация таблицы
    function initTable() {
        updateTable();
    }

    // Обновление таблицы пользователей
    function updateTable() {
        let filteredUsers = currentFilter ? users.filter(currentFilter) : [...users];

        filteredUsers.sort((a, b) => {
            const field = currentSort.field;
            const order = currentSort.order === 'asc' ? 1 : -1;
            return a[field].localeCompare(b[field]) * order;
        });

        usersTable.innerHTML = filteredUsers.map(user => `
      <tr>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.date}</td>
      </tr>
    `).join('');
    }

    // Подключение кошелька
    async function connectWallet() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                const account = accounts[0];
                connectText.textContent = `${account.slice(0,6)}...${account.slice(-4)}`;
            } catch (error) {
                console.error('Connection error:', error);
                alert('Error connecting wallet');
            }
        } else {
            alert('Please install MetaMask!');
        }
    }

    // Экспорт данных из таблицы "Retrieved Data"
    function exportData() {
        const data = [];
        const rows = dataTable.querySelectorAll('tr');

        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            data.push({
                field: cells[0].textContent,
                value: cells[1].textContent
            });
        });

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'exported-data.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Создание скрытого input для загрузки файлов
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'hiddenFileInput';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    browseButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', handleFileUpload);

    function handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const jsonData = JSON.parse(e.target.result);
                dataInput.value = JSON.stringify(jsonData, null, 2);
                updateDataTable(jsonData);
            } catch (error) {
                alert('Error parsing JSON file');
                console.error('File error:', error);
            }
        };
        reader.readAsText(file);
    }

    // Обновление таблицы "Retrieved Data"
    function updateDataTable(data) {
        dataTable.innerHTML = Object.entries(data).map(([key, value]) => `
      <tr>
        <td>${key}</td>
        <td>${value}</td>
      </tr>
    `).join('');
    }

    // Функции для показа и закрытия модальных окон
    function showModal(modal) {
        modal.style.display = 'block';
    }

    function closeModal() {
        [sortModal, filterModal].forEach(modal => {
            modal.style.display = 'none';
        });
    }

    // Сортировка пользователей
    function applySort() {
        const sortField = document.getElementById('sortField').value;
        const sortOrder = document.getElementById('sortOrder').value;
        currentSort = { field: sortField, order: sortOrder };
        updateTable();
        closeModal();
    }

    // Фильтрация пользователей
    function applyFilter() {
        const username = document.getElementById('usernameFilter').value.toLowerCase();
        const dates = document.getElementById('dateRange').value.split(' to ');

        currentFilter = user => {
            const nameMatch = user.username.toLowerCase().includes(username);
            const dateMatch = dates.length < 2 || (
                    new Date(user.date) >= new Date(dates[0]) &&
                    new Date(user.date) <= new Date(dates[1])
            );
            return nameMatch && dateMatch;
        };

        updateTable();
        closeModal();
    }

    function clearFilter() {
        currentFilter = null;
        document.getElementById('usernameFilter').value = '';
        document.getElementById('dateRange').value = '';
        updateTable();
        closeModal();
    }

    // Обработчик клавиши Escape для закрытия модальных окон
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeModal();
        }
    });

    // Назначение обработчиков событий для кнопок модальных окон
    applySortButton.addEventListener('click', applySort);
    cancelSortButton.addEventListener('click', closeModal);
    applyFilterButton.addEventListener('click', applyFilter);
    clearFilterButton.addEventListener('click', clearFilter);
    cancelFilterButton.addEventListener('click', closeModal);

    // Назначение основных обработчиков событий
    connectButton.addEventListener('click', connectWallet);
    exportButton.addEventListener('click', exportData);
    sortButton.addEventListener('click', () => showModal(sortModal));
    filterButton.addEventListener('click', () => showModal(filterModal));

    // Инициализация таблицы после загрузки документа
    document.addEventListener('DOMContentLoaded', initTable);
})();
