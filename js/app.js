// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.

"use strict";

//Locations - In lieu of from db
var dbLocations = [
    { title: 'Starbucks', location: { lat: 33.6816445, lng: -117.918946699999993 } },
    { title: '7 Leaves Cafe', location: { lat: 33.673568, lng: -117.91872940000002 } },
    { title: 'Portola Coffee Roasters', location: { lat: 33.694459, lng: -117.92573670000002 } },
    { title: 'Sidecar Doughnuts and Coffee', location: { lat: 33.6338574, lng: -117.91520170000001 } },
    { title: 'Blackmarket Bakery', location: { lat: 33.67819419999999, lng: -117.88655979999999 } },
    { title: 'SOCIAL', location: { lat: 33.6437724, lng: -117.91966209999998 } }
];

//load the initial map
var map;

//create array of locations
var markers = [];


//Create Location Model
var Location = function (data) {
    var self = this;
    this.title = data.title;
    this.position = data.location;
    this.latlng = data.location.lat + ',' + data.location.lng;
    this.visible = ko.observable(true);
    this.address = "";
    this.infowindow = new google.maps.InfoWindow();
    this.url = "";

    this.marker = new google.maps.Marker({
        position: data.location,
        map: map,
        title: data.title
    });

    var fsid = 'YUNACPHYFIJPZHI4XL4UOONUPQUA5BY2GMTLNY4DOL2WZHYQ';
    var fscs = 'IRHHZYMMMRVQ5FGFCIPXTD2T03ULZ2CCHYC4NSXGKE33Z413';

    //foursquare api to obtain address of location
    $.getJSON('https://api.foursquare.com/v2/venues/search?ll='+this.latlng+'&limit=1&radius=1000&client_id='+fsid+'&client_secret='+fscs+'&query='+this.title+'&v=20180413',
        function (data) {
            $.each(data.response.venues, function (i, venues) {
                self.address = venues.location.address;
                self.url = 'https://foursquare.com/v/'+venues.name+'/'+venues.id+'?ref='+fsid;
            });
        }).fail(function() {
            alert("Please refresh and try again");
        });

    //populate info window with foursquare venue results
    this.marker.addListener('click', function () {
        if (self.marker.getAnimation() !== null) {
            self.marker.setAnimation(null);
        }
        else {
            self.marker.setAnimation(google.maps.Animation.BOUNCE);
            self.infowindow.setContent('<div>' + self.marker.title + '</div><div>'+ self.address + '</div>' +
            '<div><a href="' + self.url +'">FourSquare</a></div>');
            self.infowindow.open(map, this);
        }
        
    });

    //animate the marker when clicked
    this.toggleBounce = function () {
        google.maps.event.trigger(self.marker, 'click');
    };

    //depending on visibility flag, show or hide the marker on the map
    this.displayerMarker = ko.computed(function () {
        if (this.visible() === true) {
            this.marker.setMap(map);
        }
        else
        {
            this.marker.setMap(null);
        }
        return true;
    }, this);

    markers.push(this.marker);
};

//Create View Model
function ViewModel() {
    var self = this;
    this.locations = ko.observableArray([]);
    this.query = ko.observable('');

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 33.641132, lng: -117.918671 },
        zoom: 13
    });

    //add intial locations
    dbLocations.forEach(function (item) {
        self.locations.push(new Location(item));
    });

    //http://www.knockmeout.net/2011/04/utility-functions-in-knockoutjs.html
    this.filtered = ko.computed(function () {
        var filter = self.query().toLowerCase();
        //everything is visbile to begin
        if (!filter) {
            self.locations().forEach(function(Location){
				Location.visible(true);
			});
            return self.locations();
        }
        else {
            //filter based off the live query
            return ko.utils.arrayFilter(self.locations(), function (Location) {
                var result = (Location.title.toLowerCase().search(filter) >= 0);
                Location.visible(result);
                return result;
            });
        }
    }, self);
}

//Helper function to show all the coffee from earlier map lessons
function showBrew() {
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

//Helper function to hide all the coffee from earlier map lessons
function hideBrew() {
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }
}

//Start the app (called from loading the google maps api)
function initApp() {
    ko.applyBindings(new ViewModel());
}

//handle errors on the initial load
function handleError() {
    alert("There was an issue with the page, please refresh and try again");
}
