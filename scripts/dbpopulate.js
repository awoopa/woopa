const pgp = require('pg-promise')({});
const db = require('../app/models/index');
const fsp = require('fs-promise');

const salt = "f02e37699bc84bd39fae2333514ff1ee4641c15754a8616f8153b727eebe5a1e165ebf348509dbce0286d37ec48c0a205ae1474f05a43bfa59bd18ec982d16adebea846813793cffc114fe7c3b95074613ca1a44c1182d2aa4b1837c7680e721b2ef8ec367fd5eac05f5af613af69f04832d1d6a11f8cad1ea19017d2f4a2590d6d82e1317dee649f0f0d4145faa66fc6b67c9c858b89654ff8fd8291fff44900dbce6bed3bb8ffff4ffe94b784710f1f62628b45e31f65a4eec0ffa8bb5a2ab8aca92b6713052dd0d2e2fcd05ae5880f91242dc923e58ea1c59b895720e3c29af22c60f3905f1dc114d1f9a76857662f79412525826e734167b0c579e375886eb49c11ae8f0bf2c078e91bbe66e4d48b4f51a712eba38453f2aa3562f2590211ecf663095a559bcea2e153d7b1aba88425442d96d0785aef49f26fffec650095ddeefdc9619f3904d5fe5de6371f0bac5163ad55c4f1c14850e3c4043aef7f950d3731a1b81fdd528f7e92020968cc98e16b9fa2921e7181491aba36372b95cde6cb955ff45e8204fd457ed9c74cd952ad5e6078c3d9fdbeff682a9fbb9c0540fdc63535c308d2d17b411fedd5d178d0ecb62153f813936f59fdcfb31132f34287bf6c3f156e5430dc58957ba0ef8995297ecf25a5c99e564e32e1d1115694a672323889236925d74e6a64e2dd5b8f40b8790fd4334915e3167c7565796c3b1";
const pass = "9ae3e38433336f3eb933f8eae355a4a42ee0cd99bec0449df0255933002a2ffe46865eb6172c2b7623bef2ce82e0cb3cddaa21b5ddc95b03f40b4a48e82dc7ba4e6f2db13ad14cc263a795467ea6eae4c05a5ad6bd0a9e9249011373bf45fea56744a6530adca3ac9fbbf4e44aef48fce06252d094c38e4625e8e8eb9f26a8c48325630ca63561844a6e02ca16aa1e125645e28333d0484ae9f60674563e1f7ef77a9360c8b76e6690f5f3231d1a16fb8ca22e39f140eb6ca46c59e653bb89559eff899fd20f9f6574d4b2c969c58cbb9dd3ef58f3b715924b80524dd421d089c53a35979652c8eae2dfb386a8f28a759c26401221ec5d6feb9f6a6558647e9c8e0b1c9e70223ce0b5cccf2bd8fcf885ff1902f9a9cf779364cf52edcd819d27b75f692e4ef09b49e77f3109498a21aef1341520df4ebf761e9612452d6e837393e941e143c5f220f9465da9eeea8a37ccd2f40c26b5b3ec7bd48f41da7aee0321593022986ca8fe85f006cf28fc587f84f39144d1225cf41b239f7bb6901a6d8a5fc2d1e2d76d8d873859027e7d4cf337fe07213a969a904b42045019be6707b8986cb9da957d20ca340b1ccd6a6aef989295095c52ca7b3982ab61fdfa79e6953c7736bc218ae07cb5271a633b5aa05cc37ec59965a7d4cbb0be0c024f83b84b76ba25d99c629fef653ccd014ee88bdb881d4912541e691e45ad8708012f76";

// password is "f"

