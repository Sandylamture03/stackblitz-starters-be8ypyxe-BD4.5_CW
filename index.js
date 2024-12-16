let express = require('express');
let cors = require('cors');
let sqlite3 = require('sqlite3').verbose();
let { open } = require('sqlite');

let app = express();
let PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());

let db;

(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();

// Read all movies released in a year from one actor

async function filterByYearAndActor(year, actor) {
  let query = 'SELECT * FROM movies WHERE release_year = ? AND actor = ? ';
  let response = await db.all(query, [year, actor]);
  return { movies: response };
}

app.get('/movies/year-actor', async (req, res) => {
  let year = req.query.year;
  let actor = req.query.actor;
  try {
    let results = await filterByYearAndActor(year, actor);
    if (results.movies.length === 0) {
      return res
        .status(404)
        .json({ message: 'No movie found i this year for this actor' });
    }
    return res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.messgae });
  }
});

// Award winning movies
/* Get all the movies where rating is greateer than equal to 4.5 
sort the results by rating  */

async function filterAwardWnningMovies() {
  let query = 'SELECT * FROM movies WHERE rating >= 4.5 ORDER BY rating';
  let response = await db.all(query, []);
  return { movies: response };
}

app.get('/movies/award-winning', async (req, res) => {
  try {
    let results = await filterAwardWnningMovies();
    if (results.movies.length === 0) {
      return res.status(404).json({ message: 'no award winning movies found' });
    }
    return res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.messgae });
  }
});

//Blockbuster movies - 100Cr+ club
/*  get all the movies where box_office_collection is greater than equal to 100
 the results should be sorted to show the biggest blockbuster at the top */

async function filterByBlockBuster() {
  let query =
    'SELECT * FROM movies WHERE box_office_collection >= 100 ORDER BY box_office_collection DESC ';
  let response = await db.all(query, []);
  return { movies: response };
}

app.get('/movies/blockbuster', async (req, res) => {
  try {
    let results = await filterByBlockBuster();
    if (results.movies.length === 0) {
      return res.status(404).json({ message: 'nmo block-buster movie found' });
    }
    return res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log('server runniong on port 3000'));
