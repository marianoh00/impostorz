
import { SubCategory } from './types';

const allEras = (list: string[]): Record<number, string[]> => ({
  1990: list, 2000: list, 2010: list, 2018: list, 2020: list, 2022: list, 2025: list
});

export const PLAYER_DATA: Record<SubCategory, Record<number, string[]>> = {
  // --- SPORTS ---
  [SubCategory.PREMIER_LEAGUE]: {
    2018: ["Mohamed Salah", "Kevin De Bruyne", "Harry Kane", "Eden Hazard", "David De Gea", "Virgil van Dijk", "N'Golo Kanté"],
    2022: ["Erling Haaland", "Kevin De Bruyne", "Harry Kane", "Martin Ødegaard", "Bukayo Saka", "Marcus Rashford", "Son Heung-min"],
    2025: ["Cole Palmer", "Erling Haaland", "Rodri", "Alexander Isak", "Phil Foden", "Bukayo Saka", "Ollie Watkins"],
    1990: ["Alan Shearer", "Eric Cantona", "Ryan Giggs", "Thierry Henry", "Dennis Bergkamp", "Patrick Vieira", "Roy Keane"]
  },
  [SubCategory.LA_LIGA]: {
    2018: ["Lionel Messi", "Cristiano Ronaldo", "Luka Modric", "Antoine Griezmann", "Luis Suárez", "Sergio Ramos"],
    2022: ["Karim Benzema", "Vinícius Júnior", "Robert Lewandowski", "Pedri", "Gavi", "Federico Valverde"],
    2025: ["Kylian Mbappé", "Lamine Yamal", "Jude Bellingham", "Vinícius Júnior", "Nico Williams", "Antoine Griezmann"],
    1990: ["Raúl", "Zidane", "Ronaldinho", "Ronaldo Nazário", "Rivaldo", "Roberto Carlos", "Luis Figo"]
  },
  [SubCategory.BUNDESLIGA]: allEras(["Harry Kane", "Florian Wirtz", "Jamal Musiala", "Thomas Müller", "Granit Xhaka", "Leroy Sané", "Dani Olmo"]),
  [SubCategory.LEGENDS_FOOTBALL]: allEras(["Pelé", "Diego Maradona", "Franz Beckenbauer", "Johan Cruyff", "Zinedine Zidane", "Ronaldinho", "Ronaldo Nazário", "Bobby Charlton", "Gerd Müller", "Lev Yashin", "Eusébio", "George Best", "Marco van Basten"]),
  
  [SubCategory.ATP]: {
    2018: ["Novak Djokovic", "Rafael Nadal", "Roger Federer", "Alexander Zverev", "Juan Martin del Potro", "Kevin Anderson", "Marin Cilic", "Dominic Thiem", "Kei Nishikori", "John Isner", "Karen Khachanov", "Borna Coric", "Fabio Fognini", "Kyle Edmund", "Stefanos Tsitsipas", "Daniil Medvedev", "Diego Schwartzman", "Milos Raonic", "Grigor Dimitrov", "Marco Cecchinato", "Nikoloz Basilashvili", "David Goffin", "Roberto Bautista Agut", "Pablo Carreno Busta", "Chung Hyeon", "Richard Gasquet", "Fernando Verdasco", "Gilles Simon", "Gael Monfils", "Denis Shapovalov", "Lucas Pouille", "Alex de Minaur", "Steve Johnson", "Philipp Kohlschreiber", "Nick Kyrgios", "Marton Fucsovics", "Andreas Seppi", "John Millman", "Frances Tiafoe", "Martin Klizan", "Adrian Mannarino", "Taylor Fritz", "Malek Jaziri", "Robin Haase", "Mikhail Kukushkin", "Joao Sousa", "Damir Dzumhur", "Jeremy Chardy", "Sam Querrey", "Tennys Sandgren"],
    2022: ["Carlos Alcaraz", "Rafael Nadal", "Casper Ruud", "Stefanos Tsitsipas", "Novak Djokovic", "Felix Auger-Aliassime", "Daniil Medvedev", "Andrey Rublev", "Taylor Fritz", "Hubert Hurkacz", "Holger Rune", "Alexander Zverev", "Pablo Carreno Busta", "Cameron Norrie", "Jannik Sinner", "Matteo Berrettini", "Marin Cilic", "Denis Shapovalov", "Frances Tiafoe", "Karen Khachanov", "Roberto Bautista Agut", "Nick Kyrgios", "Lorenzo Musetti", "Borna Coric", "Alex de Minaur", "Diego Schwartzman", "Daniel Evans", "Miomir Kecmanovic", "Francisco Cerundolo", "Alejandro Davidovich Fokina", "Tommy Paul", "Sebastian Korda", "Maxime Cressy", "Botic van de Zandschulp", "Yoshihito Nishioka", "Alexander Bublik", "Reilly Opelka", "Brandon Nakashima", "Lorenzo Sonego", "Jack Draper", "Grigor Dimitrov", "Albert Ramos-Vinolas", "Sebastian Baez", "Arthur Rinderknech", "Marc-Andrea Huesler", "Oscar Otte", "Emil Ruusuvuori", "Jiri Lehecka", "Filip Krajinovic", "Andy Murray"],
    2025: ["Carlos Alcaraz", "Jannik Sinner", "Alexander Zverev", "Novak Djokovic", "Felix Auger-Aliassime", "Taylor Fritz", "Alex de Minaur", "Lorenzo Musetti", "Ben Shelton", "Jack Draper", "Alexander Bublik", "Casper Ruud", "Daniil Medvedev", "Alejandro Davidovich Fokina", "Holger Rune", "Andrey Rublev", "Jiri Lehecka", "Karen Khachanov", "Jakub Mensik", "Tommy Paul", "Francisco Cerundolo", "Flavio Cobolli", "Denis Shapovalov", "Joao Fonseca", "Tallon Griekspoor", "Luciano Darderi", "Cameron Norrie", "Learner Tien", "Arthur Rinderknech", "Frances Tiafoe", "Valentin Vacherot", "Tomas Machac", "Brandon Nakashima", "Stefanos Tsitsipas", "Corentin Moutet", "Jaume Munar", "Ugo Humbert", "Alex Michelsen", "Lorenzo Sonego", "Arthur Fils", "Gabriel Diallo", "Alexandre Muller", "Zizou Bergs", "Grigor Dimitrov", "Sebastian Baez", "Daniel Altmaier", "Nuno Borges", "Sebastian Korda", "Camilo Ugo Carabelli", "Reilly Opelka"],
    1990: ["Pete Sampras", "Andre Agassi", "Boris Becker", "Stefan Edberg", "Jim Courier", "Ivan Lendl", "Michael Chang", "Goran Ivanišević", "Thomas Muster"]
  },
  [SubCategory.WTA]: {
    2018: ["Simona Halep", "Angelique Kerber", "Caroline Wozniacki", "Elina Svitolina", "Naomi Osaka", "Sloane Stephens", "Petra Kvitova", "Karolina Pliskova", "Kiki Bertens", "Daria Kasatkina", "Anastasija Sevastova", "Elise Mertens", "Aryna Sabalenka", "Julia Goerges", "Ashleigh Barty", "Serena Williams", "Madison Keys", "Garbiñe Muguruza", "Caroline Garcia", "Anett Kontaveit", "Wang Qiang", "Jelena Ostapenko", "Carla Suarez Navarro", "Mihaela Buzarnescu", "Dominika Cibulkova", "Camila Giorgi", "Lesia Tsurenko", "Hsieh Su-wei", "Maria Sharapova", "Aliaksandra Sasnovich", "Petra Martic", "Barbora Strycova", "Donna Vekic", "Johanna Konta", "Danielle Collins", "Zhang Shuai", "Maria Sakkari", "Ajla Tomljanovic", "Kirsten Flipkens", "Sofia Kenin", "Belinda Bencic", "Viktória Kužmová", "Monica Puig", "Tatjana Maria", "Zheng Saisai", "Venus Williams", "Alison Riske", "Dayana Yastremska", "Alizé Cornet", "Rebecca Peterson"],
    2022: ["Iga Swiatek", "Ons Jabeur", "Jessica Pegula", "Caroline Garcia", "Aryna Sabalenka", "Maria Sakkari", "Coco Gauff", "Daria Kasatkina", "Veronika Kudermetova", "Simona Halep", "Madison Keys", "Belinda Bencic", "Paula Badosa", "Danielle Collins", "Beatriz Haddad Maia", "Petra Kvitova", "Anett Kontaveit", "Jelena Ostapenko", "Liudmila Samsonova", "Ekaterina Alexandrova", "Barbora Krejcikova", "Elena Rybakina", "Amanda Anisimova", "Zhang Shuai", "Martina Trevisan", "Victoria Azarenka", "Marie Bouzkova", "Zheng Qinwen", "Karolina Pliskova", "Irina-Camelia Begu", "Jil Teichmann", "Kaia Kanepi", "Sorana Cirstea", "Elise Mertens", "Aliaksandra Sasnovich", "Ajla Tomljanovic", "Alizé Cornet", "Bernarda Pera", "Naomi Osaka", "Shelby Rogers", "Sofia Kenin", "Bianca Andreescu", "Leylah Fernandez", "Sloane Stephens", "Yulia Putintseva", "Anhelina Kalinina", "Petra Martic", "Mayar Sherif", "Anastasia Potapova", "Katerina Siniakova"],
    2025: ["Aryna Sabalenka", "Iga Swiatek", "Coco Gauff", "Amanda Anisimova", "Elena Rybakina", "Jessica Pegula", "Madison Keys", "Jasmine Paolini", "Mirra Andreeva", "Ekaterina Alexandrova", "Belinda Bencic", "Clara Tauson", "Linda Noskova", "Elina Svitolina", "Emma Navarro", "Naomi Osaka", "Liudmila Samsonova", "Victoria Mboko", "Karolina Muchova", "Elise Mertens", "Diana Shnaider", "Leylah Fernandez", "Jelena Ostapenko", "Zheng Qinwen", "Paula Badosa", "Marta Kostyuk", "Dayana Yastremska", "Sofia Kenin", "Emma Raducanu", "Veronika Kudermetova", "McCartney Kessler", "Maya Joint", "Anna Kalinskaya", "Marketa Vondrousova", "Iva Jovic", "Lois Boisson", "Daria Kasatkina", "Ann Li", "Jaqueline Cristian", "Eva Lys", "Jessica Bouzas Maneiro", "Marie Bouzkova", "Sorana Cirstea", "Ashlyn Krueger", "Tatjana Maria", "Laura Siegemund", "Anastasia Pavlyuchenkova", "Katerina Siniakova", "Emiliana Arango", "Sara Sorribes Tormo"],
    1990: ["Steffi Graf", "Monica Seles", "Martina Navratilova", "Gabriela Sabatini", "Jennifer Capriati", "Arantxa Sánchez Vicario", "Mary Joe Fernández"]
  },
  [SubCategory.LEGENDS_TENNIS]: allEras(["Björn Borg", "John McEnroe", "Steffi Graf", "Martina Navratilova", "Pete Sampras", "Andre Agassi", "Serena Williams", "Roger Federer", "Rafael Nadal", "Novak Djokovic", "Rod Laver", "Billie Jean King", "Chris Evert"]),
  
  [SubCategory.PADEL_PROS]: {
    2025: ["Agustín Tapia", "Arturo Coello", "Alejandro Galán", "Federico Chingotto", "Juan Lebrón", "Franco Stupaczuk", "Martín Di Nenno", "Paquito Navarro", "Mike Yanguas", "Coki Nieto", "Jon Sanz", "Momo González", "Fernando Belasteguín", "Juan Tello", "Javi Garrido", "Edu Alonso", "Sanyo Gutiérrez", "Lucas Bergamini", "Leo Augsburger", "Tino Libaak", "Pablo Cardona", "Álex Ruiz", "Javi Leal", "Gonzalo Alfonso", "Tolito Aguirre"]
  },
  [SubCategory.LEGENDS_PADEL]: {
    2025: ["Fernando Belasteguín", "Juan Martín Díaz", "Roby Gattiker", "Alejandro Lasaigues", "Pablo Lima", "Sanyo Gutiérrez", "Paquito Navarro", "Gaby Reca", "Sebastián Nerone", "Cristián Gutiérrez", "Miguel Lamperti", "Hernán Auguste", "Juan Lebrón", "Alejandro Galán", "Maxi Sánchez", "Willy Lahoz", "Juani Mieres", "Matías Díaz", "Arturo Coello", "Agustín Tapia"]
  },

  [SubCategory.LEGENDS_F1]: allEras(["Michael Schumacher", "Lewis Hamilton", "Ayrton Senna", "Juan Manuel Fangio", "Alain Prost", "Niki Lauda", "Jim Clark", "Jackie Stewart", "Sebastian Vettel", "Stirling Moss", "Max Verstappen", "Nelson Piquet", "Graham Hill", "Jack Brabham", "Mika Hakkinen", "Nigel Mansell", "Emerson Fittipaldi", "Alberto Ascari", "James Hunt", "Mario Andretti"]),
  [SubCategory.F1_DRIVERS]: allEras(["Max Verstappen", "Lewis Hamilton", "Lando Norris", "Charles Leclerc", "Oscar Piastri", "George Russell", "Carlos Sainz", "Fernando Alonso", "Nico Hulkenberg", "Sergio Perez", "Alex Albon", "Yuki Tsunoda"]),
  
  [SubCategory.LEGENDS_NBA]: allEras(["Michael Jordan", "LeBron James", "Kareem Abdul-Jabbar", "Magic Johnson", "Larry Bird", "Kobe Bryant", "Wilt Chamberlain", "Bill Russell", "Shaquille O'Neal", "Tim Duncan", "Stephen Curry", "Hakeem Olajuwon", "Oscar Robertson", "Jerry West", "Julius Erving", "Kevin Durant", "Charles Barkley", "Karl Malone", "Elgin Baylor", "David Robinson", "Dennis Rodman"]),
  [SubCategory.NBA_STARS]: allEras(["Nikola Jokić", "Luka Dončić", "Shai Gilgeous-Alexander", "Giannis Antetokounmpo", "Jayson Tatum", "Stephen Curry", "LeBron James", "Kevin Durant", "Anthony Edwards", "Joel Embiid", "Victor Wembanyama"]),
  
  [SubCategory.LEGENDS_NFL]: allEras(["Tom Brady", "Jerry Rice", "Jim Brown", "Lawrence Taylor", "Joe Montana", "Walter Payton", "Peyton Manning", "Reggie White", "Barry Sanders", "Don Hutson", "Dick Butkus", "Ronnie Lott", "Anthony Munoz", "Joe Greene", "Ray Lewis", "Brett Favre", "John Elway", "Dan Marino", "Emmitt Smith", "Deion Sanders"]),
  [SubCategory.NFL_STARS]: allEras(["Patrick Mahomes", "Lamar Jackson", "Josh Allen", "Christian McCaffrey", "Tyreek Hill", "Justin Jefferson", "T.J. Watt", "Aron Donald", "Travis Kelce", "Joe Burrow", "Brock Purdy", "Jalen Hurts"]),

  // --- ARTISTS ---
  [SubCategory.RAP]: {
    1990: ["2Pac", "Notorious B.I.G.", "Dr. Dre", "Snoop Dogg", "Jay-Z", "Nas", "Ice Cube", "Wu-Tang Clan", "Busta Rhymes", "DMX"],
    2000: ["50 Cent", "Eminem", "Kanye West", "Lil Wayne", "Jay-Z", "Ludacris", "T.I.", "Nelly", "Rick Ross", "Soulja Boy"],
    2010: ["Drake", "Kendrick Lamar", "Travis Scott", "J. Cole", "Future", "Nicki Minaj", "Cardi B", "Migos", "Post Malone", "Lil Uzi Vert", "ASAP Rocky", "Tyler, The Creator", "Mac Miller", "Young Thug", "Wiz Khalifa"],
    2020: ["Kendrick Lamar", "Travis Scott", "Lil Baby", "21 Savage", "Jack Harlow", "Metro Boomin", "Ice Spice", "Central Cee", "Yeat", "Playboi Carti", "Lil Durk", "GloRilla", "Sexyy Red", "Latto", "Don Toliver"]
  },
  [SubCategory.POP]: {
    1990: ["Michael Jackson", "Madonna", "Britney Spears", "Spice Girls", "Backstreet Boys", "Mariah Carey", "Celine Dion", "Whitney Houston", "Ricky Martin", "Janet Jackson"],
    2000: ["Britney Spears", "Beyoncé", "Justin Timberlake", "Lady Gaga", "Rihanna", "Katy Perry", "Shakira", "Pink", "Usher", "Avril Lavigne"],
    2010: ["Taylor Swift", "Adele", "Justin Bieber", "Ariana Grande", "Ed Sheeran", "Bruno Mars", "Rihanna", "The Weeknd", "Billie Eilish", "Dua Lipa", "Selena Gomez"],
    2020: ["Taylor Swift", "The Weeknd", "Billie Eilish", "Olivia Rodrigo", "Harry Styles", "Dua Lipa", "Miley Cyrus", "SZA", "Sabrina Carpenter", "Doja Cat", "Tate McRae", "Tyla", "Charli XCX"]
  },
  [SubCategory.KPOP]: {
    1990: ["Seo Taiji & Boys", "H.O.T.", "S.E.S.", "Shinhwa", "Fin.K.L", "g.o.d", "Sechs Kies", "Turbo", "Jinusean"],
    2000: ["BIGBANG", "Girls' Generation", "Super Junior", "TVXQ", "Wonder Girls", "SHINee", "2NE1", "Rain", "BoA", "Kara"],
    2010: ["BTS", "BLACKPINK", "EXO", "TWICE", "Red Velvet", "GOT7", "SEVENTEEN", "NCT", "Stray Kids", "Mamamoo", "Monsta X", "Ateez", "TXT", "Itzy", "G(I)-DLE"],
    2020: ["BTS", "NewJeans", "IVE", "LE SSERAFIM", "Stray Kids", "Aespa", "TXT", "Enhypen", "ILLIT", "Fifty Fifty", "BabyMonster", "Riize", "Zerobaseone"]
  },
  [SubCategory.LATIN]: {
    1990: ["El General", "Vico C", "Daddy Yankee", "Ivy Queen", "Don Chezina", "Baby Rasta & Gringo", "Playero", "The Noise"],
    2000: ["Daddy Yankee", "Don Omar", "Wisin & Yandel", "Tego Calderón", "Zion & Lennox", "Arcángel", "Calle 13", "Hector El Father", "Ivy Queen", "Plan B"],
    2010: ["J Balvin", "Bad Bunny", "Karol G", "Maluma", "Ozuna", "Nicky Jam", "Farruko", "Rauw Alejandro", "Anuel AA", "Becky G", "Sebastian Yatra", "Rosalía"],
    2020: ["Bad Bunny", "Karol G", "Feid", "Rauw Alejandro", "Myke Towers", "Young Miko", "Eladio Carrión", "Mora", "Quevedo", "Peso Pluma", "Rels B", "Ryan Castro"]
  },
  [SubCategory.ROCK]: allEras(["Queen", "Nirvana", "The Rolling Stones", "Led Zeppelin", "AC/DC", "Guns N' Roses", "Pink Floyd", "The Beatles"]),
  [SubCategory.LEGENDS_ARTISTS]: allEras(["Michael Jackson", "Elvis Presley", "Freddie Mercury", "Madonna", "The Beatles", "2Pac", "Notorious B.I.G.", "Whitney Houston", "Bob Marley", "Prince", "David Bowie", "Aretha Franklin", "Jimi Hendrix", "Eminem", "Beyoncé"]),

  // --- GAMES ---
  [SubCategory.GAMES_SOCIAL]: allEras(["Roblox", "Minecraft", "Grand Theft Auto Online", "League of Legends", "Dota 2", "Monster Hunter Wilds", "Sea of Thieves", "Rocket League", "Dead by Daylight", "Helldivers 2", "Warframe", "Among Us"]),
  [SubCategory.GAMES_ACTION]: allEras(["Ghost of Yotei", "Assassin’s Creed Shadows", "The Last of Us Part II", "Death Stranding 2", "God of War: Ragnarök", "Red Dead Redemption 2", "Black Myth: Wukong", "Hollow Knight: Silksong", "Star Wars Outlaws", "Zelda: Tears of the Kingdom", "Uncharted", "Ghostwire: Tokyo", "Stellar Blade"]),
  [SubCategory.GAMES_SHOOTER]: allEras(["Counter-Strike 2", "Fortnite", "Call of Duty: Black Ops 7", "Valorant", "Apex Legends", "PUBG", "Delta Force", "Rainbow Six Siege", "Overwatch 2", "Marvel Rivals", "The Finals", "DOOM: The Dark Ages", "Battlefield 6"]),
  [SubCategory.GAMES_RPG]: allEras(["Baldur’s Gate 3", "Elder Scrolls IV: Oblivion", "Final Fantasy VII Rebirth", "Avowed", "The Witcher 3", "Cyberpunk 2077", "Kingdom Come: Deliverance II", "Genshin Impact", "Dragon Age: The Veilguard", "Honkai: Star Rail", "Fable", "Persona 6"]),
  [SubCategory.LEGENDS_GAMES]: allEras(["Astro Bot", "Baldur's Gate 3", "Elden Ring", "It Takes Two", "The Last of Us Part II", "Sekiro", "God of War", "Zelda: Breath of the Wild", "Overwatch", "The Witcher 3", "Dragon Age: Inquisition", "Grand Theft Auto V", "Skyrim"]),

  // --- STREAMERS ---
  [SubCategory.STREAM_EN]: allEras(["Kai Cenat", "IShowSpeed", "xQc", "Asmongold", "Shroud", "Ninja", "Adin Ross"]),
  [SubCategory.STREAM_ES]: allEras(["Ibai", "AuronPlay", "ElRubius", "TheGrefg", "DjMaRiiO", "Rivers_gg"]),
  [SubCategory.STREAM_FR]: allEras(["Squeezie", "Kameto", "Aminematue", "Mister V", "Gotaga"]),
  [SubCategory.LEGENDS_STREAMERS]: allEras(["Ninja", "PewDiePie", "Shroud", "Sodapoppin", "Summit1g", "DrDisrespect", "Pokimane", "El Rubius", "Gronkh", "xQc", "Justin Kan", "Tyler1", "Markiplier", "Ibai", "Valkyrae"]),

  // --- CARS ---
  [SubCategory.CARS_NORMAL]: allEras(["Toyota Corolla", "VW Golf", "Ford F-150", "Hyundai Tucson", "Honda Civic", "Nissan Qashqai", "Tesla Model 3", "BYD Seal", "Mazda CX-5"]),
  [SubCategory.CARS_SUPERCARS]: allEras(["Lamborghini Revuelto", "Ferrari SF90 Stradale", "McLaren 750S", "Porsche 911 GT3 RS", "Chevrolet Corvette ZR1", "Bugatti Tourbillon", "Aston Martin Vanquish", "Maserati MC20", "Ford Mustang GTD", "Koenigsegg Jesko", "Pagani Utopia", "Rimac Nevera"]),
  [SubCategory.CARS_LUXURY]: allEras(["Rolls-Royce Phantom", "Bentley Continental GT", "Mercedes-Maybach S-Class", "BMW i7", "Range Rover Autobiography", "Audi A8 L", "Lexus LS 500", "Porsche Panamera", "Genesis G90", "Cadillac Escalade-V", "Lucid Air Sapphire"]),
  [SubCategory.LEGENDS_CARS]: allEras(["Ferrari F40", "Lamborghini Countach", "Toyota Supra MK4", "Nissan Skyline GT-R R34", "Porsche 911 (1964)", "Ford Mustang (1965)", "Aston Martin DB5", "McLaren F1", "DMC DeLorean", "Shelby Cobra 427", "Jaguar E-Type", "Volkswagen Beetle", "Dodge Charger (1969)", "Mercedes-Benz 300 SL Gullwing", "Ferrari 250 GTO"])
};
