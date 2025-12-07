// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyCJGR8dXeawpg6RNpF1iUC7TD65RWm-oxE",
    authDomain: "sun-day-video-production-298c8.firebaseapp.com",
    projectId: "sun-day-video-production-298c8",
    storageBucket: "sun-day-video-production-298c8.firebasestorage.app",
    messagingSenderId: "927333523323",
    appId: "1:927333523323:web:16375e95732c5acb4767de",
    measurementId: "G-ZY2Y2Y749H"
};

// Firebase Initialization
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const rtdb = firebase.database();
const storage = firebase.storage();

// DOM Elements
const screens = document.querySelectorAll('.screen');
const screen1 = document.getElementById('screen1');
const screen4 = document.getElementById('screen4');
const adminLoginBtn = document.getElementById('adminLoginBtn');
const videoList = document.getElementById('videoList');
const mainVideoPlayer = document.getElementById('mainVideoPlayer');
const unlockVideosBtn = document.getElementById('unlockVideosBtn');
const loginStatus = document.getElementById('loginStatus');
const storyMenuToggle = document.getElementById('storyMenuToggle');
const storyMenu = document.getElementById('storyMenu');
const storyList = document.getElementById('storyList');
const storyPasswordSection = document.getElementById('storyPasswordSection');
const storyPassword = document.getElementById('storyPassword');
const unlockStoryBtn = document.getElementById('unlockStoryBtn');
const storyPasswordStatus = document.getElementById('storyPasswordStatus');
const selectedStoryName = document.getElementById('selectedStoryName');
const showContactLinksScreen = document.getElementById('showContactLinksScreen');
const backToScreen1FromContacts = document.getElementById('backToScreen1FromContacts');
const downloadedVideosSection = document.getElementById('downloadedVideosSection');
const downloadedVideosList = document.getElementById('downloadedVideosList');
const contactLinksScreenList = document.getElementById('contactLinksScreenList');
const adminMessageContent = document.getElementById('adminMessageContent');
const connectionStatus = document.getElementById('connectionStatus');
const passwordTimerDisplay = document.getElementById('passwordTimerDisplay');
const timerText = document.getElementById('timerText');
const compactPasswordSection = document.getElementById('compactPasswordSection');
const noInternetModal = document.getElementById('noInternetModal');
const continueOfflineBtn = document.getElementById('continueOfflineBtn');
const closeNoInternetModal = document.getElementById('closeNoInternetModal');
const editDownloadedModal = document.getElementById('editDownloadedModal');
const closeEditDownloadedModal = document.getElementById('closeEditDownloadedModal');
const editDownloadedName = document.getElementById('editDownloadedName');
const editDownloadedStory = document.getElementById('editDownloadedStory');
const editDownloadedType = document.getElementById('editDownloadedType');
const editDownloadedNotes = document.getElementById('editDownloadedNotes');
const saveDownloadedEditBtn = document.getElementById('saveDownloadedEditBtn');
const normalModeBtn = document.getElementById('normalModeBtn');
const digitalModeBtn = document.getElementById('digitalModeBtn');
const darkModeBtn = document.getElementById('darkModeBtn');

// Application State Variables
let videos = [];
let stories = [];
let contactLinksData = [];
let currentVideoElement = null;
let hls = null;
let isUserLoggedIn = false;
let currentSelectedStory = null;
let unlockedStories = [];
let passwords = [];
let monthlyPasswords = [];
let timeBasedPasswords = {};
let activeTimePassword = null;
let passwordExpirationTimer = null;
let currentDeviceId = '';
let userSessionRef = null;
let isOfflineMode = false;
let downloadingVideos = new Set();
let downloadProgress = {};
let currentlyEditingDownloadedVideoId = null;
let passwordBoxSizeTimer = null;
let isPasswordBoxSmall = true;
let adminMessageData = {
    content: '',
    timestamp: null
};
let customApplicationImageUrl = "https://res.cloudinary.com/zaumaran/image/upload/v1764932924/Kachin_Vision_Empire_For_Logo_zpkdbg.png";

// Constants
const APP_FOLDER_NAME = 'Kachin Visions Empire';
const VIDEO_FOLDER_NAME = 'videos';
let appStorage = null;

// Main Initialization Function
async function initApp() {
    currentDeviceId = generateDeviceId();
    
    setStyleMode('digital');
    loadCustomImage();
    await initSecureDownloadSystem();
    
    auth.onAuthStateChanged(user => {
        if (user && user.email === 'sunday@video.com') {
            // Admin user detected
        }
    });

    await loadVideos();
    await loadPasswords();
    await loadMonthlyPasswords();
    await loadTimePasswords();
    await loadContactLinks();
    
    setDefaultImageAsVideo();
    cacheVideosForOffline();
    checkOfflineVideos();
    checkActiveTimePassword();
    checkActiveMonthlyPassword();
    
    initPasswordBoxSizeManagement();
    initAutoRememberSystem();
    initDownloadedVideoEditModal();
    
    renderDownloadedVideosSection();
    
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    updateConnectionStatus();
    
    initDigitalEffects();
}

// Default Image Setup
function setDefaultImageAsVideo() {
    mainVideoPlayer.innerHTML = '';
    
    const videoPlayerWrapper = document.createElement('div');
    videoPlayerWrapper.className = 'video-player-wrapper';
    
    const topBar = document.createElement('div');
    topBar.id = 'topBlackBar';
    topBar.className = 'black-bars top-bar';
    topBar.style.height = '0px';
    
    const bottomBar = document.createElement('div');
    bottomBar.id = 'bottomBlackBar';
    bottomBar.className = 'black-bars bottom-bar';
    bottomBar.style.height = '0px';
    
    const videoContent = document.createElement('div');
    videoContent.className = 'video-content';
    videoContent.style.height = '100%';
    
    const imgElement = document.createElement('img');
    imgElement.id = 'defaultImageElement';
    imgElement.src = customApplicationImageUrl;
    imgElement.alt = 'Kachin Visions Empire';
    imgElement.style.width = '100%';
    imgElement.style.height = '100%';
    imgElement.style.objectFit = 'contain';
    imgElement.style.objectPosition = 'center';
    
    videoContent.appendChild(imgElement);
    
    videoPlayerWrapper.appendChild(topBar);
    videoPlayerWrapper.appendChild(videoContent);
    videoPlayerWrapper.appendChild(bottomBar);
    mainVideoPlayer.appendChild(videoPlayerWrapper);
    
    currentVideoElement = imgElement;
}

// Load Custom Image
function loadCustomImage() {
    const savedImageUrl = localStorage.getItem('customApplicationImageUrl');
    if (savedImageUrl) {
        customApplicationImageUrl = savedImageUrl;
    }
}

// Digital Effects
function initDigitalEffects() {
    createEnhancedParticles();
    
    digitalModeBtn.addEventListener('click', () => {
        setTimeout(createEnhancedParticles, 100);
    });
}

