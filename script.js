
const songs = [
    {
        title: "Không cần thêm một ai nữa ",
        artist: "Mr Siro",
        src: "music/Khongcanthemmotainua.mp3",
        cover: "images/Khongcanthemmotainua.jpg"
    }
];

// Lấy các phần tử trên giao diện
const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const title = document.getElementById("title");
const artist = document.getElementById("artist");
const playButton = document.getElementById("play");
const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const progress = document.getElementById("progress");
const currentTimeText = document.getElementById("current-time");
const durationText = document.getElementById("duration");
const volume = document.getElementById("volume");
const songList = document.getElementById("song-list");

let currentIndex = 0;

// Chuyển số giây thành phút:giây
function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) {
        return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Tạo danh sách bài hát
function renderPlaylist() {
    songList.innerHTML = "";

    songs.forEach((song, index) => {
        const item = document.createElement("button");
        item.type = "button";
        item.className = "song-item";
        item.dataset.index = index;

        const image = document.createElement("img");
        image.src = song.cover;
        image.alt = `Ảnh bìa ${song.title}`;
        image.loading = "lazy";

        const details = document.createElement("div");
        details.className = "details";

        const songTitle = document.createElement("strong");
        songTitle.textContent = song.title;

        const songArtist = document.createElement("span");
        songArtist.textContent = song.artist;

        const icon = document.createElement("span");
        icon.className = "track-icon";
        icon.textContent = "♫";
        icon.setAttribute("aria-hidden", "true");

        details.append(songTitle, songArtist);
        item.append(image, details, icon);

        item.addEventListener("click", () => {
            selectSong(index, true);
        });

        songList.appendChild(item);
    });

    updateActiveSong();
}

// Đánh dấu bài hát đang chọn
function updateActiveSong() {
    document.querySelectorAll(".song-item").forEach((item, index) => {
        const isActive = index === currentIndex;

        item.classList.toggle("active", isActive);

        if (isActive) {
            item.setAttribute("aria-current", "true");
        } else {
            item.removeAttribute("aria-current");
        }

        const icon = item.querySelector(".track-icon");
        if (icon) {
            icon.textContent =
                isActive && !audio.paused ? "♫" : "♪";
        }
    });
}

// Chọn bài và cập nhật ảnh bìa
function selectSong(index, autoPlay = false) {
    if (index < 0 || index >= songs.length) return;

    currentIndex = index;
    const song = songs[currentIndex];

    title.textContent = song.title;
    artist.textContent = song.artist;
    cover.src = song.cover;
    cover.alt = `Ảnh bìa ${song.title}`;

    audio.src = song.src;
    audio.load();

    progress.value = 0;
    currentTimeText.textContent = "0:00";
    durationText.textContent = "0:00";

    playButton.textContent = autoPlay ? "❚❚" : "▶";
    playButton.setAttribute(
        "aria-label",
        autoPlay ? "Tạm dừng nhạc" : "Phát nhạc"
    );

    updateActiveSong();

    if (autoPlay) {
        playAudio();
    }
}

// Phát nhạc
async function playAudio() {
    if (!audio.getAttribute("src")) {
        if (songs.length === 0) return;
        selectSong(currentIndex, false);
    }

    try {
        await audio.play();

        playButton.textContent = "❚❚";
        playButton.setAttribute("aria-label", "Tạm dừng nhạc");
        updateActiveSong();
    } catch (error) {
        console.error("Không thể phát bài hát:", error);
        playButton.textContent = "▶";
        playButton.setAttribute("aria-label", "Phát nhạc");
        updateActiveSong();
    }
}

// Phát hoặc tạm dừng
playButton.addEventListener("click", () => {
    if (audio.paused) {
        playAudio();
    } else {
        audio.pause();
    }
});

// Bài trước
prevButton.addEventListener("click", () => {
    if (songs.length === 0) return;

    if (audio.currentTime > 3) {
        audio.currentTime = 0;
    } else {
        const previousIndex =
            (currentIndex - 1 + songs.length) % songs.length;
        selectSong(previousIndex, true);
    }
});

// Bài tiếp theo
nextButton.addEventListener("click", () => {
    if (songs.length === 0) return;

    const nextIndex = (currentIndex + 1) % songs.length;
    selectSong(nextIndex, true);
});

// Cập nhật thanh tiến trình và thời gian
audio.addEventListener("loadedmetadata", () => {
    durationText.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
    currentTimeText.textContent = formatTime(audio.currentTime);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        progress.value = (audio.currentTime / audio.duration) * 100;
    } else {
        progress.value = 0;
    }
});

progress.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
        audio.currentTime =
            (Number(progress.value) / 100) * audio.duration;
    }
});

// Chỉnh âm lượng
audio.volume = Number(volume.value);

volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
});

// Đồng bộ giao diện khi phát hoặc tạm dừng
audio.addEventListener("play", () => {
    playButton.textContent = "❚❚";
    playButton.setAttribute("aria-label", "Tạm dừng nhạc");
    updateActiveSong();
});

audio.addEventListener("pause", () => {
    playButton.textContent = "▶";
    playButton.setAttribute("aria-label", "Phát nhạc");
    updateActiveSong();
});

// Hết bài thì tự chuyển bài
audio.addEventListener("ended", () => {
    if (songs.length > 0) {
        selectSong((currentIndex + 1) % songs.length, true);
    }
});

// Báo lỗi khi file nhạc không tải được
audio.addEventListener("error", () => {
    playButton.textContent = "▶";
    console.error(
        "Không tải được file nhạc. Hãy kiểm tra đường dẫn:",
        songs[currentIndex]?.src
    );
});

// Khởi tạo website
if (songs.length > 0) {
    renderPlaylist();
    selectSong(0, false);
} else {
    title.textContent = "Chưa có bài hát";
    artist.textContent = "Hãy thêm bài hát vào danh sách";
    playButton.disabled = true;
    prevButton.disabled = true;
    nextButton.disabled = true;
}
