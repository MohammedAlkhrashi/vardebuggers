// Global video data (example format - can be fetched dynamically later)
let videoData = {};  // This will be dynamically populated based on the selected match

const eventSelect = document.getElementById("eventSelect");
const outcomeSelect = document.getElementById("outcomeSelect");
const tbody = document.querySelector("#videoTable tbody");

function populateEventOptions() {
  // Clear previous options
//   eventSelect.innerHTML = '<option value="">-- Select Event --</option>';
  const events = Object.keys(videoData["1"]); // or dynamic match ID
  events.forEach(event => {
    const option = document.createElement("option");
    option.value = event;
    option.textContent = event.charAt(0).toUpperCase() + event.slice(1); // Capitalize first letter
    eventSelect.appendChild(option);
  });
}

export async function loadVideoData(matchId) {  // Added `export` here
    const matchIdMapped = matchId === 'Match 1' ? '1' : (matchId === 'Match 2' ? '2' : null);

    if (!matchIdMapped) {
        console.error("Invalid match selected.");
        return;
    }
    try {
        const response = await fetch(`data/player_actions_${matchIdMapped}.json`); // Fetch the specific match's JSON file
        const data = await response.json();
        videoData = data; // Assign the fetched data to videoData
        // After fetching the video data, populate event options
        populateEventOptions();
    } catch (error) {
        console.error("Error loading match data:", error);
    }
}

function loadClips() {
    // Clear the previous results
    const accordionContainer = document.getElementById("accordionContainer");
    accordionContainer.innerHTML = ""; // Reset the accordion container

    const selectedEvent = eventSelect.value;
    const selectedOutcome = outcomeSelect.value;

    if (!selectedEvent || !selectedOutcome) {
        alert("Please select both event and outcome.");
        return;
    }

    // Get the clips for the selected event and outcome
    const clips = videoData["1"][selectedEvent][selectedOutcome] || [];

    if (clips.length === 0) {
        // Show a message if no clips are found
        const message = document.createElement("p");
        message.textContent = "No clips found for this combination.";
        accordionContainer.appendChild(message);
        return;
    }

    // Loop through the clips and create an accordion item for each
    clips.forEach(clipPath => {
        const accordionItem = document.createElement("div");
        accordionItem.classList.add("accordion-item");

        // Create a random minute between 1 and 90
        const randomMinute = Math.floor(Math.random() * 90) + 1;
        
        // Create the accordion button (header)
        const button = document.createElement("button");
        button.classList.add("accordion-button");
        button.textContent = `Minute: ${randomMinute}'`;

        // Append the button to the accordion item
        accordionItem.appendChild(button);

        // Create the accordion content (body)
        const content = document.createElement("div");
        content.classList.add("accordion-content");

        // Create a video element for the clip
        const clipDiv = document.createElement("div");
        clipDiv.classList.add("clip");

        const video = document.createElement("video");
        video.src = `data/${clipPath}`;
        video.controls = true;
        video.width = 180;

        clipDiv.appendChild(video);
        content.appendChild(clipDiv);

        // Append the content to the accordion item
        accordionItem.appendChild(content);

        // Append the accordion item to the container
        accordionContainer.appendChild(accordionItem);

        // Attach event listener to toggle the accordion
        button.addEventListener("click", () => {
            // Toggle the active class for smooth expansion
            accordionItem.classList.toggle("active");
        });
    });
}



// const accordionItems = document.querySelectorAll('.accordion-item');

// accordionItems.forEach(item => {
//     const button = item.querySelector('.accordion-button');
//     button.addEventListener('click', () => {
//         // Toggle active class on the accordion item
//         item.classList.toggle('active');
        
//         // // to close other items if we want only one to be open at a time
//         // accordionItems.forEach(otherItem => {
//         //     if (otherItem !== item) {
//         //         otherItem.classList.remove('active');
//         //     }
//         // });
//     });
// });



// // Initialize
// populateEventOptions();

// Load video data for a selected match (you can replace '1' with the matchId)
loadVideoData('Match 1');

// Event listener for loading clips based on selection
document.getElementById("loadClipsBtn").addEventListener("click", loadClips);

// Change event for match selection (to load the new match's clips)
matchSelect.addEventListener('change', () => {
  const selectedMatchId = matchSelect.value;
  loadVideoData(selectedMatchId); // Load data for the selected match
});
