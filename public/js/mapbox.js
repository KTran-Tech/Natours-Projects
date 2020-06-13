/* eslint-disable */

const locations = JSON.parse(document.getElementById('map').dataset.locations);
mapboxgl.accessToken =
  'pk.eyJ1Ijoia2V2aXRyYW4iLCJhIjoiY2tiZHc1aTExMGZ0azJ5bnRiNGN5bDVqdSJ9.wiHSvcVVAxG0tcX9BlQYPw';

const map = new mapboxgl.Map({
  container: 'map',
  style:
    'mapbox://styles/kevitran/ckbdwxsn127tg1jlz07ywtvtv',
  scrollZoom: false,
  //   center: [-118.113491, 34.111745],
  //   interactive: false,
});

const bounds = new mapboxgl.LngLatBounds();

locations.forEach((loc) => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom',
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add popup
  new mapboxgl.Popup({
    offset: 30,
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map);

  // Extend map bounds to include current location
  bounds.extend(loc.coordinates);
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100,
  },
});