const express = require('express');
const { resolve } = require('path');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const app = express();
const port = 3010;
let db;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database,
  });
})();
app.use(express.static('static'));

app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});
const fetchRestaurants = async () => {
  const sql = 'SELECT * from restaurants';

  return db.all(sql);
};
app.get('/restaurants', async (req, res) => {
  try {
    const restaurants = await fetchRestaurants();
    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found.' });
    }
    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantById(id) {
  const sql = 'SELECT * FROM restaurants WHERE id = ?';
  return db.get(sql, [id]);
}

app.get('/restaurants/details/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const restaurant = await fetchRestaurantById(id);

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    res.status(200).json({ restaurant });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsByCuisine(cuisine) {
  const sql = 'SELECT * FROM restaurants WHERE cuisine = ?';
  return db.all(sql, [cuisine]);
}

app.get('/restaurants/cuisine/:cuisine', async (req, res) => {
  const { cuisine } = req.params;

  try {
    const restaurants = await fetchRestaurantsByCuisine(cuisine);

    if (restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: 'No restaurants found for this cuisine.' });
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsByFilters(filters) {
  const { isVeg, hasOutdoorSeating, isLuxury } = filters;

  //any of query missing its give error
  // let sql =
  //   'SELECT * FROM restaurants WHERE isVeg = ? AND hasOutdoorSeating = ? AND isLuxury = ? ';
  // const params = [isVeg, hasOutdoorSeating, isLuxury];

  // Build the SQL query dynamically based on provided filters
  let sql = 'SELECT * FROM restaurants WHERE 1=1';
  const params = [];

  if (isVeg !== undefined) {
    sql += ' AND isVeg = ?';
    params.push(isVeg); // Assuming 1 for true and 0 for false
  }

  if (hasOutdoorSeating !== undefined) {
    sql += ' AND hasOutdoorSeating = ?';
    params.push(hasOutdoorSeating);
  }

  if (isLuxury !== undefined) {
    sql += ' AND isLuxury = ?';
    params.push(isLuxury);
  }

  return db.all(sql, params);
}

app.get('/restaurants/filter', async (req, res) => {
  const filters = {
    isVeg: req.query.isVeg,
    hasOutdoorSeating: req.query.hasOutdoorSeating,
    isLuxury: req.query.isLuxury,
  };

  try {
    const restaurants = await fetchRestaurantsByFilters(filters);

    if (restaurants.length === 0) {
      return res
        .status(404)
        .json({ message: 'No restaurants found with the specified filters.' });
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchRestaurantsSortedByRating() {
  const sql = 'SELECT * FROM restaurants ORDER BY rating DESC';
  return db.all(sql);
}

app.get('/restaurants/sort-by-rating', async (req, res) => {
  try {
    const restaurants = await fetchRestaurantsSortedByRating();

    if (restaurants.length === 0) {
      return res.status(404).json({ message: 'No restaurants found.' });
    }

    res.status(200).json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchAllDishes() {
  const sql = 'SELECT * FROM dishes';
  return db.all(sql);
}

app.get('/dishes', async (req, res) => {
  try {
    const dishes = await fetchAllDishes();

    if (dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found.' });
    }

    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchDishById(id) {
  const sql = 'SELECT * FROM dishes WHERE id = ?';
  return db.get(sql, [id]);
}

app.get('/dishes/details/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const dish = await fetchDishById(id);

    if (!dish) {
      return res.status(404).json({ message: 'Dish not found.' });
    }

    res.status(200).json({ dish });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

async function fetchDishesByFilter(isVeg) {
  const sql = 'SELECT * FROM dishes WHERE isVeg = ?';
  return db.all(sql, [isVeg]); 


app.get('/dishes/filter', async (req, res) => {
  const { isVeg } = req.query;


  const filterVeg = isVeg === 'true'; 

  try {
    const dishes = await fetchDishesByFilter(filterVeg);

    if (dishes.length === 0) {
      return res
        .status(404)
        .json({ message: 'No dishes found for this filter.' });
    }

    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


async function fetchDishesSortedByPrice() {
  const sql = 'SELECT * FROM dishes ORDER BY price ASC';
  return db.all(sql);
}


app.get('/dishes/sort-by-price', async (_req, res) => {
  try {
    const dishes = await fetchDishesSortedByPrice();

    if (dishes.length === 0) {
      return res.status(404).json({ message: 'No dishes found.' });
    }

    res.status(200).json({ dishes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
