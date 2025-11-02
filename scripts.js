function toggleNormalParams() {
  const type = document.getElementById("populationType").value;
  const normalParams = document.getElementById("normalParams");
  normalParams.style.display = type === "normal" ? "block" : "none";
}

function generatePopulation(type, size = 10000) {
  const data = [];
  const mean = parseFloat(document.getElementById("normalMean").value);
  const std = parseFloat(document.getElementById("normalStd").value);

  for (let i = 0; i < size; i++) {
    if (type === "uniform") {
      data.push(Math.random() * 10);
    } else if (type === "normal") {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      data.push(num * std + mean);
    } else if (type === "skewed") {
      const lambda = 0.5;
      const exp = -Math.log(1 - Math.random()) / lambda;
      data.push(exp);
    } else if (type === "discrete") {
      data.push(Math.floor(Math.random() * 11));
    }
  }
  return data;
}

function calculateStats(data) {
  const mean = data.reduce((a, b) => a + b, 0) / data.length;
  const variance = data.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / data.length;
  return { mean, variance };
}

function simulate() {
  const type = document.getElementById("populationType").value;
  const sampleSize = parseInt(document.getElementById("sampleSize").value);
  const numSamples = parseInt(document.getElementById("numSamples").value);

  const population = generatePopulation(type);
  const popStats = calculateStats(population);

  const sampleMeans = [];
  for (let i = 0; i < numSamples; i++) {
    const sample = [];
    for (let j = 0; j < sampleSize; j++) {
      const index = Math.floor(Math.random() * population.length);
      sample.push(population[index]);
    }
    const mean = sample.reduce((a, b) => a + b, 0) / sampleSize;
    sampleMeans.push(mean);
  }

  const meanStats = calculateStats(sampleMeans);
  const theoreticalVariance = popStats.variance / sampleSize;

  document.getElementById("stats").innerHTML = `
    <strong>Media de la población:</strong> ${popStats.mean.toFixed(3)}<br>
    <strong>Varianza de la población:</strong> ${popStats.variance.toFixed(3)}<br>
    <strong>Media de las medias muestrales:</strong> ${meanStats.mean.toFixed(3)}<br>
    <strong>Varianza de las medias muestrales:</strong> ${meanStats.variance.toFixed(3)}<br>
    <strong>Varianza teórica esperada:</strong> ${theoreticalVariance.toFixed(3)}
  `;

  drawChart(sampleMeans, popStats.mean, theoreticalVariance);
}

function normalCurve(x, mean, variance) {
  const std = Math.sqrt(variance);
  return (1 / (std * Math.sqrt(2 * Math.PI))) * Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
}

function drawChart(data, theoreticalMean, theoreticalVariance) {
  const ctx = document.getElementById("chart").getContext("2d");
  const bins = Array(50).fill(0);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const step = (max - min) / bins.length;

  data.forEach(value => {
    const index = Math.min(Math.floor((value - min) / step), bins.length - 1);
    bins[index]++;
  });

  const labels = bins.map((_, i) => (min + i * step).toFixed(2));
  const normalValues = labels.map(x => normalCurve(parseFloat(x), theoreticalMean, theoreticalVariance) * data.length * step);

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: "Frecuencia de medias muestrales",
        data: bins,
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        type: "bar"
      },
      {
        label: "Curva normal teórica",
        data: normalValues,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: false,
        type: "line",
        tension: 0.3
      }
    ]
  };

  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    data: chartData,
    options: {
      scales: {
        x: { title: { display: true, text: "Media muestral" } },
        y: { title: { display: true, text: "Frecuencia / Densidad" } }
      }
    }
  });
}
