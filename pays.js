const gameZone = document.getElementById('game-zone');
const playBtn = document.getElementById('play-btn');
const regionLinks = document.querySelectorAll('#region-nav a');

let currentRegion = 'all'; 
let countries = [];

// Mapping des régions françaises vers les noms API REST Countries
const regionMap = {
    'all': 'all',
    'europe': 'europe',
    'amerique': 'americas',
    'afrique': 'africa',
    'asie': 'asia',
    'oceanie': 'oceania',
    'accueil': 'accueil'
};

// Fonction pour charger les pays d'une région
async function fetchCountries(region) {
    let url = "https://restcountries.com/v3.1/all";
    const apiRegion = regionMap[region];
    
    if (apiRegion && apiRegion !== 'all') {
        url = `https://restcountries.com/v3.1/region/${apiRegion}`;
    }

    try {
        const response = await fetch(url);
        countries = await response.json();
        const regionName = region.charAt(0).toUpperCase() + region.slice(1);
        gameZone.innerHTML = `<p id="message">Région ${regionName} chargée ! Cliquez sur le bouton pour voir un drapeau.</p>`;
    } catch (error) {
        gameZone.innerHTML = `<p id="message">Erreur de chargement...</p>`;
    }
}

// Charger tous les pays au démarrage
fetchCountries('all');

// Changer de région au clic sur le menu
regionLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const dataRegion = link.getAttribute('data-region');
        
        // Si c'est "Accueil", rafraîchir la page
        if (dataRegion === 'accueil') {
            location.reload();
            return;
        }
        
        currentRegion = dataRegion;
        fetchCountries(currentRegion);
    });
});

// Afficher un drapeau avec 3 choix de réponse
playBtn.addEventListener('click', () => {
    if (countries.length === 0) {
        alert("Choisis d'abord une région en haut !");
        return;
    }

    // Ajouter la classe pour enlever la bordure
    gameZone.classList.add('playing');

    // Sélectionner un pays aléatoire
    const randomIndex = Math.floor(Math.random() * countries.length);
    const correctCountry = countries[randomIndex];

    // Générer 2 mauvaises réponses différentes
    let wrongCountries = [];
    while (wrongCountries.length < 2) {
        const wrongIndex = Math.floor(Math.random() * countries.length);
        const wrongCountry = countries[wrongIndex];
        
        // Éviter de dupliquer la bonne réponse et les doublons
        if (wrongCountry.name.common !== correctCountry.name.common && 
            !wrongCountries.some(c => c.name.common === wrongCountry.name.common)) {
            wrongCountries.push(wrongCountry);
        }
    }

    // Créer un tableau avec les 3 options et le mélanger
    let options = [correctCountry, ...wrongCountries];
    options = options.sort(() => Math.random() - 0.5);

    // Afficher le drapeau et les options
    gameZone.innerHTML = `
        <div id="flag-container">
            <img src="${correctCountry.flags.svg}" alt="Drapeau" style="max-height: 150px;">
        </div>
        <div id="options-container">
            ${options.map((country) => `
                <button class="option-btn" data-correct="${country.name.common === correctCountry.name.common}">
                    ${country.translations.fra.common}
                </button>
            `).join('')}
        </div>
        <div id="result-message"></div>
    `;

    // Ajouter les événements aux boutons
    const optionBtns = document.querySelectorAll('.option-btn');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const isCorrect = btn.getAttribute('data-correct') === 'true';
            
            // Désactiver tous les boutons
            optionBtns.forEach(b => b.disabled = true);

            if (isCorrect) {
                btn.style.backgroundColor = '#90EE90';
                btn.style.borderColor = '#00A000';
                document.getElementById('result-message').innerHTML = `<p style="color: green; font-size: 20px; margin-top: 20px; font-weight: bold;">✓ Correct !</p>`;
            } else {
                btn.style.backgroundColor = '#FFB6C6';
                btn.style.borderColor = '#FF0000';
                // Afficher la bonne réponse
                const correctBtn = Array.from(optionBtns).find(b => b.getAttribute('data-correct') === 'true');
                correctBtn.style.backgroundColor = '#90EE90';
                correctBtn.style.borderColor = '#00A000';
                document.getElementById('result-message').innerHTML = `<p style="color: red; font-size: 20px; margin-top: 20px; font-weight: bold;">✗ Mauvaise réponse ! La bonne réponse était : ${correctCountry.translations.fra.common}</p>`;
            }
        });
    });
    
    // Bonus : Affiche le nom dans la console
    console.log("Le pays à deviner est :", correctCountry.translations.fra.common);
});