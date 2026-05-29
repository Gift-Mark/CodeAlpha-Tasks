// ===== ELEMENTS =====
const audio = document.getElementById("audio");
const playBtn = document.getElementById("playBtn");
const playIcon = document.getElementById("playIcon");
const progress = document.getElementById("progress");
const progressContainer = document.getElementById("progressContainer");
const volume = document.getElementById("volume");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const titleEl = document.querySelector("h1");
const artistEl = document.querySelector(".artist");
const albumCover = document.getElementById("albumCover");
const likeBtn = document.getElementById("likeBtn");
const likeIcon = document.getElementById("likeIcon");

// ===== STATE =====
let currentSong = 0;
let isPlaying = false;
let shuffle = false;
let repeat = false;

// restore last played song from storage
const savedSong = Number(localStorage.getItem("currentSong"));
if (!Number.isNaN(savedSong) && savedSong >= 0 && savedSong < songs.length) {
  currentSong = savedSong;
}

loadSong(currentSong);

// ===== LOAD SONG =====
function loadSong(index){
  currentSong = index;
  const song = songs[index];

  audio.src = song.src;
  titleEl.innerText = song.title;
  artistEl.innerText = song.artist;
  albumCover.src = song.cover;
  albumCover.style.animation = "none";
  albumCover.offsetHeight;
  albumCover.style.animation = "spin 8s linear infinite";

  if (!isPlaying) {
  albumCover.style.animationPlayState = "paused";
  }
  //save current song
  localStorage.setItem("currentSong", index);
  updateLikeButton();
}

// ===== PLAY / PAUSE =====
async function togglePlay(){
  try{
    if(isPlaying){
    audio.pause();
    playIcon.classList.replace("fa-pause","fa-play");
    albumCover.style.animationPlayState = "paused";
    isPlaying = false;
    } else {
    await audio.play();
    playIcon.classList.replace("fa-play","fa-pause");
    albumCover.style.animationPlayState = "running";
    isPlaying =true;
    }
  }catch (err){
  console.log("Playback failed:",err)
  }
}

// ===== NEXT =====
function nextSong(){

  let queueSongs =
    JSON.parse(localStorage.getItem("queueSongs")) || [];

  const queueIndexes = queueSongs.map(queueSong =>
    songs.findIndex(song =>
      song.title === queueSong.title &&
      song.artist === queueSong.artist
    )
  ).filter(index => index >=0);

  //SHUFFLE MODE
  if(shuffle){
    currentSong = Math.floor(Math.random()*songs.length);
  }

  //Queue mode
  else if (queueIndexes.length >0){
    let currentQueueIndex = queueIndexes.indexOf(currentSong);
    //if current song not in queue
    if (currentQueueIndex === -1){
      currentSong = queueIndexes[0];
    }else {
      currentQueueIndex = (currentQueueIndex + 1) % queueIndexes.length;
      currentSong = queueIndexes[currentQueueIndex];
    }
  }

  //normal mode
  else {
    currentSong = (currentSong + 1) % songs.length;
  }
  loadSong(currentSong);
  audio.play()
  .then(() => {
    isPlaying = true;
    playIcon.classList.replace("fa-play","fa-pause");
    albumCover.style.animationPlayState = "running";
  })
  .catch(err => {
    console.log("Playback failed:", err);
  });
}

// ===== PREVIOUS =====
function prevSong(){
  currentSong = (currentSong - 1 + songs.length) % songs.length;

  loadSong(currentSong);
  audio.play()
  .then(() => {
    isPlaying = true;
    playIcon.classList.replace("fa-play","fa-pause");
    albumCover.style.animationPlayState = "running";
  })
  .catch(err => {
    console.log("Playback failed:", err);
  });
}

