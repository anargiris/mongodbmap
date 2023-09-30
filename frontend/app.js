document.addEventListener("DOMContentLoaded", function () {
  // Initialize the map
  const map = L.map("map").setView([0, 0], 2); // Setting a default position and zoom level BOILERPLATE

  // Add a tile layer (background) BOILERPLATE
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

  // Fetching tweet data from the backend
  fetch("api/tweets")
    .then((response) => response.json())
    .then((tweets) => {
      tweets.forEach((tweet) => {
        if (tweet.estimated_locations && tweet.estimated_locations.length > 0) {
          const location = tweet.estimated_locations[0];
          const geometry = location.geometry;

          // Ensure the geometry is of type "Point" and has coordinates
          if (geometry && geometry.type === "Point" && geometry.coordinates) {
            const [longitude, latitude] = geometry.coordinates;

            const popupContent = `
            <h4>${tweet.text}</h4>
            ${
              tweet.image_url
                ? `<img class="info-image" src="${tweet.image_url}" alt="Tweet Image"/>`
                : ""
            }
            <div class="info-item"><strong>Date:</strong> ${
              tweet.created_at
            }</div>
            <div class="info-item"><strong>Reliability:</strong> ${
              tweet.reliability
            }</div>
            <div class="info-item"><strong>Relevance Estimation:</strong> ${
              tweet.relevance_estimation
            }</div>
            <div class="info-item"><strong>Location in Text:</strong> ${
              location.location_in_text
            }</div>
            <div class="info-item"><strong>Full Location:</strong> ${
              location.location_fullname
            }</div>
        `;

            // Add a marker to the map for each tweet BOILERPLATE
            L.marker([latitude, longitude]).addTo(map).bindPopup(popupContent);
          }
        }
      });
    })
    .catch((err) => console.error("Error fetching tweets:", err));
});