function createEnhancedParticles() {
    if (!document.body.classList.contains('digital-mode')) {
        return;
    }
    
    const particlesContainer = document.querySelector('.digital-particles');
    if (!particlesContainer) return;
    
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const sunParticle = document.createElement('div');
        sunParticle.className = 'particle sun';
        sunParticle.style.width = `${Math.random() * 40 + 20}px`;
        sunParticle.style.height = sunParticle.style.width;
        sunParticle.style.left = `${Math.random() * 100}%`;
        sunParticle.style.top = `${Math.random() * 100}%`;
        sunParticle.style.animationDuration = `${Math.random() * 20 + 10}s`;
        sunParticle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(sunParticle);
    }
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.width = `${Math.random() * 10 + 2}px`;
        particle.style.height = particle.style.width;
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 15 + 5}s`;
        particle.style.animationDelay = `${Math.random() * 3}s`;
        particlesContainer.appendChild(particle);
    }
}

// Secure Download System
async function initSecureDownloadSystem() {
    try {
        if ('showDirectoryPicker' in window) {
            try {
                const handle = await window.showDirectoryPicker({
                    id: 'kachin-visions-empire-video-storage',
                    mode: 'readwrite',
                    startIn: 'documents'
                });
                
                if (handle.name !== APP_FOLDER_NAME) {
                    appStorage = await handle.getDirectoryHandle(APP_FOLDER_NAME, { create: true });
                } else {
                    appStorage = handle;
                }
                
                await appStorage.getDirectoryHandle(VIDEO_FOLDER_NAME, { create: true });
            } catch (error) {
                console.warn('File System Access API not available or permission denied:', error);
                appStorage = null;
            }
        } else {
            console.warn('File System Access API not supported in this browser');
            appStorage = null;
        }
    } catch (error) {
        console.error('Error initializing secure download system:', error);
        appStorage = null;
    }
}

// Device ID Management
function generateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        deviceId = 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('deviceId', deviceId);
        registerInstallation(deviceId);
    }
    return deviceId;
}

function registerInstallation(deviceId) {
    if (navigator.onLine && !isOfflineMode) {
        const userAgent = navigator.userAgent;
        let deviceType = 'Unknown';
        
        if (/Android/.test(userAgent)) {
            deviceType = 'Android';
        } else if (/iPhone|iPad|iPod/.test(userAgent)) {
            deviceType = 'iOS';
        } else if (/Windows/.test(userAgent)) {
            deviceType = 'Windows';
        } else if (/Mac/.test(userAgent)) {
            deviceType = 'Mac';
        } else if (/Linux/.test(userAgent)) {
            deviceType = 'Linux';
        }
        
        db.collection('installations').doc(deviceId).set({
            deviceType: deviceType,
            userAgent: userAgent,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            online: true,
            lastSeen: new Date().toISOString()
        }).catch(error => {
            console.error('Error registering installation:', error);
        });
    }
}

// Password Box Size Management
function setPasswordBoxSmall() {
    if (!compactPasswordSection) return;
    
    compactPasswordSection.classList.add('small-state');
    isPasswordBoxSmall = true;
    
    if (passwordBoxSizeTimer) {
        clearTimeout(passwordBoxSizeTimer);
        passwordBoxSizeTimer = null;
    }
}

function setPasswordBoxNormal() {
    if (!compactPasswordSection) return;
    
    compactPasswordSection.classList.remove('small-state');
    isPasswordBoxSmall = false;
    
    passwordBoxSizeTimer = setTimeout(() => {
        setPasswordBoxSmall();
    }, 10000);
}

function initPasswordBoxSizeManagement() {
    setPasswordBoxSmall();
    
    const passwordInput = document.getElementById('password');
    const unlockVideosBtn = document.getElementById('unlockVideosBtn');
    
    if (passwordInput) {
        passwordInput.addEventListener('focus', () => {
            setPasswordBoxNormal();
        });
        
        passwordInput.addEventListener('click', () => {
            setPasswordBoxNormal();
        });
        
        passwordInput.addEventListener('input', () => {
            setPasswordBoxNormal();
        });
    }
    
    if (unlockVideosBtn) {
        unlockVideosBtn.addEventListener('click', () => {
            setPasswordBoxNormal();
        });
        
        unlockVideosBtn.addEventListener('mouseenter', () => {
            setPasswordBoxNormal();
        });
    }
    
    if (compactPasswordSection) {
        compactPasswordSection.addEventListener('mouseenter', () => {
            setPasswordBoxNormal();
        });
    }
}

// Story Password Section
function showStoryPasswordSectionWithTimer(story) {
    currentSelectedStory = story;
    selectedStoryName.textContent = story;
    storyPasswordSection.classList.add('active');
    
    setTimeout(() => {
        if (storyPasswordSection.classList.contains('active')) {
            storyPasswordSection.classList.remove('active');
        }
    }, 10000);
}

// Password Remember System
function rememberPassword(passwordType, password, additionalData = {}) {
    let rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
    
    const passwordData = {
        password: password,
        timestamp: new Date().toISOString(),
        expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ...additionalData,
        passwordId: additionalData.passwordId || null
    };
    
    rememberedPasswords[passwordType] = rememberedPasswords[passwordType] || {};
    
    if (passwordType === 'story' && additionalData.storyName) {
        rememberedPasswords.story[additionalData.storyName] = passwordData;
    } else {
        rememberedPasswords[passwordType] = passwordData;
    }
    
    localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
    
    schedulePasswordCleanup(passwordType, additionalData.storyName, passwordData.expiry);
}

function schedulePasswordCleanup(passwordType, storyName, expiry) {
    const expiryTime = new Date(expiry).getTime() - Date.now();
    
    if (expiryTime > 0) {
        setTimeout(() => {
            clearExpiredRememberedPasswords();
            
            if (passwordType === 'story' && storyName) {
                lockStoryVideos(storyName);
            } else if (passwordType === 'global' || passwordType === 'monthly' || passwordType === 'time') {
                lockTimeBasedContent();
            }
        }, expiryTime);
    }
}

function checkAndAutoFillPasswords() {
    const rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
    const now = new Date();
    
    if (rememberedPasswords.global && new Date(rememberedPasswords.global.expiry) > now) {
        document.getElementById('password').value = rememberedPasswords.global.password;
    }
    
    if (rememberedPasswords.story && currentSelectedStory) {
        const storyPasswordData = rememberedPasswords.story[currentSelectedStory];
        if (storyPasswordData && new Date(storyPasswordData.expiry) > now) {
            document.getElementById('storyPassword').value = storyPasswordData.password;
        }
    }
    
    if (rememberedPasswords.monthly && new Date(rememberedPasswords.monthly.expiry) > now) {
        document.getElementById('password').value = rememberedPasswords.monthly.password;
    }
}

function clearExpiredRememberedPasswords() {
    const rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
    const now = new Date();
    let hasChanges = false;
    
    if (rememberedPasswords.global && new Date(rememberedPasswords.global.expiry) <= now) {
        delete rememberedPasswords.global;
        hasChanges = true;
    }
    
    if (rememberedPasswords.story) {
        Object.keys(rememberedPasswords.story).forEach(storyName => {
            if (new Date(rememberedPasswords.story[storyName].expiry) <= now) {
                delete rememberedPasswords.story[storyName];
                hasChanges = true;
            }
        });
        
        if (Object.keys(rememberedPasswords.story).length === 0) {
            delete rememberedPasswords.story;
            hasChanges = true;
        }
    }
    
    if (rememberedPasswords.monthly && new Date(rememberedPasswords.monthly.expiry) <= now) {
        delete rememberedPasswords.monthly;
        hasChanges = true;
    }
    
    if (hasChanges) {
        localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
    }
}

function setupAdminPasswordDeletionListener() {
    if (navigator.onLine && !isOfflineMode) {
        db.collection('passwords').onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    const deletedPasswordId = change.doc.id;
                    
                    const rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
                    let passwordToRemove = null;
                    
                    if (rememberedPasswords.global && rememberedPasswords.global.password === deletedPasswordId) {
                        passwordToRemove = 'global';
                    }
                    
                    if (rememberedPasswords.story) {
                        Object.keys(rememberedPasswords.story).forEach(storyName => {
                            if (rememberedPasswords.story[storyName].password === deletedPasswordId) {
                                passwordToRemove = `story.${storyName}`;
                            }
                        });
                    }
                    
                    if (passwordToRemove) {
                        if (passwordToRemove === 'global') {
                            delete rememberedPasswords.global;
                        } else if (passwordToRemove.startsWith('story.')) {
                            const storyName = passwordToRemove.split('.')[1];
                            delete rememberedPasswords.story[storyName];
                        }
                        
                        localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
                        
                        if (passwordToRemove.startsWith('story.')) {
                            const storyName = passwordToRemove.split('.')[1];
                            lockStoryVideos(storyName);
                        }
                    }
                }
            });
        });
        
        db.collection('monthlyPasswords').onSnapshot((snapshot) => {
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'removed') {
                    const deletedPasswordId = change.doc.id;
                    
                    const rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
                    
                    if (rememberedPasswords.monthly && rememberedPasswords.monthly.password === deletedPasswordId) {
                        delete rememberedPasswords.monthly;
                        localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
                        
                        lockTimeBasedContent();
                    }
                }
            });
        });
    }
}

function initAutoRememberSystem() {
    clearExpiredRememberedPasswords();
    
    document.getElementById('storyList').addEventListener('click', function(e) {
        if (e.target.classList.contains('story-item')) {
            setTimeout(checkAndAutoFillPasswords, 100);
        }
    });
    
    window.addEventListener('load', function() {
        setTimeout(checkAndAutoFillPasswords, 500);
    });
    
    setupAdminPasswordDeletionListener();
}

// Downloaded Videos Management
function renderDownloadedVideosSection() {
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    
    if (Object.keys(downloadedVideos).length === 0) {
        downloadedVideosSection.style.display = 'none';
        return;
    }
    
    downloadedVideosSection.style.display = 'block';
    downloadedVideosList.innerHTML = '';
    
    Object.entries(downloadedVideos).forEach(([videoId, videoData]) => {
        const videoItem = document.createElement('div');
        videoItem.className = 'video-item downloaded';
        
        const expiresDate = new Date(videoData.expires);
        const daysLeft = Math.ceil((expiresDate - new Date()) / (1000 * 60 * 60 * 24));
        
        const customName = videoData.customName || videoData.name;
        const customStory = videoData.customStory || videoData.storyName;
        const customType = videoData.customType || videoData.type;
        const notes = videoData.notes || '';
        
        videoItem.innerHTML = `
            <div style="flex: 1;">
                <h4 style="font-size: 9px;">${customName}</h4>
                <p style="font-size: 8px;">${customType} ${customStory ? `• ${customStory}` : ''}</p>
                <p style="font-size: 8px; color: var(--accent);">
                    <i class="fas fa-clock"></i> Expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}
                </p>
                ${notes ? `<p style="font-size: 7px; color: var(--gray); margin-top: 2px;"><i class="fas fa-sticky-note"></i> ${notes}</p>` : ''}
                <div class="downloaded-video-actions">
                    <button class="downloaded-edit-btn" data-id="${videoId}">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="downloaded-delete-btn" data-id="${videoId}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <button class="play-offline-btn" data-id="${videoId}" style="
                background: var(--success);
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
            ">
                <i class="fas fa-play"></i> Play
            </button>
        `;
        
        videoItem.addEventListener('click', async (e) => {
            if (e.target.closest('.play-offline-btn') || 
                e.target.closest('.downloaded-edit-btn') || 
                e.target.closest('.downloaded-delete-btn')) return;
            await playOfflineVideo(videoId);
        });
        
        const playBtn = videoItem.querySelector('.play-offline-btn');
        playBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await playOfflineVideo(videoId);
        });
        
        const editBtn = videoItem.querySelector('.downloaded-edit-btn');
        editBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditDownloadedModal(videoId, videoData);
        });
        
        const deleteBtn = videoItem.querySelector('.downloaded-delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteDownloadedVideo(videoId);
        });
        
        downloadedVideosList.appendChild(videoItem);
    });
}

function openEditDownloadedModal(videoId, videoData) {
    currentlyEditingDownloadedVideoId = videoId;
    
    editDownloadedName.value = videoData.customName || videoData.name || '';
    editDownloadedStory.value = videoData.customStory || videoData.storyName || '';
    editDownloadedType.value = videoData.customType || videoData.type || 'mp4';
    editDownloadedNotes.value = videoData.notes || '';
    
    editDownloadedModal.style.display = 'flex';
}

function saveDownloadedVideoEdit() {
    const videoId = currentlyEditingDownloadedVideoId;
    if (!videoId) return;
    
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    const videoData = downloadedVideos[videoId];
    
    if (!videoData) {
        alert('Video not found!');
        return;
    }
    
    const newName = editDownloadedName.value.trim();
    const newStory = editDownloadedStory.value.trim();
    const newType = editDownloadedType.value;
    const newNotes = editDownloadedNotes.value.trim();
    
    if (!newName) {
        alert('Video name is required!');
        return;
    }
    
    videoData.customName = newName;
    if (newStory) videoData.customStory = newStory;
    if (newType) videoData.customType = newType;
    if (newNotes) videoData.notes = newNotes;
    videoData.lastEdited = new Date().toISOString();
    
    downloadedVideos[videoId] = videoData;
    localStorage.setItem('downloadedVideos', JSON.stringify(downloadedVideos));
    
    editDownloadedModal.style.display = 'none';
    currentlyEditingDownloadedVideoId = null;
    
    renderDownloadedVideosSection();
    renderVideoLibraryWithDownloads();
    
    alert('Video information updated successfully!');
}

function deleteDownloadedVideo(videoId) {
    if (!confirm('Are you sure you want to delete this downloaded video? This action cannot be undone.')) {
        return;
    }
    
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    
    if (!downloadedVideos[videoId]) {
        alert('Video not found!');
        return;
    }
    
    delete downloadedVideos[videoId];
    localStorage.setItem('downloadedVideos', JSON.stringify(downloadedVideos));
    
    const cachedVideos = JSON.parse(localStorage.getItem('cachedVideos') || '[]');
    const updatedCachedVideos = cachedVideos.filter(v => v.id !== videoId);
    localStorage.setItem('cachedVideos', JSON.stringify(updatedCachedVideos));
    
    renderDownloadedVideosSection();
    renderVideoLibraryWithDownloads();
    
    alert('Video deleted successfully! Storage space has been freed up.');
}

function initDownloadedVideoEditModal() {
    closeEditDownloadedModal.addEventListener('click', () => {
        editDownloadedModal.style.display = 'none';
        currentlyEditingDownloadedVideoId = null;
    });
    
    saveDownloadedEditBtn.addEventListener('click', saveDownloadedVideoEdit);
    
    editDownloadedModal.addEventListener('click', (e) => {
        if (e.target === editDownloadedModal) {
            editDownloadedModal.style.display = 'none';
            currentlyEditingDownloadedVideoId = null;
        }
    });
}

// Video Management
async function loadVideos() {
    try {
        if (navigator.onLine && !isOfflineMode) {
            const snapshot = await db.collection('videos').get();
            videos = [];
            snapshot.forEach(doc => {
                videos.push({ id: doc.id, ...doc.data() });
            });
            
            videos.sort((a, b) => {
                if (a.storyName && b.storyName) {
                    if (a.storyName.toLowerCase() < b.storyName.toLowerCase()) return -1;
                    if (a.storyName.toLowerCase() > b.storyName.toLowerCase()) return 1;
                }
                
                if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
                if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
                return 0;
            });
            
            await renderVideoList();
            loadStories();
            updateDownloadableVideos();
            cacheVideosForOffline();
        } else {
            await loadCachedVideos();
            await renderVideoList();
        }
    } catch (error) {
        console.error('Error loading videos:', error);
        await renderVideoList();
    }
}

function updateDownloadableVideos() {
    const downloadableVideos = videos.filter(v => v.downloadable === true);
    localStorage.setItem('downloadableVideos', JSON.stringify(downloadableVideos));
    renderVideoLibraryWithDownloads();
}

function renderVideoLibraryWithDownloads() {
    videoList.innerHTML = '';
    
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    
    let videosToDisplay = [...videos];
    
    videosToDisplay.sort((a, b) => {
        if (a.downloadable && !b.downloadable) return -1;
        if (!a.downloadable && b.downloadable) return 1;
        return a.name.localeCompare(b.name);
    });
    
    videosToDisplay.forEach(video => {
        renderVideoItem(video, downloadedVideos);
    });
}

function renderVideoItem(video, downloadedVideos) {
    const videoItem = document.createElement('div');
    
    const isFree = video.passwordType === 'free';
    const isUnlocked = isUserLoggedIn || 
        (video.storyName && unlockedStories.includes(video.storyName)) ||
        activeTimePassword;
    
    const isDownloadable = video.downloadable === true;
    const isDownloaded = downloadedVideos[video.id];
    
    if ((isFree || isUnlocked) && isDownloadable) {
        videoItem.className = 'video-item downloadable';
    } else if (isFree) {
        videoItem.className = 'video-item free';
    } else if (!isUnlocked) {
        videoItem.className = 'video-item locked';
    } else {
        videoItem.className = 'video-item';
    }
    
    videoItem.innerHTML = `
        <div style="flex: 1;">
            <h4 style="font-size: 9px;">${video.name}</h4>
            <p style="font-size: 8px;">${video.type} ${video.storyName ? `• ${video.storyName}` : ''}</p>
            ${isDownloadable ? '<p style="font-size: 8px; color: var(--success);"><i class="fas fa-download"></i> Download Available</p>' : ''}
            ${isDownloaded ? '<p style="font-size: 8px; color: var(--accent);"><i class="fas fa-check-circle"></i> Downloaded</p>' : ''}
        </div>
        ${isFree ? '<span class="free-badge">Free</span>' : ''}
        ${isDownloadable && (isFree || isUnlocked) ? 
            `<button class="download-video-btn" data-id="${video.id}" style="
                background: ${isDownloaded ? 'var(--success)' : 'var(--primary)'};
                color: white;
                border: none;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 4px;
            ">
                <i class="fas ${isDownloaded ? 'fa-check' : 'fa-download'}"></i>
                ${isDownloaded ? 'Downloaded' : 'Save'}
            </button>` : ''
        }
    `;
    
    videoItem.addEventListener('click', async (e) => {
        if (e.target.closest('.download-video-btn')) return;
        
        if (!videoItem.classList.contains('locked')) {
            await playVideo(video);
        } else if (isFree) {
            await playVideo(video);
        } else {
            alert('This video requires a password. Please enter the password for this story or use the global password.');
        }
    });
    
    if (isDownloadable && (isFree || isUnlocked)) {
        const downloadBtn = videoItem.querySelector('.download-video-btn');
        downloadBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await downloadVideoForOffline(video);
        });
    }
    
    videoList.appendChild(videoItem);
}

// Video Download Functions
async function downloadVideoForOffline(video) {
    if (!video.downloadable) {
        alert('This video is not available for download.');
        return;
    }
    
    if (downloadingVideos.has(video.id)) {
        alert('This video is already being downloaded.');
        return;
    }
    
    if (!await checkStorageQuota()) {
        alert('Insufficient storage space. Please free up some space and try again.');
        return;
    }
    
    const downloadBtn = document.querySelector(`.download-video-btn[data-id="${video.id}"]`);
    const originalText = downloadBtn.innerHTML;
    downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
    downloadBtn.disabled = true;
    downloadingVideos.add(video.id);
    
    try {
        const encryptedVideoData = await encryptVideoData(video);
        
        let storagePath = null;
        if (appStorage) {
            try {
                storagePath = await saveToSecureStorage(video.id, encryptedVideoData);
            } catch (error) {
                console.warn('Failed to save to secure storage:', error);
            }
        }
        
        const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
        downloadedVideos[video.id] = {
            ...video,
            encryptedData: encryptedVideoData,
            storagePath: storagePath,
            downloadDate: new Date().toISOString(),
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };
        
        localStorage.setItem('downloadedVideos', JSON.stringify(downloadedVideos));
        
        downloadBtn.innerHTML = '<i class="fas fa-check"></i> Downloaded';
        downloadBtn.style.background = 'var(--success)';
        
        alert('Video downloaded securely! You can now watch it offline.');
        
        renderVideoLibraryWithDownloads();
        renderDownloadedVideosSection();
        
        if (navigator.onLine && !isOfflineMode) {
            await db.collection('videoDownloads').add({
                videoId: video.id,
                videoName: video.name,
                storyName: video.storyName,
                deviceId: currentDeviceId,
                downloadDate: firebase.firestore.FieldValue.serverTimestamp(),
                expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            });
        }
        
    } catch (error) {
        console.error('Error downloading video:', error);
        downloadBtn.innerHTML = originalText;
        downloadBtn.disabled = false;
        alert('Error downloading video. Please try again.');
    } finally {
        downloadingVideos.delete(video.id);
    }
}

async function saveToSecureStorage(videoId, encryptedData) {
    if (!appStorage) return null;
    
    try {
        const videosFolder = await appStorage.getDirectoryHandle(VIDEO_FOLDER_NAME, { create: true });
        
        const filename = `video_${videoId}_${currentDeviceId}.enc`;
        const fileHandle = await videosFolder.getFileHandle(filename, { create: true });
        const writable = await fileHandle.createWritable();
        
        await writable.write(encryptedData);
        await writable.close();
        
        return filename;
    } catch (error) {
        console.error('Error saving to secure storage:', error);
        throw error;
    }
}

async function loadFromSecureStorage(filename) {
    if (!appStorage) return null;
    
    try {
        const videosFolder = await appStorage.getDirectoryHandle(VIDEO_FOLDER_NAME, { create: false });
        const fileHandle = await videosFolder.getFileHandle(filename, { create: false });
        const file = await fileHandle.getFile();
        return await file.text();
    } catch (error) {
        console.error('Error loading from secure storage:', error);
        return null;
    }
}

async function deleteFromSecureStorage(filename) {
    if (!appStorage) return;
    
    try {
        const videosFolder = await appStorage.getDirectoryHandle(VIDEO_FOLDER_NAME, { create: false });
        await videosFolder.removeEntry(filename);
    } catch (error) {
        console.error('Error deleting from secure storage:', error);
    }
}

// Encryption Functions
async function encryptVideoData(video) {
    const secretKey = CryptoJS.SHA256(`${currentDeviceId}_${video.id}_kachin_visions_empire_secret`).toString();
    
    const encrypted = CryptoJS.AES.encrypt(
        JSON.stringify({
            ...video,
            _encrypted: true,
            _deviceId: currentDeviceId,
            _timestamp: new Date().toISOString(),
            _app: 'Kachin Visions Empire'
        }),
        secretKey
    ).toString();
    
    return encrypted;
}

async function decryptVideoData(encryptedData) {
    try {
        const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
        let videoId = null;
        
        for (const [id, data] of Object.entries(downloadedVideos)) {
            if (data.encryptedData === encryptedData || data.storagePath) {
                videoId = id;
                break;
            }
        }
        
        if (!videoId) {
            throw new Error('Video not found in downloaded videos');
        }
        
        const secretKey = CryptoJS.SHA256(`${currentDeviceId}_${videoId}_kachin_visions_empire_secret`).toString();
        
        const decryptedBytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
            throw new Error('Decryption failed - invalid key or data');
        }
        
        const decrypted = JSON.parse(decryptedText);
        
        if (decrypted._deviceId !== currentDeviceId) {
            throw new Error('Video not authorized for this device');
        }
        
        if (decrypted._app !== 'Kachin Visions Empire') {
            throw new Error('Invalid video format');
        }
        
        delete decrypted._encrypted;
        delete decrypted._deviceId;
        delete decrypted._timestamp;
        delete decrypted._app;
        
        return decrypted;
    } catch (error) {
        console.error('Error decrypting video:', error);
        throw new Error('Failed to decrypt video data. It may be corrupted or not authorized for this device.');
    }
}

// Storage Management
async function checkStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
        try {
            const { usage, quota } = await navigator.storage.estimate();
            const availableSpace = quota - usage;
            const minRequired = 50 * 1024 * 1024;
            
            return availableSpace > minRequired;
        } catch (error) {
            console.error('Error checking storage quota:', error);
            return true;
        }
    }
    return true;
}

// Offline Video Playback
async function playOfflineVideo(videoId) {
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    const videoData = downloadedVideos[videoId];
    
    if (!videoData) {
        alert('Video not found in offline storage.');
        return;
    }
    
    if (videoData.expires && new Date(videoData.expires) < new Date()) {
        delete downloadedVideos[videoId];
        localStorage.setItem('downloadedVideos', JSON.stringify(downloadedVideos));
        
        if (videoData.storagePath) {
            await deleteFromSecureStorage(videoData.storagePath);
        }
        
        alert('This downloaded video has expired. Please download it again.');
        renderVideoLibraryWithDownloads();
        renderDownloadedVideosSection();
        return;
    }
    
    try {
        let encryptedData = videoData.encryptedData;
        if (videoData.storagePath && !encryptedData) {
            encryptedData = await loadFromSecureStorage(videoData.storagePath);
            if (!encryptedData) {
                throw new Error('Could not load video from secure storage');
            }
        }
        
        const decryptedVideo = await decryptVideoData(encryptedData);
        
        await playVideo(decryptedVideo);
        
    } catch (error) {
        console.error('Error playing offline video:', error);
        alert('Error playing offline video. It may be corrupted or not authorized for this device.');
    }
}

// Video Caching
async function loadCachedVideos() {
    try {
        const cachedVideos = JSON.parse(localStorage.getItem('cachedVideos') || '[]');
        videos = cachedVideos;
    } catch (error) {
        console.error('Error loading cached videos:', error);
        videos = [];
    }
}

function cacheVideosForOffline() {
    if (navigator.onLine && !isOfflineMode) {
        const videoCache = videos.map(v => ({
            id: v.id,
            name: v.name,
            storyName: v.storyName,
            type: v.type,
            passwordType: v.passwordType,
            downloadable: v.downloadable || false,
            added: v.added
        }));
        
        localStorage.setItem('cachedVideos', JSON.stringify(videoCache));
    }
}

// Story Management
function loadStories() {
    stories = [];
    const storyMap = {};
    
    videos.forEach(video => {
        if (video.storyName && !storyMap[video.storyName]) {
            storyMap[video.storyName] = true;
            stories.push(video.storyName);
        }
    });
    
    renderStoryMenu();
}

function renderStoryMenu() {
    storyList.innerHTML = '';
    
    stories.forEach(story => {
        const storyItem = document.createElement('div');
        storyItem.className = 'story-item';
        storyItem.textContent = story;
        storyItem.addEventListener('click', () => {
            selectStory(story);
            storyMenu.classList.remove('active');
        });
        
        storyList.appendChild(storyItem);
    });
}

function selectStory(story) {
    currentSelectedStory = story;
    selectedStoryName.textContent = story;
    
    document.querySelectorAll('.story-item').forEach(item => {
        item.classList.remove('active');
        if (item.textContent === story) {
            item.classList.add('active');
        }
    });
    
    checkAndAutoFillPasswords();
    
    const hasPasswordProtectedVideos = videos.some(video => 
        video.storyName === story && video.passwordType === 'password'
    );
    
    if (hasPasswordProtectedVideos && !unlockedStories.includes(story)) {
        showStoryPasswordSectionWithTimer(story);
        storyPasswordStatus.textContent = 'Enter password to unlock this story';
        storyPasswordStatus.style.color = 'var(--accent)';
    } else {
        storyPasswordSection.classList.remove('active');
        filterVideosByStory(story);
    }
}

// Story Unlock Functions
function unlockStory() {
    const password = storyPassword.value;
    const story = currentSelectedStory;
    
    if (!password) {
        storyPasswordStatus.textContent = 'Please enter a password';
        storyPasswordStatus.style.color = 'var(--danger)';
        return;
    }
    
    const validPassword = passwords.find(p => 
        p.password === password && p.storyName === story
    );
    
    if (validPassword) {
        if (validPassword.singleDevice && validPassword.deviceId && validPassword.deviceId !== currentDeviceId) {
            storyPasswordStatus.textContent = 'This password is already registered to another device.';
            storyPasswordStatus.style.color = 'var(--danger)';
            return;
        }
        
        unlockedStories.push(story);
        storyPasswordSection.classList.remove('active');
        storyPasswordStatus.textContent = '';
        filterVideosByStory(story);
        
        rememberPassword('story', password, { storyName: story });
        
        alert(`Story "${story}" unlocked successfully!`);
    } else {
        storyPasswordStatus.textContent = 'Invalid password for this story';
        storyPasswordStatus.style.color = 'var(--danger)';
    }
}

function filterVideosByStory(story) {
    renderVideoLibraryWithDownloads();
}

function lockStoryVideos(storyName) {
    const index = unlockedStories.indexOf(storyName);
    if (index !== -1) {
        unlockedStories.splice(index, 1);
    }
    
    document.querySelectorAll('.video-item').forEach(item => {
        const itemText = item.querySelector('p')?.textContent || '';
        if (itemText.includes(`• ${storyName}`) || itemText.includes(storyName)) {
            if (!item.classList.contains('free')) {
                item.classList.add('locked');
            }
        }
    });
    
    renderContactLinksScreen();
    
    if (isUserLoggedIn) {
        alert(`Access to story "${storyName}" has been revoked. Videos from this story are now locked.`);
    }
    
    if (unlockedStories.length === 0) {
        isUserLoggedIn = false;
        loginStatus.textContent = 'Please enter your password to unlock videos';
        loginStatus.style.color = 'var(--accent)';
    }
}

// Password Loading Functions
function loadPasswords() {
    if (navigator.onLine && !isOfflineMode) {
        db.collection('passwords').get().then(snapshot => {
            passwords = [];
            snapshot.forEach(doc => {
                passwords.push({ id: doc.id, ...doc.data() });
            });
        }).catch(error => {
            console.error('Error loading passwords:', error);
        });
    }
}

function loadMonthlyPasswords() {
    if (navigator.onLine && !isOfflineMode) {
        db.collection('monthlyPasswords').get().then(snapshot => {
            monthlyPasswords = [];
            snapshot.forEach(doc => {
                monthlyPasswords.push({ id: doc.id, ...doc.data() });
            });
        }).catch(error => {
            console.error('Error loading monthly passwords:', error);
        });
    }
}

function loadTimePasswords() {
    if (navigator.onLine && !isOfflineMode) {
        db.collection('timePasswords').get().then(snapshot => {
            timeBasedPasswords = {};
            snapshot.forEach(doc => {
                timeBasedPasswords[doc.id] = doc.data();
            });
            
            checkActiveTimePassword();
        }).catch(error => {
            console.error('Error loading time passwords:', error);
            checkActiveTimePassword();
        });
    } else {
        checkActiveTimePassword();
    }
}

// Contact Links
function loadContactLinks() {
    if (navigator.onLine && !isOfflineMode) {
        db.collection('contactLinks').get().then(snapshot => {
            contactLinksData = [];
            snapshot.forEach(doc => {
                contactLinksData.push({ id: doc.id, ...doc.data() });
            });
            
            renderContactLinksScreen();
        }).catch(error => {
            console.error('Error loading contact links:', error);
            renderContactLinksScreen();
        });
    } else {
        renderContactLinksScreen();
    }
}

// Video Playback
async function renderVideoList() {
    renderVideoLibraryWithDownloads();
}

async function playVideo(video) {
    if (hls) {
        hls.destroy();
        hls = null;
    }
    
    let videoUrl = video.url;
    
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    const isDownloaded = downloadedVideos[video.id];
    
    if (!navigator.onLine && !isDownloaded) {
        alert('Video not available offline. Please download it first or connect to the internet.');
        return;
    }
    
    if (!navigator.onLine && isDownloaded) {
        try {
            const decryptedVideo = await decryptVideoData(downloadedVideos[video.id].encryptedData);
            videoUrl = decryptedVideo.url;
        } catch (error) {
            alert('Error playing offline video. Please try downloading it again.');
            return;
        }
    }
    
    mainVideoPlayer.innerHTML = '';
    
    const videoPlayerWrapper = document.createElement('div');
    videoPlayerWrapper.className = 'video-player-wrapper';
    
    const topBar = document.createElement('div');
    topBar.id = 'topBlackBar';
    topBar.className = 'black-bars top-bar';
    topBar.style.height = '0px';
    
    const bottomBar = document.createElement('div');
    bottomBar.id = 'bottomBlackBar';
    bottomBar.className = 'black-bars bottom-bar';
    bottomBar.style.height = '0px';
    
    const videoContent = document.createElement('div');
    videoContent.className = 'video-content';
    videoContent.style.height = '100%';
    
    if (video.type === 'youtube') {
        const videoId = extractYouTubeId(video.url);
        if (!videoId) {
            alert('Invalid YouTube URL format');
            return;
        }
        
        const embedUrl = `https://www.youtube.com/embed/${videoId}`;
        
        const iframe = document.createElement('iframe');
        iframe.className = 'youtube-iframe';
        iframe.src = embedUrl;
        iframe.allowFullscreen = true;
        iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.frameBorder = '0';
        iframe.title = video.name;
        
        videoContent.appendChild(iframe);
        currentVideoElement = iframe;
    } else if (video.type === 'hls' && video.url && video.url.endsWith('.m3u8')) {
        if (Hls.isSupported()) {
            const videoElement = document.createElement('video');
            videoElement.id = 'mainVideoElement';
            videoElement.controls = true;
            videoElement.autoplay = true;
            videoElement.muted = false;
            videoElement.loop = false;
            videoElement.controlsList = 'nodownload noremoteplayback';
            videoElement.style.width = '100%';
            videoElement.style.height = '100%';
            videoElement.oncontextmenu = () => false;
            
            videoContent.appendChild(videoElement);
            currentVideoElement = videoElement;
            
            hls = new Hls({
                enableWorker: false,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            
            hls.loadSource(videoUrl);
            hls.attachMedia(videoElement);
            
            hls.on(Hls.Events.MANIFEST_PARSED, function() {
                console.log('HLS manifest parsed successfully');
            });
        } else if (videoElement && videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            videoElement.src = videoUrl;
            currentVideoElement = videoElement;
        } else {
            console.error('HLS is not supported in this browser');
            alert('HLS video is not supported in your browser. Please try a different browser.');
            return;
        }
    } else {
        const videoElement = document.createElement('video');
        videoElement.id = 'mainVideoElement';
        videoElement.controls = true;
        videoElement.autoplay = true;
        videoElement.muted = false;
        videoElement.loop = false;
        videoElement.controlsList = 'nodownload noremoteplayback';
        videoElement.style.width = '100%';
        videoElement.style.height = '100%';
        videoElement.oncontextmenu = () => false;
        
        const source = document.createElement('source');
        source.src = videoUrl;
        
        if (videoUrl.toLowerCase().endsWith('.webm')) {
            source.type = 'video/webm';
        } else if (videoUrl.toLowerCase().endsWith('.ogg') || videoUrl.toLowerCase().endsWith('.ogv')) {
            source.type = 'video/ogg';
        } else {
            source.type = 'video/mp4';
        }
        
        videoElement.appendChild(source);
        videoElement.innerHTML += 'Your browser does not support the video tag.';
        
        videoContent.appendChild(videoElement);
        currentVideoElement = videoElement;
    }
    
    videoPlayerWrapper.appendChild(topBar);
    videoPlayerWrapper.appendChild(videoContent);
    videoPlayerWrapper.appendChild(bottomBar);
    mainVideoPlayer.appendChild(videoPlayerWrapper);
    
    document.querySelectorAll('.video-item').forEach(item => {
        item.classList.remove('playing');
    });
    
    const videoItems = document.querySelectorAll('.video-item');
    for (let i = 0; i < videoItems.length; i++) {
        const itemText = videoItems[i].querySelector('h4').textContent;
        if (itemText === video.name) {
            videoItems[i].classList.add('playing');
            break;
        }
    }

    if (currentVideoElement) {
        currentVideoElement.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            return false;
        });
    }
}

