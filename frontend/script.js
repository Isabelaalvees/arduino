
const API_URL = "http://localhost:8000";

// Formata os números no padrão brasileiro
function formatarNumero(valor) {
    if (valor === null || valor === undefined) {
        return "--";
    }

    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Formata a data recebida da API
function formatarData(data) {
    if (!data) return "--";

    const dataObjeto = new Date(data);

    if (Number.isNaN(dataObjeto.getTime())) {
        return String(data);
    }

    return dataObjeto.toLocaleString("pt-BR");
}

// Configuração do gráfico
const elementoGrafico = document.getElementById("weatherChart");

const weatherChart = new Chart(elementoGrafico, {
    type: "line",
    data: {
        labels: [],
        datasets: [
            {
                label: "Pressão atmosférica (hPa)",
                data: [],
                borderColor: "#a78bfa",
                backgroundColor: "rgba(167, 139, 250, 0.12)",
                fill: true,
                tension: 0.35
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: "#94a3b8"
                }
            }
        },
        scales: {
            x: {
                ticks: { color: "#94a3b8" },
                grid: { color: "rgba(255,255,255,0.04)" }
            },
            y: {
                title: {
                    display: true,
                    text: "Pressão (hPa)",
                    color: "#94a3b8"
                },
                ticks: { color: "#a78bfa" },
                grid: { color: "rgba(255,255,255,0.05)" }
            }
        }
    }
});

// Consulta a API e atualiza a página
async function atualizarDados() {
    const statusDot = document.getElementById("status-dot");
    const statusTexto = document.getElementById("status-text");

    try {
        const resposta = await fetch(`${API_URL}/atmosfera`);

        if (!resposta.ok) {
            throw new Error("A API não conseguiu buscar as medições.");
        }

        const dados = await resposta.json();

        // Atualiza o status da conexão
        statusDot.className = "dot online";
        statusTexto.textContent = "API conectada";

        // Não existem dados de chuva no banco atual
        document.getElementById("rain-val").textContent = "--";
        document.getElementById("rain-status").textContent =
            "Sensor de chuva não disponível";

        if (dados.length === 0) {
            document.getElementById("pressure-val").textContent = "--";
            document.getElementById("pressure-status").textContent =
                "Nenhuma medição registrada";

            weatherChart.data.labels = [];
            weatherChart.data.datasets[0].data = [];
            weatherChart.update();

            return;
        }

        // A API retorna os registros do mais recente para o mais antigo
        const ultimaMedicao = dados[0];

        document.getElementById("pressure-val").textContent =
            formatarNumero(ultimaMedicao.pressao_atmosferica);

        document.getElementById("pressure-status").textContent =
            ultimaMedicao.pressao_atmosferica >= 1013
                ? "Pressão relativamente alta"
                : "Pressão abaixo de 1013 hPa";

        // O gráfico fica em ordem cronológica: antigo para recente
        const historico = [...dados].reverse();

        weatherChart.data.labels = historico.map(
            registro => formatarData(registro.data)
        );

        weatherChart.data.datasets[0].data = historico.map(
            registro => registro.pressao_atmosferica
        );

        weatherChart.update();

    } catch (erro) {
        console.error("Erro ao carregar medições:", erro);

        statusDot.className = "dot offline";
        statusTexto.textContent = "Erro de conexão";

        document.getElementById("pressure-status").textContent =
            "Não foi possível carregar os dados";
    }
}

// Executa ao abrir a página
atualizarDados();

// Atualiza automaticamente a cada 5 segundos
setInterval(atualizarDados, 5000);
