function mapLocation() {

  var currentLocation, poly, marker;
  var directionsDisplay;
  var directionsService = new google.maps.DirectionsService();
  var map;
  var routesArray =[];
  var differentItemsArray = [];

  function markDifferentItemsOnMap (isTracking) {

    google.maps.event.addListener(map, 'click', function(event) {
      placeMarker(event.latLng);
    });

    function placeMarker(location) {
      var marker = new google.maps.Marker({
        position: location,
        map: map,
        draggable: !isTracking,
        title: "Title",
        label: "Label"
      });

      if (isTracking) {

        routesArray.push([location.lat(),location.lng()]);
        console.log(routesArray);

      }
    }

  }

  function startTracking() {

    document.getElementById('check_tracking').style.display='block';
    document.getElementById('cancel_tracking').style.display='block';

    document.getElementById('start_tracking').style.display='none';


    markDifferentItemsOnMap (true);


    /*google.maps.event.addListener(map, 'click', function(event) {
    placeMarker(event.latLng);
  });

  function placeMarker(location) {
  var marker = new google.maps.Marker({
  position: location,
  map: map,
  draggable: true
});
routesArray.push([location.lat(),location.lng()]);
console.log(routesArray);

}*/
}

function checkTracking() {

  if (routesArray.length == 0 || routesArray.length == 1) {
    return alert('No results found for this route');
  } else  {

    routesArray.push(routesArray[0]);
  }

  document.getElementById('check_tracking').style.display='none';
  document.getElementById('start_tracking').style.display='block';
  document.getElementById('cancel_tracking').style.display='block';

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

  routesArray =[];
  marker.setMap(null);

}

function calculateDistance () {

  var bounds = new google.maps.LatLngBounds;
  var markersArray = [];

  var origin1 = {lat: 55.93, lng: -3.118};
  var origin2 = 'Greenwich, England';
  var destinationA = 'Stockholm, Sweden';
  var destinationB = {lat: 50.087, lng: 14.421};

  var destinationIcon = 'https://chart.googleapis.com/chart?' +
  'chst=d_map_pin_letter&chld=D|FF0000|000000';
  var originIcon = 'https://chart.googleapis.com/chart?' +
  'chst=d_map_pin_letter&chld=O|FFFF00|000000';
  var map = new google.maps.Map(document.getElementById('map-canvas'), {
    center: {lat: 55.53, lng: 9.4},
    zoom: 10
  });

  var geocoder = new google.maps.Geocoder;

  var service = new google.maps.DistanceMatrixService;
  service.getDistanceMatrix({
    origins: [origin1, origin2],
    destinations: [destinationA, destinationB],
    travelMode: 'WALKING',
    unitSystem: google.maps.UnitSystem.METRIC,
    avoidHighways: false,
    avoidTolls: false
  }, function(response, status) {
    if (status !== 'OK') {
      alert('Error was: ' + status);
    } else {
      var originList = response.originAddresses;
      var destinationList = response.destinationAddresses;


      var showGeocodedAddressOnMap = function(asDestination) {
        var icon = asDestination ? destinationIcon : originIcon;
        return function(results, status) {
          if (status === 'OK') {
            map.fitBounds(bounds.extend(results[0].geometry.location));
            markersArray.push(new google.maps.Marker({
              map: map,
              position: results[0].geometry.location,
              icon: icon
            }));
          } else {
            alert('Geocode was not successful due to: ' + status);
          }
        };
      };

      for (var i = 0; i < originList.length; i++) {
        var results = response.rows[i].elements;
        geocoder.geocode({'address': originList[i]},
        showGeocodedAddressOnMap(false));
        for (var j = 0; j < results.length; j++) {
          geocoder.geocode({'address': destinationList[j]},
          showGeocodedAddressOnMap(true));

          console.log ("RESULTS ::  " + originList[i] + ' to ' + destinationList[j] +
          ': ' + results[j].distance.text);

        }
      }
    }
  });
}

function getLocationAndInitialize() {

  console.log ("getLocationAndInitialize : called");
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);

    // ** TRACK BY WALKING
    //navigator.geolocation.watchPosition(showPosition, showError);
  } else {
    console.log ("Geolocation is not supported by this browser.");
  }
}

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


  //calculateDistance ();
  // ** TRACK BY WALKING

  /*
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
*/
directionsDisplay.setMap(map);
google.maps.event.addDomListener(document.getElementById('start_tracking'), 'click', startTracking);
google.maps.event.addDomListener(document.getElementById('check_tracking'), 'click', checkTracking);
google.maps.event.addDomListener(document.getElementById('cancel_tracking'), 'click', cancelTracking);
google.maps.event.addDomListener(document.getElementById('mark_items'), 'click', markDifferentItemsOnMap(false));


}

// ** TRACK BY WALKING
/* setInterval(function(){
showPosition();
},10000);
*/

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

google.maps.event.addDomListener(window, 'load', getLocationAndInitialize);
}
