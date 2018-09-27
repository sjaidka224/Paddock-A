// Function called from HTML file as a callback after defining the maps
function mapLocation() {

  window.currentLocation;
  window.poly;
  window.marker;
  window.directionsDisplay;
  window.directionsService = new google.maps.DirectionsService();
  window.map;
  window.routesArray =[];
  window.differentItemsArray = [];
  window.trackByWalking = false;
  window.markersArray = [];

  // ** TRACK BY WALKING

  if (trackByWalking) {
    //setInterval(function(){
    //showPosition();
    //},10000);
  }

  google.maps.event.addDomListener(window, 'load', getLocationAndInitialize);
}


// Check for current location and initialize Google Maps
function getLocationAndInitialize() {

  if (navigator.geolocation) {

    if (trackByWalking) {
      // ** TRACK BY WALKING
      navigator.geolocation.watchPosition(showPosition);
    } else {
      navigator.geolocation.getCurrentPosition(showPosition, showError);
    }

  } else {
    console.log ("Geolocation is not supported by this browser.");
  }
}

// Show curretn position on the maps
function showPosition(position) {

  console.log ("Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude);
  currentLocation = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

  directionsDisplay = new google.maps.DirectionsRenderer();
  //currentLocation = new google.maps.LatLng(-37.846355, 145.114370);
  var mapOptions = {
    zoom: 14,
    center: currentLocation
  };
  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
  document.getElementById('default-text-maps').style.display='none';

  // ** TRACK BY WALKING
  if (trackByWalking) {
    poly = new google.maps.Polyline({
      map: map,
      path: []
    });


    var path = poly.getPath();
    if(position && position.coords ){
      path.push(new google.maps.LatLng(position.coords.latitude,  position.coords.longitude));
    }
    // update the polyline with the updated path
    poly.setPath(path);
  }
  // ** TRACK BY WALKING -- ENDS

  directionsDisplay.setMap(map);
  google.maps.event.addDomListener(document.getElementById('start_tracking'), 'click', startTracking);
  google.maps.event.addDomListener(document.getElementById('check_tracking'), 'click', checkTracking);
  google.maps.event.addDomListener(document.getElementById('cancel_tracking'), 'click', cancelTracking);
  //google.maps.event.addDomListener(document.getElementById('mark_items'), 'click', markDifferentItemsOnMap(false));
  google.maps.event.addDomListener(document.getElementById('add_name_to_paddock'), 'click', addNameToPaddock);

  removeClickListenersFromMap ("click");

}

function startTracking() {

  document.getElementById('check_tracking').style.display='block';
  document.getElementById('cancel_tracking').style.display='block';
  document.getElementById('add_name_to_paddock').style.display='none';
  document.getElementById('start_tracking').style.display='none';
  removePolylinesAndMarkers ();

  markDifferentItemsOnMap (true);

}

function checkTracking() {

  if (routesArray.length == 0 || routesArray.length == 1) {
    return alert('No results found for this route');
  } else  {

    routesArray.push(routesArray[0]);
    calculateDistance ();
  }
  removeClickListenersFromMap ("click");
  document.getElementById('check_tracking').style.display='none';
  document.getElementById('start_tracking').style.display='none';
  document.getElementById('cancel_tracking').style.display='block';
  document.getElementById('add_name_to_paddock').style.display='block';

  var i;
  var request = {
    travelMode: google.maps.TravelMode.WALKING
  };
  for (i = 0; i < routesArray.length; i++) {
    marker = new google.maps.Marker({
      position: new google.maps.LatLng(routesArray[i][0], routesArray[i][1]),
    });

    if (i == 0) request.origin = marker.getPosition();
    else if (i == routesArray.length - 1) request.destination = marker.getPosition();
    else {
      if (!request.waypoints) request.waypoints = [];
      request.waypoints.push({
        location: marker.getPosition(),
        stopover: true
      });
    }
  }

  directionsService.route(request, function(result, status) {
    if (status == google.maps.DirectionsStatus.OK) {
      directionsDisplay.setMap (map);
      directionsDisplay.setOptions( { suppressMarkers: true } );
      directionsDisplay.setDirections(result);
    } else{
      alert('No results found for this route');
    }
  });
}

function cancelTracking () {

  document.getElementById('check_tracking').style.display='none';
  document.getElementById('start_tracking').style.display='block';
  document.getElementById('cancel_tracking').style.display='none';
  document.getElementById('add_name_to_paddock').style.display='none';
  document.getElementById('boundary-unit').style.display = 'none';

  removePolylinesAndMarkers ();
  removeClickListenersFromMap ();
  routesArray = [];
  marker.setMap(null);

}

function addNameToPaddock () {

  var savedArea = {
    coordinates: routesArray
  };

  console.log ("Saved Area : ");
  console.log (savedArea);

  $('#modalLoginForm').modal('show');

}


function calculateDistance () {

  var bounds = new google.maps.LatLngBounds;

  var distanceTotal = 0.0;

  for (var i = 0; i < routesArray.length - 1; i++) {
    var from = {lat: routesArray[i][0], lng: routesArray[i][1]};
    var dest = {lat: routesArray[i+1][0], lng: routesArray[i+1][1]};

    var service = new google.maps.DistanceMatrixService();

    var metricSystem = distanceMeasurement;
    if (distanceMeasurement > 1) {
      metricSystem = 0;
    }

    service.getDistanceMatrix(
      {
        origins: [from],
        destinations: [dest],
        travelMode: 'WALKING',
        unitSystem: metricSystem,
        avoidHighways: true,
        avoidTolls: true
      }, callback);

      function callback(response, status) {
        if (status == 'OK') {
          var origins = response.originAddresses;
          var destinations = response.destinationAddresses;

          for (var i = 0; i < origins.length; i++) {
            var results = response.rows[i].elements;

            for (var j = 0; j < results.length; j++) {
              var element = results[j];
              var distance = element.distance.text;
              var duration = element.duration.text;

              var units = distance.replace(/[0-9^!?. ]/g,'');

              distance = parseFloat(distance);

              distanceTotal = distance + distanceTotal;
              console.log ("distanceTotal: " + distanceTotal.toFixed(2) + " " + units);

              if (distanceMeasurement > 1) {

                var newDistanceToBeShown = changeUnits (distanceTotal);
                //distanceTotal = 0.0;
                document.getElementById('boundary-unit').style.display = 'block';
                document.getElementById('boundary-unit').innerHTML = newDistanceToBeShown;
                console.log ("newDistanceToBeShown HERE is: " + newDistanceToBeShown);
                changeFontSize ();
              } else {
                document.getElementById('boundary-unit').style.display = 'block';
                document.getElementById('boundary-unit').innerHTML = distanceTotal.toFixed(2) + " " + units;
                changeFontSize ();
              }

              areaOfPolygon (distanceTotal.toFixed(2), routesArray.length, distance);

            }
          }
        }
      }
    }
  }

  function showError(error) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
      console.log ("User denied the request for Geolocation.");
      break;
      case error.POSITION_UNAVAILABLE:
      console.log ("Location information is unavailable.");
      break;
      case error.TIMEOUT:
      console.log ("The request to get user location timed out.");
      break;
      case error.UNKNOWN_ERROR:
      console.log ("An unknown error occurred.");
      break;
    }
  }


  function addMarkerBasedOnSelection(properties) {
    $("#wrapper").toggleClass("toggled");
    switch (properties) {
      case "track-by-tapping":
      trackByWalking = false;
      break;

      case "track-by-walking":
      trackByWalking = false; //Should be true here
      break;

      case "mark-stock-shelters":
      markDifferentItemsOnMap (false, "");
      break;

      case "mark-stock-feeders":
      markDifferentItemsOnMap (false, "");
      break;

      case "mark-sheds":
      markDifferentItemsOnMap (false, "");
      break;

      case "mark-water-troughs":
      markDifferentItemsOnMap (false, "");
      break;

      case "mark-bores":
      markDifferentItemsOnMap (false, "");
      break;

      case "mark-pumps":
      markDifferentItemsOnMap (false, "");
      break;

      case "mark-hazards":
      markDifferentItemsOnMap (false, "");
      break;
      default:

    }

  }

  function savePaddockArea () {

    var nameOfPaddock = $("#defaultForm-text").val();
    console.log ("VALUE: " + nameOfPaddock);

    $('#modalLoginForm').modal('hide');

    document.getElementById('check_tracking').style.display='none';
    document.getElementById('start_tracking').style.display='block';
    document.getElementById('cancel_tracking').style.display='none';
    document.getElementById('add_name_to_paddock').style.display='none';
    document.getElementById('boundary-unit').style.display = 'none';
    //SAVE PADDOCK HERE AND CLEAR THE MAP

    var dataParam = {};

    var savedArea = {
      coordinates: [-37.83653206484877,145.11738254470515]
    };

    console.log ("asdsadasdasdasdasd");
    console.log (savedArea.coordinates);
    console.log ("routesArray " + routesArray);
    $.get('https://paddockback.au-syd.mybluemix.net/api/paddock/insert?name=' + nameOfPaddock + '&coordinates=' + savedArea.coordinates,dataParam,function(result){
      console.log ("backendInteraction + uploadDataToDb ", result);
      //alert ("We will contact you shortly on " + dataParam + ".");
    })


    routesArray = [];

  }

  function changeUnits (distance) {

    if (distanceMeasurement == distanceMeasurementTypes.FEET) {

      var newDistance = distance * 3280.84;
      return newDistance.toFixed(2) + " ft";
    }

  }

  function markDifferentItemsOnMap (isTracking, iconPath) {

    google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });

    function placeMarker(location) {
      if (iconPath == "" || iconPath == "  ") {
        marker = new google.maps.Marker({
          position: location,
          map: map,
          draggable: !isTracking,
          title: "Title",
          label: "Label"
        });
      } else {
        marker = new google.maps.Marker({
          position: location,
          map: map,
          draggable: !isTracking,
          title: "Title",
          label: "Label",
          icon: iconPath
        });
      }


      if (isTracking) {
        markersArray.push (marker);
        routesArray.push([location.lat(),location.lng()]);
        console.log(routesArray);

      }
    }

  }

  function removeClickListenersFromMap (listenerToBeCleared) {

    google.maps.event.clearListeners(map, listenerToBeCleared);

  }

  function removePolylinesAndMarkers () {

    directionsDisplay.setMap (null);

    for (var i = 0; i < markersArray.length; i++) {
      markersArray[i].setMap(null);
    }

    markersArray = [];

  }

  function changeUnitSystem (select) {

    console.log (select.options[select.selectedIndex].getAttribute("id"));

    distanceMeasurement = select.options[select.selectedIndex].getAttribute("id");

  }

  function areaOfPolygon (perimeter, numberOfSides, sideLength) {
    console.log ("perimeter : " + perimeter);
    console.log ("numberOfSides : " + numberOfSides);
    console.log ("sideLength : " + sideLength);
    var apothem = (sideLength / (Math.tan (180 / numberOfSides))) / 2;

    var area = ( perimeter * apothem ) / 2;

    console.log ("Areaaaa : " + area);

    return area;
  }

  function changeFontSize() {
    var div = document.getElementById("boundary-unit");
    var currentFont = div.style.fontSize.replace("px", "");
    console.log ("currentFont " + currentFont);
    div.style.fontSize = parseInt(currentFont) + parseInt(36) + "px";
  }
