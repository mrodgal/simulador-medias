function generatePopulation(type, size = 10000) {
  const data = [];
  for (let i = 0; i < size; i++) {
    if (type === "uniform") {
      data.push(Math.random() * 10);
    } else if (type === "normal") {
      let u = 0, v = 0;
      while (u === 0) u = Math.random();
      while (v === 0) v = Math.random();
      let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
      data.push(num * 2 + 5); // media ~5, desviación ~2
    } else if (type === "random") {
      data.push(Math.floor(Math.random() * 11)); // enteros de 0 a 10
    }
  }
  return data;
}

function simulate() {
  const type = document.getElementById("populationType").value;
  const sampleSize = parseInt(document.getElementById("sampleSize").value);
  const numSamples = parseInt(document.getElementById("numSamples").value);

  const population = generatePopulation(type);
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

  drawChart(sampleMeans);
}

function drawChart(data) {
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
  const chartData = {
    labels: labels,
    datasets: [{
      label: "Frecuencia de medias muestrales",
      data: bins,
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1
    }]
  };

  if (window.myChart) window.myChart.destroy();
  window.myChart = new Chart(ctx, {
    type: "bar",
    data: chartData,
    options: {
      scales: {
        x: { title: { display: true, text: "Media muestral" } },
        y: { title: { display: true, text: "Frecuencia" } }
      }
    }
  });
}
