// =========================
// CONFIGURATION
// =========================
const API_ANILIST = "https://graphql.anilist.co";
const SEARCH_DELAY = 500; // Délai anti-rebond en ms

// =========================
// INITIALISATION
// =========================
document.addEventListener("DOMContentLoaded", async () => {
  console.log("Initialisation du site manga...");
  
  // Initialiser les composants
  initSearch();
  
  // Charger les données en parallèle
  try {
    const [nouveautes, recommandations] = await Promise.all([
      fetchRomanceAnime(),
      fetchRandomAnime()
    ]);
    
    displayRomanceAnime(nouveautes);
    displayRecommandesAnime(recommandations);
    
  } catch (error) {
    console.error("Erreur lors du chargement initial:", error);
    showErrorMessages();
  }
});

// =========================
// GESTION DE LA RECHERCHE
// =========================
let searchInput;
let searchTimeout;

function initSearch() {
  searchInput = document.getElementById("searchInput");
  const searchButton = document.getElementById("searchButton");
  
  if (!searchInput) {
    console.warn("Champ de recherche non trouvé");
    return;
  }
  
  // Recherche au clic
  if (searchButton) {
    searchButton.addEventListener("click", searchAnime);
  }
  
  // Recherche à la saisie avec anti-rebond
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(searchAnime, SEARCH_DELAY);
  });
  
  // Recherche avec Entrée
  searchInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      clearTimeout(searchTimeout);
      searchAnime();
    }
  });
}

