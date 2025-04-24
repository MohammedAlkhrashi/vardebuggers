// Global video data (example format - can be fetched dynamically later)
let videoData = {
        "1": {
        "serve": {
            "success": [
            "tennis/1.mp4",
            "tennis/4.mp4"
            ],
            "fail": ["tennis/2.mp4"]
        },
        "net": {
            "success": [
            "tennis/2.mp4"
            ],
            "fail": []
        },
        "rally": {
            "success": [
            "tennis/3.mp4",
            "tennis/5.mp4"
            ],
            "fail": []
        }
        }
    };

const eventSelect = document.getElementById("eventSelect");
const outcomeSelect = document.getElementById("outcomeSelect");
const matchSelect = document.getElementById("matchSelect");

function populateEventOptions() {
    // clear previous options
    eventSelect.innerHTML = '';
    clearVideoGrid();
    const accordionContainer = document.getElementById("accordionContainer");
    while (accordionContainer.firstChild) {
        accordionContainer.removeChild(accordionContainer.firstChild);
    }
    const events = Object.keys(videoData[1]); // using 1 to match json file , this is not match id
    console.log('Populating events for tennis', events);
    events.forEach(event => {
        const option = document.createElement("option");
        option.value = event;
        option.textContent = event.charAt(0).toUpperCase() + event.slice(1); // Capitalize first letter
        eventSelect.appendChild(option);
    });
}

export async function loadVideoData() {
    console.log('Loading video data for tennis');
    try {
        populateEventOptions(videoData);
    } catch (error) {
        console.error("Error loading match data:", error);
    }
}

function clearVideoGrid() {
    const videoGrid = document.getElementById('videoGrid');
    while (videoGrid.firstChild) {
        videoGrid.removeChild(videoGrid.firstChild);
    }
}

function loadClips() {
    clearVideoGrid();
    const accordionContainer = document.getElementById("accordionContainer");
    while (accordionContainer.firstChild) {
        accordionContainer.removeChild(accordionContainer.firstChild);
    }
    // const selectedMatch = matchSelect.value;
    // const matchId = selectedMatch === 'Match 1' ? '1' : '2';
    const selectedEvent = eventSelect.value;
    const selectedOutcome = outcomeSelect.value;

    if (!selectedEvent || !selectedOutcome) {
        alert("Please select both event and outcome.");
        return;
    }

    // clips for the selected event and outcome using the correct match ID
    const clips = videoData[1][selectedEvent][selectedOutcome] || []; 

    if (clips.length === 0) {
        const message = document.createElement("p");
        message.textContent = "No clips found for this combination.";
        accordionContainer.appendChild(message);
        return;
    }

    // loop through the clips and create an accordion item for each
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
        // video.src = `data/${clipPath}`;
        video.src = `data/${clipPath}?v=${new Date().getTime()}`;
        video.controls = true;
        video.width = 180;

        clipDiv.appendChild(video);
        content.appendChild(clipDiv);

        // Handle video load success
        video.addEventListener("canplay", () => {
            console.log(`✅ Video loaded successfully: ${clipPath}`);
            // Optionally add a class or UI indicator for success
        });

        // Handle video load failure
        video.addEventListener("error", (e) => {
            console.error(`❌ Failed to load video: ${clipPath}`, e);
            video.poster = "path/to/fallback-image.jpg"; // Optional fallback
            // Or display a message:
            const errorMsg = document.createElement("p");
            // errorMsg.textContent = "Video could not be loaded.";
            clipDiv.appendChild(errorMsg);
        });

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

// Initialize with Match 1
loadVideoData();

// // Single event listener for match changes
// matchSelect.addEventListener('change', () => {
//     const selectedMatchId = matchSelect.value;
//     loadVideoData(selectedMatchId);
// });

// Event listener for loading clips
document.getElementById("loadClipsBtn").addEventListener("click", loadClips);
