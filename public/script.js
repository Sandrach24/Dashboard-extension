document.getElementById('login-form').addEventListener('submit', function (e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
  
    // Verifica las credenciales del administrador
    if (username === 'admin' && password === 'admin123') { // Cambia esto por la validación de credenciales real
      alert('Inicio de sesión exitoso');
      document.getElementById('admin-panel').style.display = 'block';
    } else {
      alert('Credenciales inválidas');
    }
  });
  
  document.getElementById('apply-color').addEventListener('click', function () {
    const color = document.getElementById('bg-color').value;
    document.body.style.backgroundColor = color;
  });
  
  document.getElementById('apply-text').addEventListener('click', function () {
    const text = document.getElementById('edit-text').value;
    const selectedElement = document.getElementById('editable-text'); // Asegúrate de que el elemento tenga el ID correcto
    if (selectedElement) {
      selectedElement.innerText = text;
    } else {
      alert('No se encontró el elemento para editar');
    }
  });
  
  document.getElementById('delete-element').addEventListener('click', function () {
    const elementId = document.getElementById('element-id').value;
    const element = document.getElementById(elementId);
    if (element) {
      element.remove();
    } else {
      alert('No se encontró el elemento para eliminar');
    }
  });
  
  function loadDashboardData() {
    fetch('/stats')
      .then(response => response.json())
      .then(stats => {
        document.getElementById('total-emails').innerText = stats.totalEmails;
        document.getElementById('total-phishing').innerText = stats.totalPhishing;
        document.getElementById('total-non-phishing').innerText = stats.totalNonPhishing;
      });
  
    fetch('/data')
      .then(response => response.json())
      .then(data => {
        const phishingUserStatsTable = document.getElementById('phishing-user-stats-table');
        const validUserStatsTable = document.getElementById('valid-user-stats-table');
  
        // Procesar y mostrar usuarios más activos de phishing
        const phishingUserStats = data.filter(user => user.is_phishing === 1).map(user => `
          <tr>
            <td>${user.url}</td>
            <td>${user.recipient}</td>
          </tr>`).join('');
        phishingUserStatsTable.innerHTML = phishingUserStats;
  
        // Procesar y mostrar usuarios más activos de correos válidos
        const validUserStats = data.filter(user => user.is_phishing === 0).map(user => `
          <tr>
            <td>${user.url}</td>
            <td>${user.recipient}</td>
          </tr>`).join('');
        validUserStatsTable.innerHTML = validUserStats;
  
        // Procesar y mostrar gráficos diarios
        const dailyValidAttemptsData = data.reduce((acc, curr) => {
          if (curr.is_phishing === 0) {
            const date = curr.email_date.split('T')[0];
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += 1;
          }
          return acc;
        }, {});
  
        const dailyPhishingAttemptsData = data.reduce((acc, curr) => {
          if (curr.is_phishing === 1) {
            const date = curr.email_date.split('T')[0];
            if (!acc[date]) {
              acc[date] = 0;
            }
            acc[date] += 1;
          }
          return acc;
        }, {});
  
        const dailyValidAttemptsChartCtx = document.getElementById('daily-valid-attempts-chart').getContext('2d');
        const dailyPhishingAttemptsChartCtx = document.getElementById('daily-phishing-attempts-chart').getContext('2d');
  
        new Chart(dailyValidAttemptsChartCtx, {
          type: 'line',
          data: {
            labels: Object.keys(dailyValidAttemptsData),
            datasets: [{
              label: 'Intentos Válidos Diarios',
              data: Object.values(dailyValidAttemptsData),
              borderColor: '#008000',
              backgroundColor: 'rgba(0, 128, 0, 0.1)',
              fill: true,
              tension: 0.4, // Hace la línea más suave
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true // Muestra la leyenda
              }
            },
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Fecha'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Cantidad de Intentos Válidos'
                },
                beginAtZero: true
              }
            }
          }
        });
  
        new Chart(dailyPhishingAttemptsChartCtx, {
          type: 'line',
          data: {
            labels: Object.keys(dailyPhishingAttemptsData),
            datasets: [{
              label: 'Intentos de Phishing Diarios',
              data: Object.values(dailyPhishingAttemptsData),
              borderColor: '#FF0000',
              backgroundColor: 'rgba(255, 0, 0, 0.1)',
              fill: true,
              tension: 0.4, // Hace la línea más suave
            }]
          },
          options: {
            plugins: {
              legend: {
                display: true // Muestra la leyenda
              }
            },
            layout: {
              padding: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
              }
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: 'Fecha'
                }
              },
              y: {
                display: true,
                title: {
                  display: true,
                  text: 'Cantidad de Intentos de Phishing'
                },
                beginAtZero: true
              }
            }
          }
        });
      });
  }
  
  // Cargar datos del dashboard al iniciar
  loadDashboardData();

