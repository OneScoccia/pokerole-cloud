import React, { useState, useEffect } from 'react';
// --- IMPORT FIREBASE ---
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

// --- CONFIGURAZIONE FIREBASE ---
const firebaseConfig = {
  apiKey: "AIzaSyCv8OLNHZoBvsqAHxGSBkOsz6BEqrPVpJ8",
  authDomain: "pokerole-8b426.firebaseapp.com",
  projectId: "pokerole-8b426",
  storageBucket: "pokerole-8b426.firebasestorage.app",
  messagingSenderId: "317006598417",
  appId: "1:317006598417:web:7dd0827ed474ae5de77cb0",
  measurementId: "G-6LLYPB5ST5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// --- COLORI E DIZIONARI UFFICIALI ---
const typeColors = {
  Normal: '#A8A77A', Fire: '#EE8130', Water: '#6390F0', Electric: '#F7D02C',
  Grass: '#7AC74C', Ice: '#96D9D6', Fighting: '#C22E28', Poison: '#A33EA1',
  Ground: '#E2BF65', Flying: '#A98FF3', Psychic: '#F95587', Bug: '#A6B91A',
  Rock: '#B6A136', Ghost: '#735797', Dragon: '#6F35FC', Dark: '#705898',
  Steel: '#B7B7CE', Fairy: '#D685AD', None: '#333333'
};

const tradTipi = {
  Normal: 'Normale', Fire: 'Fuoco', Water: 'Acqua', Electric: 'Elettro',
  Grass: 'Erba', Ice: 'Ghiaccio', Fighting: 'Lotta', Poison: 'Veleno',
  Ground: 'Terra', Flying: 'Volante', Psychic: 'Psico', Bug: 'Coleottero',
  Rock: 'Roccia', Ghost: 'Spettro', Dragon: 'Drago', Dark: 'Buio',
  Steel: 'Acciaio', Fairy: 'Folletto', None: 'Nessuno'
};

const tradStats = { Strength: 'FORZA', Dexterity: 'DESTREZZA', Vitality: 'VITALITÀ', Special: 'SPECIALE', Insight: 'ACUME' };

const tradTrainerSkills = {
  Brawl: 'Rissa', Throw: 'Lancio', Evasion: 'Evasione', Weapons: 'Armi',
  Alert: 'Allerta', Athletic: 'Atletica', Nature: 'Natura', Stealth: 'Furtività', Survival: 'Sopravvivenza',
  Allure: 'Fascino', Etiquette: 'Etichetta', Intimidate: 'Intimidire', Perform: 'Esibire',
  Lore: 'Storia/Cultura', Medicine: 'Medicina', Science: 'Scienza', Crafts: 'Artigianato', Command: 'Comandare'
};

const tradPkmSkills = {
  Brawl: 'Rissa', Channel: 'Incanalare', Clash: 'Contrasto', Evasion: 'Evasione',
  Alert: 'Allerta', Athletic: 'Atletica', Nature: 'Natura', Stealth: 'Furtività',
  Allure: 'Fascino', Etiquette: 'Etichetta', Intimidate: 'Intimidire', Perform: 'Esibire'
};

const tradStrumentiEngToIta = {
  "Pokeball": "Poké Ball", "Greatball": "Mega Ball", "Ultraball": "Ultra Ball", "Masterball": "Master Ball",
  "Potion": "Pozione", "Super Potion": "Superpozione", "Hyper Potion": "Iperpozione", "Max Potion": "Pozione Max",
  "Full Restore": "Ricarica Totale", "Revive": "Revitalizzante", "Max Revive": "Revitalizzante Max", "Full Heal": "Cura Totale",
  "Antidote": "Antidoto", "Paralyze Heal": "Antiparalisi", "Awakening": "Sveglia", "Burn Heal": "Antiscottatura", "Ice Heal": "Antigelo",
  "Elixir": "Elisir", "Max Elixir": "Elisir Max", "Ether": "Etere", "Max Ether": "Etere Max"
};

const tradMosseEngToIta = {
  "Tackle": "Azione", "Scratch": "Graffio", "Ember": "Braciere", "Water Gun": "Pistolacqua", 
  "Thunder Shock": "Sottocarica", "Vine Whip": "Frustata", "Razor Leaf": "Foglielama", 
  "Flamethrower": "Lanciafiamme", "Surf": "Surf", "Ice Beam": "Geloraggio", "Thunderbolt": "Fulmine", 
  "Psychic": "Psichico"
};

const tradStrumentiItaToEng = Object.fromEntries(Object.entries(tradStrumentiEngToIta).map(([eng, ita]) => [ita, eng]));

const tNomePkm = (nome) => {
  return nome.replace('(Mega Form)', '(Mega)')
             .replace('(Mega X Form)', '(Mega X)')
             .replace('(Mega Y Form)', '(Mega Y)')
             .replace('(Alolan Form)', '(Forma di Alola)')
             .replace('(Galarian Form)', '(Forma di Galar)')
             .replace('(Hisuian Form)', '(Forma di Hisui)')
             .replace('(Paldean Form)', '(Forma di Paldea)');
};

const tCatMosse = (cat) => cat === 'Physical' ? 'Fisico' : cat === 'Special' ? 'Speciale' : 'Supporto';
const tItem = (engName) => tradStrumentiEngToIta[engName] || engName;
const tMossa = (engName) => tradMosseEngToIta[engName] || engName;

const listaStrumentiBase = [
  "Beast Ball", "Cherish Ball", "Dive Ball", "Dream Ball", "Dusk Ball", "Fast Ball", "Friend Ball", "Greatball", 
  "Heal Ball", "Heavy Ball", "Level Ball", "Love Ball", "Lure Ball", "Luxury Ball", "Masterball", "Moon Ball", 
  "Nest Ball", "Net Ball", "Park Ball", "Pokeball", "Premier Ball", "Quick Ball", "Repeat Ball", "Safari Ball", 
  "Sport Ball", "Timer Ball", "Ultraball", "Abomasite", "Absolite", "Aerodactylite", "Aggronite", "Alakazite", 
  "Altarianite", "Ampharosite", "Audinite", "Banettite", "Beedrillite", "Blastoisinite", "Blazikenite", "Cameruptite", 
  "Charizardite X", "Charizardite Y", "Diancite", "Galladite", "Garchompite", "Gardevoirite", "Gengarite", "Glalitite", 
  "Gyaradosite", "Heracronite", "Houndoominite", "Kangaskhanite", "Latiasite", "Latiosite", "Lopunnite", "Lucarionite", 
  "Manectite", "Mawilite", "Medichamite", "Metagrossite", "Mewtwonite X", "Mewtwonite Y", "Pidgeotite", "Pinsirite", 
  "Sablenite", "Salamencite", "Sceptilite", "Scizorite", "Sharpedonite", "Slowbronite", "Steelixite", "Swampertite", 
  "Tyranitarite", "Venusaurite", "Antidote", "Aspear Berry", "Awakening", "Berry Juice", "Burn Heal", "Cheri Berry", 
  "Chesto Berry", "Elixir", "Energy Powder", "Energy Root", "Enigma Berry", "Ether", "Fresh Water", "Full Heal", 
  "Full Restore", "Heal Powder", "Hyper Potion", "Ice Heal", "Lemonade", "Leppa Berry", "Lum Berry", "Max Elixir", 
  "Max Ether", "Max Potion", "Max Revive", "Moomoo Milk", "Oran Berry", "Paralyze Heal", "Pecha Berry", "Persim Berry", 
  "Potion", "Rawst Berry", "Revival Herb", "Revive", "Sitrus Berry", "Soda Pop", "Super Potion", "Ability Capsule", 
  "Ability Patch", "Absorb Bulb", "Adamant Orb", "Air Balloon", "Amulet Coin", "Armor Fossil", "Assault Vest", 
  "Big Root", "Binding Band", "Black Belt", "Black Glasses", "Black Sludge", "Bright Powder", "Cell Battery", 
  "Charcoal", "Choice Band", "Choice Scarf", "Choice Specs", "Claw Fossil", "Cover Fossil", "Damp Rock", "Dawn Stone", 
  "Destiny Knot", "Dome Fossil", "Draco Plate", "Dragon Fang", "Dread Plate", "Dusk Stone", "Earth Plate", "Eject Button", 
  "Eject Pack", "Electric Seed", "Escape Rope", "Eviolite", "Expert Belt", "Fire Stone", "Fist Plate", "Flame Orb", 
  "Flame Plate", "Float Stone", "Focus Band", "Focus Sash", "Grassy Seed", "Grip Claw", "Hard Stone", "Heat Rock", 
  "Heavy-Duty Boots", "Helix Fossil", "Ice Stone", "Icicle Plate", "Icy Rock", "Insect Plate", "Iron Ball", "Iron Plate", 
  "Jaw Fossil", "Kings Rock", "Leaf Stone", "Leftovers", "Life Orb", "Light Ball", "Light Clay", "Luminous Moss", 
  "Macho Brace", "Magnet", "Meadow Plate", "Mental Herb", "Metal Coat", "Metronome", "Mind Plate", "Miracle Seed", 
  "Misty Seed", "Moon Stone", "Muscle Band", "Mystic Water", "Never-Melt Ice", "Old Amber", "Oval Stone", "Pixie Plate", 
  "Plume Fossil", "Poison Barb", "Power Anklet", "Power Band", "Power Belt", "Power Bracer", "Power Herb", "Power Lens", 
  "Power Weight", "Protective Pads", "Psychic Seed", "Quick Claw", "Rare Candy", "Razor Claw", "Razor Fang", "Red Card", 
  "Ring Target", "Rocky Helmet", "Room Service", "Root Fossil", "Rose Incense", "Safety Goggles", "Scope Lens", 
  "Sea Incense", "Sharp Beak", "Shed Shell", "Shell Bell", "Shiny Stone", "Shock Drive", "Silk Scarf", "Silver Powder", 
  "Skull Fossil", "Sky Plate", "Smooth Rock", "Snowball", "Soft Sand", "Spell Tag", "Splash Plate", "Spooky Plate", 
  "Sticky Barb", "Stone Plate", "Sun Stone", "Terrain Extender", "Thick Club", "Thunder Stone", "Toxic Orb", "Toxic Plate", 
  "Twisted Spoon", "Utility Umbrella", "Water Stone", "Wave Incense", "Weakness Policy", "White Herb", "Wide Lens", 
  "Wise Glasses", "Zap Plate"
];

const listaPokemon = [
"Bulbasaur", "Ivysaur", "Venusaur", "Venusaur (Mega Form)", "Charmander", "Charmeleon", "Charizard", "Charizard (Mega X Form)", "Charizard (Mega Y Form)", "Squirtle", "Wartortle", "Blastoise", "Blastoise (Mega Form)", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Beedrill (Mega Form)", "Pidgey", "Pidgeotto", "Pidgeot", "Pidgeot (Mega Form)", "Rattata", "Rattata (Alolan Form)", "Raticate", "Raticate (Alolan Form)", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Raichu (Alolan Form)", "Sandshrew", "Sandshrew (Alolan Form)", "Sandslash", "Sandslash (Alolan Form)", "Nidoran F", "Nidorina", "Nidoqueen", "Nidoran M", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Vulpix (Alolan Form)", "Ninetales", "Ninetales (Alolan Form)", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Diglett (Alolan Form)", "Dugtrio", "Dugtrio (Alolan Form)", "Meowth", "Meowth (Alolan Form)", "Meowth (Galarian Form)", "Persian", "Persian (Alolan Form)",  "Toxel", "Toxtricity (Amped Form)", "Toxtricity (Low Key Form)", "Sizzlipede", "Centiskorch", "Clobbopus", "Grapploct", "Sinistea", "Polteageist", "Hatenna", "Hattrem", "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Obstagoon", "Perrserker", "Cursola", "Sirfetch'd", "Mr. Rime", "Runerigus", "Milcery", "Alcremie", "Falinks", "Pincurchin", "Snom", "Frosmoth", "Stonjourner", "Eiscue", "Indeedee", "Morpeko", "Cufant", "Copperajah", "Dracozolt", "Arctozolt", "Dracovish", "Arctovish", "Duraludon", "Dreepy", "Drakloak", "Dragapult", "Zacian", "Zamazenta", "Eternatus", "Kubfu", "Urshifu", "Zarude", "Regieleki", "Regidrago", "Glastrier", "Spectrier", "Calyrex", "Calyrex (Ice Rider Form)", "Calyrex (Shadow Rider Form)", "Wyrdeer", "Kleavor", "Ursaluna", "Basculegion (Female Form)","Basculegion (Male Form)", "Sneasler", "Overqwil", "Enamorus", "Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval", "Lechonk", "Oinkologne", "Tarountula", "Spidops", "Nymble", "Lokix", "Pawmi", "Pawmo", "Pawmot", "Tandemaus", "Maushold", "Fidough", "Dachsbun", "Smoliv", "Dolliv", "Arboliva", "Squawkabilly", "Nacli", "Naclstack", "Garganacl", "Charcadet", "Armarouge", "Ceruledge", "Tadbulb", "Bellibolt", "Wattrel", "Kilowattrel", "Maschiff", "Mabosstiff", "Shroodle", "Grafaiai", "Bramblin", "Brambleghast", "Toedscool", "Toedscruel", "Klawf", "Capsakid", "Scovillain", "Rellor", "Rabsca", "Flittle", "Espathra", "Tinkatink", "Tinkatuff", "Tinkaton", "Wiglett", "Wugtrio", "Bombirdier", "Finizen", "Palafin", "Varoom", "Revavroom", "Cyclizar", "Orthworm", "Glimmet", "Glimmora", "Greavard", "Houndstone", "Flamigo", "Cetoddle", "Cetitan", "Veluza", "Dondozo", "Tatsugiri", "Annihilape", "Clodsire", "Farigiraf", "Dudunsparce", "Kingambit", "Great Tusk", "Scream Tail", "Brute Bonnet", "Flutter Mane", "Slither Wing", "Sandy Shocks", "Iron Treads", "Iron Bundle", "Iron Hands", "Iron Jugulis", "Iron Moth", "Iron Thorns", "Frigibax", "Arctibax", "Baxcalibur", "Gimmighoul", "Gholdengo", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Roaring Moon", "Iron Valiant", "Koraidon", "Miraidon", "Venusaur (Gigantamax Form)", "Charizard (Gigantamax Form)", "Blastoise (Gigantamax Form)", "Pikachu (Gigantamax Form)", "Meowth (Gigantamax Form)", "Machamp (Gigantamax Form)", "Gengar (Gigantamax Form)", "Kingler (Gigantamax Form)", "Lapras (Gigantamax Form)", "Eevee (Gigantamax Form)", "Snorlax (Gigantamax Form)", "Garbodor (Gigantamax Form)", "Toxtricity (Gigantamax Form)", "Centiskorch (Gigantamax Form)", "Hatterene (Gigantamax Form)", "Grimmsnarl (Gigantamax Form)", "Alcremie (Gigantamax Form)", "Corviknight (Gigantamax Form)", "Urshifu (Gigantamax Form)", "Sandaconda (Gigantamax Form)", "Butterfree (Gigantamax Form)", "Ogerpon (Teal Mask Form)", "Ogerpon (Wellspring Mask Form)", "Ogerpon (Hearthflame Mask Form)", "Ogerpon (Cornerstone Mask Form)", "Poltchageist (Counterfeit Form)", "Poltchageist (Artisan Form)", "Sinistcha (Unremarkable Form)", "Sinistcha (Masterpiece Form)", "Urshifu (Single Strike Style)", "Urshifu (Rapid Strike Style)", "Lycanroc (Midday Form)", "Lycanroc (Midnight Form)", "Lycanroc (Dusk Form)", "Deoxys (Normal Form)", "Deoxys (Attack Form)", "Deoxys (Defense Form)", "Deoxys (Speed Form)", "Calyrex (Ice Rider)", "Calyrex (Shadow Rider)", "Meowstic (Male)", "Meowstic (Female)", "Indeedee (Male)", "Indeedee (Female)", "Oinkologne (Male)", "Oinkologne (Female)", "Basculegion (Male)", "Basculegion (Female)", "Basculin (Red-Striped Form)", "Basculin (Blue-Striped Form)", "Basculin (White-Striped Form)", "Tatsugiri (Curly Form)", "Tatsugiri (Droopy Form)", "Tatsugiri (Stretchy Form)", "Squawkabilly (Green Plumage)", "Squawkabilly (Blue Plumage)", "Squawkabilly (Yellow Plumage)", "Squawkabilly (White Plumage)", "Rotom (Normal Form)", "Rotom (Heat Form)", "Rotom (Wash Form)", "Rotom (Frost Form)", "Rotom (Fan Form)", "Rotom (Mow Form)", "Oricorio (Baile Style)", "Oricorio (Pom-Pom Style)", "Oricorio (Pa'u Style)", "Oricorio (Sensu Style)", "Terapagos (Normal Form)", "Terapagos (Terastal Form)", "Terapagos (Stellar Form)",
];

const statiPossibili = [
  { id: 'BRN', col: '#e67e22', label: '🔥 SCOTTATURA' }, { id: 'PAR', col: '#f1c40f', label: '⚡ PARALISI' },
  { id: 'PSN', col: '#9b59b6', label: '☠️ AVVELENATO' }, { id: 'SLP', col: '#3498db', label: '💤 SONNO' },
  { id: 'FRZ', col: '#81ecec', label: '❄️ CONGELATO' }, { id: 'CNF', col: '#e84393', label: '😵 CONFUSIONE' },
  { id: 'FLN', col: '#636e72', label: '💫 TENTENNAMENTO' }, { id: 'BLN', col: '#2d3436', label: '🕶️ ACCECATO' }
];

function App() {
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  const [tab, setTab] = useState("trainer"); 
  const [ricerca, setRicerca] = useState("");
  const [pkmTrovato, setPkmTrovato] = useState(null);
  const [squadra, setSquadra] = useState([]);
  const [dettagliMosse, setDettagliMosse] = useState({});
  const [zaino, setZaino] = useState([]);
  const [itemSelezionato, setItemSelezionato] = useState("");

  const [trainer, setTrainer] = useState({
    nome: "", player: "", age: 15, concept: "", nature: "",
    money: 3000, confidence: 1, currentHP: 2, currentWill: 4,
    stats: { Strength: 2, Dexterity: 2, Vitality: 2, Special: 2, Insight: 2 },
    skills: { 
      Brawl: 1, Throw: 0, Evasion: 1, Weapons: 0, 
      Alert: 1, Athletic: 0, Nature: 0, Stealth: 0, Survival: 0,
      Allure: 0, Etiquette: 0, Intimidate: 0, Perform: 0,
      Lore: 0, Medicine: 0, Science: 0, Crafts: 0, Command: 2
    }
  });

  const listaStrumenti = listaStrumentiBase.map(item => tradStrumentiEngToIta[item] || item).sort();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docSnap = await getDoc(doc(db, "utenti", currentUser.uid));
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.trainer) setTrainer(data.trainer);
            if (data.squadra) setSquadra(data.squadra);
            if (data.zaino) setZaino(data.zaino);
          }
        } catch (error) {
          console.error("Errore nel caricamento dati:", error);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const gestisciLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setAuthError("Errore credenziali. Contatta il Master.");
    }
  };

  const salvaSulCloud = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "utenti", user.uid), {
        trainer, squadra, zaino
      });
      alert("✅ Salvataggio sul Cloud completato con successo!");
    } catch (err) {
      alert("❌ Errore durante il salvataggio: " + err.message);
    }
  };

  const fetchData = async (folder, name) => {
    try {
      const url = process.env.PUBLIC_URL ? `${process.env.PUBLIC_URL}/data/${folder}/${encodeURIComponent(name)}.json` : `/data/${folder}/${encodeURIComponent(name)}.json`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch (e) { return null; }
  };

  const tiraDadi = (numero, nomeTradotto) => {
    if (isNaN(numero) || numero <= 0) return;
    let tiri = [], successi = 0;
    for (let i = 0; i < numero; i++) {
      let d = Math.floor(Math.random() * 6) + 1;
      tiri.push(d);
      if (d >= 4) successi++;
    }
    alert(`🎲 Lancio: ${nomeTradotto.toUpperCase()}\nDadi tirati: ${numero}\nRisultati: [${tiri.join(", ")}]\n✨ SUCCESSI: ${successi}`);
  };

  const cercaPokemon = async () => {
    const query = ricerca.trim().toLowerCase();
    if (!query) return;

    let nomeReale = listaPokemon.find(p => p.toLowerCase() === query);
    if (!nomeReale) nomeReale = listaPokemon.find(p => p.toLowerCase().startsWith(query + " ("));
    if (!nomeReale) return alert("Pokémon non trovato!");

    const isGmax = nomeReale.includes("Gigantamax");
    const nomeJSON = isGmax ? nomeReale.split(' (')[0] : nomeReale;

    const pkm = await fetchData('Pokedex', nomeJSON);
    if (pkm) {
      pkm.Moves.forEach(async (m) => {
        const moveData = await fetchData('Moves', m.Name);
        if (moveData) setDettagliMosse(prev => ({ ...prev, [m.Name]: moveData }));
      });
      const nomeBase = pkm.Name.split(' (')[0];
      pkm.availableForms = listaPokemon.filter(p => p === nomeBase || p.startsWith(nomeBase + " ("));
      pkm.currentForm = nomeReale; 
      setPkmTrovato(pkm);
    }
  };

  const aggiungiZaino = async (nomeItemScritto) => {
    const nomeFormattato = nomeItemScritto.trim();
    const nomeIngleseDB = tradStrumentiItaToEng[nomeFormattato] || nomeFormattato;
    
    const item = await fetchData('Items', nomeIngleseDB);
    if (item) {
      setZaino([...zaino, { ...item, qty: 1 }]);
    } else { 
      const conferma = window.confirm(`L'oggetto "${nomeFormattato}" non è stato trovato.\nVuoi aggiungerlo comunque come Oggetto Custom?`);
      if (conferma) {
        setZaino([...zaino, { Name: nomeIngleseDB, customName: nomeFormattato, Description: "Oggetto personalizzato", qty: 1 }]);
      }
    }
  };

  const rimuoviDalloZaino = (index) => {
    setZaino(zaino.filter((_, i) => i !== index));
  };

  const aggiungiASquadra = () => {
    if (pkmTrovato) {
      setSquadra([...squadra, { 
        ...pkmTrovato, id: Date.now(), curHP: pkmTrovato.Vitality, curWill: pkmTrovato.Insight,
        selectedMoves: ["", "", "", ""], activeStatus: [], heldItem: null, currentForm: pkmTrovato.Name,
        pkmSkills: { Brawl: 1, Channel: 1, Clash: 1, Evasion: 1, Alert: 1, Athletic: 1, Nature: 1, Stealth: 1, Allure: 1, Etiquette: 1, Intimidate: 1, Perform: 1 }
      }]);
      setPkmTrovato(null); setTab("squadra");
    }
  };

  const scambiaForma = async (idPkm, nuovaForma) => {
    const isGmax = nuovaForma.includes("Gigantamax");
    const nomeJSON = isGmax ? nuovaForma.split(' (')[0] : nuovaForma;

    const data = await fetchData('Pokedex', nomeJSON);
    if (data) {
      setSquadra(squadra.map(p => p.id === idPkm ? {
        ...p, ...data, curHP: Math.max(1, p.curHP + (data.Vitality - p.Vitality)), currentForm: nuovaForma
      } : p));
    }
  };

  // --- MOTORE DI RICERCA IMMAGINI MIGLIORATO (ANTI-404 SU GITHUB) ---
  const renderImmagine = (tipo, nome, stile) => {
    if (!nome) return null;
    const cartella = tipo === 'pokemon' ? 'BookSprites' : 'Items';
    
    // Configura il percorso base (fondamentale per GitHub Pages)
    const baseUrl = process.env.PUBLIC_URL || '';
    const basePath = `${baseUrl}/data/images/${cartella}/`;

    // formatPokemonName trasforma "Venusaur (Mega Form)" in "Venusaur-Mega"
    const formatPokemonName = (rawName) => {
      let clean = rawName.replace(/\s*Form\b/gi, ''); 
      clean = clean.replace(/\s*\(\s*/g, '-').replace(/\s*\)\s*/g, '').replace(/\s+/g, '-');
      return clean.replace(/-+/g, '-').replace(/-$/, ''); 
    };

    // Prepara il primo nome da provare
    const nomePulito = tipo === 'pokemon' ? formatPokemonName(nome) : nome.replace(/\s+/g, '');
    const nomeBase = nome.split(' (')[0]; 

    return (
      <img 
        key={nome}
        src={`${basePath}${encodeURIComponent(nomePulito)}.png`} // 1° Tentativo: "Venusaur-Mega.png" (o "PokeBall.png")
        alt={nome} 
        style={stile} 
        onError={(e) => { 
          // Contatore dei tentativi falliti salvato sul tag img
          const tr = parseInt(e.target.dataset.try || "0", 10);
          e.target.dataset.try = tr + 1;

          // Una vera e propria rete di salvataggio a cascata
          switch(tr) {
            case 0:
              // 2° TENTATIVO (SALVAVITA LINUX): Tutto minuscolo -> "venusaur-mega.png" o "pokeball.png"
              e.target.src = `${basePath}${encodeURIComponent(nomePulito.toLowerCase())}.png`;
              break;
            case 1:
              if (tipo === 'pokemon') {
                // 3° TENTATIVO PKM: Fallback al Pokémon Base -> "Venusaur.png"
                e.target.src = `${basePath}${encodeURIComponent(nomeBase)}.png`;
              } else {
                // 3° TENTATIVO ITEM: Originale con gli spazi -> "Poke Ball.png"
                e.target.src = `${basePath}${encodeURIComponent(nome)}.png`;
              }
              break;
            case 2:
              if (tipo === 'pokemon') {
                // 4° TENTATIVO PKM: Fallback al Base tutto minuscolo -> "venusaur.png"
                e.target.src = `${basePath}${encodeURIComponent(nomeBase.toLowerCase())}.png`;
              } else {
                // 4° TENTATIVO ITEM: Originale con gli spazi minuscolo -> "poke ball.png"
                e.target.src = `${basePath}${encodeURIComponent(nome.toLowerCase())}.png`;
              }
              break;
            case 3:
              // 5° TENTATIVO FINALE: Prova l'estensione maiuscola (.PNG)
              e.target.src = e.target.src.replace('.png', '.PNG');
              break;
            default:
              // Se dopo 5 tentativi non l'ha trovata, nasconde l'icona rotta
              e.target.style.display = 'none'; 
              break;
          }
        }} 
      />
    );
  };


  const renderTrainerSkillGroup = (title, skillsArray) => (
    <div style={styles.sheetBox}>
      <div style={styles.sheetBoxHeader}>{title}</div>
      <div style={{padding: '10px'}}>
        {skillsArray.map(k => (
          <div key={k} style={styles.sheetSkillRow} onClick={() => tiraDadi(trainer.skills[k] + trainer.stats.Insight, tradTrainerSkills[k])}>
            <span style={{fontSize: '14px', fontWeight: 'bold'}}>{tradTrainerSkills[k]}</span>
            <input type="number" value={trainer.skills[k]} onClick={e => e.stopPropagation()} onChange={e => setTrainer({...trainer, skills: {...trainer.skills, [k]: parseInt(e.target.value) || 0}})} style={styles.sheetMiniInput} />
          </div>
        ))}
      </div>
    </div>
  );

  
  const renderPkmSkillGroup = (title, skillsArray, p) => (
    <div style={styles.sheetBox}>
      <div style={styles.sheetBoxHeader}>{title}</div>
      <div style={{padding: '10px'}}>
        {skillsArray.map(k => (
          <div key={k} style={styles.sheetSkillRow} onClick={() => tiraDadi((p.pkmSkills[k] || 0) + p.Insight, tNomePkm(p.Name) + ' - ' + tradPkmSkills[k])}>
            <span style={{fontSize: '14px', fontWeight: 'bold'}}>{tradPkmSkills[k]}</span>
            <input type="number" value={p.pkmSkills[k] || 0} onClick={e => e.stopPropagation()} onChange={e => setSquadra(squadra.map(x => x.id === p.id ? {...x, pkmSkills: {...x.pkmSkills, [k]: parseInt(e.target.value) || 0}} : x))} style={styles.sheetMiniInput} />
          </div>
        ))}
      </div>
    </div>
  );

  if (!user) {
    return (
      <div style={{...styles.container, display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div style={styles.physicalSheet}>
          <div style={styles.sheetHeader}>
            <h1 style={{margin: 0, fontSize: '28px', letterSpacing: '2px'}}>LEGA POKÉMON</h1>
            <h3 style={{margin: '5px 0 0 0', fontSize: '14px', color: '#ff4757', fontWeight: 'bold'}}>ACCESSO AL TERMINALE PRIVATO</h3>
          </div>
          <form onSubmit={gestisciLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <div style={styles.sheetInputBox}>
              <label style={styles.sheetLabel}>EMAIL</label>
              <input type="email" style={styles.sheetInput} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={styles.sheetInputBox}>
              <label style={styles.sheetLabel}>PASSWORD</label>
              <input type="password" style={styles.sheetInput} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {authError && <div style={{color: '#ff4757', fontSize: '13px', textAlign: 'center', fontWeight: 'bold'}}>{authError}</div>}
            <button type="submit" style={styles.btnSuccess}>ENTRA NEL TERMINALE</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <button onClick={() => setTab("trainer")} style={tab === "trainer" ? styles.navActive : styles.navBtn}>👤 ALLENATORE</button>
        <button onClick={() => setTab("squadra")} style={tab === "squadra" ? styles.navActive : styles.navBtn}>🎒 SQUADRA ({squadra.length})</button>
        <button onClick={() => setTab("pokedex")} style={tab === "pokedex" ? styles.navActive : styles.navBtn}>🔍 POKÉDEX</button>
        <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '10px', gap: '10px'}}>
          <button onClick={salvaSulCloud} style={{...styles.btnSuccess, padding: '10px', width: 'auto', marginTop: 0, fontSize: '14px'}}>☁️ SALVA</button>
          <button onClick={() => signOut(auth)} style={{...styles.btnDelPkm, padding: '10px'}}>ESCI</button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {tab === "trainer" && (
          <div style={styles.physicalSheet}>
            <div style={styles.sheetHeader}>
              <h1 style={{margin: 0, fontSize: '28px', letterSpacing: '2px'}}>SCHEDA ALLENATORE</h1>
            </div>
            <div style={styles.sheetGridRow}>
              <div style={styles.sheetInputBox}><label style={styles.sheetLabel}>NOME</label><input style={styles.sheetInput} value={trainer.nome} onChange={e => setTrainer({...trainer, nome: e.target.value})} /></div>
              <div style={styles.sheetInputBox}><label style={styles.sheetLabel}>RANGO</label><input style={styles.sheetInput} value={trainer.rango} onChange={e => setTrainer({...trainer, rango: e.target.value})} /></div>
              <div style={styles.sheetInputBox}><label style={styles.sheetLabel}>SOLDI</label><input type="number" style={styles.sheetInput} value={trainer.money} onChange={e => setTrainer({...trainer, money: e.target.value})} /></div>
            </div>
            <div style={{...styles.sheetGridRow, marginTop: '15px'}}>
              <div style={{...styles.sheetInputBox, backgroundColor: '#2d1b1b', borderColor: '#ff4757'}}>
                <label style={{...styles.sheetLabel, color: '#ff4757'}}>PS</label>
                <input type="number" style={{...styles.sheetInput, color: '#ff4757', textAlign: 'center', fontSize: '24px'}} value={trainer.currentHP} onChange={e => setTrainer({...trainer, currentHP: e.target.value})} />
              </div>
              <div style={{...styles.sheetInputBox, backgroundColor: '#1b2d2d', borderColor: '#4bcffa'}}>
                <label style={{...styles.sheetLabel, color: '#4bcffa'}}>VOLONTÀ</label>
                <input type="number" style={{...styles.sheetInput, color: '#4bcffa', textAlign: 'center', fontSize: '24px'}} value={trainer.currentWill} onChange={e => setTrainer({...trainer, currentWill: e.target.value})} />
              </div>
            </div>
            <div style={{display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap'}}>
              <div style={{flex: '0.8', display: 'flex', flexDirection: 'column', gap: '10px'}}>
                <div style={{...styles.sheetBoxHeader, backgroundColor: '#444'}}>ATTRIBUTI</div>
                {Object.entries(trainer.stats).map(([k, v]) => (
                  <div key={k} style={styles.sheetAttributeBox}>
                    <label style={styles.sheetAttributeLabel}>{tradStats[k]}</label>
                    <input type="number" value={v} onChange={e => setTrainer({...trainer, stats: {...trainer.stats, [k]: parseInt(e.target.value) || 0}})} style={styles.sheetAttributeInput} />
                  </div>
                ))}
              </div>
              <div style={{flex: '2', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                {renderTrainerSkillGroup("COMBATTIMENTO", ['Brawl', 'Throw', 'Evasion', 'Weapons'])}
                {renderTrainerSkillGroup("SOPRAVVIVENZA", ['Alert', 'Athletic', 'Nature', 'Stealth', 'Survival'])}
                {renderTrainerSkillGroup("SOCIALI", ['Allure', 'Etiquette', 'Intimidate', 'Perform'])}
                {renderTrainerSkillGroup("CONOSCENZA", ['Crafts', 'Lore', 'Medicine', 'Science', 'Command'])}
              </div>
            </div>
            <div style={{marginTop: '25px', ...styles.sheetBox}}>
              <div style={styles.sheetBoxHeader}>INVENTARIO</div>
              <div style={{padding: '15px'}}>
                <div style={{display:'flex', gap: 10, marginBottom: 15}}>
                  <input list="strumenti-disponibili" style={styles.searchBar} value={itemSelezionato} onChange={(e) => setItemSelezionato(e.target.value)} placeholder="Strumento..." />
                  <datalist id="strumenti-disponibili">{listaStrumenti.map(item => <option key={item} value={item} />)}</datalist>
                  <button onClick={() => { if(itemSelezionato) { aggiungiZaino(itemSelezionato); setItemSelezionato(""); } }} style={styles.btnCercaMini}> + </button>
                </div>
                {zaino.map((item, i) => (
                  <div key={i} style={styles.sheetItemRow}>
                    <div style={styles.imgContainer}>
                      {renderImmagine('item', item.Name, styles.itemImage)}
                    </div>
                    
                    <div style={{flex: 1, marginLeft: 15}}>
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <strong style={{color: '#fff', fontSize: '16px'}}>{item.customName || tItem(item.Name)}</strong>
                        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
                          <input type="number" value={item.qty} style={styles.sheetMiniInput} onChange={e => { const n = [...zaino]; n[i].qty = parseInt(e.target.value); setZaino(n); }} />
                          <button onClick={() => rimuoviDalloZaino(i)} style={{background: 'none', border: 'none', cursor: 'pointer'}}>❌</button>
                        </div>
                      </div>
                      <div style={{fontSize: '12px', color: '#aaa', fontStyle: 'italic', marginTop: '3px'}}>{item.Description}</div>
                      {item.Effect && (
                        <div style={styles.effectBox}>
                          <strong>EFFETTO:</strong> {item.Effect}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "squadra" && (
          <div>
            {squadra.map(p => (
              <div key={p.id} style={{...styles.physicalSheet, marginBottom: '40px', borderLeft: '8px solid #ff4757'}}>
                <div style={styles.sheetHeader}><h1>SCHEDA POKÉMON</h1></div>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '0 0 140px', textAlign: 'center', backgroundColor: '#222', borderRadius: '15px', padding: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', margin: '0 auto' }}>
                    {renderImmagine('pokemon', p.currentForm, { width: '120px', height: '120px', objectFit: 'contain' })}
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '250px' }}>
                    <div style={styles.sheetGridRow}>
                      <div style={{...styles.sheetInputBox, flex: 2}}>
                        <label style={styles.sheetLabel}>NOME</label>
                        <input style={styles.sheetInput} value={tNomePkm(p.Name)} readOnly />
                        <div style={{display: 'flex', gap: '5px', marginTop: '5px'}}>
                          <span style={{...styles.typeBadge, backgroundColor: typeColors[p.Type1]}}>{tradTipi[p.Type1]}</span>
                          {p.Type2 && p.Type2 !== "None" && (
                            <span style={{...styles.typeBadge, backgroundColor: typeColors[p.Type2]}}>{tradTipi[p.Type2]}</span>
                          )}
                        </div>
                      </div>
                      {p.availableForms && p.availableForms.length > 1 && (
                        <div style={{...styles.sheetInputBox, flex: 1.5}}>
                          <label style={styles.sheetLabel}>FORMA</label>
                          <select style={{...styles.sheetInput, backgroundColor: '#252525'}} value={p.currentForm} onChange={(e) => scambiaForma(p.id, e.target.value)}>
                             {p.availableForms.map(f => <option key={f} value={f}>{tNomePkm(f)}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <div style={styles.sheetGridRow}>
                      <div style={{...styles.sheetInputBox, backgroundColor: '#2d1b1b', borderColor: '#ff4757'}}>
                        <label style={{...styles.sheetLabel, color: '#ff4757'}}>PS</label>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
                          <button onClick={() => setSquadra(squadra.map(x => x.id === p.id ? {...x, curHP: x.curHP-1} : x))} style={styles.btnCircleMin}>-</button>
                          <span style={{ fontSize: '22px', color: '#ff4757', fontWeight: 'bold' }}>{p.curHP} / {p.Vitality}</span>
                          <button onClick={() => setSquadra(squadra.map(x => x.id === p.id ? {...x, curHP: x.curHP+1} : x))} style={styles.btnCircleMin}>+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{...styles.sheetBox, marginBottom: '20px'}}>
                  <div style={styles.sheetBoxHeader}>STATI ALTERATI</div>
                  <div style={{ padding: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {statiPossibili.map(s => (
                      <button key={s.id} onClick={() => {
                        const active = p.activeStatus.includes(s.id) ? p.activeStatus.filter(x => x!==s.id) : [...p.activeStatus, s.id];
                        setSquadra(squadra.map(x => x.id === p.id ? {...x, activeStatus: active} : x));
                      }} style={{...styles.statusBtn, backgroundColor: p.activeStatus.includes(s.id) ? s.col : '#2d2d2d'}}>{s.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap' }}>
                  <div style={{ flex: '0.8', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px' }}>
                    <div style={{...styles.sheetBoxHeader, backgroundColor: '#444'}}>ATTRIBUTI</div>
                    {['Strength', 'Dexterity', 'Vitality', 'Special', 'Insight'].map(s => (
                      <div key={s} style={styles.sheetAttributeBox}>
                        <label style={styles.sheetAttributeLabel}>{tradStats[s]}</label>
                        <input type="number" value={p[s]} onChange={e => setSquadra(squadra.map(x => x.id === p.id ? {...x, [s]: parseInt(e.target.value) || 0} : x))} style={styles.sheetAttributeInput} />
                      </div>
                    ))}
                  </div>
                  <div style={{ flex: '2', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px' }}>
                    {renderPkmSkillGroup("LOTTA", ['Brawl', 'Channel', 'Clash', 'Evasion'], p)}
                    {renderPkmSkillGroup("SOPRAVVIVENZA", ['Alert', 'Athletic', 'Nature', 'Stealth'], p)}
                    {renderPkmSkillGroup("SOCIALE", ['Allure', 'Etiquette', 'Intimidate', 'Perform'], p)}
                  </div>
                </div>

                <div style={{ marginTop: '25px', ...styles.sheetBox }}>
                  <div style={styles.sheetBoxHeader}>MOSSE</div>
                  <div style={{ padding: '15px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '15px' }}>
                    {[0, 1, 2, 3].map(i => {
                      const mossaNome = p.selectedMoves[i];
                      const info = dettagliMosse[mossaNome];
                      let baseStat = 0, accVal = 0, dmgVal = "-";
                      if (info) {
                        baseStat = info.Category === "Special" ? p.Special : (info.Category === "Physical" ? p.Strength : Math.max(p.Insight, p.Dexterity));
                        accVal = parseInt(info.Accuracy) || 0;
                        dmgVal = parseInt(info.Power || info.Damage) || "-";
                      }
                      const prec = baseStat + trainer.skills.Command + accVal;
                      return (
                        <div key={i} style={styles.sheetMoveCard}>
                          <select style={{...styles.sheetInput, backgroundColor: '#111', padding: '10px'}} value={mossaNome} onChange={(e) => {
                            const n = [...p.selectedMoves]; n[i] = e.target.value;
                            setSquadra(squadra.map(x => x.id === p.id ? {...x, selectedMoves: n} : x));
                          }}>
                            <option value="">-- Seleziona --</option>
                            {p.Moves.map(m => <option key={m.Name} value={m.Name}>{tMossa(m.Name)}</option>)}
                          </select>
                          {info && (
                            <div style={{marginTop: 10, borderTop: `2px solid ${typeColors[info.Type]}`, paddingTop: 10}}>
                              <div style={{display:'flex', justifyContent:'space-between', fontSize: 14}}>
                                <span style={{color: typeColors[info.Type], fontWeight:'bold'}}>{tradTipi[info.Type]}</span>
                                <span>{tCatMosse(info.Category)}</span>
                                <span style={{cursor:'pointer'}} onClick={() => tiraDadi(prec, tMossa(mossaNome))}>🎲 {prec} | 💥 {dmgVal === "-" ? "-" : (baseStat + dmgVal)}</span>
                              </div>
                              <div style={{fontSize: 12, color:'#aaa', fontStyle:'italic', marginTop: 5}}>{info.Effect || info.Description}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div style={{textAlign: 'right', marginTop: '10px'}}><button onClick={() => setSquadra(squadra.filter(x => x.id !== p.id))} style={styles.btnDelPkm}>RIMUOVI</button></div>
              </div>
            ))}
          </div>
        )}

        {tab === "pokedex" && (
          <div style={{textAlign:'center'}}>
            <input list="pokemon-disponibili" style={styles.bigSearch} value={ricerca} onChange={e => setRicerca(e.target.value)} placeholder="Nome Pokémon..." />
            <datalist id="pokemon-disponibili">{listaPokemon.map(pkm => <option key={pkm} value={pkm}>{tNomePkm(pkm)}</option>)}</datalist>
            <button onClick={cercaPokemon} style={styles.btnCerca}>CERCA</button>
            {pkmTrovato && (
              <div style={styles.card}>
                <div style={{backgroundColor:'#222', borderRadius:20, padding:15, display:'inline-block'}}>{renderImmagine('pokemon', pkmTrovato.currentForm || pkmTrovato.Name, {width: 130})}</div>
                <h2 style={{color: '#fff'}}>{tNomePkm(pkmTrovato.currentForm || pkmTrovato.Name)}</h2>
                <button onClick={aggiungiASquadra} style={styles.btnSuccess}>AGGIUNGI AL TEAM</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#121212', minHeight: '100vh', color: '#eee', fontFamily: 'sans-serif', paddingBottom: 50 },
  navbar: { display: 'flex', backgroundColor: '#1f1f1f', position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 4px 15px rgba(0,0,0,0.5)', flexWrap: 'wrap' },
  navBtn: { flex: 1, padding: '15px', border: 'none', background: 'none', color: '#888', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', minWidth: '80px' },
  navActive: { flex: 1, padding: '15px', border: 'none', background: 'none', color: '#ff4757', borderBottom: '4px solid #ff4757', fontWeight: 'bold', fontSize: '13px', minWidth: '80px' },
  mainContent: { padding: '15px', maxWidth: '850px', margin: '0 auto' },
  physicalSheet: { backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '15px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' },
  sheetHeader: { borderBottom: '2px solid #555', paddingBottom: '10px', marginBottom: '15px', textAlign: 'center' },
  sheetGridRow: { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' },
  sheetInputBox: { flex: 1, border: '1px solid #444', backgroundColor: '#252525', borderRadius: '8px', padding: '8px 10px', display: 'flex', flexDirection: 'column', minWidth: '120px' },
  sheetLabel: { fontSize: '9px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' },
  sheetInput: { background: 'none', border: 'none', color: '#fff', fontSize: '16px', fontWeight: 'bold', outline: 'none' },
  sheetBox: { border: '1px solid #444', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#222', marginBottom: 15 },
  sheetBoxHeader: { backgroundColor: '#ff4757', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '6px', textAlign: 'center', textTransform: 'uppercase' },
  sheetAttributeBox: { backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '10px', padding: '10px', textAlign: 'center', minWidth: '100px' },
  sheetAttributeLabel: { fontSize: '11px', color: '#aaa', fontWeight: 'bold' },
  sheetAttributeInput: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', width: '100%', outline: 'none' },
  sheetSkillRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #333', cursor: 'pointer' },
  sheetMiniInput: { width: '35px', background: '#111', border: '1px solid #555', color: '#fff', textAlign: 'center', borderRadius: '5px', fontSize: '14px', fontWeight: 'bold' },
  sheetItemRow: { backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '10px', border: '1px solid #333', display: 'flex', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' },
  itemImage: { width: 40, height: 40, objectFit: 'contain' },
  sheetMoveCard: { backgroundColor: '#252525', border: '1px solid #444', borderRadius: '10px', padding: '12px' },
  btnCircleMin: { background: 'none', border: '1px solid #ff4757', color: '#ff4757', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' },
  btnCircleMinBlue: { background: 'none', border: '1px solid #4bcffa', color: '#4bcffa', borderRadius: '50%', width: '25px', height: '25px', cursor: 'pointer' },
  btnDelPkm: { background: 'transparent', border: '1px solid #ff4757', color: '#ff4757', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '11px' },
  bigSearch: { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#1f1f1f', color: '#fff', fontSize: '18px', marginBottom: 15 },
  btnCerca: { backgroundColor: '#ff4757', color: '#fff', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', width: '100%', cursor: 'pointer' },
  btnSuccess: { backgroundColor: '#2ed573', color: '#fff', padding: '15px', borderRadius: '15px', border: 'none', fontWeight: 'bold', width: '100%', cursor: 'pointer' },
  card: { backgroundColor: '#1f1f1f', padding: '20px', borderRadius: '20px', marginTop: 15 },
  btnCercaMini: { backgroundColor: '#ff4757', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 15px', fontWeight: 'bold', cursor: 'pointer' },
  searchBar: { flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #444', backgroundColor: '#111', color: '#fff', minWidth: '150px' },
  typeBadge: {
    fontSize: '10px',
    padding: '2px 8px',
    borderRadius: '4px',
    color: '#fff',
    fontWeight: 'bold',
    textTransform: 'uppercase'
  },
  statusBtn: { padding: '5px 10px', borderRadius: '8px', fontSize: '10px', fontWeight: 'bold', color: '#fff', border: 'none' },
  btnDeletePiccolo: { background: 'none', border: 'none', cursor: 'pointer' },
  imgContainer: { width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  effectBox: { backgroundColor: '#333', padding: '5px', borderRadius: '5px', marginTop: '5px', fontSize: '11px', color: '#ddd' }
};

export default App;