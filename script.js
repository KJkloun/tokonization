// Инициализация Flatpickr
flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    allowInput: true
});

// Данные пользователей
let users = [
    { username: "JohnDoe", email: "john@example.com", date: "2023-01-15" },
    { username: "AliceSmith", email: "alice@example.com", date: "2023-02-20" },
    { username: "BobWilson", email: "bob@example.com", date: "2023-03-10" },
    { username: "EvaBrown", email: "eva@example.com", date: "2023-04-05" }
];

// Состояние сортировки и фильтрации
let currentSort = { field: 'username', order: 'asc' };
let currentFilter = null;

// Инициализация таблицы
function initTable() {
    updateTable();
}

// Обновление таблицы
function updateTable() {
    let filteredUsers = currentFilter ? users.filter(currentFilter) : [...users];

    filteredUsers.sort((a, b) => {
        const field = currentSort.field;
        const order = currentSort.order === 'asc' ? 1 : -1;
        return a[field].localeCompare(b[field]) * order;
    });

    const tbody = document.getElementById('usersTable');
    tbody.innerHTML = filteredUsers.map(user => `
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
            document.getElementById('connectText').textContent =
                    `${account.slice(0,6)}...${account.slice(-4)}`;
        } catch (error) {
            console.error('Connection error:', error);
            alert('Error connecting wallet');
        }
    } else {
        alert('Please install MetaMask!');
    }
}

// Экспорт данных
function exportData() {
    const data = [];
    const rows = document.querySelectorAll('#dataTable tr');

    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        data.push({
            field: cells[0].textContent,
            value: cells[1].textContent
        });
    });

    const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'exported-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Загрузка файлов
document.getElementById('browseButton').addEventListener('click', () => {
    document.getElementById('hiddenFileInput').click();
});

const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.id = 'hiddenFileInput';
fileInput.style.display = 'none';
document.body.appendChild(fileInput);

fileInput.addEventListener('change', handleFileUpload);

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const jsonData = JSON.parse(e.target.result);
            document.getElementById('dataInput').value = JSON.stringify(jsonData, null, 2);
            updateDataTable(jsonData);
        } catch (error) {
            alert('Error parsing JSON file');
            console.error('File error:', error);
        }
    };
    reader.readAsText(file);
}

function updateDataTable(data) {
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = Object.entries(data).map(([key, value]) => `
      <tr>
          <td>${key}</td>
          <td>${value}</td>
      </tr>
    `).join('');
}

// Сортировка
function showSortModal() {
    document.getElementById('sortModal').style.display = 'block';
}

function applySort() {
    currentSort = {
        field: document.getElementById('sortField').value,
        order: document.getElementById('sortOrder').value
    };
    updateTable();
    closeModal();
}

// Фильтрация
function showFilterModal() {
    document.getElementById('filterModal').style.display = 'block';
}

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

// Закрытие модальных окон
function closeModal() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

// Обработчики событий
document.getElementById('connectButton').addEventListener('click', connectWallet);
document.getElementById('exportButton').addEventListener('click', exportData);
document.getElementById('sortButton').addEventListener('click', showSortModal);
document.getElementById('filterButton').addEventListener('click', showFilterModal);

// Инициализация
document.addEventListener('DOMContentLoaded', initTable);