// Fonction de recherche (déjà fournie)
async function searchAnime() {
    const query = searchInput.value.trim();
    
    // Ignorer silencieusement si vide
    if (!query) {
        return;
    }

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
                            title { 
                                romaji 
                                english 
                                native 
                            }
                            coverImage { 
                                large 
                                extraLarge 
                            }
                            description
                            episodes
                            status
                            averageScore
                            genres
                            season
                            seasonYear
                            studios { 
                                nodes { 
                                    name 
                                } 
                            }
                            format
                            duration
                            startDate { 
                                year 
                                month 
                                day 
                            }
                            endDate { 
                                year 
                                month 
                                day 
                            }
                        }
                    }
                }`,
                variables: { search: query }
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

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

// =========================
// FONCTIONS UTILITAIRES
// =========================

function cleanHTML(text) {
  if (!text) return "Aucune description disponible";
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&[^;]+;/g, '')
    .replace(/\n/g, ' ');
}

function showErrorMessages() {
  const containers = [
    document.getElementById("nouveautesContainer"),
    ...document.querySelectorAll('.recommandes-ligne')
  ];
  
  containers.forEach(container => {
    if (container) {
      container.innerHTML = `
        <div class="error-message">
          <p>Erreur de chargement</p>
          <button onclick="location.reload()" 
                  style="margin-top: 10px; padding: 5px 10px; background: #000; color: #fff; border: none; cursor: pointer;">
            Réessayer
          </button>
        </div>`;
    }
  });
}

// =========================
// NOUVEAUTÉS ROMANCE
// =========================

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
              title { 
                romaji 
                english 
              }
              coverImage { 
                large 
              }
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
  if (!container) {
    console.error("Container nouveautesContainer non trouvé");
    return;
  }

  if (!list || list.length === 0) {
    container.innerHTML = `
      <div class="error-message">
        <p>Aucune nouveauté disponible</p>
        <button onclick="location.reload()" 
                style="margin-top: 10px; padding: 5px 10px; background: #000; color: #fff; border: none; cursor: pointer;">
          Réessayer
        </button>
      </div>`;
    return;
  }

  container.innerHTML = list.map(anime => `
    <div class="nouveaute-card" data-id="${anime.id}">
      <img class="nouveaute-poster" 
           src="${anime.coverImage.large}" 
           alt="${anime.title.romaji || anime.title.english}"
           loading="lazy"
           onerror="this.src='https://via.placeholder.com/210x300?text=Image+Manquante'">
      <div class="nouveaute-titre">
        ${anime.title.romaji || anime.title.english}
        ${anime.averageScore ? `<br><small>Score: ${anime.averageScore}/100</small>` : ''}
      </div>
    </div>
  `).join("");

  // Ajouter les événements clic
  container.querySelectorAll(".nouveaute-card").forEach((card, i) => {
    card.onclick = () => window.showAnimeDetails(list[i]);
    card.style.cursor = "pointer";
  });
}

// =========================
// RECOMMANDÉS ALÉATOIRES
// =========================

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
              title { 
                romaji 
                english 
                native 
              }
              coverImage { 
                large 
              }
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
    document.querySelectorAll('.recommandes-ligne').forEach(container => {
      container.innerHTML = `
        <div class="error-message">
          <p>Erreur de chargement</p>
          <button onclick="location.reload()" 
                  style="margin-top: 10px; padding: 5px 10px; background: #000; color: #fff; border: none; cursor: pointer;">
            Réessayer
          </button>
        </div>`;
    });
    return;
  }

  // Diviser en 4 lignes (comme votre HTML)
  const lignes = [
    list.slice(0, 5),    // ligne1
    list.slice(5, 10),   // ligne2
    list.slice(10, 14),  // ligne3 (note: votre HTML saute ligne3)
    list.slice(14, 19)   // ligne4
  ];

  // IDs des conteneurs (selon votre HTML)
  const containerIds = ['ligne1', 'ligne2', 'ligne4'];
  
  lignes.forEach((ligne, i) => {
    // Sauter ligne3 si non présente dans le HTML
    if (i === 2) return;
    
    const container = document.getElementById(containerIds[i]);
    if (!container) {
      console.error(`Container ${containerIds[i]} non trouvé`);
      return;
    }

    container.innerHTML = ligne.map(anime => `
      <div class="recommande-card" data-id="${anime.id}">
        <img class="recommande-poster" 
             src="${anime.coverImage.large}" 
             alt="${anime.title.romaji || anime.title.english}"
             loading="lazy"
             onerror="this.src='https://via.placeholder.com/150x225?text=Image+Manquante'">
        <div class="recommande-titre">
          ${(anime.title.romaji || anime.title.english || "").substring(0, 20)}
          ${(anime.title.romaji || anime.title.english || "").length > 20 ? '...' : ''}
        </div>
      </div>
    `).join("");

    // Ajouter les événements clic
    container.querySelectorAll(".recommande-card").forEach((card, idx) => {
      card.onclick = () => window.showAnimeDetails(ligne[idx]);
      card.style.cursor = "pointer";
    });
  });
}

// =========================
// MODALES (déjà fournies)
// =========================

function showSearchResults(list, query) {
  // Créer la modale
  const modal = document.createElement("div");
  modal.className = "search-modal active";
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    z-index: 1000;
    padding: 40px 20px;
    overflow: auto;
    display: block;
  `;

  modal.innerHTML = `
    <div class="search-modal-content">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h2 style="margin: 0; color: #fff;">Résultats pour "${query}"</h2>
        <button onclick="this.closest('.search-modal').remove()" 
                style="background: #fff; color: #000; border: 2px solid #000; padding: 8px 16px; cursor: pointer; font-family: inherit; font-size: 1rem; font-weight: bold;">
          Fermer
        </button>
      </div>
      <div class="search-modal-results" style="display: grid; gap: 15px;">
        ${list.map(anime => `
          <div class="search-result-item" 
               onclick="window.showAnimeDetails(${JSON.stringify(anime).replace(/"/g, '&quot;')})"
               style="border: 2px solid #fff; padding: 15px; cursor: pointer; background: #222; color: #fff; transition: transform 0.2s;">
            <img src="${anime.coverImage.large}" 
                 style="width: 80px; float: left; margin-right: 10px; border: 1px solid #fff;">
            <div>
              <strong style="display: block; margin-bottom: 5px; font-size: 1.1rem; color: #f3c5f6;">
                ${anime.title.romaji || anime.title.english || anime.title.native}
              </strong>
              <p style="margin: 0; font-size: 0.9rem; color: #ccc;">
                Score: ${anime.averageScore ? anime.averageScore + "/100" : "N/A"}
                ${anime.episodes ? ` • ${anime.episodes} épisodes` : ""}
              </p>
              <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: #aaa; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">
                ${cleanHTML(anime.description).substring(0, 100)}...
              </p>
            </div>
            <div style="clear: both;"></div>
          </div>
        `).join("")}
      </div>
    </div>
  `;

  // Effet hover
  modal.querySelectorAll('.search-result-item').forEach(item => {
    item.onmouseenter = () => item.style.transform = 'scale(1.02)';
    item.onmouseleave = () => item.style.transform = 'scale(1)';
  });

  // Fermer en cliquant en dehors
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };

  document.body.appendChild(modal);
}