// ===== FORMAT TIME =====
function formatTime(time){
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs < 10 ? "0"+secs : secs}`;
}

// ===== PROGRESS =====
audio.addEventListener("timeupdate", () => {
  if(audio.duration){
  const percent = (audio.currentTime / audio.duration) * 100;
  progress.style.width = percent + "%";

    currentTimeEl.innerText = formatTime(audio.currentTime);
    durationEl.innerText = formatTime(audio.duration);
  }
});

// ===== SEEK =====
progressContainer.addEventListener("click", (e) => {
  const width = progressContainer.clientWidth;
  const clickX = e.offsetX;
  audio.currentTime = (clickX / width) * audio.duration;
});

// ===== VOLUME =====
volume.addEventListener("input", (e) => {
  audio.volume = e.target.value;
});

// ===== AUTO NEXT / REPEAT =====
audio.addEventListener("ended", () => {
  if(repeat){
    audio.currentTime = 0;
    audio.play();
  } else {
    nextSong();
  }
});

// ===== BUTTON EVENTS =====
playBtn.addEventListener("click", togglePlay);
document.querySelector(".fa-forward").addEventListener("click", nextSong);
document.querySelector(".fa-backward").addEventListener("click", prevSong);

// ===== SHUFFLE =====
document.querySelector(".fa-shuffle").addEventListener("click", (e) => {
  shuffle = !shuffle;
  e.target.style.color = shuffle ? "#8e3bff" : "#ccc";
});

// ===== REPEAT =====
document.querySelector(".fa-repeat").addEventListener("click", (e) => {
  repeat = !repeat;
  e.target.style.color = repeat ? "#8e3bff" : "#ccc";
});

//LIKE SYSTEM
  //check if current song is liked
  function updateLikeButton() {
    let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];

  const current = songs[currentSong];

  // avoid duplicates
  const exists = likedSongs.find(
    song => song.title === current.title
  );

    if(exists){
      likeIcon.classList.remove("fa-regular");
      likeIcon.classList.add("fa-solid");
      likeBtn.style.color = "#ff3b3b";
    } else {
      likeIcon.classList.remove("fa-solid");
      likeIcon.classList.add("fa-regular");
      likeBtn.style.color = "#ccc";
      }
   }

   //toggle like
   likeBtn.addEventListener("click", () => {
    let likedSongs = JSON.parse(localStorage.getItem("likedSongs")) || [];
    const current = songs[currentSong];
    const existsIndex = likedSongs.findIndex(
      song => song.title === current.title
    );
    //REMOVE if already liked
    if(existsIndex !== -1){
      likedSongs.splice(existsIndex, 1);
    } else {
      //ADD if not liked
      likedSongs.push(current);
    }
    localStorage.setItem("likedSongs", JSON.stringify(likedSongs));
    updateLikeButton();
   });
   
   // ADD TO QUEUE
   const addQueueBtn = document.getElementById("addQueueBtn");
   
   addQueueBtn.addEventListener("click", () => {
     let queueSongs = JSON.parse(localStorage.getItem("queueSongs")) || [];
     const queueIndexes = queueSongs
       .map((item) => {
         if (typeof item === "number") {
           return item;
         }
         return songs.findIndex(
           (song) => song.title === item.title && song.artist === item.artist
         );
       })
       .filter((index) => index >= 0);

     if (!queueIndexes.includes(currentSong)) {
       queueIndexes.push(currentSong);
       const updatedQueue = queueIndexes.map(index => songs[index]);
       localStorage.setItem("queueSongs", JSON.stringify(updatedQueue));
       addQueueBtn.style.color = "#8e3bff";
       alert(`Added "${songs[currentSong].title}" to queue!`);
       setTimeout(() => {
         addQueueBtn.style.color = "";
       }, 1500);
     }
   });
   window.addEventListener("load", async () => {
  try {
    await audio.play();
    isPlaying = true;
    playIcon.classList.replace("fa-play", "fa-pause");
    albumCover.style.animationPlayState = "running";
  } catch (err) {
    console.log("Autoplay blocked");
  }
});