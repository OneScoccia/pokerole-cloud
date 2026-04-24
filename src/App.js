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

// --- FIX PERCORSO (LOCALE VS ONLINE) ---
const BASE_URL = window.location.hostname.includes("localhost") ? "" : "/pokerole-cloud";
const cleanUrl = (path) => path.replace(/\/+/g, '/');

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
  "Elixir": "Elisir", "Max Elixir": "Elisir Max", "Ether": "Etere", "Max Ether": "Etere Max",
  "Berry Juice": "Succo di Bacca", "Fresh Water": "Acqua Fresca", "Soda Pop": "Gassosa", "Lemonade": "Lemonsucco", "Moomoo Milk": "Latte Mumu",
  "Energy Powder": "Polvenergia", "Energy Root": "Radicenergia", "Heal Powder": "Polvocura", "Revival Herb": "Vitalerba",
  "Oran Berry": "Baccarancia", "Sitrus Berry": "Baccacedro", "Lum Berry": "Baccaprugna", "Pecha Berry": "Baccapesca", 
  "Rawst Berry": "Baccafrago", "Chesto Berry": "Baccacastagna", "Cheri Berry": "Baccaciliegia", "Aspear Berry": "Baccaperina",
  "Persim Berry": "Baccaki", "Leppa Berry": "Baccamela", "Enigma Berry": "Baccenigma",
  "Choice Band": "Bendascelta", "Choice Specs": "Lentiscelta", "Choice Scarf": "Stolascelta", "Life Orb": "Assorbisfera",
  "Leftovers": "Avanzi", "Black Sludge": "Fangopece", "Eviolite": "Evolcondensa", "Assault Vest": "Corpetto Assalto",
  "Focus Sash": "Focalnastro", "Focus Band": "Bandana", "Rocky Helmet": "Bitorzolelmo", "Expert Belt": "Cintura Esperto",
  "Light Clay": "Creta Luce", "Miracle Seed": "Miracolseme", "Mystic Water": "Acquamagica", "Charcoal": "Carbonella",
  "Magnet": "Calamita", "Sharp Beak": "Beccaffilato", "Poison Barb": "Velenaculeo", "Hard Stone": "Pietradura",
  "Spell Tag": "Spettrotarga", "Twisted Spoon": "Cucchiaio Torto", "Silver Powder": "Argentopolvere", "Dragon Fang": "Dentedidrago",
  "Silk Scarf": "Sciarpa Seta", "Never-Melt Ice": "Gelomai", "Metal Coat": "Metalcoperta", "Soft Sand": "Sabbia Soffice",
  "Black Belt": "Cinturanera", "Black Glasses": "Occhialineri", "Destiny Knot": "Destincomune", "Kings Rock": "Roccia di Re",
  "Quick Claw": "Rapidartigli", "Shell Bell": "Conchinella", "Shed Shell": "Disfoglia", "Amulet Coin": "Monetamuletto",
  "Macho Brace": "Crescicappa", "Power Anklet": "Vigorcavigliera", "Power Band": "Vigorfascia", "Power Belt": "Vigorcintura",
  "Power Bracer": "Vigorcerchio", "Power Herb": "Vigorerba", "Power Lens": "Vigorlente", "Power Weight": "Vigorpeso",
  "Abomasite": "Abomasnowite", "Alakazite": "Alakazamite", "Heracronite": "Heracrossite", "Houndoominite": "Houndoomite",
  "Manectite": "Manectricite", "Sablenite": "Sableyite", "Slowbronite": "Slowbroite",
  "Armor Fossil": "Fossilscudo", "Claw Fossil": "Fossilunghia", "Cover Fossil": "Fossiltappo", "Dome Fossil": "Domofossile",
  "Helix Fossil": "Helixfossile", "Jaw Fossil": "Fossilmascella", "Old Amber": "Ambra Antica", "Plume Fossil": "Fossilpiuma",
  "Root Fossil": "Radifossile", "Skull Fossil": "Fossilcranio", "Dawn Stone": "Pietralbore", "Dusk Stone": "Pietrascura",
  "Fire Stone": "Pietrafocaia", "Ice Stone": "Pietragelo", "Leaf Stone": "Pietrafoglia", "Moon Stone": "Pietralunare",
  "Oval Stone": "Pietraovale", "Shiny Stone": "Pietrabrillo", "Sun Stone": "Pietrasolare", "Thunder Stone": "Pietratuono", "Water Stone": "Pietraidrica",
  "Air Balloon": "Palloncino", "Big Root": "Granradice", "Binding Band": "Legafascia", "Bright Powder": "Luminpolvere",
  "Cell Battery": "Ricaripila", "Damp Rock": "Rocciaumida", "Draco Plate": "Lastradrakon", "Dread Plate": "Lastratimore",
  "Earth Plate": "Lastrageo", "Eject Button": "Pulsantefuga", "Eject Pack": "Zainofuga", "Electric Seed": "Elettroseme",
  "Flame Orb": "Fiammosfera", "Flame Plate": "Lastrarogo", "Float Stone": "Pietralieve", "Grassy Seed": "Erboseme",
  "Heat Rock": "Rocciacalda", "Heavy-Duty Boots": "Scarponi Robusti", "Icicle Plate": "Lastragelo", "Icy Rock": "Rocciafredda",
  "Insect Plate": "Lastrabaco", "Iron Plate": "Lastraferro", "Meadow Plate": "Lastraprato", "Mental Herb": "Mentalerba",
  "Mind Plate": "Lastramente", "Misty Seed": "Nebbioseme", "Pixie Plate": "Lastraspiritello", "Psychic Seed": "Psicoseme",
  "Red Card": "Cartellinorosso", "Ring Target": "Facilsaglio", "Room Service": "Servizio in Camera", "Rose Incense": "Rosaroma",
  "Safety Goggles": "Visierantisabbia", "Scope Lens": "Mirino", "Sea Incense": "Marearoma", "Shock Drive": "Voltmodulo",
  "Sky Plate": "Lastracielo", "Smooth Rock": "Roccialiscia", "Snowball": "Palla di Neve", "Splash Plate": "Lastraidro",
  "Spooky Plate": "Lastratetro", "Sticky Barb": "Vischiopunta", "Stone Plate": "Lastrapietra", "Terrain Extender": "Estensiterreno",
  "Thick Club": "Ossospesso", "Toxic Orb": "Tossicosfera", "Toxic Plate": "Lastrafiele", "Utility Umbrella": "Ombrello Multiuso",
  "Wave Incense": "Ondaroma", "Weakness Policy": "Vulneropolizza", "White Herb": "Biancherba", "Wide Lens": "Grandangolo",
  "Wise Glasses": "Saviocchiali", "Zap Plate": "Lastrasaetta", "Beast Ball": "UC Ball", "Cherish Ball": "Pregio Ball",
  "Dive Ball": "Sub Ball", "Dream Ball": "Dream Ball", "Dusk Ball": "Scuro Ball", "Fast Ball": "Rapid Ball",
  "Friend Ball": "Friend Ball", "Heal Ball": "Cura Ball", "Heavy Ball": "Peso Ball", "Level Ball": "Level Ball",
  "Love Ball": "Love Ball", "Lure Ball": "Esca Ball", "Luxury Ball": "Chic Ball", "Moon Ball": "Luna Ball",
  "Nest Ball": "Minor Ball", "Net Ball": "Rete Ball", "Park Ball": "Park Ball", "Premier Ball": "Premier Ball",
  "Quick Ball": "Velox Ball", "Repeat Ball": "Bis Ball", "Safari Ball": "Safari Ball", "Sport Ball": "Gara Ball",
  "Timer Ball": "Timer Ball", "Ability Capsule": "Capsula Abilità", "Ability Patch": "Cerotto Abilità"
};

