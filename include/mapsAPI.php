
    <script src="https://polyfill.io/v3/polyfill.min.js?features=default"></script>
    <style>/* Always set the map height explicitly to define the size of the div
       * element that contains the map. */
#map {
  height: 100%;
}

/* Optional: Makes the sample page fill the window. */
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}

input[type="text"] {
  background-color: #fff;
  border: 0;
  border-radius: 2px;
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
  margin: 10px;
  padding: 0 0.5em;
  font: 400 18px Roboto, Arial, sans-serif;
  overflow: hidden;
  line-height: 40px;
  margin-right: 0;
  min-width: 25%;
}

input[type="button"] {
  background-color: #fff;
  border: 0;
  border-radius: 2px;
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
  margin: 10px;
  padding: 0 0.5em;
  font: 400 18px Roboto, Arial, sans-serif;
  overflow: hidden;
  height: 40px;
  cursor: pointer;
  margin-left: 5px;
}
input[type="button"]:hover {
  background: #ebebeb;
}
input[type="button"].button-primary {
  background-color: #1a73e8;
  color: white;
}
input[type="button"].button-primary:hover {
  background-color: #1765cc;
}
input[type="button"].button-secondary {
  background-color: white;
  color: #1a73e8;
}
input[type="button"].button-secondary:hover {
  background-color: #d2e3fc;
}

#response-container {
  background-color: #fff;
  border: 0;
  border-radius: 2px;
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
  margin: 10px;
  padding: 0 0.5em;
  font: 400 18px Roboto, Arial, sans-serif;
  overflow: hidden;
  overflow: auto;
  max-height: 50%;
  max-width: 90%;
  background-color: rgba(255, 255, 255, 0.95);
  font-size: small;
}

#instructions {
  background-color: #fff;
  border: 0;
  border-radius: 2px;
  box-shadow: 0 1px 4px -1px rgba(0, 0, 0, 0.3);
  margin: 10px;
  padding: 0 0.5em;
  font: 400 18px Roboto, Arial, sans-serif;
  overflow: hidden;
  padding: 1rem;
  font-size: medium;
}</style>
<script type="text/javascript" src="https://code.jquery.com/jquery-1.8.2.min.js"></script>

    <script >
        let map;
let marker;
let geocoder;
let responseDiv;
let response;
<? if(isset($_GET['zoomlevel'])){$zooml=$_GET['zoomlevel'];} else {$zooml=15;}?>
function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    zoom: <?=$zooml?>,
    center: { lat: 28.425808, lng: 77.090734 },
    mapTypeControl: false,
  });
  geocoder = new google.maps.Geocoder();
marker = new google.maps.Marker({
    map,
  });
  map.addListener("click", (e) => {
    geocode({ location: e.latLng });
  });

  window.addEventListener('load', (event) => 
  
    geocode({ address: '<?=$_GET['mapaddress']?>' })
  );
  

}



function geocode(request) {

  geocoder
    .geocode(request)
    .then((result) => {
      const { results } = result;
      var pickedLocation =results[0].geometry.location;

      map.setCenter(results[0].geometry.location);
      marker.setPosition(results[0].geometry.location);
      marker.setMap(map);
      
      return results;
    })
    .catch((e) => {
      alert("Geocode was not successful for the following reason: " + e);
    });
}


    </script>

  </head>
  <body>
    <div id="map"></div>

    <!-- Async script executes immediately and must be after any DOM elements used in callback. -->
    <?php
      /* The key used to be hard-coded here, in a public repository. A Maps
         browser key is necessarily visible to anyone who loads the page, so
         the protection that matters is an HTTP-referrer restriction in the
         Google Cloud console, not secrecy — but a key committed to git is
         also usable from anywhere until that restriction exists.

         Reads GOOGLE_MAPS_API_KEY from the environment. The previously
         committed key must be treated as compromised and rotated. */
      $maps_key = getenv('GOOGLE_MAPS_API_KEY') ?: '';
    ?>
    <?php if ($maps_key !== '') { ?>
    <script
      src="https://maps.googleapis.com/maps/api/js?key=<?= urlencode($maps_key) ?>&callback=initMap&v=weekly&channel=2"
      async
    ></script>
    <?php } else { ?>
    <!-- GOOGLE_MAPS_API_KEY is not set; the map is not rendered. -->
    <?php } ?>
  