/* ========== STATE MANAGER ========== */

class StateManager {
    constructor() {
        this.likedImages = (JSON.parse(localStorage.getItem("likedImages")) || []).map(item => ({
            ...item,
            src: this.normalizeImageSrc(item.src)
        }));
        this.currentCategory = localStorage.getItem("currentCategory") || "all";
        this.searchQuery = "";
        this.isDarkMode = localStorage.getItem("darkMode") === "true" || 
                          (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
        this.gridColumns = localStorage.getItem("gridColumns") || "3";
        this.imageQuality = localStorage.getItem("imageQuality") || "medium";
        this.galleryVisibility = localStorage.getItem("galleryVisibility") || "private";
        
        this.init();
    }
    
    init() {
        this.applyDarkMode();
        this.restoreLikedImages();
    }
    
    normalizeImageSrc(src) {
        const anchor = document.createElement("a");
        anchor.href = src;
        return anchor.href;
    }
    
    toggleLike(imageSrc, imageAlt) {
        const normalizedSrc = this.normalizeImageSrc(imageSrc);
        const existingIndex = this.likedImages.findIndex(img => img.src === normalizedSrc);
        
        let isLiked;
        if(existingIndex !== -1) {
            this.likedImages.splice(existingIndex, 1);
            isLiked = false;
        } else {
            this.likedImages.push({
                src: normalizedSrc,
                alt: imageAlt,
                category: this.getCategoryFromImage(normalizedSrc)
            });
            isLiked = true;
        }
        
        this.save();
        this.notifyStateChange("likeToggled");
        return isLiked;
    }
    
    isImageLiked(imageSrc) {
        return this.likedImages.some(img => img.src === this.normalizeImageSrc(imageSrc));
    }
    
    getLikedCount() {
        return this.likedImages.length;
    }
    
    getLikedByCategory(category) {
        if(category === "all") return this.likedImages;
        return this.likedImages.filter(img => img.category === category);
    }
    
    getCategoryFromImage(imageSrc) {
        const normalizedSrc = this.normalizeImageSrc(imageSrc);
        const images = Array.from(document.querySelectorAll(".card img"));
        const matched = images.find(img => img.src === normalizedSrc || this.normalizeImageSrc(img.getAttribute("src")) === normalizedSrc);
        return matched ? matched.getAttribute("data-category") : "other";
    }
    
    setDarkMode(isDark) {
        this.isDarkMode = isDark;
        this.applyDarkMode();
        this.save();
    }
    
    applyDarkMode() {
        if(this.isDarkMode) {
            document.body.classList.add("dark");
        } else {
            document.body.classList.remove("dark");
        }
    }
    
    setCurrentCategory(category) {
        this.currentCategory = category;
        this.save();
    }
    
    setSearchQuery(query) {
        this.searchQuery = query.toLowerCase();
    }
    
    restoreLikedImages() {
        document.querySelectorAll(".heart").forEach(heart => {
            const img = heart.previousElementSibling;
            if(this.isImageLiked(img.src)) {
                heart.classList.add("active");
                heart.innerHTML = "♥";
            } else {
                heart.classList.remove("active");
                heart.innerHTML = "♡";
            }
        });
    }
    
    save() {
        localStorage.setItem("likedImages", JSON.stringify(this.likedImages));
        localStorage.setItem("darkMode", this.isDarkMode);
        localStorage.setItem("currentCategory", this.currentCategory);
        localStorage.setItem("gridColumns", this.gridColumns);
        localStorage.setItem("imageQuality", this.imageQuality);
        localStorage.setItem("galleryVisibility", this.galleryVisibility);
    }
    
    notifyStateChange(eventType) {
        document.dispatchEvent(new CustomEvent("stateChanged", { detail: { type: eventType } }));
    }
}

const state = new StateManager();

/* ========== HEART MANAGEMENT ========== */

function updateHeartUI(heart, isLiked) {

    heart.classList.toggle("active", isLiked);
    heart.innerHTML = isLiked ? "♥" : "♡";

    heart.classList.remove("heart-tap-animation");

    void heart.offsetWidth;

    heart.classList.add("heart-tap-animation");

    setTimeout(() => {
        heart.classList.remove("heart-tap-animation");
    }, 600);
}

/* ========== LIGHTBOX ========== */

const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const lightboxCaption = document.getElementById("lightbox-caption");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxCurrent = document.getElementById("lightbox-current");
const lightboxTotal = document.getElementById("lightbox-total");

let currentLightboxIndex = 0;
let allImages = [];

function getVisibleImages(){
    return Array.from(document.querySelectorAll(".card"))
        .filter(card => card.style.display !== "none")
        .map(card => card.querySelector("img"));
}

function initLightbox(){
    allImages = getVisibleImages();
    lightboxTotal.textContent = allImages.length;
}

initLightbox();

function openLightbox(index){
    currentLightboxIndex = index;
    lightboxImg.src = allImages[index].src;
    lightboxImg.alt = allImages[index].alt;
    lightboxCaption.textContent = allImages[index].alt;
    lightbox.style.display = "flex";
    lightboxCurrent.textContent = index + 1;
}

function closeLightbox(){
    lightbox.classList.remove("closing");
    lightbox.style.display = "none";
    currentZoom = 1;
    lightboxImg.style.transform = 'scale(1)';
}

function nextImage(){
    currentLightboxIndex = (currentLightboxIndex + 1) % allImages.length;
    lightboxImg.src = allImages[currentLightboxIndex].src;
    lightboxImg.alt = allImages[currentLightboxIndex].alt;
    lightboxCaption.textContent = allImages[currentLightboxIndex].alt;
    lightboxCurrent.textContent = currentLightboxIndex + 1;
    currentZoom = 1;
    lightboxImg.style.transform = 'scale(1)';
}

function prevImage(){
    currentLightboxIndex = (currentLightboxIndex - 1 + allImages.length) % allImages.length;
    lightboxImg.src = allImages[currentLightboxIndex].src;
    lightboxImg.alt = allImages[currentLightboxIndex].alt;
    lightboxCaption.textContent = allImages[currentLightboxIndex].alt;
    lightboxCurrent.textContent = currentLightboxIndex + 1;
    currentZoom = 1;
    lightboxImg.style.transform = 'scale(1)';
}

document.querySelectorAll(".card img").forEach((img, index) => {
    img.addEventListener("click", () => openLightbox(index));
});

lightboxClose.addEventListener("click", () => {
    lightbox.classList.add("closing");
    setTimeout(closeLightbox, 300);
});

lightboxNext.addEventListener("click", nextImage);
lightboxPrev.addEventListener("click", prevImage);

lightbox.addEventListener("click", (e) => {
    if(e.target === lightbox){
        lightbox.classList.add("closing");
        setTimeout(closeLightbox, 300);
    }
});

document.addEventListener("keydown", (e) => {
    if(lightbox.style.display === "flex"){
        if(e.key === "ArrowRight") nextImage();
        if(e.key === "ArrowLeft") prevImage();
        if(e.key === "Escape"){
            lightbox.classList.add("closing");
            setTimeout(closeLightbox, 300);
        }
    }
});

let touchStartX = 0, touchEndX = 0, touchStartY = 0, touchEndY = 0;
let initialDistance = 0, currentZoom = 1;

function handleSwipe(){
    const diffX = touchEndX - touchStartX;
    const diffY = touchEndY - touchStartY;
    const absDiffY = Math.abs(diffY), absDiffX = Math.abs(diffX);
    
    if(absDiffY > 100 && absDiffY > absDiffX && diffY > 0){
        lightbox.classList.add("closing");
        setTimeout(closeLightbox, 300);
    } else if(absDiffX > 50 && absDiffX > absDiffY){
        if(diffX < -50) nextImage();
        else if(diffX > 50) prevImage();
    }
}

function getDistance(p1, p2){
    const dx = p1.clientX - p2.clientX;
    const dy = p1.clientY - p2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
    if(e.touches.length === 2){
        initialDistance = getDistance(e.touches[0], e.touches[1]);
    }
}, false);

