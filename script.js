let songs;
let currfolder;
let currentsong = new Audio();

function sectomin(second) {
    if (isNaN(second) || second < 0) {
        return "00:00";
    }
    const min = Math.floor(second / 60);
    const remainsec = Math.floor(second % 60);
    const formatmin = String(min).padStart(2, '0');
    const formatremainsec = String(remainsec).padStart(2, '0');

    return `${formatmin}:${formatremainsec}`;
}

async function getsongs(folder) {
    try {
        currfolder = folder;
        let response = await fetch(`http://127.0.0.1:5500/${folder}/`);
        let htmlContent = await response.text();

        let div = document.createElement("div");
        div.innerHTML = htmlContent;

        let as = div.querySelectorAll("a");
        songs = [];
        for (let i = 0; i < as.length; i++) {
            const element = as[i];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split(`/${folder}/`)[1]);
            }
        }

        playmusic(songs[0], true);
        let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0];
        songul.innerHTML = " ";
        for (const song of songs) {
            songul.innerHTML += `<li><img class="invert" src="music.svg" alt="">
                                <div class="info">
                                    <div>${song}</div>
                                    <div>Amith</div>
                                </div>
                                <div class="playnow">
                                    <span>play now</span>
                                    <img class="invert" src="play.svg" alt="">
                                </div>                       
            </li>`;
        }
        // Attach the event to play the song on click
        Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
            e.addEventListener("click", () => {
                playmusic(e.querySelector(".info").firstElementChild.innerHTML);
            });
        });

    } catch (error) {
        console.error("Error fetching songs:", error);
    }
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML = track;
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}
async function display() {
    try {
        let response = await fetch(`http://127.0.0.1:5500/songs/`);
        let htmlContent = await response.text();

        let div = document.createElement("div");
        div.innerHTML = htmlContent;
        let anchor = div.getElementsByTagName("a");
        let cardcontainer = document.querySelector(".cardcontainer");
        let array = Array.from(anchor);

        cardcontainer.innerHTML = ""; // Clear previous albums

        // Loop over all anchor elements and ensure albums are added to the display
        for (let i = 0; i < array.length; i++) {
            const element = array[i];
            if (element.href.includes("/songs/")) {
                let folderName = element.href.split("/").slice(-2)[1];

                let infoResponse = await fetch(`http://127.0.0.1:5500/songs/${folderName}/info.json`);
                let albumInfo = await infoResponse.json();

                // Append album card
                cardcontainer.innerHTML += `<div data-folder="${folderName}" class="card">
                                               <div class="play style">
                                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" color="#000000" fill="black">
                                                       <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                                                   </svg>
                                               </div>
                                               <img src="/songs/${folderName}/cover.jpg" alt="">
                                               <h2>${albumInfo.title}</h2>
                                               <p>${albumInfo.description}</p>
                                           </div>`;
            }
        }

        // Add event listeners to the album cards
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener("click", async items => {
                let folder = items.currentTarget.dataset.folder;
                console.log(`Loading songs from folder: ${folder}`);
                await getsongs(`songs/${folder}`);
            });
        });

    } catch (error) {
        console.error("Error loading albums:", error);
    }
}

async function main() {
    await getsongs("songs/ncs");
    playmusic(songs[0], true);
    //display all the albums on the page

    display()

    // Attach event listener to play button
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    });

    // Listen for time update events
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${sectomin(currentsong.currentTime)}/${sectomin(currentsong.duration)}`;
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });

    // Add an event listener to the seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * percent / 100;
    });

    // Add event listener for hamburger menu
    document.querySelector(".hamburg").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0%"; // Open sidebar
    });

    // Add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"; // Close sidebar
    });

    // Add event listeners for previous and next buttons
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Add event listener for volume control
    document.querySelector(".range input").addEventListener("change", (e) => {
        console.log(e.target.value);
        currentsong.volume = parseInt(e.target.value) / 100;
    });
    //add event listener to mute
    document.querySelector(".volume img").addEventListener("click",e=>{
        if(e.target.src.includes("volume.svg"))
        {
            e.target.src=e.target.src.replace("volume.svg","mute.svg")
            currentsong.volume=0;
            document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else{
            e.target.src=e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=1;
            document.querySelector(".range").getElementsByTagName("input")[0].value=10;
        }
    })
}

main();
