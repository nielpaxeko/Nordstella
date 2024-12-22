import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-easyprint';
import '../styles/globetrotter.css';

const WanderLog = () => {
    // State variables to match original global variables
    const [visitedCountries, setVisitedCountries] = useState([]);
    const [wantToVisitCountries, setWantToVisitCountries] = useState([]);
    const [visitedCities, setVisitedCities] = useState([]);
    const [wantToVisitCities, setWantToVisitCities] = useState([]);
    const [validCities, setValidCities] = useState([]);
    const [cityData, setCityData] = useState([]);
    const [activeTab, setActiveTab] = useState('countries');

    // Refs for map and layers
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const countryLayerRef = useRef(null);
    const cityMarkersRef = useRef(null);

    // Icons (recreating the original icons)
    const visitedIcon = L.icon({
        iconUrl: '../assets/globetrotter/visited-pin.svg',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });

    const wantedIcon = L.icon({
        iconUrl: '../assets/globetrotter/wanted-pin.svg',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });

    const currentIcon = L.icon({
        iconUrl: '../assets/globetrotter/current-pin.svg',
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30],
    });

    // Initialization effect
    useEffect(() => {
        // Initialize map
        mapInstanceRef.current = L.map('map').setView([20, 0], 2);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 15
        }).addTo(mapInstanceRef.current);

        // Easy Print Control
        L.easyPrint({
            title: 'Print Map',
            sizeModes: ['A4Landscape', 'A4Portrait'],
            filename: 'My-Map',
            exportOnly: true,
            hideControlContainer: true,
        }).addTo(mapInstanceRef.current);

        // Initialize layer groups
        cityMarkersRef.current = new L.LayerGroup().addTo(mapInstanceRef.current);

        // Fetch initial data
        fetchData();

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
            }
        };
    }, []);

    const fetchData = async () => {
        try {
            // Fetch cities
            const citiesResponse = await fetch('/api/wanderlogs/cities');
            const cities = await citiesResponse.json();
            setValidCities(cities);
            populateCityAutocomplete(cities);

            // Fetch city data
            const cityDataResponse = await fetch('/api/wanderlogs/city-data');
            const cityDataJson = await cityDataResponse.json();
            setCityData(cityDataJson);

            // Fetch countries GeoJSON
            const countriesResponse = await fetch('/api/wanderlogs/countries');
            const countriesData = await countriesResponse.json();

            // Add your country layer setup here
            countryLayerRef.current = L.geoJSON(countriesData, {
                style: function (feature) {
                    return {
                        color: '#3388ff',
                        fillOpacity: 0.2
                    };
                },
                onEachFeature: function (feature, layer) {
                    layer.on('click', (event) => handleCountryClick(feature.properties.ADMIN, event));
                }
            }).addTo(mapInstanceRef.current);

        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    // Duplicate existing functions from original implementation
    const handleCountryClick = (countryName, event) => {
        const clickLocation = event.latlng;
        if (visitedCountries.includes(countryName)) {
            if (window.confirm(`Remove ${countryName} from the visited list?`)) {
                setVisitedCountries(prev => prev.filter(c => c !== countryName));
                updateCountry(countryName);
            }
        } else if (wantToVisitCountries.includes(countryName)) {
            if (window.confirm(`Remove ${countryName} from the want to visit list?`)) {
                setWantToVisitCountries(prev => prev.filter(c => c !== countryName));
                updateCountry(countryName);
            }
        } else {
            // Popup for adding country
            const popupContent = `
                <div style="text-align: center;">
                    <strong style="display: block; margin-bottom: 10px;">${countryName}</strong>
                    <div style="display: flex; justify-content: center; gap: 5px;">
                        <button onclick="window.addCountryToList('${countryName}', 'visited'); window.closePopup()"
                            style="background-color: #ff9500; color: white; height: 40px; border: none; padding: 5px; margin-top: 5px; cursor: pointer;">
                            Add to Visited
                        </button>
                        <button onclick="window.addCountryToList('${countryName}', 'want_to_visit'); window.closePopup()"
                            style="background-color: #5A00FF; color: white; height: 40px; border: none; padding: 5px; margin-top: 5px; cursor: pointer;">
                            Add to Wanted
                        </button>
                    </div>
                </div>
            `;
            L.popup()
                .setLatLng(clickLocation)
                .setContent(popupContent)
                .openOn(mapInstanceRef.current);
        }
        updateMap();
    };

    const updateCountry = (countryName) => {
        countryLayerRef.current.eachLayer((layer) => {
            const currentCountryName = layer.feature.properties.ADMIN;
            if (currentCountryName === countryName) {
                layer.setStyle({
                    color: '#3388ff',
                    fillOpacity: 0.2
                });
            }
        });
    };

    const addCountry = (status) => {
        const countryName = document.getElementById('countrySearch').value;
        if (!countryName) {
            return alert('Please enter a country name');
        } else {
            zoomToCountry(countryName);
            addCountryToList(countryName, status);
            updateMap();
        }
    };

    const addCountryToList = (countryName, status) => {
        setVisitedCountries(prev => prev.filter(c => c !== countryName));
        setWantToVisitCountries(prev => prev.filter(c => c !== countryName));

        if (status === 'visited') {
            setVisitedCountries(prev => [...prev, countryName]);
            updateVisitedCounts();
        } else if (status === 'want_to_visit') {
            setWantToVisitCountries(prev => [...prev, countryName]);
        }
    };

    const zoomToCountry = (countryName) => {
        countryLayerRef.current.eachLayer((layer) => {
            if (layer.feature.properties.ADMIN === countryName) {
                mapInstanceRef.current.flyToBounds(layer.getBounds(), { duration: 1 });
            }
        });
    };

    // City logic
    const addCity = (status) => {
        const cityName = document.getElementById('citySearch').value;
        if (!cityName) {
            return alert('Please enter a city name');
        } else if (!validCities.includes(cityName)) {
            return alert(cityName + " was not found.");
        } else {
            addCityToList(cityName, status);
            updateMap();
        }
    };

    const addCityToList = (cityName, status) => {
        setVisitedCities(prev => prev.filter(c => c !== cityName));
        setWantToVisitCities(prev => prev.filter(c => c !== cityName));

        if (status === 'visited') {
            setVisitedCities(prev => [...prev, cityName]);
            zoomToCity(cityName);
            addCityMarker(cityName, visitedIcon);
            updateVisitedCounts();
        } else if (status === 'want_to_visit') {
            setWantToVisitCities(prev => [...prev, cityName]);
            zoomToCity(cityName);
            addCityMarker(cityName, wantedIcon);
        }
    };

    const getCityCoordinates = (cityName) => {
        const cityInfo = cityData.find(city => city.city === cityName);
        return cityInfo ? [parseFloat(cityInfo.lat), parseFloat(cityInfo.lng)] : null;
    };

    const zoomToCity = (cityName) => {
        const coordinates = getCityCoordinates(cityName);
        if (coordinates) {
            mapInstanceRef.current.flyTo(coordinates, 5, { duration: 0.5 });
        }
    };

    const addCityMarker = (cityName, icon) => {
        const coordinates = getCityCoordinates(cityName);
        if (!coordinates) {
            console.error(`City "${cityName}" not found or invalid coordinates.`);
            return;
        }
        const marker = L.marker(coordinates, { icon: icon }).addTo(cityMarkersRef.current);
        marker.on('click', function () {
            const popupContent = `
                <div style="text-align: center;">
                    <strong>${cityName}</strong><br>
                    <button onclick="window.removeCity('${cityName}'); window.closePopup();"
                        style="background-color: red; color: white; border: none; padding: 5px 10px; margin-top: 5px; cursor: pointer;">
                        Remove City
                    </button>
                </div>
            `;
            marker.bindPopup(popupContent).openPopup();
        });
    };



    const populateAutocomplete = (countries) => {
        const dataList = document.getElementById('countryList');
        dataList.innerHTML = '';
        const uniqueCountries = [...new Set(countries)];

        uniqueCountries.forEach(country => {
            const option = document.createElement('option');
            option.value = country;
            dataList.appendChild(option);
        });
    };

    const updateMap = () => {
        fetch('/api/wanderlogs/add-country', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visited: visitedCountries, want_to_visit: wantToVisitCountries })
        })
            .then(response => response.json())
            .then(data => {
                setVisitedCountries(data.visited);
                setWantToVisitCountries(data.want_to_visit);

                // Update country colors
                countryLayerRef.eachLayer(function (layer) {
                    var countryName = layer.feature.properties.ADMIN;
                    if (visitedCountries.includes(countryName)) {
                        layer.setStyle({ color: '#ff9500', fillOpacity: 0.5 });
                    } else if (wantToVisitCountries.includes(countryName)) {
                        layer.setStyle({ color: '#5A00FF', fillOpacity: 0.5 });
                    }
                });

                // Clear and re-add city markers
                cityMarkersRef.clearLayers();
                visitedCities.forEach(city => addCityMarker(city, visitedIcon));
                wantToVisitCities.forEach(city => addCityMarker(city, wantedIcon));
                updateVisitedCounts();
            })
            .catch(err => console.error('Error:', err));

        fetch('/api/wanderlogs/add-city', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ visited: visitedCities, want_to_visit: wantToVisitCities })
        })
            .then(response => response.json())
            .then(data => {
                // Existing logic
            });
    };

    const updateVisitedCounts = () => {
        window.updateVisitedCounts = () => {
            const countryCount = visitedCountries.length;
            document.getElementById('countryCount').textContent = countryCount;
            document.getElementById('countriesVisited').style.display = countryCount > 0 ? 'block' : 'none';

            const cityCount = visitedCities.length;
            document.getElementById('cityCount').textContent = cityCount;
            document.getElementById('citiesVisited').style.display = cityCount > 0 ? 'block' : 'none';
        };
    };

    const locateUser = () => {
        const permission = window.confirm("Would you like to share your location?");
        if (permission && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const userLocation = [latitude, longitude];
                    mapInstanceRef.current.setView(userLocation, 5);

                    // Add user marker logic
                },
                (error) => console.error("Geolocation error:", error)
            );
        }
    };

    const toggleTab = (tab) => {
        setActiveTab(tab);
    };

    const populateCityAutocomplete = (cities) => {
        const dataList = document.getElementById('cityList');
        dataList.innerHTML = '';
        const uniqueCities = [...new Set(cities)];

        uniqueCities.forEach(city => {
            const option = document.createElement('option');
            option.value = city;
            dataList.appendChild(option);
        });
    };

    useEffect(() => {
        window.addCountryToList = addCountryToList;
        window.closePopup = () => mapInstanceRef.current.closePopup();
        window.removeCity = (cityName) => {
            setVisitedCities(prev => prev.filter(c => c !== cityName));
            setWantToVisitCities(prev => prev.filter(c => c !== cityName));
            cityMarkersRef.current.clearLayers();
            updateVisitedCounts();
            updateMap();
        };
        updateVisitedCounts();
    }, []);

    return (
        <section className='wanderlog-section'>
            <div>
                <div
                    id="countriesTab"
                    className={`tab ${activeTab === 'countries' ? 'active' : ''}`}
                    onClick={() => toggleTab('countries')}
                >
                    Countries
                </div>
                <div
                    id="citiesTab"
                    className={`tab ${activeTab === 'cities' ? 'active' : ''}`}
                    onClick={() => toggleTab('cities')}
                >
                    Cities
                </div>
            </div>
            <div id="map" style={{ height: '600px' }}></div>
            <div id="trotter-controls">
                <div
                    id="countrySearchSection"
                    style={{ display: activeTab === 'countries' ? 'block' : 'none' }}
                >
                    <input
                        list="countryList"
                        type="text"
                        id="countrySearch"
                        placeholder="Search for a country"
                    />
                    <button
                        className="visited-btn"
                        onClick={() => addCountry("visited")}
                        style={{ marginTop: '10px' }}
                    >
                        Add to Visited
                    </button>
                    <button
                        className="wanted-btn"
                        onClick={() => addCountry("want_to_visit")}
                        style={{ marginTop: '10px' }}
                    >
                        Add to Wanted
                    </button>
                    <datalist id="countryList"></datalist>
                    <button
                        className="locateUserButton otherBtn"
                        onClick={locateUser}
                        style={{ marginTop: '10px' }}
                    >
                        Locate Me
                    </button>
                </div>
                <div
                    id="citySearchSection"
                    style={{ display: activeTab === 'cities' ? 'block' : 'none' }}
                >
                    <input
                        list="cityList"
                        type="text"
                        id="citySearch"
                        placeholder="Search for a city"
                    />
                    <button
                        className="visited-btn"
                        onClick={() => addCity('visited')}
                        style={{ marginTop: '10px' }}
                    >
                        Add to Visited
                    </button>
                    <button
                        className="wanted-btn"
                        onClick={() => addCity('want_to_visit')}
                        style={{ marginTop: '10px' }}
                    >
                        Add to Wanted
                    </button>
                    <datalist id="cityList"></datalist>
                    <button
                        className="locateUserButton otherBtn"
                        onClick={locateUser}
                        style={{ marginTop: '10px' }}
                    >
                        Locate Me
                    </button>
                </div>
            </div>
            <div className="controls">
                <label id="showRoutesLabel">
                    <input
                        type="checkbox"
                        id="toggleRailwayLayer"
                        style={{ marginTop: '10px' }}
                    />
                    Show Railway Routes
                </label>
            </div>
            <div id="visitedCounts" style={{ marginTop: '10px' }}>
                <div
                    id="countriesVisited"
                    style={{ display: visitedCountries.length > 0 ? 'block' : 'none' }}
                >
                    Countries visited: <span id="countryCount">{visitedCountries.length}</span>
                </div>
                <div
                    id="citiesVisited"
                    style={{ display: visitedCities.length > 0 ? 'block' : 'none' }}
                >
                    Cities visited: <span id="cityCount">{visitedCities.length}</span>
                </div>
            </div>
        </section>
    );
};

export default WanderLog;