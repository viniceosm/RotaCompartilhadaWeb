self.addEventListener('message', event => {
  const { keyUsuarioLogado } = event.data;
  
  // Capturar a localização
  self.addEventListener('fetch', async (event) => {
    if (event.request.url.endsWith(`/users/${keyUsuarioLogado}.json`)) {
      const position = await obterLocalizacao();
      if (position) {
        const { latitude, longitude } = position.coords;
        enviarParaFirebase(keyUsuarioLogado, { latitude, longitude });
      }
    }
  });
});

function obterLocalizacao() {
  return new Promise((resolve, reject) => {
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.focus(); // Foca na janela da aplicação para solicitar permissão
      });
    });

    self.navigator.geolocation.getCurrentPosition(resolve, reject);
  });
}

async function enviarParaFirebase(keyUsuarioLogado, coordenadas) {
  try {
    const response = await fetch(`https://rotacompartilhada-58ae8-default-rtdb.firebaseio.com/users/${keyUsuarioLogado}.json`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userLatLng: coordenadas }),
    });

    if (!response.ok) {
      throw new Error('Falha ao enviar para o Firebase');
    }
  } catch (error) {
    console.error(error);
  }
}