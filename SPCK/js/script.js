// js/script.js

let allPlayers = []; // Biến để lưu trữ tất cả dữ liệu cầu thủ
const playersGrid = document.getElementById('playersGrid');
const playerSearchInput = document.getElementById('playerSearchInput');
const positionFilter = document.getElementById('positionFilter');
const overallFilter = document.getElementById('overallFilter');
const overallValueSpan = document.getElementById('overallValue');
const potentialFilter = document.getElementById('potentialFilter');
const potentialValueSpan = document.getElementById('potentialValue');
const applyFiltersButton = document.getElementById('applyFiltersButton');
const listTitle = document.getElementById('listTitle');
const noResultsDiv = document.getElementById('noResults');
const mobileMenuButton = document.getElementById('mobileMenuButton');
const mobileMenu = document.getElementById('mobileMenu');

// Hàm tải dữ liệu cầu thủ từ file JSON
async function loadPlayers() {
    try {
        // Đảm bảo đường dẫn này khớp với cấu trúc thư mục của bạn
        const response = await fetch('data/fifa19_players.json');
        if (!response.ok) {
            // Ném lỗi rõ ràng hơn nếu có vấn đề về đường dẫn/tải file
            throw new Error(`HTTP error! status: ${response.status}. Could not load JSON file. Check path 'data/fifa19_players.json' and ensure you are running a local server.`);
        }
        allPlayers = await response.json();
        console.log('Dữ liệu cầu thủ đã tải:', allPlayers.length);
        filterPlayers(); // Gọi filterPlayers để hiển thị cầu thủ ban đầu dựa trên các bộ lọc mặc định
    } catch (error) {
        console.error('Lỗi khi tải dữ liệu cầu thủ:', error);
        playersGrid.innerHTML = '<p class="col-span-full text-center text-red-400">Không thể tải dữ liệu cầu thủ. Vui lòng kiểm tra file JSON và đường dẫn (hoặc chạy qua local server).</p>';
    }
}

// Hàm tạo và hiển thị thẻ cầu thủ
function createPlayerCard(player) {
    const card = document.createElement('div');
    card.classList.add('bg-gray-700', 'rounded-lg', 'shadow-md', 'p-4', 'flex', 'flex-col', 'items-center', 'text-center', 'transform', 'hover:scale-105', 'transition-transform', 'duration-300');
    card.setAttribute('data-player-id', player.sofifa_id); // Dùng để định danh cầu thủ

    // Lấy các chỉ số chính một cách an toàn
    const pace = player.pace !== undefined && player.pace !== null ? player.pace : 'N/A';
    const shooting = player.shooting !== undefined && player.shooting !== null ? player.shooting : 'N/A';
    const passing = player.passing !== undefined && player.passing !== null ? player.passing : 'N/A';
    const dribbling = player.dribbling !== undefined && player.dribbling !== null ? player.dribbling : 'N/A';
    const defending = player.defending !== undefined && player.defending !== null ? player.defending : 'N/A';
    const physical = player.physical !== undefined && player.physical !== null ? player.physical : 'N/A';

    // Xử lý player_face_url nếu không có
    const playerImageUrl = player.player_face_url || 'https://via.placeholder.com/120x120?text=Player';

    card.innerHTML = `
        <img src="${playerImageUrl}" alt="${player.short_name}" class="w-28 h-28 rounded-full object-cover mb-4 border-2 border-blue-500 shadow-md">
        <h3 class="text-xl font-bold text-white mb-1">${player.short_name}</h3>
        <p class="text-md text-gray-300 mb-2">Vị trí: ${player.player_positions} | OVR: ${player.overall} | POT: ${player.potential}</p>
        <div class="grid grid-cols-2 gap-2 w-full text-sm text-gray-200">
            <div class="bg-gray-600 rounded-md p-1">Tốc độ: ${pace}</div>
            <div class="bg-gray-600 rounded-md p-1">Dứt điểm: ${shooting}</div>
            <div class="bg-gray-600 rounded-md p-1">Chuyền: ${passing}</div>
            <div class="bg-gray-600 rounded-md p-1">Rê bóng: ${dribbling}</div>
            <div class="bg-gray-600 rounded-md p-1">Phòng ngự: ${defending}</div>
            <div class="bg-gray-600 rounded-md p-1">Thể chất: ${physical}</div>
        </div>
        <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full transition-colors duration-200 shadow-md view-details-btn" data-player-id="${player.sofifa_id}">
            Xem chi tiết
        </button>
    `;
    return card;
}

// Hàm hiển thị danh sách cầu thủ
function displayPlayers(playersToDisplay) {
    playersGrid.innerHTML = ''; // Xóa các thẻ cầu thủ hiện có
    if (playersToDisplay.length === 0) {
        noResultsDiv.classList.remove('hidden');
    } else {
        noResultsDiv.classList.add('hidden');
        playersToDisplay.forEach(player => {
            const card = createPlayerCard(player);
            playersGrid.appendChild(card);
        });
    }
}

// Hàm tìm kiếm và lọc cầu thủ
function filterPlayers() {
    const searchTerm = playerSearchInput.value.toLowerCase().trim();
    const selectedPosition = positionFilter.value;
    const minOverall = parseInt(overallFilter.value);
    const minPotential = parseInt(potentialFilter.value);

    let filteredPlayers = allPlayers.filter(player => {
        const matchesSearch = player.long_name.toLowerCase().includes(searchTerm) ||
                              player.short_name.toLowerCase().includes(searchTerm);

        const matchesPosition = selectedPosition === '' || player.player_positions.split(', ').some(pos => pos === selectedPosition);

        const matchesOverall = player.overall >= minOverall;
        const matchesPotential = player.potential >= minPotential;

        return matchesSearch && matchesPosition && matchesOverall && matchesPotential;
    });

    // Cập nhật tiêu đề danh sách
    if (searchTerm !== '' || selectedPosition !== '' || minOverall > 60 || minPotential > 60) {
        listTitle.textContent = 'Kết Quả Tìm Kiếm';
    } else {
        listTitle.textContent = 'Đề Xuất';
    }

    displayPlayers(filteredPlayers);
}

// Cập nhật giá trị hiển thị của range input và lọc lại ngay lập tức
overallFilter.addEventListener('input', () => {
    overallValueSpan.textContent = overallFilter.value;
    filterPlayers();
});

potentialFilter.addEventListener('input', () => {
    potentialValueSpan.textContent = potentialFilter.value;
    filterPlayers();
});

// Lắng nghe sự kiện tìm kiếm và lọc
playerSearchInput.addEventListener('keyup', filterPlayers); // Lọc ngay khi người dùng gõ
positionFilter.addEventListener('change', filterPlayers); // Lọc khi thay đổi vị trí
applyFiltersButton.addEventListener('click', filterPlayers); // Lọc khi nhấn nút Áp dụng Bộ lọc

// Xử lý menu mobile
mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// Tải dữ liệu khi trang được load
document.addEventListener('DOMContentLoaded', loadPlayers);

// Để xử lý "Xem chi tiết" (sẽ cần trang chi tiết cầu thủ riêng)
playersGrid.addEventListener('click', (event) => {
    const targetButton = event.target.closest('.view-details-btn');
    if (targetButton) {
        const playerId = targetButton.dataset.playerId;
        alert(`Bạn muốn xem chi tiết cầu thủ có ID: ${playerId}. Chức năng này sẽ được phát triển sau.`);
    }
});