lightbox.addEventListener("touchmove", (e) => {
    if(e.touches.length === 2){
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = currentDistance / initialDistance;
        currentZoom = Math.max(1, Math.min(scale, 3));
        lightboxImg.style.transform = `scale(${currentZoom})`;
    }
}, false);

lightbox.addEventListener("touchend", (e) => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    if(currentZoom <= 1) {
        handleSwipe();
    }
}, false);

/* ========== FILTERING ========== */

const searchInput = document.querySelector("input");
const filterButtons = document.querySelectorAll(".filters button");
const gallery = document.querySelector(".gallery");

gallery.addEventListener("click", (e) => {
    const heart = e.target.closest(".heart");
    if (!heart || !gallery.contains(heart)) return;
    const card = heart.closest(".card");
    if (!card) return;
    const img = card.querySelector("img");
    if (!img) return;

    const isLiked = state.toggleLike(img.src, img.alt);
    updateHeartUI(heart, isLiked);
});

function applyFilters() {
    const searchValue = searchInput.value.toLowerCase();
    let visibleCards = 0;

    document.querySelectorAll(".card").forEach(card => {
        const img = card.querySelector("img");
        const imgCategory = img.getAttribute("data-category");
        const imgAlt = img.getAttribute("alt").toLowerCase();

        const categoryMatch = state.currentCategory === "all" || imgCategory === state.currentCategory;
        const searchMatch = imgAlt.includes(searchValue);

        if(categoryMatch && searchMatch){
            card.style.display = "block";
            visibleCards++;
        } else {
            card.style.display = "none";
        }
    });

    document.querySelector(".empty").style.display = visibleCards === 0 ? "block" : "none";
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        state.setCurrentCategory(button.textContent.trim().toLowerCase());
        applyFilters();
    });
});

