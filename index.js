const pantryId = "95f0c4c2-187c-42fa-a536-9df81811d815"; // Change this to your own pantryid

const submitStoryButton = document.getElementById("submitStory");
const getStoriesButton = document.getElementById("getStories");
const storyTextInput = document.getElementById("storyInput");
const dataReadout = document.getElementById("dataReadout");

let latitude = 0;
let longitude = 0;

let storyIds = [];

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


const displayStories = (storyDataObject) => {
    let strStories = JSON.stringify(storyDataObject, undefined, 2);
    dataReadout.innerHTML = `<pre><code>${strStories}</code></pre>`;
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
    let storyDataObject = await getStories();
    displayStories(storyDataObject);
});


submitStoryButton.addEventListener('click', async (event) => {
    let position = await getPosition();
    let storyDataObject = await getStories();
    let storyIds = extractStoryIds(storyDataObject);
    if (!storyIds) { console.log("Couldn't get list of story ids"); return; }
    let maxId = Math.max(...storyIds);
    let updatedStoryDataObject = await addStory(maxId+1, storyTextInput.value, position.coords.latitude, position.coords.longitude);
    displayStories(updatedStoryDataObject);
});