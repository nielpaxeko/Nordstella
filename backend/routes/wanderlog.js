import express from "express";
import fs from "fs";
import path from 'path';
import { fileURLToPath } from 'url';
import csvParser from "csv-parser";

const router = express.Router();

// Store the countries and cities status
let visitedCountries = [];
let wantToVisitCountries = [];
let visitedCities = [];
let wantToVisitCities = [];

// Define paths to the CSV and GeoJSON files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const countryPath = path.join(__dirname, "./geodata/countries.geojson");
const cityPath = path.join(__dirname, "./geodata/worldcities.csv");

// Load city data from CSV (static/js/worldcities.csv)
let cityData = [];
let validCities = [];

// Ensure that we load city data before starting the server
const loadCityData = new Promise((resolve, reject) => {
  fs.createReadStream(cityPath)
    .pipe(csvParser())
    .on("data", (row) => {
      cityData.push(row);
    })
    .on("end", () => {
      console.log("City data loaded successfully.");
      validCities = cityData.map((row) => row.city);
      resolve();
    })
    .on("error", (err) => {
      console.error("Error loading city data:", err);
      reject(err);
    });
});

// Load country data (GeoJSON)
let countryData = {};
let validCountries = [];

// Ensure that we load country data before starting the server
const loadCountryData = new Promise((resolve, reject) => {
  fs.readFile(countryPath, "utf-8", (err, data) => {
    if (err) {
      console.error("Error loading GeoJSON file:", err);
      reject(err);
    }
    try {
      countryData = JSON.parse(data);
      validCountries = countryData.features.map((feature) => feature.properties.ADMIN);
      console.log("Country data loaded successfully.");
      resolve();
    } catch (parseError) {
      console.error("Error parsing GeoJSON file:", parseError);
      reject(parseError);
    }
  });
});

// Ensure both data are loaded before handling routes
Promise.all([loadCityData, loadCountryData]).then(() => {
  console.log("Both city and country data are ready.");
}).catch(err => {
  console.error("Failed to load data:", err);
});

// Routes
router.get("/city-data", (req, res) => {
  const filteredData = cityData.map((row) => ({
    city: row.city,
    lat: row.lat,
    lng: row.lng,
  }));
  res.json(filteredData);
});

router.get("/countries", (req, res) => {
  res.json(validCountries);
});

router.get("/cities", (req, res) => {
  res.json(validCities);
});

router.post("/add-country", (req, res) => {
  const data = req.body;
  const visited = data.visited || [];
  const wantToVisit = data.want_to_visit || [];

  // Validate countries
  visitedCountries = visited.filter((country) => validCountries.includes(country));
  wantToVisitCountries = wantToVisit.filter((country) => validCountries.includes(country));

  res.json({
    visited: visitedCountries,
    want_to_visit: wantToVisitCountries,
  });
});

router.post("/add-city", (req, res) => {
  const data = req.body;
  const visited = data.visited || [];
  const wantToVisit = data.want_to_visit || [];

  // Validate cities
  visitedCities = visited.filter((city) => validCities.includes(city));
  wantToVisitCities = wantToVisit.filter((city) => validCities.includes(city));

  res.json({
    visited: visitedCities,
    want_to_visit: wantToVisitCities,
  });
});

export default router;
