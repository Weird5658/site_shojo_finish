// Exemple de récupération des infos depuis l'API Jikan pour les 3 animes
const animeApiBase = 'https://api.jikan.moe/v4/anime/';
const animeIds = [11503, 31546, 33352]; // Ao Haru Ride, A Silent Voice, Orange

async function loadAnimeData() {
  for (let i = 0; i < animeIds.length; i++) {
    try {
      const res = await fetch(animeApiBase + animeIds[i]);
      const data = await res.json();
      const anime = data.data;

      const card = document.getElementById(`card-${i + 1}`);
      const img = card.querySelector('img');
      if (anime.images?.jpg?.large_image_url) {
        img.src = anime.images.jpg.large_image_url;
      }
    } catch (err) {
      console.error('Erreur lors du chargement de l’anime', err);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadAnimeData);
