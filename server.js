const PORT = process.env.PORT || 8080;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const app = express();

const restaurants = [
  {
    name: "burgerking",
    address: "https://fastfoodprecios.mx/burger-king-precos-portugal/",
    base: "",
  },
  {
    name: "mcdonalds",
    address: "https://fastfoodprecios.mx/mcdonalds-portugal-precos/",
    base: "",
  },
  {
    name: "kfc",
    address: "https://fastfoodprecios.mx/kfc-precos-portugal/",
    base: "",
  },
];

const menus = [];

function getMenus() {
  return menus;
}

restaurants.forEach((restaurant) => {
  axios.get(restaurant.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('tr:contains("Menu")', html).each(function () {
      const title = $(this).text();

      const parts = title.split("\n", 4);
      const menuName = parts[1];
      const menuPrice = parts[2];

      menus.push({
        menuName,
        menuPrice,
        source: restaurant.name,
      });
    });
  });
});

app.get("/", (req, res) => {
  //res.json("Welcome to my FastFood Menu's API");
  res.sendFile("public/index.html", { root: __dirname });
});

app.get("/fastfood", (req, res) => {
  res.json(menus);
});

app.get("/fastfood/:restaurantId", (req, res) => {
  const restaurantId = req.params.restaurantId;

  const restaurantAddress = restaurants.filter(
    (restaurant) => restaurant.name == restaurantId
  )[0].address;

  axios
    .get(restaurantAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificmenus = [];

      $('tr:contains("Menu")', html).each(function () {
        const title = $(this).text();

        const parts = title.split("\n", 4);
        const menuName = parts[1];
        const menuPrice = parts[2];

        specificmenus.push({
          menuName,
          menuPrice,
          source: restaurantId,
        });
      });
      res.json(specificmenus);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));