searchInput.addEventListener("input", () => {
    state.setSearchQuery(searchInput.value);
    applyFilters();
});

/* ========== INFINITE SCROLL ========== */

const loadingSpinner = document.querySelector(".loading-spinner");
let isLoading = false;
let hasMoreImages = true;

const additionalImages = [
    { src: "images/young-woman-traveling-with-suitcase.jpg", alt: "lady at the airport", category: "travel" },
    { src: "images/tindari-7276929_640.jpg", alt: "nature scene", category: "nature" },
    { src: "images/sunflowers-1719119_640.jpg", alt: "Sunflowers", category: "nature" },
    { src: "images/sunset-7133867_640.jpg", alt: "Sunset", category: "nature" },
    { src: "images/girl-1990347_640.jpg", alt: "lady wearing headphones", category: "people" },
    { src: "images/people-6545894_640.jpg", alt: "people on the street", category: "people" },
    { src: "images/merry-christmas-4697055_640.jpg", alt: "couple", category: "people" },
    { src: "images/lisbon-8275994_640.jpg", alt: "lisbon", category: "city" },
];

function getRandomImages(count = 4){

    return [...additionalImages]
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

}

getRandomImages().forEach(img => {
    const card = createCardElement(
        img.src,
        img.alt,
        img.category
    );

    gallery.insertBefore(card, loadingSpinner);
});