const tradMosseEngToIta = {
  "Tackle": "Azione", "Scratch": "Graffio", "Ember": "Braciere", "Water Gun": "Pistolacqua", 
  "Thunder Shock": "Sottocarica", "Vine Whip": "Frustata", "Razor Leaf": "Foglielama", 
  "Flamethrower": "Lanciafiamme", "Surf": "Surf", "Ice Beam": "Geloraggio", "Thunderbolt": "Fulmine", 
  "Psychic": "Psichico", "Earthquake": "Terremoto", "Recover": "Ripresa", "Fire Blast": "Fuocobomba", 
  "Hydro Pump": "Idropompa", "Solar Beam": "Solarraggio", "Hyper Beam": "Iper Raggio", 
  "Quick Attack": "Attacco Rapido", "Pound": "Botta", "Karate Chop": "Colpokarate", 
  "Double Slap": "Doppiasberla", "Comet Punch": "Cometapugno", "Mega Punch": "Megapugno", 
  "Pay Day": "Giornopaga", "Fire Punch": "Fuocopugno", "Ice Punch": "Gelopugno", "Thunder Punch": "Tuonopugno", 
  "Vice Grip": "Presa", "Guillotine": "Ghigliottina", "Razor Wind": "Ventagliente", "Swords Dance": "Danzaspada", 
  "Cut": "Taglio", "Gust": "Raffica", "Wing Attack": "Attacco d'Ala", "Whirlwind": "Turbine", "Fly": "Volo", 
  "Bind": "Legatutto", "Slam": "Schianto", "Stomp": "Pestone", "Double Kick": "Doppiocalcio", "Mega Kick": "Megacalcio", 
  "Jump Kick": "Calciosalto", "Rolling Kick": "Calciorullo", "Sand Attack": "Turbosabbia", "Headbutt": "Bottintesta", 
  "Horn Attack": "Incornata", "Fury Attack": "Furia", "Horn Drill": "Perforcorno", "Body Slam": "Corposcontro", 
  "Wrap": "Avvolbotta", "Take Down": "Riduttore", "Thrash": "Colpo", "Double-Edge": "Sdoppiatore", 
  "Tail Whip": "Colpocoda", "Poison Sting": "Velenospina", "Twineedle": "Doppio Ago", "Pin Missile": "Missilspillo", 
  "Leer": "Fulmisguardo", "Bite": "Morso", "Growl": "Ruggito", "Roar": "Boato", "Sing": "Canto", 
  "Supersonic": "Supersuono", "Sonic Boom": "Sonicboom", "Disable": "Inibitore", "Acid": "Acido", 
  "Mist": "Nebbia", "Blizzard": "Bora", "Psybeam": "Psicoraggio", "Bubble Beam": "Bollaraggio", 
  "Aurora Beam": "Raggioaurora", "Peck": "Beccata", "Drill Peck": "Perforbecco", "Submission": "Sottomissione", 
  "Low Kick": "Colpo Basso", "Counter": "Contatore", "Seismic Toss": "Movimento Sismico", "Strength": "Forza", 
  "Absorb": "Assorbimento", "Mega Drain": "Megassorbimento", "Leech Seed": "Parassimese", "Growth": "Crescita", 
  "Poison Powder": "Velenpolvere", "Stun Spore": "Paralizzante", "Sleep Powder": "Sonnifero", "Petal Dance": "Petalodanza", 
  "String Shot": "Millebave", "Dragon Rage": "Ira di Drago", "Fire Spin": "Turbofuoco", "Thunder Wave": "Tuononda", 
  "Thunder": "Tuono", "Rock Throw": "Sassata", "Fissure": "Abisso", "Dig": "Fossa", "Toxic": "Tossina", 
  "Confusion": "Confusione", "Hypnosis": "Ipnosi", "Meditate": "Meditazione", "Agility": "Agilità", 
  "Rage": "Ira", "Teleport": "Teletrasporto", "Night Shade": "Ombra Notturna", "Mimic": "Mimica", 
  "Screech": "Stridio", "Double Team": "Doppioteam", "Harden": "Rafforzatore", "Minimize": "Minimizzato", 
  "Smokescreen": "Muro di Fumo", "Confuse Ray": "Stordiraggio", "Withdraw": "Ritirata", "Defense Curl": "Ricciolscudo", 
  "Barrier": "Barriera", "Light Screen": "Schermoluce", "Haze": "Nube", "Reflect": "Riflesso", "Focus Energy": "Focalenergia", 
  "Bide": "Pazienza", "Metronome": "Metronomo", "Mirror Move": "Speculmossa", "Self-Destruct": "Autodistruzione", 
  "Egg Bomb": "Uovobomba", "Lick": "Leccata", "Smog": "Smog", "Sludge": "Fango", "Bone Club": "Ossoclava", 
  "Waterfall": "Cascata", "Clamp": "Tenaglia", "Swift": "Comete", "Skull Bash": "Capocciata", "Spike Cannon": "Sparalance", 
  "Constrict": "Costrizione", "Amnesia": "Amnesia", "Kinesis": "Cinèsi", "Soft-Boiled": "Covauova", 
  "High Jump Kick": "Calcinvolo", "Glare": "Bagliore", "Dream Eater": "Mangiasogni", "Poison Gas": "Velenogas", 
  "Barrage": "Attacco Pioggia", "Leech Life": "Sanguisuga", "Lovely Kiss": "Demonbacio", "Sky Attack": "Aeroattacco", 
  "Transform": "Trasformazione", "Bubble": "Bolla", "Dizzy Punch": "Stordipugno", "Spore": "Spora", 
  "Flash": "Flash", "Psywave": "Psiconda", "Splash": "Splash", "Acid Armor": "Scudo Acido", "Crabhammer": "Martellata", 
  "Explosion": "Esplosione", "Fury Swipes": "Sfuriate", "Bonemerang": "Ossomerang", "Rest": "Riposo", 
  "Rock Slide": "Frana", "Hyper Fang": "Iperzanna", "Sharpen": "Affilatore", "Conversion": "Conversione", 
  "Tri Attack": "Tripletta", "Super Fang": "Superzanna", "Slash": "Lacerazione", "Substitute": "Sostituto", 
  "Struggle": "Scontro", "Sketch": "Schizzo", "Triple Kick": "Triplocalcio", "Thief": "Furto", "Spider Web": "Ragnatela", 
  "Mind Reader": "Leggimente", "Nightmare": "Incubo", "Flame Wheel": "Ruotafuoco", "Snore": "Russare", 
  "Curse": "Maledizione", "Flail": "Flagello", "Conversion 2": "Conversione2", "Aeroblast": "Aerocolpo", 
  "Cotton Spore": "Cotonspora", "Reversal": "Contropiede", "Spite": "Dispetto", "Powder Snow": "Polneve", 
  "Protect": "Protezione", "Mach Punch": "Pugnorapido", "Scary Face": "Visotruce", "Feint Attack": "Finta", 
  "Sweet Kiss": "Dolcebacio", "Belly Drum": "Panciamburo", "Sludge Bomb": "Fangobomba", "Mud-Slap": "Fangosberla", 
  "Octazooka": "Octazooka", "Spikes": "Punte", "Zap Cannon": "Falcecannone", "Foresight": "Preveggenza", 
  "Destiny Bond": "Destinobbligato", "Perish Song": "Ultimocanto", "Icy Wind": "Ventogelato", "Detect": "Individua", 
  "Bone Rush": "Ossoraffica", "Lock-On": "Localizza", "Outrage": "Oltraggio", "Sandstorm": "Terrempesta", 
  "Giga Drain": "Gigassorbimento", "Endure": "Resistenza", "Charm": "Fascino", "Rollout": "Rotolamento", 
  "False Swipe": "Falsofinale", "Swagger": "Bullismo", "Milk Drink": "Buonlatte", "Spark": "Scintilla", 
  "Fury Cutter": "Tagliofuria", "Steel Wing": "Alacciaio", "Mean Look": "Malosguardo", "Attract": "Attrazione", 
  "Sleep Talk": "Sonnolalia", "Heal Bell": "Rintoccasana", "Return": "Ritorno", "Present": "Regalo", 
  "Frustration": "Frustrazione", "Safeguard": "Salvaguardia", "Pain Split": "Malcomune", "Sacred Fire": "Magifuoco", 
  "Magnitude": "Magnitudo", "Dynamic Punch": "Dinamipugno", "Megahorn": "Megacorno", "Dragon Breath": "Dragospiro", 
  "Baton Pass": "Staffetta", "Encore": "Ripeti", "Pursuit": "Inseguimento", "Rapid Spin": "Rapigiro", 
  "Sweet Scent": "Profumino", "Iron Tail": "Codacciaio", "Metal Claw": "Ferrartigli", "Vital Throw": "Vitaltiro", 
  "Morning Sun": "Mattindoro", "Synthesis": "Sintesi", "Moonlight": "Lucelunare", "Hidden Power": "Introforza", 
  "Cross Chop": "Incrocolpo", "Twister": "Tornado", "Rain Dance": "Pioggiadanza", "Sunny Day": "Giornodisole", 
  "Crunch": "Sgranocchio", "Mirror Coat": "Specchiovelo", "Psych Up": "Psicamisù", "Extreme Speed": "Extrarapido", 
  "Ancient Power": "Forzantica", "Shadow Ball": "Palla Ombra", "Future Sight": "Divinazione", "Rock Smash": "Spaccaroccia", 
  "Whirlpool": "Mulinello", "Beat Up": "Picchiaduro", "Fake Out": "Bruciapelo", "Uproar": "Baraonda", 
  "Stockpile": "Accumulo", "Spit Up": "Sfoghenergia", "Swallow": "Introenergia", "Heat Wave": "Ondacalda", 
  "Hail": "Grandine", "Torment": "Attaccaclite", "Flatter": "Adulazione", "Will-O-Wisp": "Fuocofatuo", 
  "Memento": "Memento", "Facade": "Facciata", "Focus Punch": "Centripugno", "Smelling Salts": "Maniereforti", 
  "Follow Me": "Sonoqui", "Nature Power": "Naturforza", "Charge": "Sottocarica", "Taunt": "Provocazione", 
  "Helping Hand": "Altruismo", "Trick": "Raggiro", "Role Play": "Giocodiruolo", "Wish": "Desiderio", 
  "Assist": "Assistente", "Ingrain": "Radicamento", "Superpower": "Troppoforte", "Magic Coat": "Magivelo", 
  "Recycle": "Riciclo", "Revenge": "Vendetta", "Brick Break": "Breccia", "Yawn": "Sbadiglio", "Knock Off": "Privazione", 
  "Endeavor": "Rimonta", "Eruption": "Eruzione", "Skill Swap": "Baratto", "Imprison": "Esclusiva", 
  "Refresh": "Rinfrescata", "Grudge": "Rancore", "Snatch": "Scippo", "Secret Power": "Forzasegreta", 
  "Dive": "Sub", "Arm Thrust": "Sberletese", "Camouflage": "Camuffamento", "Tail Glow": "Codadiluce", 
  "Luster Purge": "Abbagliante", "Mist Ball": "Foschia", "Feather Dance": "Danzapiume", "Teeter Dance": "Strampadanza", 
  "Blaze Kick": "Calciardente", "Mud Sport": "Fangata", "Ice Ball": "Palla Gelo", "Needle Arm": "Pugnospine", 
  "Slack Off": "Pigro", "Hyper Voice": "Granvoce", "Poison Fang": "Velenodente", "Crush Claw": "Tritartigli", 
  "Blast Burn": "Incendio", "Hydro Cannon": "Idrocannone", "Meteor Mash": "Meteorpugno", "Astonish": "Sgomento", 
  "Weather Ball": "Palla Clima", "Aromatherapy": "Aromaterapia", "Fake Tears": "Falselacrime", "Air Cutter": "Aerasoio", 
  "Overheat": "Vampata", "Odor Sleuth": "Segugio", "Rock Tomb": "Rocciotomba", "Silver Wind": "Ventargenteo", 
  "Metal Sound": "Ferrostrido", "Grass Whistle": "Meloderba", "Tickle": "Solletico", "Cosmic Power": "Cosmoforza", 
  "Water Spout": "Zampillo", "Signal Beam": "Segnoraggio", "Shadow Punch": "Pugnombra", "Extrasensory": "Extrasenso", 
  "Sky Uppercut": "Stramontante", "Shadow Force": "Oscurotuffo"
};