// Fonction globale accessible depuis le HTML
window.showAnimeDetails = function(anime) {
  // Supprimer toute modale existante
  document.querySelectorAll('.search-modal').forEach(m => m.remove());

  const modal = document.createElement("div");
  modal.className = "search-modal active";
  modal.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.95);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1001;
    padding: 20px;
  `;

  const description = cleanHTML(anime.description);
  
  modal.innerHTML = `
    <div style="background: #222; color: #fff; padding: 30px; max-width: 800px; max-height: 90vh; border: 3px solid #fff; overflow: auto; position: relative; font-family: Arial, sans-serif;">
      <button onclick="this.closest('.search-modal').remove()" 
              style="position: absolute; top: 10px; right: 10px; background: #fff; color: #000; border: none; width: 30px; height: 30px; cursor: pointer; font-family: inherit; font-weight: bold; border-radius: 50%;">
        X
      </button>
      
      <div style="display: flex; flex-wrap: wrap; gap: 20px; margin-bottom: 20px;">
        <img src="${anime.coverImage.extraLarge || anime.coverImage.large}" 
             style="width: 250px; height: auto; border: 2px solid #fff;"
             onerror="this.src='https://via.placeholder.com/250x350?text=Image+Manquante'">
        <div style="flex: 1; min-width: 300px;">
          <h2 style="margin-top: 0; color: #f3c5f6; border-bottom: 2px solid #f3c5f6; padding-bottom: 10px;">
            ${anime.title.romaji || anime.title.english || anime.title.native}
          </h2>
          
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-bottom: 20px;">
            ${anime.averageScore ? `
              <div style="background: #333; padding: 10px; border-radius: 5px;">
                <strong style="color: #f3c5f6;">Score:</strong><br>
                <span style="font-size: 1.5rem; color: #f3c5f6;">${anime.averageScore}/100</span>
              </div>
            ` : ""}
            
            ${anime.episodes ? `
              <div style="background: #333; padding: 10px; border-radius: 5px;">
                <strong style="color: #f3c5f6;">Épisodes:</strong><br>
                <span style="font-size: 1.5rem;">${anime.episodes}</span>
              </div>
            ` : ""}
            
            ${anime.seasonYear ? `
              <div style="background: #333; padding: 10px; border-radius: 5px;">
                <strong style="color: #f3c5f6;">Année:</strong><br>
                <span style="font-size: 1.5rem;">${anime.seasonYear}</span>
              </div>
            ` : ""}
            
            ${anime.format ? `
              <div style="background: #333; padding: 10px; border-radius: 5px;">
                <strong style="color: #f3c5f6;">Format:</strong><br>
                <span style="font-size: 1.5rem;">${anime.format}</span>
              </div>
            ` : ""}
          </div>
          
          ${anime.genres && anime.genres.length ? `
            <div style="margin-bottom: 15px;">
              <strong style="color: #f3c5f6; display: block; margin-bottom: 5px;">Genres:</strong>
              ${anime.genres.map(genre => `
                <span style="display: inline-block; background: #555; color: #fff; padding: 5px 10px; margin: 2px; border-radius: 3px; border: 1px solid #f3c5f6;">
                  ${genre}
                </span>
              `).join("")}
            </div>
          ` : ""}
        </div>
      </div>
      
      ${description ? `
        <div>
          <h3 style="color: #f3c5f6; border-bottom: 2px solid #f3c5f6; padding-bottom: 5px;">Synopsis</h3>
          <p style="line-height: 1.6; background: #333; padding: 15px; border-radius: 5px;">${description}</p>
        </div>
      ` : ""}
    </div>
  `;

  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  };

  document.body.appendChild(modal);
};