function createCardElement(src, alt, category) {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
        <img src="${src}" alt="${alt}" data-category="${category}" loading="lazy">
       <div class="heart">♡</div>
    `;
    
    const heart = card.querySelector(".heart");
    const img = card.querySelector("img");
    
    const isLiked = state.isImageLiked(img.src);
    updateHeartUI(heart, isLiked);

    img.addEventListener("click", () => {
        const allImgs = Array.from(document.querySelectorAll(".card img"));
        const index = allImgs.indexOf(img);
        openLightbox(index);
    });
    img.addEventListener("load", () => {
    img.classList.add("loaded");
    });
    
    return card;
}

function loadMoreImages() {
    if(isLoading || !hasMoreImages) return;
    
    isLoading = true;
    gallery.classList.add("loading");
    
    setTimeout(() => {
        additionalImages.forEach(img => {
            const card = createCardElement(img.src, img.alt, img.category);
            gallery.insertBefore(card, loadingSpinner);
        });
        
        initLightbox();
        updateAlbumCounts();
        isLoading = false;
        gallery.classList.remove("loading");
        hasMoreImages = false;
    }, 1000);
}

const observerOptions = { root: null, rootMargin: "100px", threshold: 0 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if(entry.isIntersecting && !isLoading && hasMoreImages) {
            loadMoreImages();
        }
    });
}, observerOptions);

observer.observe(loadingSpinner);

/* ========== DARK MODE ========== */

const darkModeToggle = document.getElementById("darkModeToggle");

darkModeToggle.addEventListener("click", () => {
    state.setDarkMode(!state.isDarkMode);
    darkModeToggle.innerHTML = state.isDarkMode ? "☀️" : "🌙";
});

darkModeToggle.innerHTML = state.isDarkMode ? "☀️" : "🌙";

/* ========== TAB SWITCHING ========== */

const navItems = document.querySelectorAll(".nav-item");

navItems.forEach(item => {
    item.addEventListener("click", () => {
        const tabName = item.getAttribute("data-tab");
        switchTab(tabName);
    });
});

function switchTab(tabName) {

    document.querySelectorAll(".tab-section").forEach(section => {
        section.classList.remove("active");
    });

    if(tabName === "photos") {

        /* document.getElementById("photos-section").classList.add("active");

        document.querySelector(".gallery").style.display = "block";
        document.querySelector(".topbar").style.display = "flex";
        document.querySelector(".search-box").style.display = "flex";
        document.querySelector(".filters").style.display = "flex";
 */
        document.getElementById("photos-section")
        .classList.add("active");

        document.querySelector(".gallery")
        .classList.remove("hidden");

        document.querySelector(".topbar")
        .classList.remove("hidden");

        document.querySelector(".search-box")
        .classList.remove("hidden");

        document.querySelector(".filters")
        .classList.remove("hidden");
    } else {

        document.querySelector(".gallery").classList.add("hidden");
        document.querySelector(".topbar").classList.add("hidden");
        document.querySelector(".search-box").classList.add("hidden");
        document.querySelector(".filters").classList.add("hidden");

        document.getElementById(tabName + "-section").classList.add("active");
    }

    navItems.forEach(nav => nav.classList.remove("active"));

    document
        .querySelector(`[data-tab="${tabName}"]`)
        .classList.add("active");

    /* window.scrollTo({
        top: 0,
        behavior: "smooth"
    }); */
}

/* ========== ALBUMS MANAGER ========== */

function updateAlbumCounts() {
    const categoryNames = ["nature", "people", "travel", "city"];

    categoryNames.forEach(category => {
        const count = document.querySelectorAll(`.gallery .card img[data-category="${category}"]`).length;
        const card = document.querySelector(`.album-card[data-category="${category}"]`);
        const countEl = card ? card.querySelector(".album-count") : null;
        if(countEl) {
            countEl.textContent = `${count} photo${count !== 1 ? "s" : ""}`;
        }
    });
}

document.getElementById("create-album-btn").addEventListener("click", () => {
    const albumName = prompt("Enter album name:", "New Album");
    if(albumName) alert("Album '" + albumName + "' created! (Demo mode)");
});

document.querySelectorAll(".album-card").forEach(card => {
    card.addEventListener("click", () => {
        const category = card.dataset.category || card.querySelector("h3").textContent.trim().toLowerCase();
        state.setCurrentCategory(category);

        filterButtons.forEach(btn => {
            btn.classList.toggle("active", btn.textContent.trim().toLowerCase() === category);
        });

        switchTab("photos");
        applyFilters();
    });
});

updateAlbumCounts();

/* ========== FOR YOU SECTION ========== */

function updateForYouSection() {
    const likedCount = state.getLikedCount();
    const likedCountEl = document.getElementById("liked-count");
    
    if(likedCountEl) {
        likedCountEl.textContent = `${likedCount} photo${likedCount !== 1 ? "s" : ""} liked`;
    }
}

updateForYouSection();

document.querySelectorAll(".view-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        switchTab("photos");
        applyFilters();
    });
});

/* ========== STATE CHANGE LISTENERS ========== */

document.addEventListener("stateChanged", (e) => {
    if(e.detail.type === "likeToggled") {
        updateAlbumCounts();
        updateForYouSection();
        initLightbox();
    }
});

/* ========== SETTINGS ========== */

document.getElementById("grid-columns")
.addEventListener("change", (e) => {

    state.gridColumns = e.target.value;

    applyGridColumns();

    state.save();
});

document.getElementById("image-quality").addEventListener("change", (e) => {
    state.imageQuality = e.target.value;
    state.save();
});

document.getElementById("gallery-visibility").addEventListener("change", (e) => {
    state.galleryVisibility = e.target.value;
    state.save();
});

document.querySelectorAll("input[type='checkbox']").forEach(checkbox => {
    checkbox.addEventListener("change", (e) => {
        localStorage.setItem(e.target.id, e.target.checked);
    });
});

document.querySelector(".save-settings-btn").addEventListener("click", () => {
    alert("Settings saved successfully! ✅");
});

function loadSettings() {
    document.getElementById("grid-columns").value = state.gridColumns;
    document.getElementById("image-quality").value = state.imageQuality;
    document.getElementById("gallery-visibility").value = state.galleryVisibility;
    
    document.getElementById("new-photos-notif").checked = localStorage.getItem("new-photos-notif") !== "false";
    document.getElementById("album-notif").checked = localStorage.getItem("album-notif") !== "false";
    applyGridColumns();
}

loadSettings();

filterButtons.forEach(btn => {

    if(btn.textContent.trim().toLowerCase() === state.currentCategory){
        btn.classList.add("active");
    } else {
        btn.classList.remove("active");
    }

});

applyFilters();

function applyGridColumns() {

    const gallery = document.querySelector(".gallery");

    switch(state.gridColumns){

        case "2":
            gallery.style.columns = "2 350px";
            break;

        case "3":
            gallery.style.columns = "3 280px";
            break;

        case "4":
            gallery.style.columns = "4 220px";
            break;
    }
}

//FAB
document.querySelector(".fab")
.addEventListener("click", () => {

    alert("Upload feature coming soon 📸");

});

document.querySelectorAll(".card img").forEach(img => {

    img.addEventListener("load", () => {
        img.classList.add("loaded");
    });

});
