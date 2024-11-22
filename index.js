const pantryId = "91f1e6be-e651-40a0-87f0-38bab048a1d1"; // Change this to your own pantryid

const submitStoryButton = document.getElementById("submit-story");
const getStoriesButton = document.getElementById("get-stories");
const storyTextInput = document.getElementById("story-input");
//const dataReadout = document.getElementById("dataReadout");

let zoomlevel = 17;

let latitude = 0;
let longitude = 0;

let storyIds = [];

//initialising the map over London, as per leaflet API
var map = L.map('map').setView([51.505, -0.09], zoomlevel);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 20,
    minZoom: 1,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//initialise over current location
window.onload = async () => {
    alert('The Geolocation API has some accuracy issues with some browsers. \n \nFor best results, please use the google chrome or mozilla firefox browsers on desktop, and samsung internet or webview iOS on mobile. \n \nI hope you enjoy Worldly Writers <3')
    console.log('Initialising webpage');
    navigator.geolocation.getCurrentPosition(function (position) {
        console.log(`Coordinates Retrieved: latitude = ${position.coords.latitude}, longitude = ${position.coords.longitude}`);

        map.setView([position.coords.latitude, position.coords.longitude], zoomlevel);

    });

    let storyDataObject = await getStories();
    extractStories(storyDataObject);
}


const getStories = async() => {
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }};
    const response = await fetch(`https://pantry.offig.com?token=${pantryId}`, options);
    const result = await response.json();
    
    let objResult = (typeof result == "object") ? result  : JSON.parse(result);

    return objResult;
}


const addStory = async (id, storyText, latitude, longitude) => {
    const bodyJSON = `{ "${id}" : { "latitude" : ${latitude}, "longitude" : ${longitude}, "story": "${storyText}" } }`;
    const options = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: bodyJSON };
    const response = await fetch(`https://pantry.offig.com?token=${pantryId}`, options);
    const result = await response.json();    
    let objResult = (typeof result == "object") ? result  : JSON.parse(result);
    return objResult;
}

//stringifies object for the purpose of displaying it.
const displayStories = (storyDataObject) => {
    let strStories = JSON.stringify(storyDataObject, undefined, 2);
    //dataReadout.innerHTML = `<pre><code>${strStories}</code></pre>`;
}

const extractStories = (storyDataObject) => {
    //for each story in the pantry basket, pull their coords, and their story, and place a marker with a popup event at the given location
    for (var i = 0; i < Object.keys(storyDataObject).length; i++) 
    {
        var coords = [];
        var story = "";
        coords.push(storyDataObject[i]["latitude"]);
        coords.push(storyDataObject[i]["longitude"]);
        story = (storyDataObject[i]["story"])
        console.log(coords);
        console.log(story);
        var marker = L.marker(coords).addTo(map);
        marker.bindPopup(story);
        
    }
    

}



const extractStoryIds = (storyDataObject) => {
    // assumes that each story has an id that can be parsed into a number
    let ids;
    try {
        let strIds = Object.keys(storyDataObject)
        ids = strIds.map((x) => parseInt(x));
    } catch(error) {
        console.error(error);
    }
    return ids;
}

// converts the old-school callback based geolocation API to the new async/await approach
function getPosition(options) {
    return new Promise((resolve, reject) => 
        navigator.geolocation.getCurrentPosition(resolve, reject, options)
    );
}

getStoriesButton.addEventListener('click', async (event) => { 
    let position = await getPosition();
    map.setView([position.coords.latitude, position.coords.longitude], zoomlevel);
});

submitStoryButton.addEventListener('click', async (event) => {
    let position = await getPosition();
    let storyDataObject = await getStories();
    let storyIds = extractStoryIds(storyDataObject);
    if (!storyIds) { console.log("Couldn't get list of story ids"); return; }
    let maxId = Math.max(...storyIds);
    let updatedStoryDataObject = await addStory(maxId+1, storyTextInput.value, position.coords.latitude, position.coords.longitude);
    storyTextInput.value = "";
    extractStories(updatedStoryDataObject);
    
});