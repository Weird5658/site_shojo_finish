document.addEventListener("DOMContentLoaded", () => {
  console.log("Script chargé - DOM prêt");

  // ===== ELEMENTS DOM =====
  const searchInput = document.getElementById("searchInput");
  const API_ANILIST = "https://graphql.anilist.co";

  // ===== VARIABLES GLOBALES =====
  let searchTimeout;

  // ===== VÉRIFICATIONS INITIALES =====
  if (!searchInput) {
    console.error("ERREUR: searchInput non trouvé dans le DOM");
    alert("Erreur de configuration: barre de recherche introuvable");
    return;
  }

  console.log("searchInput trouvé:", searchInput);

  /* =========================
     OUTILS
  ========================= */

  function cleanHTML(text) {
    return text ? text.replace(/<[^>]*>/g, "") : "";
  }

  function setLoading(loading) {
    const searchIcon = document.querySelector('.search svg');
    if (searchIcon) {
      searchIcon.style.opacity = loading ? '0.5' : '1';
      searchIcon.style.cursor = loading ? 'wait' : 'pointer';
      searchIcon.innerHTML = loading ?
        '<circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="15.7 15.7"><animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/></circle>' :
        '<path d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z" stroke="currentColor" stroke-width="2"/><path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
    }
  }

  /* =========================
     RECHERCHE
  ========================= */

  async function searchAnime() {
    const query = searchInput.value.trim();
    if (!query) return;

    console.log("Recherche lancée:", query);

    try {
      const response = await fetch(API_ANILIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query ($search: String) {
            Page(perPage: 10) {
              media(search: $search, type: ANIME) {
                id
                title { romaji english native }
                coverImage { large extraLarge }
                description
                episodes
                status
                averageScore
                genres
                season
                seasonYear
                studios { nodes { name } }
                format
                duration
                startDate { year month day }
                endDate { year month day }
              }
            }
          }`,
          variables: { search: query }
        })
      });

      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);

      const { data } = await response.json();

      if (!data.Page.media.length) {
        alert(`Aucun anime trouvé pour "${query}"`);
        return;
      }

      console.log(`${data.Page.media.length} résultats trouvés`);
      showSearchResults(data.Page.media, query);

    } catch (error) {
      console.error("Erreur de recherche:", error);
      alert("Erreur lors de la recherche. Vérifiez votre connexion internet.");
    }
  }

  /* =========================
     MODALES
  ========================= */

  function showSearchResults(list, query) {
    document.querySelectorAll('.search-modal').forEach(m => m.remove());

    const modal = document.createElement("div");
    modal.className = "search-modal active";
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      z-index: 1000;
      padding: 40px 20px;
      overflow: auto;
      display: block;
    `;

    modal.innerHTML = `
      <div class="search-modal-content" style="max-width: 800px; margin: 0 auto;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; color: white;">
          <h2 style="margin: 0;">Résultats pour "${query}"</h2>
          <button onclick="this.closest('.search-modal').remove()"
                  style="background: #d86fb2; color: #fff; border: 2px solid #000; padding: 8px 16px; cursor: pointer; font-family: inherit; font-size: 1rem; border-radius: 4px;">
            Fermer
          </button>
        </div>
        <div class="search-modal-results" style="display: flex; flex-direction: column; gap: 15px;">
          ${list.map(anime => `
            <div class="search-result-item"
                 onclick="window.showAnimeDetails(${JSON.stringify(anime).replace(/"/g, '&quot;')})"
                 style="border: 2px solid #d86fb2; padding: 15px; cursor: pointer; background: #fff; border-radius: 8px; transition: transform 0.2s;">
              <img src="${anime.coverImage.large}"
                   style="width: 80px; height: 112px; object-fit: cover; float: left; margin-right: 15px; border: 1px solid #000; border-radius: 4px;">
              <div>
                <strong style="display: block; margin-bottom: 5px; font-size: 1.1rem; color: #333;">
                  ${anime.title.romaji || anime.title.english || anime.title.native}
                </strong>
                <p style="margin: 0; font-size: 0.9rem; color: #666;">
                  ${anime.averageScore ? `<span style="color: #d86fb2;">★ ${anime.averageScore}/100</span>` : "N/A"}
                  ${anime.episodes ? ` • ${anime.episodes} épisodes` : ""}
                  ${anime.seasonYear ? ` • ${anime.seasonYear}` : ""}
                </p>
                <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #888; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                  ${cleanHTML(anime.description).substring(0, 150)}...
                </p>
              </div>
              <div style="clear: both;"></div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    modal.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('mouseenter', () => {
        item.style.transform = 'translateY(-2px)';
        item.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.transform = 'translateY(0)';
        item.style.boxShadow = 'none';
      });
    });

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);
  }

  // Fonction globale accessible depuis le HTML
  window.showAnimeDetails = function(anime) {
    document.querySelectorAll('.search-modal').forEach(m => m.remove());

    const modal = document.createElement("div");
    modal.className = "search-modal active";
    modal.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1001;
      padding: 20px;
    `;

    const description = cleanHTML(anime.description);

    modal.innerHTML = `
      <div style="background: #fff; padding: 30px; max-width: 800px; width: 90%; max-height: 90vh; border: 3px solid #d86fb2; overflow: auto; position: relative; border-radius: 12px;">
        <button onclick="this.closest('.search-modal').remove()"
                style="position: absolute; top: 10px; right: 10px; background: #d86fb2; color: #fff; border: none; width: 30px; height: 30px; cursor: pointer; font-family: inherit; font-weight: bold; border-radius: 50%;">
          X
        </button>

        <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
          <img src="${anime.coverImage.extraLarge || anime.coverImage.large}"
               style="width: 250px; height: auto; border: 2px solid #000; border-radius: 8px; flex-shrink: 0;">
          <div style="flex: 1; min-width: 300px;">
            <h2 style="margin-top: 0; color: #d86fb2; border-bottom: 2px solid #f3c5f6; padding-bottom: 10px;">
              ${anime.title.romaji || anime.title.english || anime.title.native}
            </h2>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
              ${anime.averageScore ? `
                <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                  <strong style="display: block; color: #666; font-size: 0.9rem;">Score:</strong>
                  <span style="font-size: 1.5rem; color: #d86fb2; font-weight: bold;">${anime.averageScore}/100</span>
                </div>
              ` : ""}
              ${anime.episodes ? `
                <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                  <strong style="display: block; color: #666; font-size: 0.9rem;">Épisodes:</strong>
                  <span style="font-size: 1.2rem;">${anime.episodes}</span>
                </div>
              ` : ""}
              ${anime.seasonYear ? `
                <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                  <strong style="display: block; color: #666; font-size: 0.9rem;">Année:</strong>
                  <span style="font-size: 1.2rem;">${anime.seasonYear}</span>
                </div>
              ` : ""}
              ${anime.format ? `
                <div style="background: #f9f9f9; padding: 10px; border-radius: 6px; border: 1px solid #eee;">
                  <strong style="display: block; color: #666; font-size: 0.9rem;">Format:</strong>
                  <span style="font-size: 1.2rem;">${anime.format}</span>
                </div>
              ` : ""}
            </div>

            ${anime.genres && anime.genres.length ? `
              <div style="margin-bottom: 20px;">
                <strong style="display: block; margin-bottom: 5px; color: #666;">Genres:</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                  ${anime.genres.map(genre => `<span style="display: inline-block; background: #f3c5f6; padding: 5px 10px; border: 1px solid #d86fb2; border-radius: 15px; font-size: 0.85rem;">${genre}</span>`).join("")}
                </div>
              </div>
            ` : ""}
          </div>
        </div>

        ${description ? `
          <div>
            <h3 style="color: #d86fb2; border-bottom: 2px solid #f3c5f6; padding-bottom: 10px; margin-bottom: 15px;">Synopsis</h3>
            <p style="line-height: 1.6; color: #444;">${description}</p>
          </div>
        ` : ""}

        ${anime.studios?.nodes?.length ? `
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <strong style="color: #666;">Studios:</strong>
            <span> ${anime.studios.nodes.map(s => s.name).join(", ")}</span>
          </div>
        ` : ""}

        <!-- SECTION NOTES PERSONNELLES -->
        <div style="margin-top: 24px; padding-top: 18px; border-top: 2px solid #f3c5f6;">
          <h3 style="color: #d86fb2; margin-bottom: 12px; font-size: 1.1rem;">📝 Ma note personnelle</h3>
          <div id="starRating" style="display: flex; gap: 8px; margin-bottom: 12px;">
            <span data-star="1" style="font-size: 2rem; cursor: pointer; color: #ccc; transition: color 0.15s;">☆</span>
            <span data-star="2" style="font-size: 2rem; cursor: pointer; color: #ccc; transition: color 0.15s;">☆</span>
            <span data-star="3" style="font-size: 2rem; cursor: pointer; color: #ccc; transition: color 0.15s;">☆</span>
            <span data-star="4" style="font-size: 2rem; cursor: pointer; color: #ccc; transition: color 0.15s;">☆</span>
            <span data-star="5" style="font-size: 2rem; cursor: pointer; color: #ccc; transition: color 0.15s;">☆</span>
          </div>
          <textarea id="animeNote" placeholder="Écris ta note ici..."
            style="width: 100%; min-height: 80px; border: 2px solid #d86fb2; border-radius: 6px; padding: 8px; font-family: inherit; font-size: 0.95rem; resize: vertical; outline: none; box-sizing: border-box;"></textarea>
          <div style="display: flex; align-items: center; margin-top: 10px; gap: 12px;">
            <button id="saveNote"
              style="background: #d86fb2; color: #fff; border: none; padding: 8px 20px; border-radius: 4px; cursor: pointer; font-family: inherit; font-size: 0.95rem;">
              Sauvegarder
            </button>
            <span id="noteSaved" style="color: #d86fb2; font-size: 0.9rem; opacity: 0; transition: opacity 0.3s;">✓ Sauvegardé !</span>
          </div>
        </div>
      </div>
    `;

    modal.onclick = (e) => { if (e.target === modal) modal.remove(); };
    document.body.appendChild(modal);

    // ---- Logique étoiles + sauvegarde ----
    const noteKey = `anime_note_${anime.id || anime.title.romaji}`;
    const starKey = `anime_star_${anime.id || anime.title.romaji}`;

    const savedNote = localStorage.getItem(noteKey) || "";
    const savedStar = parseInt(localStorage.getItem(starKey)) || 0;

    const textarea  = modal.querySelector("#animeNote");
    const stars     = modal.querySelectorAll("#starRating span");
    const saveBtn   = modal.querySelector("#saveNote");
    const savedMsg  = modal.querySelector("#noteSaved");

    textarea.value = savedNote;

    function updateStars(n) {
      stars.forEach((s, i) => {
        s.textContent = i < n ? "★" : "☆";
        s.style.color  = i < n ? "#d86fb2" : "#ccc";
      });
    }

    let currentStar = savedStar;
    updateStars(currentStar);

    stars.forEach(star => {
      const n = parseInt(star.dataset.star);
      star.addEventListener("mouseenter", () => updateStars(n));
      star.addEventListener("mouseleave", () => updateStars(currentStar));
      star.addEventListener("click", () => {
        currentStar = n;
        updateStars(n);
      });
    });

    saveBtn.addEventListener("click", () => {
      localStorage.setItem(noteKey, textarea.value);
      localStorage.setItem(starKey, currentStar);
      savedMsg.style.opacity = "1";
      setTimeout(() => savedMsg.style.opacity = "0", 2000);
    });
  };

  /* =========================
     NOUVEAUTÉS ROMANCE
  ========================= */

  async function fetchRomanceAnime() {
    console.log("Chargement des nouveautés romance...");
    try {
      const res = await fetch(API_ANILIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query {
            Page(perPage: 6) {
              media(type: ANIME, genre: "Romance", sort: TRENDING_DESC, isAdult: false) {
                id
                title { romaji english }
                coverImage { large }
                description
                averageScore
              }
            }
          }`
        })
      });
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const { data } = await res.json();
      console.log(`${data.Page.media.length} nouveautés chargées`);
      return data.Page.media;
    } catch (error) {
      console.error("Erreur lors du chargement des nouveautés:", error);
      return [];
    }
  }

  function displayRomanceAnime(list) {
    const container = document.getElementById("nouveautesContainer");
    if (!container) { console.error("Container nouveautesContainer non trouvé"); return; }

    if (!list || list.length === 0) {
      container.innerHTML = '<div class="error-message">Impossible de charger les nouveautés.</div>';
      return;
    }

    container.innerHTML = list.map(anime => `
      <div class="nouveaute-card" data-id="${anime.id}" style="cursor: pointer; transition: transform 0.3s;">
        <img class="nouveaute-poster"
             src="${anime.coverImage.large}"
             alt="${anime.title.romaji || anime.title.english}"
             loading="lazy"
             style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; border: 2px solid #d86fb2;">
        <div class="nouveaute-titre" style="margin-top: 10px; text-align: center; color: #333;">
          <strong>${(anime.title.romaji || anime.title.english).substring(0, 30)}${(anime.title.romaji || anime.title.english).length > 30 ? '...' : ''}</strong>
          ${anime.averageScore ? `<br><small style="color: #d86fb2;">★ ${anime.averageScore}/100</small>` : ''}
        </div>
      </div>
    `).join("");

    container.querySelectorAll(".nouveaute-card").forEach((card, i) => {
      card.onclick = () => window.showAnimeDetails(list[i]);
      card.addEventListener('mouseenter', () => card.style.transform = 'scale(1.05)');
      card.addEventListener('mouseleave', () => card.style.transform = 'scale(1)');
    });
  }

  /* =========================
     RECOMMANDÉS ALÉATOIRES
  ========================= */

  async function fetchRandomAnime() {
    console.log("Chargement des recommandés aléatoires...");
    try {
      const page = Math.floor(Math.random() * 10) + 1;
      const res = await fetch(API_ANILIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `query ($page: Int) {
            Page(page: $page, perPage: 30) {
              media(type: ANIME, sort: POPULARITY_DESC, isAdult: false) {
                id
                title { romaji english native }
                coverImage { large }
                description
                averageScore
              }
            }
          }`,
          variables: { page }
        })
      });
      if (!res.ok) throw new Error(`Erreur API: ${res.status}`);
      const { data } = await res.json();
      const shuffled = [...data.Page.media].sort(() => 0.5 - Math.random());
      console.log(`${shuffled.length} recommandés chargés (page ${page})`);
      return shuffled.slice(0, 19);
    } catch (error) {
      console.error("Erreur lors du chargement des recommandés:", error);
      return [];
    }
  }

  function displayRecommandesAnime(list) {
    if (!list || list.length === 0) {
      document.querySelectorAll('.recommandes-ligne').forEach(c => {
        c.innerHTML = '<div class="error-message">Impossible de charger les recommandés.</div>';
      });
      return;
    }

    const lignes = [
      list.slice(0, 5),
      list.slice(5, 10),
      list.slice(10, 14),
      list.slice(14, 19)
    ];

    lignes.forEach((ligne, i) => {
      const container = document.getElementById(`ligne${i + 1}`);
      if (!container) return;

      container.innerHTML = ligne.map(anime => `
        <div class="recommande-card" data-id="${anime.id}" style="cursor: pointer; transition: transform 0.3s;">
          <img class="recommande-poster"
               src="${anime.coverImage.large}"
               alt="${anime.title.romaji || anime.title.english}"
               loading="lazy"
               style="width: 100%; height: 150px; object-fit: cover; border-radius: 6px; border: 2px solid #d86fb2;">
          <div class="recommande-titre" style="margin-top: 8px; text-align: center; font-size: 0.9rem; color: #333;">
            ${(anime.title.romaji || anime.title.english || "").substring(0, 20)}${(anime.title.romaji || anime.title.english || "").length > 20 ? '...' : ''}
          </div>
        </div>
      `).join("");

      container.querySelectorAll(".recommande-card").forEach((card, idx) => {
        card.onclick = () => window.showAnimeDetails(ligne[idx]);
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-5px)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0)');
      });
    });
  }

  /* =========================
     ÉVÉNEMENTS
  ========================= */

  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { e.preventDefault(); searchAnime(); }
  });

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (e.target.value.trim().length > 2) searchAnime();
    }, 800);
  });

  document.querySelector('.search svg')?.addEventListener('click', () => searchAnime());

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.search-modal');
      if (modals.length > 0) modals[modals.length - 1].remove();
    }
  });

  /* =========================
     LANCEMENT INITIAL
  ========================= */

  console.log("Lancement du chargement des données...");

  Promise.all([
    fetchRomanceAnime().then(displayRomanceAnime),
    fetchRandomAnime().then(displayRecommandesAnime)
  ])
  .then(() => console.log("Toutes les données chargées avec succès!"))
  .catch(error => {
    console.error("Erreur lors du chargement initial:", error);
    alert("Erreur lors du chargement des données. Vérifiez votre connexion internet.");
  });

  /* =========================
     PAGE ALÉATOIRE (CARTE UNIQUE)
  ========================= */

  async function loadRandomAnimeCard() {
    const card = document.getElementById("randomCard");
    if (!card) return;

    const image       = document.getElementById("randomImage");
    const title       = document.getElementById("randomTitle");
    const description = document.getElementById("randomDescription");
    const rating      = document.getElementById("randomRating");

    try {
      const list = await fetchRandomAnime();
      if (!list.length) {
        title.textContent = "Erreur de chargement";
        description.textContent = "Impossible de charger un anime aléatoire.";
        return;
      }
      const anime = list[Math.floor(Math.random() * list.length)];
      image.src = anime.coverImage.large;
      image.alt = anime.title.romaji || anime.title.english;
      title.textContent = anime.title.romaji || anime.title.english || anime.title.native;
      description.textContent = cleanHTML(anime.description).substring(0, 300) + "...";
      if (anime.averageScore) {
        const s = Math.round(anime.averageScore / 20);
        rating.innerHTML = "★".repeat(s) + "☆".repeat(5 - s);
      } else {
        rating.textContent = "Aucune note";
      }
      card.onclick = () => window.showAnimeDetails(anime);
      card.style.cursor = 'pointer';
    } catch (error) {
      console.error("Erreur dans loadRandomAnimeCard:", error);
    }
  }

  /* =========================
     NOUVEAUTÉS MANUELLES (CLIC)
  ========================= */

  document.querySelectorAll(".nouveaute-click").forEach(card => {
    card.addEventListener("click", () => {
      const data = card.getAttribute("data-anime");
      if (!data) return;
      try {
        window.showAnimeDetails(JSON.parse(data));
      } catch (e) {
        console.error("Erreur parsing data-anime", e);
      }
    });
  });

  /* =========================
     BOUTON ANIME ALÉATOIRE
  ========================= */

  const randomBtn = document.getElementById("randomAnimeBtn");

  if (randomBtn) {
    const image       = document.getElementById("randomAnimeImage");
    const title       = document.getElementById("randomAnimeTitle");
    const description = document.getElementById("randomAnimeDescription");
    const score       = document.getElementById("randomAnimeScore");

    async function loadRandomAnime() {
      try {
        const page = Math.floor(Math.random() * 20) + 1;
        const res = await fetch(API_ANILIST, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `query ($page: Int) {
              Page(page: $page, perPage: 25) {
                media(type: ANIME, isAdult: false, sort: POPULARITY_DESC) {
                  title { romaji english native }
                  description
                  coverImage { extraLarge }
                  averageScore
                }
              }
            }`,
            variables: { page }
          })
        });
        if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
        const { data } = await res.json();
        const list  = data.Page.media;
        const anime = list[Math.floor(Math.random() * list.length)];
        image.src = anime.coverImage.extraLarge;
        image.alt = anime.title.romaji || anime.title.english;
        title.textContent = anime.title.romaji || anime.title.english || anime.title.native;
        description.textContent = anime.description
          ? cleanHTML(anime.description).substring(0, 350) + "…"
          : "Aucune description disponible.";
        score.textContent = anime.averageScore || "N/A";
      } catch (err) {
        console.error("Erreur animé aléatoire :", err);
        title.textContent = "Erreur de chargement";
        description.textContent = "Impossible de charger un anime aléatoire. Réessayez.";
        score.textContent = "N/A";
      }
    }

    loadRandomAnime();
    randomBtn.addEventListener("click", loadRandomAnime);
  }

  console.log("Configuration terminée. Prêt à utiliser.");
});