Promise.all([
  fsp.readFile('scripts/assets/sailormoonkib.jpg'),
  fsp.readFile('scripts/assets/zirconium.jpg'),
  fsp.readFile('scripts/assets/william.jpg'),
  fsp.readFile('scripts/assets/psych.jpg'),
  fsp.readFile('scripts/assets/zootopia.jpg'),
  fsp.readFile('scripts/assets/my_big_fat_greek_wedding_2.jpg'),
  fsp.readFile('scripts/assets/deadpool.jpg'),
  fsp.readFile('scripts/assets/batman_v_superman.jpg'),
  fsp.readFile('scripts/assets/starwars.jpg'),
  fsp.readFile('scripts/assets/the_dark_night.jpg'),
  fsp.readFile('scripts/assets/divergent.jpg'),
  fsp.readFile('scripts/assets/the_walking_dead.jpg'),
  fsp.readFile('scripts/assets/game_of_thrones.jpg'),
  fsp.readFile('scripts/assets/house_of_cards.jpg'),
  fsp.readFile('scripts/assets/greys.jpg'),
  fsp.readFile('scripts/assets/castle.jpg'),
  fsp.readFile('scripts/assets/bay.jpg')
]).then(images => {
  db.tx(function(t) {
    return t.batch([
      // Populate Users
      t.none(`
        INSERT INTO WoopaUser
        (email, username, salt, password, isAdmin)
        values($1, $2, $3, $4, $5)`,
        ["jamesjhliu@gmail.com", "yeah568", salt, pass, true]
      ),
      t.none(`
        INSERT INTO WoopaUser
        (email, username, salt, password, isAdmin)
        values($1, $2, $3, $4, $5)`,
        ["wqi.william@gmail.com", "wqi", salt, pass, true]
      ),
      t.none(`
        INSERT INTO WoopaUser
        (email, username, salt, password, isAdmin)
        values($1, $2, $3, $4, $5)`,
        ["mparkms@gmail.com", "kaabistar", salt, pass, false]
      ),
      t.none(`
        INSERT INTO WoopaUser
        (email, username, salt, password, isAdmin)
        values($1, $2, $3, $4, $5)`,
        ["sarahy@gmail.com", "sarahy8", salt, pass, false]
      ),
      t.none(`
        INSERT INTO WoopaUser
        (email, username, salt, password, isAdmin)
        values($1, $2, $3, $4, $5)`,
        ["itsm@rk.us", "markus", salt, pass, false]
      ),

      // Populate Friends
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [1, 2]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [2, 1]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [1, 3]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [3, 1]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [2, 3]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [3, 2]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [4, 1]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [1, 4]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [4, 2]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [2, 4]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [4, 5]
      ),
      t.none(
        `INSERT INTO Friends (user_userID, friend_userID) values($1, $2)`,
        [5, 4]
      ),

      // Populate Media
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numViews, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Zirconium", "Shikib Sings Zirconium", "History", new Date(2012, 11, 12), 7, 'video', 265, images[1]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numViews, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["My Moment", "The best rendition of the best song ever", "Music", new Date(2010, 8, 17), 1, 'video', 5201, images[2]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numSeasons, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Sailor Moonkib", "A lone algorithmicist defends the solar system from alien invasion", "Drama", new Date(1995, 5, 9), 5, 'tvshow', 8, images[0]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numSeasons, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Psych", "A novice sleuth is hired by the police after he cons them into thinking he has psychic powers which help solve crimes.", "Comedy", new Date(2006, 6, 7), null, 'tvshow', 2, images[3]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Kyle and Abrar Go To White Castle", "First installment in the Kyle and Abrar series", "Comedy", new Date(2004, 7, 30), null, 'movie', 92, images[15]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Kyle and Abrar Escape From Guantanamo Bay", "Second installment in the Kyle and Abrar series", "Comedy", new Date(2008, 4, 25), null, 'movie', 106, images[16]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Zootopia", "In a city of anthropomorphic animals, a rookie bunny cop and a cynical con artist fox must work together to uncover a conspiracy.", "Action", new Date(2016, 2, 4), 8.3, 'movie', 108, images[4]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["My Big Fat Greek Wedding 2", "A Portokalos family secret brings the beloved characters back together for an even bigger and Greeker wedding.", "Comedy", new Date(2016, 3, 25), null, 'movie', 94, images[5]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Deadpool", "A former Special Forces operative turned mercenary is subjected to a rogue experiment that leaves him with accelerated healing powers, adopting the alter ego Deadpool.", "Action", new Date(2016, 2, 12), null, 'movie', 108, images[6]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Batman v Superman: Dawn of Justice", "Fearing that the actions of Superman are left unchecked, Batman takes on the Man of Steel, while the world wrestles with what kind of a hero it really needs.", "Action", new Date(2016, 3, 25), 2.5, 'movie', 151, images[7]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Star Wars: Episode VII - The Force Awakens", "Three decades after the defeat of the Galactic Empire, a new threat arises. The First Order attempts to rule the galaxy and only a ragtag group of heroes can stop them, along with the help of the Resistance.", "Action", new Date(2015, 12, 18), null, 'movie', 135, images[8]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["The Dark Knight", "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, the caped crusader must come to terms with one of the greatest psychological tests of his ability to fight injustice.", "Comedy", new Date(2008, 7, 18), null, 'movie', 152, images[9]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, runtime, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Divergent", "In a world divided by factions based on virtues, Tris learns she's Divergent and won't fit in. When she discovers a plot to destroy Divergents, Tris and the mysterious Four must find out what makes Divergents dangerous before it's too late.", "Adventure", new Date(2014, 3, 21), null, 'movie', 139, images[10]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numSeasons, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["The Walking Dead", "Sheriff Deputy Rick Grimes leads a group of survivors in a world overrun by the walking dead. Fighting the dead, fearing the living.", "Drama", new Date(2010, 4, 3), 7, 'tvshow', 6, images[11]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numSeasons, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Game of Thrones", "While a civil war brews between several noble families in Westeros, the children of the former rulers of the land attempt to rise up to power. Meanwhile a forgotten race, bent on destruction, return after thousands of years in the North.", "Drama", new Date(2011, 9, 9), 7.5, 'tvshow', 6, images[12]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numSeasons, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["House of Cards", "A Congressman works with his equally conniving wife to exact revenge on the people who betrayed him.", "Drama", new Date(2013, 5, 9), null, 'tvshow', 5, images[13]]
      ),
      t.none(`
        INSERT INTO Media
        (title, synopsis, genre, publishDate, rating, type, numSeasons, img)
        values($1, $2, $3, $4 ,$5, $6, $7, $8)`,
        ["Grey's Anatomy ", "A drama centered on the personal and professional lives of five surgical interns and their supervisors.", "Drama", new Date(2005, 7, 12), null, 'tvshow', 12, images[14]]
      ),

      // Populate Actors
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Shailene Woodley", new Date(1991, 11, 15)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Theo James", new Date(1984, 12, 16)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Christian Bale", new Date(1974, 1, 30)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Heath Ledger", new Date(1979, 4, 4)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Aaron Eckhart", new Date(1968, 3, 12)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Daisy Ridley", new Date(1992, 4, 10)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["John Boyega", new Date(1992, 3, 17)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Ben Affleck", new Date(1972, 8, 15)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Ryan Reynolds", new Date(1976, 10, 23)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Nia Vardalos", new Date(1962, 9, 24)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Ginnifer Goodwin", new Date(1978, 5, 22)]
      ),
      t.none(
        `INSERT INTO Actor(actorName, dob) values($1, $2)`,
        ["Jason Bateman", new Date(1969, 1, 14)]
      ),

      // Populate Appears In
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [13, "Shailene Woodley", new Date(1991, 11, 15)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [13, "Theo James", new Date(1984, 12, 16)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [12, "Christian Bale", new Date(1974, 1, 30)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [12, "Heath Ledger", new Date(1979, 4, 4)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [12, "Aaron Eckhart", new Date(1968, 3, 12)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [11, "Daisy Ridley", new Date(1992, 4, 10)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [11, "John Boyega", new Date(1992, 3, 17)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [10, "Ben Affleck", new Date(1972, 8, 15)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [9, "Ryan Reynolds", new Date(1976, 10, 23)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [8, "Nia Vardalos", new Date(1962, 9, 24)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [7, "Ginnifer Goodwin", new Date(1978, 5, 22)]
      ),
      t.none(
        `INSERT INTO Appears_In (mediaID, actorName, dob) values($1, $2, $3)`,
        [7, "Jason Bateman", new Date(1969, 1, 14)]
      ),

      // Populate Reviews
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["this is a very interesting watch", 5, 1, 3]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        [":^)", 5, 4, 3]
      ),

      // My moment - community rec good
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["the best! music to my ears", 10, 1, 1]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["the worst! I really dislike his voice", 8, 2, 1]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["meh", 5, 3, 1]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        [":^)", 5, 4, 1]
      ),

      // walking dead - community rec to use to change aggregation
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["Pretty good show", 7, 5, 14]
      ),

      // Game of thrones - community rec good
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["Pretty good show", 7, 1, 15]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["it is interesting to say the least....", 8, 4, 15]
      ),

      // Zootopia - community rec good
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["These animals are so cute! Best movie ever!! ^_^", 9, 2, 7]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["AWWWWWWWWWWWW adorable <3", 8, 4, 7]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["Even though they are animals this is really relatable to real life. I love it.", 8, 5, 7]
      ),

      // Batman v Superman - communty rec for lowest avg rating
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["this movie wasn't that good", 3, 1, 10]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $2, $4)`,
        ["Not that great. Would not recommend :(", 2, 2, 10]
      ),

      // My moment - communty rec for lowest avg rating
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["it really isn't william's moment.", 1, 1, 2]
      ),

      // Psych - communuty rec for lowest avg rating
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["Terrible tv show, only someone with no taste would watch this. The only reason I watch is to send random screenshots of places I recognize into group chats.", 2, 1, 4]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["No plot no story no nothing. Horrible.", 1, 2, 4]
      ),
      t.none(`
        INSERT INTO Review_Writes_About
        (comment, rating, userID, mediaID)
        values($1, $2, $3, $4)`,
        ["Just. N O.", 3, 3, 4]
      ),

      // Populate Recommendations
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [1, 1, 2]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [1, 2, 1]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [1, 3, 1]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [1, 3, 4]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [1, 4, 2]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [1, 4, 1]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [3, 1, 2]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [3, 2, 1]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [3, 3, 1]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [4, 1, 2]
      ),

      // Populate Watch List Entries
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [5, 1, 1]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [2, 2, 2]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [3, 2, 2]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [4, 2, 2]
      ),
      t.none(`
        INSERT INTO Recommends_To
        (mediaID, recommenderID, recommendeeID)
        values($1, $2, $3)`,
        [4, 4, 4]
      ),

      // Populate Watched Media
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [1, 1, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [1, 2, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [1, 3, new Date(2016, 3, 28)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [1, 4, new Date(2016, 3, 29)]
      ),

      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [2, 1, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [2, 16, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [2, 8, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [2, 11, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [2, 9, new Date(2016, 3, 27)]
      ),

      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [3, 1, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [3, 16, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [3, 8, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [3, 11, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [3, 2, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [3, 9, new Date(2016, 3, 27)]
      ),

      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [4, 1, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [4, 16, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [4, 8, new Date(2016, 3, 27)]
      ),
      t.none(
        `INSERT INTO Watched (userID, mediaID, timestamp) values($1, $2, $3)`,
        [4, 11, new Date(2016, 3, 27)]
      )
    ]);
  })
  .then(() => {
    console.log("Data populated successfully!");
    pgp.end();
  })
  .catch(err => {
    if (err) {
      console.log(err);
    }
    pgp.end();
  });
});

