// app.js
let allData = [];
let currentFilters = {
    continent: '',
    country: '',
    region: '',
    school: '',
    department: ''
};
let sortColumn = null;
let sortDirection = 'asc';

// 初始化筛选器
function initFilters() {
    // 获取所有唯一值
    const uniqueContinents = [...new Set(allData.map(item => item['洲域']))];

    // 填充选择器
    const continentSelect = document.getElementById('continent');
    uniqueContinents.forEach(continent => {
        const option = document.createElement('option');
        option.value = continent;
        option.textContent = continent;
        continentSelect.appendChild(option);
    });

    // 为选择器添加事件监听器
    setupFilterListeners();

    // 为表头添加排序事件监听器
    setupSortListeners();

    // 添加搜索框事件监听器
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', handleSearch);
}

function setupFilterListeners() {
    // 为每个选择器添加变化事件
    document.querySelectorAll('.filter-select').forEach(select => {
        select.addEventListener('change', handleFilterChange);
    });

    // 重置按钮事件
    document.getElementById('reset-filter').addEventListener('click', resetFilters);
}

function handleFilterChange() {
    const selectedId = this.id;
    const selectedValue = this.value;

    // 更新当前筛选条件
    currentFilters[selectedId] = selectedValue;

    // 根据当前选择更新下一级选择器
    updateNextSelect(selectedId, selectedValue);

    // 根据筛选条件筛选数据并渲染表格
    filterAndRenderTable();
}

function updateNextSelect(currentSelectId, currentValue) {
    // 根据当前选择的值更新下一级选择器
    const nextSelectId = getNextSelectId(currentSelectId);
    if (!nextSelectId) return;

    const nextSelect = document.getElementById(nextSelectId);

    // 如果当前选择没有值，清空下一级选择器
    if (!currentValue) {
        nextSelect.innerHTML = '<option value="">选择' + nextSelectId.replace('&', '&amp;') + '</option>';
        return;
    }

    // 筛选数据以获取下一级的唯一值
    let filteredData = [...allData];
    if (currentFilters.continent) filteredData = filteredData.filter(item => item['洲域'] === currentFilters.continent);
    if (currentFilters.country) filteredData = filteredData.filter(item => item['国家&地区'] === currentFilters.country);
    if (currentFilters.region) filteredData = filteredData.filter(item => item['行政区域'] === currentFilters.region);
    if (currentFilters.school) filteredData = filteredData.filter(item => item['学校'] === currentFilters.school);

    const nextField = getFieldBySelectId(nextSelectId);
    const uniqueValues = [...new Set(filteredData.map(item => item[nextField]))];

    // 更新下一级选择器
    nextSelect.innerHTML = '<option value="">选择' + nextSelectId.replace('&', '&amp;') + '</option>';
    uniqueValues.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        nextSelect.appendChild(option);
    });

    // 重置下一级以后的所有筛选条件
    resetSubsequentFilters(nextSelectId);
}

function getFieldBySelectId(selectId) {
    switch(selectId) {
        case 'continent': return '洲域';
        case 'country': return '国家&地区';
        case 'region': return '行政区域';
        case 'school': return '学校';
        case 'department': return '院系';
        default: return '';
    }
}

function getNextSelectId(currentSelectId) {
    const order = ['continent', 'country', 'region', 'school', 'department'];
    const currentIndex = order.indexOf(currentSelectId);
    if (currentIndex >= 0 && currentIndex < order.length - 1) {
        return order[currentIndex + 1];
    }
    return null;
}

function resetSubsequentFilters(startId) {
    const order = ['continent', 'country', 'region', 'school', 'department'];
    const startIndex = order.indexOf(startId);
    if (startIndex >= 0) {
        for (let i = startIndex; i < order.length; i++) {
            const select = document.getElementById(order[i]);
            select.selectedIndex = 0;
            currentFilters[order[i]] = '';
        }
    }
}

function filterAndRenderTable() {
    // 获取所有选择器的当前值
    const { continent, country, region, school, department } = currentFilters;

    // 筛选数据
    let filteredData = [...allData];
    if (continent) filteredData = filteredData.filter(item => item['洲域'] === continent);
    if (country) filteredData = filteredData.filter(item => item['国家&地区'] === country);
    if (region) filteredData = filteredData.filter(item => item['行政区域'] === region);
    if (school) filteredData = filteredData.filter(item => item['学校'] === school);
    if (department) filteredData = filteredData.filter(item => item['院系'] === department);

    // 应用搜索过滤
    const searchInput = document.getElementById('search-input');
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        filteredData = filteredData.filter(item => {
            return Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm);
                }
                return false;
            });
        });
    }

    // 排序数据
    if (sortColumn) {
        filteredData.sort((a, b) => {
            const valueA = a[sortColumn];
            const valueB = b[sortColumn];
            if (typeof valueA === 'string' && typeof valueB === 'string') {
                return sortDirection === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
            }
            return sortDirection === 'asc' ? valueA - valueB : valueB - valueA;
        });
    }

    // 渲染表格
    populateTable(filteredData);
}

function resetFilters() {
    // 重置所有筛选条件
    currentFilters = {
        continent: '',
        country: '',
        region: '',
        school: '',
        department: ''
    };

    // 重置所有选择器
    document.querySelectorAll('.filter-select').forEach(select => {
        select.selectedIndex = 0;
    });

    // 清空搜索框
    const searchInput = document.getElementById('search-input');
    searchInput.value = '';

    // 重新渲染原始数据
    populateTable(allData);
}

// 填充表格
function populateTable(data) {
    const tbody = document.getElementById('data-body');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = document.createElement('tr');
        [
            '洲域', '国家&地区', '行政区域', '学校', '院系', 
            '姓名', '性别', '职称', '个人主页', '课题组主页',
            '邮箱地址', '研究领域', '代表论文列表', '招生信息'
        ].forEach(field => {
            const td = document.createElement('td');
            const content = item[field];

            // 检查内容是否为 NA
            if (content === 'NA') {
                td.textContent = 'NA';
            } 
            // 检查内容是否为链接
            else if ((field === '个人主页' || field === '课题组主页' || field === '代表论文列表') && content) {
                const link = document.createElement('a');
                link.href = content;
                link.textContent = '访问链接';
                link.target = '_blank';
                td.appendChild(link);
            } else {
                td.textContent = content || '-';
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });
}

// 获取数据
async function fetchData() {
    try {
        // 修改为实际的 Vercel 部署地址
        const response = await fetch('http://localhost:3000/api/data');
        if (!response.ok) throw new Error(`HTTP错误: ${response.status}`);
        allData = await response.json();
        
        console.log('成功加载数据，总数:', allData.length);
        console.log('数据样本:', allData[0]); // 检查字段名
        
        populateTable(allData); // 填充表格
        initFilters(); // 初始化筛选器
    } catch (error) {
        console.error('数据加载失败:', error);
        alert('数据加载失败，请刷新页面重试');
    }
}

// 为表头添加排序事件监听器
function setupSortListeners() {
    const headers = document.querySelectorAll('.data-table th');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.textContent;
            if (sortColumn === column) {
                sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                sortColumn = column;
                sortDirection = 'asc';
            }
            filterAndRenderTable();
        });
    });
}

// 处理搜索输入
function handleSearch() {
    filterAndRenderTable();
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', fetchData);