// YouTube ID Extraction
function extractYouTubeId(url) {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?#]+)/,
        /youtube\.com\/watch\?.*v=([^&?#]+)/,
        /youtu\.be\/([^&?#]+)/,
        /youtube\.com\/embed\/([^&?#]+)/
    ];
    
    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }
    
    return null;
}

// Video Unlock Functions
function unlockVideos() {
    const password = document.getElementById('password').value;
    
    if (!password) {
        loginStatus.textContent = 'Please enter a password';
        loginStatus.style.color = 'var(--danger)';
        return;
    }
    
    const validPassword = passwords.find(p => p.password === password);
    const validMonthlyPassword = monthlyPasswords.find(p => p.password === password);
    
    let validStoryPassword = null;
    if (!validPassword && !validMonthlyPassword) {
        const passwordParts = password.split('.');
        if (passwordParts.length >= 2) {
            const lastPart = passwordParts[passwordParts.length - 1];
            if (/^\d{6}$/.test(lastPart)) {
                validStoryPassword = passwords.find(p => p.password === password);
            }
        }
    }
    
    if (validPassword || validStoryPassword) {
        const passwordToUse = validPassword || validStoryPassword;
        const storyName = passwordToUse.storyName;
        
        if (passwordToUse.singleDevice && passwordToUse.deviceId && passwordToUse.deviceId !== currentDeviceId) {
            loginStatus.textContent = 'This password is already registered to another device. Single device access only.';
            loginStatus.style.color = 'var(--danger)';
            return;
        }
        
        if (navigator.onLine && !isOfflineMode) {
            const passwordRef = db.collection('passwords').doc(passwordToUse.id);
            
            passwordRef.update({
                deviceId: currentDeviceId,
                loginTime: new Date().toISOString(),
                online: true,
                startTime: new Date().toISOString(),
                used: true
            }).then(() => {
                passwordToUse.deviceId = currentDeviceId;
                passwordToUse.loginTime = new Date().toISOString();
                passwordToUse.online = true;
                passwordToUse.startTime = new Date().toISOString();
                passwordToUse.used = true;
                
                completeStoryPasswordUnlockProcess(password, storyName);
            }).catch(error => {
                console.error('Error updating password device info:', error);
                alert('Error unlocking videos. Please try again.');
            });
        } else {
            passwordToUse.deviceId = currentDeviceId;
            passwordToUse.loginTime = new Date().toISOString();
            passwordToUse.online = false;
            passwordToUse.startTime = new Date().toISOString();
            passwordToUse.used = true;
            
            completeStoryPasswordUnlockProcess(password, storyName);
        }
    } else if (validMonthlyPassword) {
        if (validMonthlyPassword.singleDevice && validMonthlyPassword.deviceId && validMonthlyPassword.deviceId !== currentDeviceId) {
            loginStatus.textContent = 'This password is already registered to another device. Single device access only.';
            loginStatus.style.color = 'var(--danger)';
            return;
        }
        
        if (validMonthlyPassword.expirationDate) {
            const expirationDate = validMonthlyPassword.expirationDate.toDate
                ? validMonthlyPassword.expirationDate.toDate()
                : new Date(validMonthlyPassword.expirationDate);
            
            if (new Date() > expirationDate) {
                loginStatus.textContent = 'This password has expired.';
                loginStatus.style.color = 'var(--danger)';
                return;
            }
        }
        
        if (navigator.onLine && !isOfflineMode) {
            const passwordRef = db.collection('monthlyPasswords').doc(validMonthlyPassword.id);
            
            const updateData = {
                deviceId: currentDeviceId,
                loginTime: new Date().toISOString(),
                online: true,
                startTime: new Date().toISOString(),
                used: true
            };
            
            if (!validMonthlyPassword.startTime) {
                updateData.startTime = new Date().toISOString();
                if (validMonthlyPassword.duration) {
                    const endTime = new Date();
                    endTime.setMonth(endTime.getMonth() + validMonthlyPassword.duration);
                    updateData.endTime = endTime.toISOString();
                }
            }
            
            passwordRef.update(updateData).then(() => {
                validMonthlyPassword.deviceId = currentDeviceId;
                validMonthlyPassword.loginTime = new Date().toISOString();
                validMonthlyPassword.online = true;
                validMonthlyPassword.startTime = updateData.startTime;
                validMonthlyPassword.endTime = updateData.endTime || validMonthlyPassword.endTime;
                validMonthlyPassword.used = true;
                
                completeMonthlyUnlockProcess(password, validMonthlyPassword);
            }).catch(error => {
                console.error('Error updating monthly password device info:', error);
                alert('Error unlocking videos. Please try again.');
            });
        } else {
            validMonthlyPassword.deviceId = currentDeviceId;
            validMonthlyPassword.loginTime = new Date().toISOString();
            validMonthlyPassword.online = false;
            if (!validMonthlyPassword.startTime) {
                validMonthlyPassword.startTime = new Date().toISOString();
                if (validMonthlyPassword.duration) {
                    const endTime = new Date();
                    endTime.setMonth(endTime.getMonth() + validMonthlyPassword.duration);
                    validMonthlyPassword.endTime = endTime.toISOString();
                }
            }
            validMonthlyPassword.used = true;
            
            completeMonthlyUnlockProcess(password, validMonthlyPassword);
        }
    } else {
        const timePassword = timeBasedPasswords[password];
        if (timePassword) {
            if (timePassword.singleDevice && timePassword.deviceId && timePassword.deviceId !== currentDeviceId) {
                loginStatus.textContent = 'This password is already registered to another device. Single device access only.';
                loginStatus.style.color = 'var(--danger)';
                return;
            }
            
            const expirationDate = timePassword.expirationDate.toDate();
            if (new Date() > expirationDate) {
                loginStatus.textContent = 'This password has expired.';
                loginStatus.style.color = 'var(--danger)';
                return;
            }
            
            if (navigator.onLine && !isOfflineMode) {
                const passwordRef = db.collection('timePasswords').doc(password);
                
                passwordRef.update({
                    deviceId: currentDeviceId,
                    loginTime: new Date().toISOString()
                }).then(() => {
                    timePassword.deviceId = currentDeviceId;
                    timePassword.loginTime = new Date().toISOString();
                    
                    completeTimeUnlockProcess(password, timePassword);
                }).catch(error => {
                    console.error('Error updating time password device info:', error);
                    alert('Error unlocking videos. Please try again.');
                });
            } else {
                timePassword.deviceId = currentDeviceId;
                timePassword.loginTime = new Date().toISOString();
                
                completeTimeUnlockProcess(password, timePassword);
            }
        } else {
            loginStatus.textContent = 'Invalid password. Please try again.';
            loginStatus.style.color = 'var(--danger)';
        }
    }
}

function completeStoryPasswordUnlockProcess(password, storyName) {
    const passwordParts = password.split('.');
    let passwordStoryName = '';
    
    if (passwordParts.length === 2) {
        passwordStoryName = passwordParts[0];
    } else if (passwordParts.length === 3) {
        passwordStoryName = passwordParts[1];
    }
    
    if (passwordStoryName.toLowerCase() !== storyName.toLowerCase()) {
        loginStatus.textContent = 'Password does not match story name. Access denied.';
        loginStatus.style.color = 'var(--danger)';
        alert('Error: Password story name does not match. Access denied.');
        return;
    }
    
    rememberPassword('global', password, { storyName: storyName });
    
    unlockVideosForStory(storyName);
    
    if (navigator.onLine && !isOfflineMode) {
        setupUserSession(password);
    }
    
    alert(`Videos from story "${storyName}" unlocked successfully!`);
}

function unlockVideosForStory(storyName) {
    document.querySelectorAll('.video-item').forEach(item => {
        const itemText = item.querySelector('p')?.textContent || '';
        if (itemText.includes(`• ${storyName}`) || itemText.includes(storyName)) {
            item.classList.remove('locked');
        }
    });
    
    if (!unlockedStories.includes(storyName)) {
        unlockedStories.push(storyName);
    }
    
    loginStatus.textContent = `Videos from story "${storyName}" unlocked successfully!`;
    loginStatus.style.color = 'var(--success)';
    
    renderContactLinksScreen();
}

function completeMonthlyUnlockProcess(password, monthlyPassword) {
    rememberPassword('monthly', password, { 
        duration: monthlyPassword.duration,
        expiry: monthlyPassword.endTime || new Date(Date.now() + monthlyPassword.duration * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    unlockAllContentWithMonthlyPassword(monthlyPassword);
    
    if (navigator.onLine && !isOfflineMode) {
        setupUserSession(password);
    }
    
    const durationText = monthlyPassword.duration > 1 ? 
        `${monthlyPassword.duration} months` : '1 month';
    alert(`All content unlocked successfully! Access will be valid for ${durationText}.`);
}

function unlockAllContentWithMonthlyPassword(monthlyPassword) {
    isUserLoggedIn = true;
    
    document.querySelectorAll('.video-item').forEach(item => {
        if (!item.classList.contains('free')) {
            item.classList.remove('locked');
        }
    });
    
    loginStatus.textContent = `All content unlocked with ${monthlyPassword.duration}-month password!`;
    loginStatus.style.color = 'var(--success)';
    
    renderContactLinksScreen();
    
    if (monthlyPassword.endTime) {
        const endTime = new Date(monthlyPassword.endTime);
        startPasswordExpirationTimer(endTime);
        passwordTimerDisplay.style.display = 'block';
    }
}

function completeTimeUnlockProcess(password, timePassword) {
    rememberPassword('time', password, { 
        expiry: timePassword.expirationDate.toDate().toISOString() 
    });
    
    activeTimePassword = password;
    
    unlockAllContentWithTimePassword();
    
    startPasswordExpirationTimer(timePassword.expirationDate.toDate());
    
    alert(`All videos and contact links unlocked successfully! Access will expire on ${timePassword.expirationDate.toDate().toLocaleDateString()}.`);
}

function unlockAllContentWithTimePassword() {
    isUserLoggedIn = true;
    
    document.querySelectorAll('.video-item').forEach(item => {
        if (!item.classList.contains('free')) {
            item.classList.remove('locked');
        }
    });
    
    loginStatus.textContent = `All content unlocked with time-based password!`;
    loginStatus.style.color = 'var(--success)';
    
    renderContactLinksScreen();
    
    passwordTimerDisplay.style.display = 'block';
}

// Password Timer Functions
function startPasswordExpirationTimer(expirationDate) {
    if (passwordExpirationTimer) {
        clearInterval(passwordExpirationTimer);
    }
    
    updatePasswordTimer(expirationDate);
    
    passwordExpirationTimer = setInterval(() => {
        updatePasswordTimer(expirationDate);
    }, 1000);
}

function updatePasswordTimer(expirationDate) {
    const now = new Date();
    const timeLeft = expirationDate - now;
    
    if (timeLeft <= 0) {
        timerText.textContent = 'Password expired!';
        lockTimeBasedContent();
        clearInterval(passwordExpirationTimer);
        return;
    }
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    let timerString = 'Password expires in: ';
    if (days > 0) {
        timerString += `${days}d `;
    }
    timerString += `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    timerText.textContent = timerString;
}

function lockTimeBasedContent() {
    activeTimePassword = null;
    
    localStorage.removeItem('timePassword');
    localStorage.removeItem('timePasswordExpiration');
    localStorage.removeItem('monthlyPassword');
    localStorage.removeItem('monthlyPasswordExpiry');
    
    passwordTimerDisplay.style.display = 'none';
    
    isUserLoggedIn = false;
    loginStatus.textContent = 'Please enter your password to unlock all videos';
    loginStatus.style.color = 'var(--accent)';
    
    renderVideoLibraryWithDownloads();
    
    renderContactLinksScreen();
    
    alert('Your access has expired or been revoked. All content is now locked.');
}

// Password Validation Functions
function checkActiveMonthlyPassword() {
    const rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
    
    if (rememberedPasswords.monthly) {
        const monthlyData = rememberedPasswords.monthly;
        const now = new Date();
        const expiry = new Date(monthlyData.expiry);
        
        if (now < expiry) {
            const validPassword = monthlyPasswords.find(p => p.password === monthlyData.password);
            if (validPassword) {
                if (validPassword.singleDevice && validPassword.deviceId && validPassword.deviceId !== currentDeviceId) {
                    delete rememberedPasswords.monthly;
                    localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
                    return;
                }
                
                document.getElementById('password').value = monthlyData.password;
                unlockVideos();
            } else {
                delete rememberedPasswords.monthly;
                localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
            }
        } else {
            delete rememberedPasswords.monthly;
            localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
        }
    }
}

function checkActiveTimePassword() {
    const rememberedPasswords = JSON.parse(localStorage.getItem('rememberedPasswords') || '{}');
    
    if (rememberedPasswords.time) {
        const timeData = rememberedPasswords.time;
        const now = new Date();
        const expiry = new Date(timeData.expiry);
        
        if (now < expiry) {
            activeTimePassword = timeData.password;
            unlockAllContentWithTimePassword();
            startPasswordExpirationTimer(expiry);
        } else {
            delete rememberedPasswords.time;
            localStorage.setItem('rememberedPasswords', JSON.stringify(rememberedPasswords));
        }
    }
}

// User Session Management
function setupUserSession(password) {
    if (!navigator.onLine || isOfflineMode) return;
    
    userSessionRef = rtdb.ref('userSessions/' + password + '/' + currentDeviceId);
    
    userSessionRef.set({
        loginTime: new Date().toISOString(),
        lastActive: firebase.database.ServerValue.TIMESTAMP,
        deviceInfo: navigator.userAgent,
        online: true
    });
    
    setInterval(() => {
        if (userSessionRef && navigator.onLine && !isOfflineMode) {
            userSessionRef.update({
                lastActive: firebase.database.ServerValue.TIMESTAMP,
                online: true
            });
        }
    }, 30000);
    
    userSessionRef.onDisconnect().update({
        online: false,
        lastActive: firebase.database.ServerValue.TIMESTAMP
    });
}

// Screen Navigation
function showScreen(screenNumber) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    
    document.getElementById(`screen${screenNumber}`).classList.add('active');
}

// Contact Links Rendering
function renderContactLinksScreen() {
    contactLinksScreenList.innerHTML = '';
    
    contactLinksData.forEach(link => {
        const isFree = link.accessType === 'free';
        const isUnlocked = isUserLoggedIn || 
            (!link.storyName) || 
            (link.storyName && unlockedStories.includes(link.storyName)) ||
            activeTimePassword;
        
        if (isFree || isUnlocked) {
            const linkItem = document.createElement('div');
            linkItem.className = 'video-item';
            
            let icon = '';
            let btnClass = 'contact-btn ';
            switch(link.type) {
                case 'facebook':
                    icon = '<i class="fab fa-facebook-f"></i>';
                    btnClass += 'facebook-btn';
                    break;
                case 'telegram':
                    icon = '<i class="fab fa-telegram"></i>';
                    btnClass += 'telegram-btn';
                    break;
                case 'viber':
                    icon = '<i class="fab fa-viber"></i>';
                    btnClass += 'viber-btn';
                    break;
                default:
                    icon = '<i class="fas fa-link"></i>';
                    btnClass += 'other-btn';
            }
            
            linkItem.innerHTML = `
                <div style="flex: 1;">
                    <h4 style="font-size: 9px;">${link.name}</h4>
                    <p style="font-size: 8px;">${link.type.charAt(0).toUpperCase() + link.type.slice(1)} ${link.storyName ? `• ${link.storyName}` : ''}</p>
                </div>
                <a href="${link.url}" target="_blank" class="${btnClass}">${icon} Open</a>
            `;
            
            contactLinksScreenList.appendChild(linkItem);
        }
    });
}

// Story Menu Toggle
function toggleStoryMenu() {
    storyMenu.classList.toggle('active');
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.story-collection-menu') && storyMenu.classList.contains('active')) {
        storyMenu.classList.remove('active');
    }
});

// Connection Status Management
function updateConnectionStatus() {
    if (navigator.onLine) {
        connectionStatus.className = 'connection-status online-status-badge';
        connectionStatus.innerHTML = '<i class="fas fa-wifi"></i> Online';
        connectionStatus.style.display = 'flex';
        isOfflineMode = false;
        
        const offlineIndicator = document.querySelector('.offline-indicator');
        if (offlineIndicator) {
            offlineIndicator.remove();
        }
    } else {
        connectionStatus.className = 'connection-status offline-status-badge';
        connectionStatus.innerHTML = '<i class="fas fa-wifi-slash"></i> Offline';
        connectionStatus.style.display = 'flex';
        isOfflineMode = true;
        
        if (!document.querySelector('.offline-indicator')) {
            const offlineIndicator = document.createElement('div');
            offlineIndicator.className = 'offline-indicator';
            offlineIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> You are currently offline';
            document.body.appendChild(offlineIndicator);
        }
        
        const hasDownloadedVideos = checkOfflineVideos();
        if (!hasDownloadedVideos) {
            setTimeout(() => {
                noInternetModal.style.display = 'flex';
            }, 1000);
        }
    }
    
    renderVideoLibraryWithDownloads();
}

function checkOfflineVideos() {
    const downloadedVideos = JSON.parse(localStorage.getItem('downloadedVideos') || '{}');
    
    const now = new Date();
    let hasExpired = false;
    
    Object.keys(downloadedVideos).forEach(videoId => {
        if (downloadedVideos[videoId].expires && new Date(downloadedVideos[videoId].expires) < now) {
            if (downloadedVideos[videoId].storagePath) {
                deleteFromSecureStorage(downloadedVideos[videoId].storagePath);
            }
            delete downloadedVideos[videoId];
            hasExpired = true;
        }
    });
    
    if (hasExpired) {
        localStorage.setItem('downloadedVideos', JSON.stringify(downloadedVideos));
    }
    
    if (Object.keys(downloadedVideos).length > 0) {
        downloadedVideosSection.style.display = 'block';
        renderDownloadedVideosSection();
    }
    
    return Object.keys(downloadedVideos).length > 0;
}

// Style Mode Management
function setStyleMode(mode) {
    document.body.classList.remove('normal-mode', 'digital-mode', 'dark-mode');
    document.body.classList.add(`${mode}-mode`);
    
    normalModeBtn.classList.remove('active');
    digitalModeBtn.classList.remove('active');
    darkModeBtn.classList.remove('active');
    
    if (mode === 'normal') {
        normalModeBtn.classList.add('active');
        document.querySelector('.digital-bg').style.display = 'none';
        document.querySelector('.digital-grid').style.display = 'none';
        document.querySelector('.digital-particles').style.display = 'none';
    } else if (mode === 'digital') {
        digitalModeBtn.classList.add('active');
        document.querySelector('.digital-bg').style.display = 'block';
        document.querySelector('.digital-grid').style.display = 'block';
        document.querySelector('.digital-particles').style.display = 'block';
        createEnhancedParticles();
    } else if (mode === 'dark') {
        darkModeBtn.classList.add('active');
        document.querySelector('.digital-bg').style.display = 'none';
        document.querySelector('.digital-grid').style.display = 'none';
        document.querySelector('.digital-particles').style.display = 'none';
    }
    
    localStorage.setItem('preferredStyleMode', mode);
}

function initStyleSelector() {
    setStyleMode('digital');
    
    normalModeBtn.addEventListener('click', () => setStyleMode('normal'));
    digitalModeBtn.addEventListener('click', () => setStyleMode('digital'));
    darkModeBtn.addEventListener('click', () => setStyleMode('dark'));
}

// Event Listeners
unlockVideosBtn.addEventListener('click', unlockVideos);
unlockStoryBtn.addEventListener('click', unlockStory);
showContactLinksScreen.addEventListener('click', () => showScreen(4));
backToScreen1FromContacts.addEventListener('click', () => showScreen(1));
storyMenuToggle.addEventListener('click', toggleStoryMenu);

continueOfflineBtn.addEventListener('click', function() {
    noInternetModal.style.display = 'none';
    
    const hasDownloadedVideos = checkOfflineVideos();
    if (hasDownloadedVideos) {
        renderDownloadedVideosSection();
        alert('You can access your downloaded videos in the "Downloaded Videos" section.');
    } else {
        alert('No downloaded videos available. Please connect to the internet to download videos.');
    }
});

closeNoInternetModal.addEventListener('click', () => {
    noInternetModal.style.display = 'none';
});

// Security Measures
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME' || e.target.tagName === 'IMG') {
        e.preventDefault();
        return false;
    }
});

document.addEventListener('keydown', function(e) {
    if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 73) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 74) ||
        (e.ctrlKey && e.shiftKey && e.keyCode === 67) ||
        (e.ctrlKey && e.keyCode === 85)
    ) {
        e.preventDefault();
        return false;
    }
});

// Initialize Application
initApp();
initStyleSelector();