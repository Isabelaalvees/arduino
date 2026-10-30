
const API_URL = "http://localhost:8000";

// Formata números no padrão brasileiro
function formatarNumero(valor) {
    if (valor === null || valor === undefined) {
        return "--";
    }

    return Number(valor).toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Formata datas
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
                yAxisID: "y",
                borderColor: "#a78bfa",
                backgroundColor: "rgba(167, 139, 250, 0.10)",
                fill: false,
                tension: 0.35,
                spanGaps: true
            },
            {
                label: "Temperatura (°C)",
                data: [],
                yAxisID: "y1",
                borderColor: "#fbbf24",
                backgroundColor: "rgba(251, 191, 36, 0.10)",
                fill: false,
                tension: 0.35,
                spanGaps: true
            },
            {
                label: "Nível de água",
                data: [],
                yAxisID: "y2",
                borderColor: "#38bdf8",
                backgroundColor: "rgba(56, 189, 248, 0.10)",
                fill: false,
                tension: 0.35,
                spanGaps: true
            }
        ]
    },

    options: {
        responsive: true,

        interaction: {
            mode: "index",
            intersect: false
        },

        plugins: {
            legend: {
                labels: {
                    color: "#94a3b8"
                }
            }
        },

        scales: {
            x: {
                type: "category",
                ticks: {
                    color: "#94a3b8"
                },
                grid: {
                    color: "rgba(255,255,255,0.04)"
                }
            },

            y: {
                type: "linear",
                position: "left",

                title: {
                    display: true,
                    text: "Pressão (hPa)",
                    color: "#a78bfa"
                },

                ticks: {
                    color: "#a78bfa"
                },

                grid: {
                    color: "rgba(255,255,255,0.05)"
                }
            },

            y1: {
                type: "linear",
                position: "right",

                title: {
                    display: true,
                    text: "Temperatura (°C)",
                    color: "#fbbf24"
                },

                ticks: {
                    color: "#fbbf24"
                },

                grid: {
                    drawOnChartArea: false
                }
            },

            y2: {
                type: "linear",
                position: "right",

                title: {
                    display: true,
                    text: "Nível de água",
                    color: "#38bdf8"
                },

                ticks: {
                    color: "#38bdf8"
                },

                grid: {
                    drawOnChartArea: false
                }
            }
        }
    }
});

// Busca os dados da API
async function atualizarDados() {

    const statusDot = document.getElementById("status-dot");
    const statusTexto = document.getElementById("status-text");

    try {

        // Consulta as três tabelas
        const [respostaAtmosfera, respostaTemperatura, respostaAgua] =
            await Promise.all([
                fetch(`${API_URL}/atmosfera`),
                fetch(`${API_URL}/temperatura`),
                fetch(`${API_URL}/nivel-agua`)
            ]);

        if (!respostaAtmosfera.ok ||
            !respostaTemperatura.ok ||
            !respostaAgua.ok) {
            throw new Error("Erro ao consultar os dados da API.");
        }

        const [dadosAtmosfera, dadosTemperatura, dadosAgua] =
            await Promise.all([
                respostaAtmosfera.json(),
                respostaTemperatura.json(),
                respostaAgua.json()
            ]);

        statusDot.className = "dot online";
        statusTexto.textContent = "API conectada";

        // Atualiza nível de água
        const ultimaAgua = dadosAgua[0];

        document.getElementById("water-val").textContent =
            ultimaAgua
                ? formatarNumero(ultimaAgua.nivel_agua)
                : "--";

        document.getElementById("water-status").textContent =
            ultimaAgua
                ? "Última medição recebida"
                : "Nenhuma medição registrada";

        // Atualiza pressão atmosférica
        const ultimaAtmosfera = dadosAtmosfera[0];

        document.getElementById("pressure-val").textContent =
            ultimaAtmosfera
                ? formatarNumero(ultimaAtmosfera.pressao_atmosferica)
                : "--";

        document.getElementById("pressure-status").textContent =
            ultimaAtmosfera
                ? (ultimaAtmosfera.pressao_atmosferica >= 1013
                    ? "Pressão relativamente alta"
                    : "Pressão abaixo de 1013 hPa")
                : "Nenhuma medição registrada";

        // Atualiza temperatura
        const ultimaTemperatura = dadosTemperatura[0];

        document.getElementById("temperature-val").textContent =
            ultimaTemperatura
                ? formatarNumero(ultimaTemperatura.temperatura)
                : "--";

        document.getElementById("temperature-status").textContent =
            ultimaTemperatura
                ? "Última medição recebida"
                : "Nenhuma medição registrada";

        // Junta as datas dos três históricos
        const todosRegistros = [
            ...dadosAtmosfera,
            ...dadosTemperatura,
            ...dadosAgua
        ];

        // Remove datas repetidas e organiza do mais antigo ao mais recente
        const datas = [...new Set(
            todosRegistros.map(registro => registro.data)
        )].sort((a, b) => new Date(a) - new Date(b));

        // Atualiza os rótulos do gráfico
        weatherChart.data.labels = datas.map(formatarData);

        // Organiza os dados de pressão por data
        const pressaoPorData = new Map(
            dadosAtmosfera.map(registro => [
                registro.data,
                registro.pressao_atmosferica
            ])
        );

        // Organiza os dados de temperatura por data
        const temperaturaPorData = new Map(
            dadosTemperatura.map(registro => [
                registro.data,
                registro.temperatura
            ])
        );

        // Organiza os dados de nível de água por data
        const aguaPorData = new Map(
            dadosAgua.map(registro => [
                registro.data,
                registro.nivel_agua
            ])
        );

        // Preenche as três linhas do gráfico
        weatherChart.data.datasets[0].data =
            datas.map(data => pressaoPorData.get(data) ?? null);

        weatherChart.data.datasets[1].data =
            datas.map(data => temperaturaPorData.get(data) ?? null);

        weatherChart.data.datasets[2].data =
            datas.map(data => aguaPorData.get(data) ?? null);

        // Atualiza o gráfico
        weatherChart.update();

    } catch (erro) {

        console.error("Erro ao carregar medições:", erro);

        statusDot.className = "dot offline";
        statusTexto.textContent = "Erro de conexão";

        document.getElementById("pressure-status").textContent =
            "Não foi possível carregar os dados";

        document.getElementById("temperature-status").textContent =
            "Não foi possível carregar os dados";

        document.getElementById("water-status").textContent =
            "Não foi possível carregar os dados";
    }
}

// Executa ao abrir o site
atualizarDados();

// Atualiza automaticamente a cada 5 segundos
setInterval(atualizarDados, 5000);
