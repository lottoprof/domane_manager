// charts.js

// Конфигурация графиков
const chartConfig = {
    type: 'line',
    options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)',
                }
            }
        }
    }
};

// Инициализация графиков
document.addEventListener('DOMContentLoaded', function() {
    // Clicks and Views Chart
    const clicksViewsCtx = document.getElementById('clicksViewsChart').getContext('2d');
    new Chart(clicksViewsCtx, {
        ...chartConfig,
        data: {
            labels: [], // Даты будут загружены через API
            datasets: [{
                label: 'Views',
                data: [],
                borderColor: 'rgb(72, 192, 192)',
                backgroundColor: 'rgba(72, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Clicks',
                data: [],
                borderColor: 'rgb(54, 162, 235)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                fill: true,
                tension: 0.4
            }]
        }
    });

    // API Registrations Chart
    const registrationsCtx = document.getElementById('registrationsChart').getContext('2d');
    new Chart(registrationsCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Registrations',
                data: [],
                borderColor: 'rgb(255, 99, 132)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                fill: true,
                tension: 0.4
            }]
        }
    });

    // Domains Chart
    const domainsCtx = document.getElementById('domainsChart').getContext('2d');
    new Chart(domainsCtx, {
        ...chartConfig,
        data: {
            labels: [],
            datasets: [{
                label: 'Active Domains',
                data: [],
                borderColor: 'rgb(153, 102, 255)',
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                fill: true,
                tension: 0.4
            },
            {
                label: 'Domains with Positions',
                data: [],
                borderColor: 'rgb(255, 159, 64)',
                backgroundColor: 'rgba(255, 159, 64, 0.2)',
                fill: true,
                tension: 0.4
            }]
        }
    });

    // Загрузка данных
    loadChartData();
});

// Функция загрузки данных
async function loadChartData() {
    try {
        const response = await fetch('/api/stats/charts');
        const data = await response.json();
        
        updateCharts(data);
    } catch (error) {
        console.error('Error loading chart data:', error);
    }
}

// Функция обновления графиков
function updateCharts(data) {
    // Обновление будет происходить при получении данных от API
    // Здесь будет логика обновления каждого графика
}