const tradStrumentiItaToEng = Object.fromEntries(Object.entries(tradStrumentiEngToIta).map(([eng, ita]) => [ita, eng]));

const tNomePkm = (nome) => {
  return nome.replace('(Mega Form)', '(Mega)')
             .replace('(Mega X Form)', '(Mega X)')
             .replace('(Mega Y Form)', '(Mega Y)')
             .replace('(Gigantamax Form)', '(Gigamax)')
             .replace('(Alolan Form)', '(Alola)')
             .replace('(Galarian Form)', '(Galar)')
             .replace('(Hisuian Form)', '(Hisui)')
             .replace('(Paldean Form)', '(Paldea)');
};

const tCatMosse = (cat) => cat === 'Physical' ? 'Fisico' : cat === 'Special' ? 'Speciale' : 'Supporto';
const tItem = (engName) => tradStrumentiEngToIta[engName] || engName;
const tMossa = (engName) => tradMosseEngToIta[engName] || engName;

// --- LISTA COMPLETA STRUMENTI ---
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


// --- LISTA COMPLETA POKEMON (FULL 1015+) ---
const listaPokemon = [
  "Bulbasaur", "Ivysaur", "Venusaur", "Venusaur (Mega Form)", "Charmander", "Charmeleon", "Charizard", "Charizard (Mega X Form)", "Charizard (Mega Y Form)", "Squirtle", "Wartortle", "Blastoise", "Blastoise (Mega Form)", "Caterpie", "Metapod", "Butterfree", "Weedle", "Kakuna", "Beedrill", "Beedrill (Mega Form)", "Pidgey", "Pidgeotto", "Pidgeot", "Pidgeot (Mega Form)", "Rattata", "Rattata (Alolan Form)", "Raticate", "Raticate (Alolan Form)", "Spearow", "Fearow", "Ekans", "Arbok", "Pikachu", "Raichu", "Raichu (Alolan Form)", "Sandshrew", "Sandshrew (Alolan Form)", "Sandslash", "Sandslash (Alolan Form)", "Nidoran F", "Nidorina", "Nidoqueen", "Nidoran M", "Nidorino", "Nidoking", "Clefairy", "Clefable", "Vulpix", "Vulpix (Alolan Form)", "Ninetales", "Ninetales (Alolan Form)", "Jigglypuff", "Wigglytuff", "Zubat", "Golbat", "Oddish", "Gloom", "Vileplume", "Paras", "Parasect", "Venonat", "Venomoth", "Diglett", "Diglett (Alolan Form)", "Dugtrio", "Dugtrio (Alolan Form)", "Meowth", "Meowth (Alolan Form)", "Meowth (Galarian Form)", "Persian", "Persian (Alolan Form)", "Psyduck", "Golduck", "Mankey", "Primeape", "Growlithe", "Growlithe (Hisuian Form)", "Arcanine", "Arcanine (Hisuian Form)", "Poliwag", "Poliwhirl", "Poliwrath", "Abra", "Kadabra", "Alakazam", "Alakazam (Mega Form)", "Machop", "Machoke", "Machamp", "Bellsprout", "Weepinbell", "Victreebel", "Tentacool", "Tentacruel", "Geodude", "Geodude (Alolan Form)", "Graveler", "Graveler (Alolan Form)", "Golem", "Golem (Alolan Form)", "Ponyta", "Ponyta (Galarian Form)", "Rapidash", "Rapidash (Galarian Form)", "Slowpoke", "Slowpoke (Galarian Form)", "Slowbro", "Slowbro (Mega Form)", "Slowbro (Galarian Form)", "Magnemite", "Magneton", "Farfetch'd", "Farfetch'd (Galarian Form)", "Doduo", "Dodrio", "Seel", "Dewgong", "Grimer", "Grimer (Alolan Form)", "Muk", "Muk (Alolan Form)", "Shellder", "Cloyster", "Gastly", "Haunter", "Gengar", "Gengar (Mega Form)", "Onix", "Drowzee", "Hypno", "Krabby", "Kingler", "Voltorb", "Voltorb (Hisuian Form)", "Electrode", "Electrode (Hisuian Form)", "Exeggcute", "Exeggutor", "Exeggutor (Alolan Form)", "Cubone", "Marowak", "Marowak (Alolan Form)", "Hitmonlee", "Hitmonchan", "Lickitung", "Koffing", "Weezing", "Weezing (Galarian Form)", "Rhyhorn", "Rhydon", "Chansey", "Tangela", "Tangela (Galarian Form)", "Kangaskhan", "Kangaskhan (Mega Form)", "Horsea", "Seadra", "Goldeen", "Seaking", "Staryu", "Starmie", "Mr. Mime", "Mr. Mime (Galarian Form)", "Scyther", "Jynx", "Electabuzz", "Magmar", "Pinsir", "Pinsir (Mega Form)", "Tauros", "Tauros (Paldean Form)", "Magikarp", "Gyarados", "Gyarados (Mega Form)", "Lapras", "Ditto", "Eevee", "Vaporeon", "Jolteon", "Flareon", "Porygon", "Omanyte", "Omastar", "Kabuto", "Kabutops", "Aerodactyl", "Aerodactyl (Mega Form)", "Snorlax", "Articuno", "Articuno (Galarian Form)", "Zapdos", "Zapdos (Galarian Form)", "Moltres", "Moltres (Galarian Form)", "Dratini", "Dragonair", "Dragonite", "Mewtwo", "Mewtwo (Mega X Form)", "Mewtwo (Mega Y Form)", "Mew", "Chikorita", "Bayleef", "Meganium", "Cyndaquil", "Quilava", "Typhlosion", "Typhlosion (Hisuian Form)", "Totodile", "Croconaw", "Feraligatr", "Sentret", "Furret", "Hoothoot", "Noctowl", "Ledyba", "Ledian", "Spinarak", "Ariados", "Crobat", "Chinchou", "Lanturn", "Pichu", "Cleffa", "Igglybuff", "Togepi", "Togetic", "Natu", "Xatu", "Mareep", "Flaaffy", "Ampharos", "Ampharos (Mega Form)", "Bellossom", "Marill", "Azumarill", "Sudowoodo", "Politoed", "Hoppip", "Skiploom", "Jumpluff", "Aipom", "Sunkern", "Sunflora", "Yanma", "Wooper", "Wooper (Paldean Form)", "Quagsire", "Espeon", "Umbreon", "Murkrow", "Slowking", "Slowking (Galarian Form)", "Misdreavus", "Unown", "Wobbuffet", "Girafarig", "Pineco", "Forretress", "Dunsparce", "Gligar", "Steelix", "Steelix (Mega Form)", "Snubbull", "Granbull", "Qwilfish", "Qwilfish (Hisuian Form)", "Scizor", "Scizor (Mega Form)", "Shuckle", "Heracross", "Heracross (Mega Form)", "Sneasel", "Sneasel (Hisuian Form)", "Teddiursa", "Ursaring", "Slugma", "Magcargo", "Swinub", "Piloswine", "Corsola", "Corsola (Galarian Form)", "Remoraid", "Octillery", "Delibird", "Mantine", "Skarmory", "Houndour", "Houndoom", "Houndoom (Mega Form)", "Kingdra", "Phanpy", "Donphan", "Porygon2", "Stantler", "Smeargle", "Tyrogue", "Hitmontop", "Smoochum", "Elekid", "Magby", "Miltank", "Blissey", "Raikou", "Entei", "Suicune", "Larvitar", "Pupitar", "Tyranitar", "Tyranitar (Mega Form)", "Lugia", "Ho-Oh", "Celebi", "Treecko", "Grovyle", "Sceptile", "Sceptile (Mega Form)", "Torchic", "Combusken", "Blaziken", "Blaziken (Mega Form)", "Mudkip", "Marshtomp", "Swampert", "Swampert (Mega Form)", "Poochyena", "Mightyena", "Zigzagoon", "Zigzagoon (Galarian Form)", "Linoone", "Linoone (Galarian Form)", "Wurmple", "Silcoon", "Beautifly", "Cascoon", "Dustox", "Lotad", "Lombre", "Ludicolo", "Seedot", "Nuzleaf", "Shiftry", "Taillow", "Swellow", "Wingull", "Pelipper", "Ralts", "Kirlia", "Gardevoir", "Gardevoir (Mega Form)", "Surskit", "Masquerain", "Shroomish", "Breloom", "Slakoth", "Vigoroth", "Slaking", "Nincada", "Ninjask", "Shedinja", "Whismur", "Loudred", "Exploud", "Makuhita", "Hariyama", "Azurill", "Nosepass", "Skitty", "Delcatty", "Sableye", "Sableye (Mega Form)", "Mawile", "Mawile (Mega Form)", "Aron", "Lairon", "Aggron", "Aggron (Mega Form)", "Meditite", "Medicham", "Medicham (Mega Form)", "Electrike", "Manectric", "Manectric (Mega Form)", "Plusle", "Minun", "Volbeat", "Illumise", "Roselia", "Gulpin", "Swalot", "Carvanha", "Sharpedo", "Sharpedo (Mega Form)", "Wailmer", "Wailord", "Numel", "Camerupt", "Camerupt (Mega Form)", "Torkoal", "Spoink", "Grumpig", "Spinda", "Trapinch", "Vibrava", "Flygon", "Cacnea", "Cacturne", "Swablu", "Altaria", "Altaria (Mega Form)", "Zangoose", "Seviper", "Lunatone", "Solrock", "Barboach", "Whiscash", "Corphish", "Crawdaunt", "Baltoy", "Claydol", "Lileep", "Cradily", "Anorith", "Armaldo", "Feebas", "Milotic", "Castform", "Kecleon", "Shuppet", "Banette", "Banette (Mega Form)", "Duskull", "Dusclops", "Tropius", "Chimecho", "Absol", "Absol (Mega Form)", "Wynaut", "Snorunt", "Glalie", "Glalie (Mega Form)", "Spheal", "Sealeo", "Walrein", "Clamperl", "Huntail", "Gorebyss", "Relicanth", "Luvdisc", "Bagon", "Shelgon", "Salamence", "Salamence (Mega Form)", "Beldum", "Metang", "Metagross", "Metagross (Mega Form)", "Regirock", "Regice", "Registeel", "Latias", "Latias (Mega Form)", "Latios", "Latios (Mega Form)", "Kyogre", "Groudon", "Rayquaza", "Rayquaza (Mega Form)", "Jirachi", "Deoxys", "Turtwig", "Grotle", "Torterra", "Chimchar", "Monferno", "Infernape", "Piplup", "Prinplup", "Empoleon", "Starly", "Staravia", "Staraptor", "Bidoof", "Bibarel", "Kricketot", "Kricketune", "Shinx", "Luxio", "Luxray", "Budew", "Roserade", "Cranidos", "Rampardos", "Shieldon", "Bastiodon", "Burmy", "Wormadam", "Mothim", "Combee", "Vespiquen", "Pachirisu", "Buizel", "Floatzel", "Cherubi", "Cherrim", "Shellos", "Gastrodon", "Ambipom", "Drifloon", "Drifblim", "Buneary", "Lopunny", "Lopunny (Mega Form)", "Mismagius", "Honchkrow", "Glameow", "Purugly", "Chingling", "Stunky", "Skuntank", "Bronzor", "Bronzong", "Bonsly", "Mime Jr.", "Happiny", "Chatot", "Spiritomb", "Gible", "Gabite", "Garchomp", "Garchomp (Mega Form)", "Munchlax", "Riolu", "Lucario", "Lucario (Mega Form)", "Hippopotas", "Hippowdon", "Skorupi", "Drapion", "Croagunk", "Toxicroak", "Carnivine", "Finneon", "Lumineon", "Mantyke", "Snover", "Abomasnow", "Abomasnow (Mega Form)", "Weavile", "Magnezone", "Lickilicky", "Rhyperior", "Tangrowth", "Electivire", "Magmortar", "Togekiss", "Yanmega", "Leafeon", "Glaceon", "Gliscor", "Mamoswine", "Porygon-Z", "Gallade", "Gallade (Mega Form)", "Probopass", "Dusknoir", "Froslass", "Rotom", "Uxie", "Mesprit", "Azelf", "Dialga", "Palkia", "Heatran", "Regigigas", "Giratina", "Cresselia", "Phione", "Manaphy", "Darkrai", "Shaymin", "Arceus", "Victini", "Snivy", "Servine", "Serperior", "Tepig", "Pignite", "Emboar", "Oshawott", "Dewott", "Samurott", "Samurott (Hisuian Form)", "Patrat", "Watchog", "Lillipup", "Herdier", "Stoutland", "Purrloin", "Liepard", "Pansage", "Simisage", "Pansear", "Simisear", "Panpour", "Simipour", "Munna", "Musharna", "Pidove", "Tranquill", "Unfezant", "Blitzle", "Zebstrika", "Roggenrola", "Boldore", "Gigalith", "Woobat", "Swoobat", "Drilbur", "Excadrill", "Audino", "Audino (Mega Form)", "Timburr", "Gurdurr", "Conkeldurr", "Tympole", "Palpitoad", "Seismitoad", "Throh", "Sawk", "Sewaddle", "Swadloon", "Leavanny", "Venipede", "Whirlipede", "Scolipede", "Cottonee", "Whimsicott", "Petilil", "Lilligant", "Lilligant (Hisuian Form)", "Basculin", "Sandile", "Krokorok", "Krookodile", "Darumaka", "Darumaka (Galarian Form)", "Darmanitan", "Darmanitan (Galarian Form)", "Maractus", "Dwebble", "Crustle", "Scraggy", "Scrafty", "Sigilyph", "Yamask", "Yamask (Galarian Form)", "Cofagrigus", "Tirtouga", "Carracosta", "Archen", "Archeops", "Trubbish", "Garbodor", "Zorua", "Zorua (Hisuian Form)", "Zoroark", "Zoroark (Hisuian Form)", "Minccino", "Cinccino", "Gothita", "Gothorita", "Gothitelle", "Solosis", "Duosion", "Reuniclus", "Ducklett", "Swanna", "Vanillite", "Vanillish", "Vanilluxe", "Deerling", "Sawsbuck", "Emolga", "Karrablast", "Escavalier", "Foongus", "Amoonguss", "Frillish", "Jellicent", "Alomomola", "Joltik", "Galvantula", "Ferroseed", "Ferrothorn", "Klink", "Klang", "Klinklang", "Tynamo", "Eelektrik", "Eelektross", "Elgyem", "Beheeyem", "Litwick", "Lampent", "Chandelure", "Axew", "Fraxure", "Haxorus", "Cubchoo", "Beartic", "Cryogonal", "Shelmet", "Accelgor", "Stunfisk", "Stunfisk (Galarian Form)", "Mienfoo", "Mienshao", "Druddigon", "Golett", "Golurk", "Pawniard", "Bisharp", "Bouffalant", "Rufflet", "Braviary", "Braviary (Hisuian Form)", "Vullaby", "Mandibuzz", "Heatmor", "Durant", "Deino", "Zweilous", "Hydreigon", "Larvesta", "Volcarona", "Cobalion", "Terrakion", "Virizion", "Tornadus", "Thundurus", "Reshiram", "Zekrom", "Landorus", "Kyurem", "Keldeo", "Meloetta", "Genesect", "Chespin", "Quilladin", "Chesnaught", "Fennekin", "Braixen", "Delphox", "Froakie", "Frogadier", "Greninja", "Bunnelby", "Diggersby", "Fletchling", "Fletchinder", "Talonflame", "Scatterbug", "Spewpa", "Vivillon", "Litleo", "Pyroar", "Flabebe", "Floette", "Florges", "Skiddo", "Gogoat", "Pancham", "Pangoro", "Furfrou", "Espurr", "Meowstic", "Honedge", "Doublade", "Aegislash", "Spritzee", "Aromatisse", "Swirlix", "Slurpuff", "Inkay", "Malamar", "Binacle", "Barbaracle", "Skrelp", "Dragalge", "Clauncher", "Clawitzer", "Helioptile", "Heliolisk", "Tyrunt", "Tyrantrum", "Amaura", "Aurorus", "Sylveon", "Hawlucha", "Dedenne", "Carbink", "Goomy", "Sliggoo", "Sliggoo (Hisuian Form)", "Goodra", "Goodra (Hisuian Form)", "Klefki", "Phantump", "Trevenant", "Pumpkaboo", "Gourgeist", "Bergmite", "Avalugg", "Avalugg (Hisuian Form)", "Noibat", "Noivern", "Xerneas", "Yveltal", "Zygarde", "Diancie", "Diancie (Mega Form)", "Hoopa", "Volcanion", "Rowlet", "Dartrix", "Decidueye", "Decidueye (Hisuian Form)", "Litten", "Torracat", "Incineroar", "Popplio", "Brionne", "Primarina", "Pikipek", "Trumbeak", "Toucannon", "Yungoos", "Gumshoos", "Grubbin", "Charjabug", "Vikavolt", "Crabrawler", "Crabominable", "Oricorio", "Cutiefly", "Ribombee", "Rockruff", "Lycanroc", "Wishiwashi", "Mareanie", "Toxapex", "Mudbray", "Mudsdale", "Dewpider", "Araquanid", "Fomantis", "Lurantis", "Morelull", "Shiinotic", "Salandit", "Salazzle", "Stufful", "Bewear", "Bounsweet", "Steenee", "Tsareena", "Comfey", "Oranguru", "Passimian", "Wimpod", "Golisopod", "Sandygast", "Palossand", "Pyukumuku", "Type: Null", "Silvally", "Minior", "Komala", "Turtonator", "Togedemaru", "Mimikyu", "Bruxish", "Drampa", "Dhelmise", "Jangmo-o", "Hakamo-o", "Kommo-o", "Tapu Koko", "Tapu Lele", "Tapu Bulu", "Tapu Fini", "Cosmog", "Cosmoem", "Solgaleo", "Lunala", "Nihilego", "Buzzwole", "Pheromosa", "Xurkitree", "Celesteela", "Kartana", "Guzzlord", "Necrozma", "Magearna", "Marshadow", "Poipole", "Naganadel", "Stakataka", "Blacephalon", "Zeraora", "Meltan", "Melmetal", "Grookey", "Thwackey", "Rillaboom", "Scorbunny", "Raboot", "Cinderace", "Sobble", "Drizzile", "Inteleon", "Skwovet", "Greedent", "Rookidee", "Corvisquire", "Corviknight", "Blipbug", "Dottler", "Orbeetle", "Nickit", "Thievul", "Gossifleur", "Eldegoss", "Wooloo", "Dubwool", "Chewtle", "Drednaw", "Yamper", "Boltund", "Rolycoly", "Carkol", "Coalossal", "Applin", "Flapple", "Appletun", "Silicobra", "Sandaconda", "Cramorant", "Arrokuda", "Barraskewda", "Toxel", "Toxtricity (Amped Form)", "Toxtricity (Low Key Form)", "Sizzlipede", "Centiskorch", "Clobbopus", "Grapploct", "Sinistea", "Polteageist", "Hatenna", "Hattrem", "Hatterene", "Impidimp", "Morgrem", "Grimmsnarl", "Obstagoon", "Perrserker", "Cursola", "Sirfetch'd", "Mr. Rime", "Runerigus", "Milcery", "Alcremie", "Falinks", "Pincurchin", "Snom", "Frosmoth", "Stonjourner", "Eiscue", "Indeedee", "Morpeko", "Cufant", "Copperajah", "Dracozolt", "Arctozolt", "Dracovish", "Arctovish", "Duraludon", "Dreepy", "Drakloak", "Dragapult", "Zacian", "Zamazenta", "Eternatus", "Kubfu", "Urshifu", "Zarude", "Regieleki", "Regidrago", "Glastrier", "Spectrier", "Calyrex", "Wyrdeer", "Kleavor", "Ursaluna", "Basculegion", "Sneasler", "Overqwil", "Enamorus", "Sprigatito", "Floragato", "Meowscarada", "Fuecoco", "Crocalor", "Skeledirge", "Quaxly", "Quaxwell", "Quaquaval", "Lechonk", "Oinkologne", "Tarountula", "Spidops", "Nymble", "Lokix", "Pawmi", "Pawmo", "Pawmot", "Tandemaus", "Maushold", "Fidough", "Dachsbun", "Smoliv", "Dolliv", "Arboliva", "Squawkabilly", "Nacli", "Naclstack", "Garganacl", "Charcadet", "Armarouge", "Ceruledge", "Tadbulb", "Bellibolt", "Wattrel", "Kilowattrel", "Maschiff", "Mabosstiff", "Shroodle", "Grafaiai", "Bramblin", "Brambleghast", "Toedscool", "Toedscruel", "Klawf", "Capsakid", "Scovillain", "Rellor", "Rabsca", "Flittle", "Espathra", "Tinkatink", "Tinkatuff", "Tinkaton", "Wiglett", "Wugtrio", "Bombirdier", "Finizen", "Palafin", "Varoom", "Revavroom", "Cyclizar", "Orthworm", "Glimmet", "Glimmora", "Greavard", "Houndstone", "Flamigo", "Cetoddle", "Cetitan", "Veluza", "Dondozo", "Tatsugiri", "Annihilape", "Clodsire", "Farigiraf", "Dudunsparce", "Kingambit", "Great Tusk", "Scream Tail", "Brute Bonnet", "Flutter Mane", "Slither Wing", "Sandy Shocks", "Iron Treads", "Iron Bundle", "Iron Hands", "Iron Jugulis", "Iron Moth", "Iron Thorns", "Frigibax", "Arctibax", "Baxcalibur", "Gimmighoul", "Gholdengo", "Wo-Chien", "Chien-Pao", "Ting-Lu", "Chi-Yu", "Roaring Moon", "Iron Valiant", "Koraidon", "Miraidon"
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
    rango: "", // Rango ripristinato
    money: 3000, confidence: 1, 
    currentHP: 2, 
    currentWill: 4, // Volontà ripristinata
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
        } catch (error) { console.error("Errore nel caricamento dati:", error); }
      }
    });
    return () => unsubscribe();
  }, []);

  const gestisciLogin = async (e) => {
    e.preventDefault();
    setAuthError("");
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setAuthError("Errore credenziali. Contatta il Master."); }
  };

  const salvaSulCloud = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, "utenti", user.uid), { trainer, squadra, zaino });
      alert("✅ Salvataggio sul Cloud completato!");
    } catch (err) { alert("❌ Errore durante il salvataggio."); }
  };

  const fetchData = async (folder, name) => {
    try {
      const url = cleanUrl(`${BASE_URL}/data/${folder}/${encodeURIComponent(name)}.json`);
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

  const renderImmagine = (tipo, nome, stile) => {
    if (!nome) return null;
    
    const isGmax = nome.toLowerCase().includes("gigantamax");
    const cartella = isGmax ? 'HomeSprites' : (tipo === 'pokemon' ? 'BookSprites' : 'Items');
    const getUrl = (n, f = cartella) => cleanUrl(`${BASE_URL}/data/images/${f}/${encodeURIComponent(n)}.png`);

    return (
      <img 
        key={nome}
        src={getUrl(nome)} 
        alt={nome} 
        style={stile} 
        onError={(e) => { 
          // 1. Tenta formato trattini (Toglie parentesi e parola "Form")
          // Es: "Charizard (Mega X Form)" -> "Charizard-Mega-X"
          if (!e.target.dataset.triedDash) {
            e.target.dataset.triedDash = "true";
            const nDash = nome.replace(/\s*\(|\)/g, '').replace(/\s*Form/gi, '').trim().replace(/\s+/g, '-');
            e.target.src = getUrl(nDash);
          } 
          // 2. Tenta senza spazi (Es: "Ability Capsule" -> "AbilityCapsule")
          else if (!e.target.dataset.triedClean) {
            e.target.dataset.triedClean = "true";
            e.target.src = getUrl(nome.replace(/[\s()]+/g, ''));
          }
          // 3. Tenta tutto minuscolo
          else if (!e.target.dataset.triedLower) {
            e.target.dataset.triedLower = "true";
            e.target.src = getUrl(nome.toLowerCase());
          }
          // 4. Fallback Nome Base (Es: "Charizard")
          else if (!e.target.dataset.triedBase && tipo === 'pokemon') {
            e.target.dataset.triedBase = "true";
            e.target.src = getUrl(nome.split(' (')[0]);
          } 
          else { e.target.style.display = 'none'; }
        }} 
      />
    );
  };

  const cercaPokemon = async () => {
    const query = ricerca.trim().toLowerCase();
    if (!query) return;

    let nomeReale = listaPokemon.find(p => p.toLowerCase() === query);
    if (!nomeReale) {
      nomeReale = listaPokemon.find(p => p.toLowerCase().startsWith(query + " ("));
    }

    if (!nomeReale) {
      alert("Pokémon non trovato. Controlla il nome!");
      return;
    }

    const pkm = await fetchData('Pokedex', nomeReale);
    if (pkm) {
      pkm.Moves.forEach(async (m) => {
        const moveData = await fetchData('Moves', m.Name);
        if (moveData) setDettagliMosse(prev => ({ ...prev, [m.Name]: moveData }));
      });
      const nomeBase = pkm.Name.split(' (')[0];
      pkm.availableForms = listaPokemon.filter(p => p === nomeBase || p.startsWith(nomeBase + " ("));
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
      const conferma = window.confirm(`Aggiungere "${nomeFormattato}" come custom?`);
      if (conferma) setZaino([...zaino, { Name: nomeIngleseDB, customName: nomeFormattato, Description: "Oggetto personalizzato", qty: 1 }]);
    }
  };

  const rimuoviDalloZaino = (index) => setZaino(zaino.filter((_, i) => i !== index));

  const aggiungiASquadra = () => {
    if (pkmTrovato) {
      setSquadra([...squadra, { 
        ...pkmTrovato, id: Date.now(), curHP: pkmTrovato.Vitality, curWill: pkmTrovato.Insight,
        selectedMoves: ["", "", "", ""], activeStatus: [], currentForm: pkmTrovato.Name,
        pkmSkills: { Brawl: 1, Channel: 1, Clash: 1, Evasion: 1, Alert: 1, Athletic: 1, Nature: 1, Stealth: 1, Allure: 1, Etiquette: 1, Intimidate: 1, Perform: 1 }
      }]);
      setPkmTrovato(null); setTab("squadra");
    }
  };

  const scambiaForma = async (idPkm, nuovaForma) => {
    const data = await fetchData('Pokedex', nuovaForma);
    if (data) {
      setSquadra(squadra.map(p => p.id === idPkm ? {
        ...p, ...data, curHP: Math.max(1, p.curHP + (data.Vitality - p.Vitality)), currentForm: nuovaForma
      } : p));
    }
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
      <div style={styles.loginContainer}>
        <div style={styles.physicalSheet}>
          <div style={styles.sheetHeader}><h1 style={{margin: 0}}>TERMINALE LEGA</h1></div>
          <form onSubmit={gestisciLogin} style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            <input type="email" style={styles.sheetInput} placeholder="Email" onChange={e => setEmail(e.target.value)} required />
            <input type="password" style={styles.sheetInput} placeholder="Password" onChange={e => setPassword(e.target.value)} required />
            {authError && <div style={{color: '#ff4757', textAlign: 'center'}}>{authError}</div>}
            <button type="submit" style={styles.btnSuccess}>ACCEDI</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.navbar}>
        <button onClick={() => setTab("trainer")} style={tab === "trainer" ? styles.navActive : styles.navBtn}>👤 ALLENATORE</button>
        <button onClick={() => setTab("squadra")} style={tab === "squadra" ? styles.navActive : styles.navBtn}>🎒 TEAM ({squadra.length})</button>
        <button onClick={() => setTab("pokedex")} style={tab === "pokedex" ? styles.navActive : styles.navBtn}>🔍 POKEDEX</button>
        <div style={{flex: 1, display: 'flex', justifyContent: 'flex-end', padding: '10px', gap: '10px'}}>
          <button onClick={salvaSulCloud} style={{...styles.btnCloud}}>☁️ SALVA</button>
          <button onClick={() => signOut(auth)} style={{...styles.btnExit}}>ESCI</button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {tab === "trainer" && (
          <div style={styles.physicalSheet}>
            <div style={styles.sheetHeader}><h1>SCHEDA ALLENATORE</h1></div>
<div style={styles.sheetGridRow}>
  <div style={styles.sheetInputBox}><label style={styles.sheetLabel}>NOME</label><input style={styles.sheetInput} value={trainer.nome} onChange={e => setTrainer({...trainer, nome: e.target.value})} /></div>
  <div style={styles.sheetInputBox}><label style={styles.sheetLabel}>RANGO</label><input style={styles.sheetInput} value={trainer.rango} onChange={e => setTrainer({...trainer, rango: e.target.value})} /></div>
  <div style={styles.sheetInputBox}><label style={styles.sheetLabel}>₽</label><input type="number" style={styles.sheetInput} value={trainer.money} onChange={e => setTrainer({...trainer, money: e.target.value})} /></div>
</div>
<div style={{...styles.sheetGridRow, marginTop: '15px'}}>
  <div style={{...styles.sheetInputBox, borderColor: '#ff4757'}}><label style={{...styles.sheetLabel, color: '#ff4757'}}>HP</label><input type="number" style={{...styles.sheetInput, color: '#ff4757', textAlign: 'center'}} value={trainer.currentHP} onChange={e => setTrainer({...trainer, currentHP: e.target.value})} /></div>
  <div style={{...styles.sheetInputBox, borderColor: '#4bcffa'}}><label style={{...styles.sheetLabel, color: '#4bcffa'}}>VOLONTÀ</label><input type="number" style={{...styles.sheetInput, color: '#4bcffa', textAlign: 'center'}} value={trainer.currentWill} onChange={e => setTrainer({...trainer, currentWill: e.target.value})} /></div>
</div>

            <div style={{display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap'}}>
              <div style={{flex: '0.8', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '150px'}}>
                <div style={{...styles.sheetBoxHeader, backgroundColor: '#444'}}>ATTRIBUTI</div>
                {Object.entries(trainer.stats).map(([k, v]) => (
                  <div key={k} style={styles.sheetAttributeBox}>
                    <label style={styles.sheetAttributeLabel}>{tradStats[k]}</label>
                    <input type="number" value={v} onChange={e => setTrainer({...trainer, stats: {...trainer.stats, [k]: parseInt(e.target.value) || 0}})} style={styles.sheetAttributeInput} />
                  </div>
                ))}
              </div>
              <div style={{flex: '2', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px'}}>
                {renderTrainerSkillGroup("LOTTA", ['Brawl', 'Throw', 'Evasion', 'Weapons'])}
                {renderTrainerSkillGroup("SOPRAVVIVENZA", ['Alert', 'Athletic', 'Nature', 'Stealth', 'Survival'])}
                {renderTrainerSkillGroup("SOCIALE", ['Allure', 'Etiquette', 'Intimidate', 'Perform'])}
                {renderTrainerSkillGroup("CONOSCENZA", ['Crafts', 'Lore', 'Medicine', 'Science', 'Command'])}
              </div>
            </div>

            <div style={{marginTop: '25px', ...styles.sheetBox}}>
              <div style={styles.sheetBoxHeader}>INVENTARIO</div>
              <div style={{padding: '15px'}}>
                <div style={{display:'flex', gap: 10, marginBottom: 15, flexWrap: 'wrap'}}>
                  <input list="items" style={styles.searchBar} value={itemSelezionato} onChange={e => setItemSelezionato(e.target.value)} placeholder="Aggiungi strumento..." />
                  <datalist id="items">{listaStrumenti.map(i => <option key={i} value={i} />)}</datalist>
                  <button onClick={() => { aggiungiZaino(itemSelezionato); setItemSelezionato(""); }} style={styles.btnCercaMini}> + </button>
                </div>
                {zaino.map((item, i) => (
  <div key={i} style={styles.sheetItemRow}>
    {/* Box Immagine Oggetto */}
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
      
      {/* Descrizione */}
      <div style={{fontSize: '12px', color: '#aaa', fontStyle: 'italic', marginTop: '3px'}}>{item.Description}</div>
      
      {/* EFFETTO MECCANICO (PRIORITÀ MASTER) */}
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
              <div key={p.id} style={{...styles.physicalSheet, marginBottom: '30px', borderLeft: '8px solid #ff4757'}}>
                <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <div style={styles.imgContainerBig}>{renderImmagine('pokemon', p.currentForm, { width: '100px' })}</div>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <div style={styles.sheetGridRow}>
                      <div style={{...styles.sheetInputBox, flex: 2}}><label style={styles.sheetLabel}>NOME</label><input style={styles.sheetInput} value={tNomePkm(p.Name)} readOnly /></div>
                      {p.availableForms && p.availableForms.length > 1 && (
                        <div style={styles.sheetInputBox}>
                          <label style={styles.sheetLabel}>FORMA</label>
                          <select style={styles.sheetInput} value={p.currentForm} onChange={(e) => scambiaForma(p.id, e.target.value)}>
                             {p.availableForms.map(f => <option key={f} value={f}>{tNomePkm(f)}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                    <div style={styles.sheetGridRow}>
                      <div style={{...styles.sheetInputBox, borderColor: '#ff4757'}}><label style={{...styles.sheetLabel, color: '#ff4757'}}>PS</label><input type="number" style={styles.sheetInput} value={p.curHP} onChange={e => setSquadra(squadra.map(x => x.id === p.id ? {...x, curHP: parseInt(e.target.value)} : x))} /></div>
                      <div style={{...styles.sheetInputBox, borderColor: '#4bcffa'}}><label style={{...styles.sheetLabel, color: '#4bcffa'}}>VOLONTÀ</label><input type="number" style={styles.sheetInput} value={p.curWill} onChange={e => setSquadra(squadra.map(x => x.id === p.id ? {...x, curWill: parseInt(e.target.value)} : x))} /></div>
                    </div>
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
                          <select style={styles.sheetInput} value={mossaNome} onChange={(e) => {
                            const n = [...p.selectedMoves]; n[i] = e.target.value;
                            setSquadra(squadra.map(x => x.id === p.id ? {...x, selectedMoves: n} : x));
                          }}>
                            <option value="">-- MOSSA --</option>
                            {p.Moves.map(m => <option key={m.Name} value={m.Name}>{m.Name}</option>)}
                          </select>
                          {info && (
                            <div style={{marginTop: 10, borderTop: `2px solid ${typeColors[info.Type]}`, paddingTop: 10}}>
                              <div style={{display:'flex', justifyContent:'space-between', fontSize: 13}}>
                                <span style={{color: typeColors[info.Type], fontWeight:'bold'}}>{tradTipi[info.Type]}</span>
                                <span style={{cursor: 'pointer'}} onClick={() => tiraDadi(prec, mossaNome)}>🎲 {prec} | 💥 {dmgVal === "-" ? "-" : (baseStat + dmgVal)}</span>
                              </div>
                              <div style={{fontSize: 11, color:'#aaa', marginTop: 5}}>{info.Effect || info.Description}</div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <button onClick={() => setSquadra(squadra.filter(x => x.id !== p.id))} style={styles.btnDelPkm}>RIMUOVI DAL TEAM</button>
              </div>
            ))}
          </div>
        )}

        {tab === "pokedex" && (
          <div style={{textAlign:'center'}}>
            <input list="pkm-all" style={styles.bigSearch} value={ricerca} onChange={e => setRicerca(e.target.value)} placeholder="Cerca Pokémon..." />
            <datalist id="pkm-all">{listaPokemon.map(p => <option key={p} value={p} />)}</datalist>
            <button onClick={cercaPokemon} style={styles.btnCerca}>RICERCA</button>
            {pkmTrovato && (
              <div style={{...styles.physicalSheet, marginTop: 20}}>
                {renderImmagine('pokemon', pkmTrovato.Name, {width: 150})}
                <h2>{pkmTrovato.Name}</h2>
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
  loginContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#121212' },
  navbar: { display: 'flex', backgroundColor: '#1f1f1f', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid #333' },
  navBtn: { flex: 1, padding: '15px', background: 'none', border: 'none', color: '#888', fontWeight: 'bold', cursor: 'pointer' },
  navActive: { flex: 1, padding: '15px', background: 'none', border: 'none', color: '#ff4757', borderBottom: '4px solid #ff4757', fontWeight: 'bold' },
  btnCloud: { background: 'none', border: 'none', color: '#2ed573', cursor: 'pointer', fontWeight: 'bold' },
  btnExit: { background: 'none', border: 'none', color: '#ff4757', cursor: 'pointer', fontWeight: 'bold' },
  mainContent: { padding: '15px', maxWidth: '850px', margin: '0 auto' },
  physicalSheet: { backgroundColor: '#1e1e1e', padding: '20px', borderRadius: '15px', border: '1px solid #333', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' },
  sheetHeader: { borderBottom: '2px solid #555', paddingBottom: '10px', marginBottom: '15px', textAlign: 'center' },
  sheetGridRow: { display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' },
  sheetInputBox: { 
    flex: 1, 
    border: '1px solid #444', 
    backgroundColor: '#252525', 
    borderRadius: '8px', 
    padding: '8px 10px', 
    display: 'flex', 
    flexDirection: 'column', 
    minWidth: '120px' 
  },
  sheetLabel: { fontSize: '9px', color: '#888', fontWeight: 'bold' },
  sheetInput: { 
    background: '#252525', // Sfondo scuro forzato per leggere il testo bianco
    border: 'none', 
    color: '#fff', 
    fontSize: '16px', 
    fontWeight: 'bold', 
    outline: 'none', 
    width: '100%',
    borderRadius: '4px' },
  sheetBox: { border: '1px solid #444', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#222' },
  sheetBoxHeader: { backgroundColor: '#ff4757', color: '#fff', fontSize: '11px', fontWeight: 'bold', padding: '6px', textAlign: 'center' },
  sheetAttributeBox: { backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '10px', padding: '10px', textAlign: 'center' },
  sheetAttributeLabel: { fontSize: '11px', color: '#aaa', fontWeight: 'bold' },
  sheetAttributeInput: { background: 'none', border: 'none', color: '#fff', fontSize: '24px', fontWeight: 'bold', textAlign: 'center', width: '100%' },
  sheetSkillRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderBottom: '1px solid #333', cursor: 'pointer' },
  sheetMiniInput: { width: '35px', background: '#111', border: '1px solid #555', color: '#fff', textAlign: 'center', borderRadius: '5px' },
  sheetItemRow: { backgroundColor: '#1a1a1a', padding: '10px', borderRadius: '10px', border: '1px solid #333', display: 'flex', alignItems: 'center', marginBottom: '8px' },
imgContainer: { 
    width: '60px', 
    height: '60px', 
    backgroundColor: '#111', 
    borderRadius: '12px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    border: '1px solid #444', 
    flexShrink: 0 
  },  
imgContainerBig: { 
    width: '120px', 
    height: '120px', 
    backgroundColor: '#111', 
    borderRadius: '15px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    border: '1px solid #444' 
  },
itemImage: { 
    width: '45px', 
    height: '45px', 
    objectFit: 'contain' 
  },
effectBox: { 
    fontSize: '12px', 
    color: '#2ed573', 
    marginTop: '8px', 
    padding: '8px', 
    backgroundColor: 'rgba(46, 213, 115, 0.1)', 
    borderRadius: '6px', 
    borderLeft: '4px solid #2ed573' 
  },
  sheetMoveCard: { backgroundColor: '#252525', border: '1px solid #444', borderRadius: '10px', padding: '12px' },
  btnDelPkm: { background: 'none', border: '1px solid #ff4757', color: '#ff4757', padding: '10px', borderRadius: '10px', cursor: 'pointer', width: '100%', marginTop: '10px' },
  bigSearch: { width: '100%', padding: '15px', borderRadius: '15px', border: 'none', backgroundColor: '#1f1f1f', color: '#fff', fontSize: '18px' },
  btnCerca: { backgroundColor: '#ff4757', color: '#fff', padding: '15px', borderRadius: '15px', width: '100%', border: 'none', fontWeight: 'bold', marginTop: '10px', cursor: 'pointer' },
  btnSuccess: { backgroundColor: '#2ed573', color: '#fff', padding: '15px', borderRadius: '15px', width: '100%', border: 'none', fontWeight: 'bold', cursor: 'pointer' },
  btnCercaMini: { padding: '10px 20px', backgroundColor: '#ff4757', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' },
  searchBar: { flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #444', backgroundColor: '#111', color: '#fff' }
};

export default App;