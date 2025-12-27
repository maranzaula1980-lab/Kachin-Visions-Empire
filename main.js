// =========================================================================
// INITIALIZATION - Android Optimized
// =========================================================================
document.addEventListener('DOMContentLoaded', function() {
    // Prevent double initialization
    if (appState.isInitialized) return;
    
    console.log('🚀 Starting QuickChat Messenger for Android...');
    
    // Initialize immediately to avoid loading issues
    initializeApp();
});

async function initializeApp() {
    try {
        // Show loader immediately
        document.getElementById('loader').style.display = 'flex';
        
        // Initialize Supabase with Android-optimized settings
        appState.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: false,
                storage: localStorage,
                storageKey: 'quickchat_auth'
            },
            realtime: {
                params: {
                    eventsPerSecond: 5 // Reduced for Android performance
                }
            },
            global: {
                headers: {
                    'X-Client-Info': 'quickchat-android-web'
                }
            }
        });

        // Load user settings
        loadUserSettings();

        // Setup event handlers for Android
        setupAndroidEventHandlers();

        // Check for PWA installation
        setupPWA();

        // Check connection with timeout for Android
        await verifyConnectionWithTimeout();

        // Check for existing session
        const savedSession = getSavedSession();
        if (savedSession) {
            await restoreSession(savedSession);
        } else {
            showAuthScreen();
        }

        appState.isInitialized = true;
        console.log('✅ QuickChat initialized successfully');

    } catch (error) {
        console.error('❌ Initialization error:', error);
        showError('Failed to initialize. Please check your connection and refresh.');
        showAuthScreen(); // Fallback to auth screen
    } finally {
        // Always hide loader after initialization
        setTimeout(hideLoader, 500);
    }
}

// =========================================================================
// ANDROID-SPECIFIC OPTIMIZATIONS
// =========================================================================
function setupAndroidEventHandlers() {
    // Prevent zoom on double tap
    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = Date.now();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, { passive: false });

    // Handle Android back button
    document.addEventListener('backbutton', function(e) {
        if (document.getElementById('chatPage').classList.contains('active')) {
            e.preventDefault();
            goBackToChats();
        }
    }, false);

    // Handle Android keyboard events
    window.addEventListener('resize', handleAndroidKeyboard);
    
    // Prevent pull-to-refresh on Android
    document.addEventListener('touchmove', function(e) {
        if (e.scale !== 1) {
            e.preventDefault();
        }
    }, { passive: false });

    // Improved touch feedback for Android
    document.addEventListener('touchstart', function() {}, { passive: true });
    
    // Online/offline detection for Android
    window.addEventListener('online', handleAndroidOnlineStatus);
    window.addEventListener('offline', handleAndroidOnlineStatus);
    
    // Handle page visibility for Android
    document.addEventListener('visibilitychange', handleAndroidVisibility);
    
    // Prevent context menu on long press
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
}

function handleAndroidKeyboard() {
    const isKeyboardOpen = window.innerHeight < window.outerHeight * 0.8;
    const chatMessages = document.getElementById('chatMessages');
    const messageInputArea = document.querySelector('.message-input-area');
    
    if (isKeyboardOpen && chatMessages && messageInputArea) {
        // Scroll to bottom when keyboard opens
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
            messageInputArea.style.bottom = 'calc(60px + 50vh)';
        }, 300);
    } else if (messageInputArea) {
        messageInputArea.style.bottom = '60px';
    }
}

function handleAndroidOnlineStatus() {
    const isOnline = navigator.onLine;
    appState.isOnline = isOnline;
    
    if (isOnline) {
        updateConnectionStatus(true);
        showToast('Back online', 'success');
        // Reinitialize realtime connection
        if (appState.currentUser) {
            setTimeout(() => setupRealtimeSubscriptions(), 1000);
        }
    } else {
        updateConnectionStatus(false);
        showToast('You are offline', 'error');
    }
}

function handleAndroidVisibility() {
    if (appState.currentUser) {
        const isVisible = !document.hidden;
        updateUserPresence(isVisible);
        
        if (isVisible && appState.isOnline) {
            // Refresh data when app becomes visible
            setTimeout(() => {
                refreshOnlineUsers();
                loadUserChats();
            }, 500);
    }
}
}

async function verifyConnectionWithTimeout() {
    return new Promise((resolve) => {
        const timeout = setTimeout(() => {
            console.log('Connection check timeout - proceeding anyway');
            resolve(false);
        }, 5000); // 5 second timeout for Android

        verifyConnection().then((connected) => {
            clearTimeout(timeout);
            resolve(connected);
        }).catch(() => {
            clearTimeout(timeout);
            resolve(false);
        });
    });
}

// =========================================================================
// CONNECTION MANAGEMENT - Android Optimized
// =========================================================================
async function verifyConnection() {
    try {
        // Simple ping to check connection
        const { data, error } = await appState.supabase
            .from('users')
            .select('count')
            .limit(1)
            .single();

        if (error) {
            console.warn('Connection check failed:', error.message);
            updateConnectionStatus(false);
            return false;
        }

        updateConnectionStatus(true);
        return true;

    } catch (error) {
        console.error('Connection verification failed:', error);
        updateConnectionStatus(false);
        return false;
    }
}

function updateConnectionStatus(connected) {
    const statusEl = document.getElementById('connectionStatus');
    if (!statusEl) return;
    
    appState.isOnline = connected;
    
    if (connected) {
        statusEl.textContent = 'Connected';
        statusEl.className = 'connection-status online';
        setTimeout(() => {
            statusEl.style.display = 'none';
        }, 2000);
    } else {
        statusEl.textContent = 'Disconnected - Check your connection';
        statusEl.className = 'connection-status offline';
        statusEl.style.display = 'block';
    }
}

// =========================================================================
// SESSION MANAGEMENT - Android Storage Optimized
// =========================================================================
function getSavedSession() {
    try {
        const sessionData = localStorage.getItem('quickchat_session');
        if (!sessionData) return null;
        
        const session = JSON.parse(sessionData);
        
        // Check if session is expired (24 hours)
        const now = Date.now();
        const sessionTime = session.timestamp || 0;
        const hoursDiff = (now - sessionTime) / (1000 * 60 * 60);
        
        if (hoursDiff > 24) {
            localStorage.removeItem('quickchat_session');
            return null;
        }
        
        return session.user;
    } catch (error) {
        console.warn('Failed to parse saved session:', error);
        localStorage.removeItem('quickchat_session');
        return null;
    }
}

function saveSession(user) {
    try {
        const sessionData = {
            user: user,
            timestamp: Date.now()
        };
        localStorage.setItem('quickchat_session', JSON.stringify(sessionData));
    } catch (error) {
        console.error('Failed to save session:', error);
    }
}

function clearSession() {
    try {
        localStorage.removeItem('quickchat_session');
        localStorage.removeItem('quickchat_auth');
    } catch (error) {
        console.warn('Failed to clear session:', error);
    }
}

async function restoreSession(savedUser) {
    try {
        // Verify user still exists
        const { data: user, error } = await appState.supabase
            .from('users')
            .select('*')
            .eq('id', savedUser.id)
            .single();

        if (error || !user) {
            clearSession();
            showAuthScreen();
            return;
        }

        appState.currentUser = user;
        await startApplication();

    } catch (error) {
        console.error('Session restoration failed:', error);
        showAuthScreen();
    }
}

// =========================================================================
// AUTHENTICATION - Android Optimized
// =========================================================================
function showAuthScreen() {
    document.getElementById('loader').style.display = 'none';
    document.getElementById('authScreen').style.display = 'block';
    document.getElementById('appWrapper').style.display = 'none';
    showAuthForm('login');
    
    // Auto-focus on username input
    setTimeout(() => {
        const usernameInput = document.getElementById('loginUsername');
        if (usernameInput) {
            usernameInput.focus();
            // Scroll input into view on Android
            usernameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

function showAuthForm(formType) {
    // Update tabs with smooth transition
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.auth-form').forEach(form => {
        form.style.opacity = '0';
        form.classList.remove('active');
    });

    // Show selected form
    setTimeout(() => {
        if (formType === 'login') {
            document.querySelectorAll('.auth-tab')[0].classList.add('active');
            document.getElementById('loginForm').classList.add('active');
            document.getElementById('loginForm').style.opacity = '1';
            
            // Auto-focus
            setTimeout(() => {
                const usernameInput = document.getElementById('loginUsername');
                if (usernameInput) usernameInput.focus();
            }, 50);
        } else {
            document.querySelectorAll('.auth-tab')[1].classList.add('active');
            document.getElementById('signupForm').classList.add('active');
            document.getElementById('signupForm').style.opacity = '1';
            
            // Auto-focus
            setTimeout(() => {
                const usernameInput = document.getElementById('signupUsername');
                if (usernameInput) usernameInput.focus();
            }, 50);
        }
    }, 50);

    // Clear messages
    ['loginError', 'loginSuccess', 'signupError', 'signupSuccess'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.display = 'none';
            el.textContent = '';
        }
    });
}

async function handleLogin() {
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    const errorEl = document.getElementById('loginError');
    const btn = document.getElementById('loginBtn');

    if (!username || !password) {
        showAlert(errorEl, 'Please enter username and password');
        return;
    }

    // Android: Hide keyboard
    document.activeElement?.blur();

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';

    try {
        // Find user with timeout for Android
        const { data: user, error } = await Promise.race([
            appState.supabase
                .from('users')
                .select('*')
                .eq('username', username)
                .eq('password', password)
                .single(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            )
        ]);

        if (error || !user) {
            throw new Error('Invalid username or password');
        }

        // Save session
        appState.currentUser = user;
        saveSession(user);

        // Update online status
        await updateUserPresence(true);

        // Start application
        await startApplication();

        showToast(`Welcome back, ${user.display_name || user.username}!`, 'success');

    } catch (error) {
        console.error('Login error:', error);
        showAlert(errorEl, error.message || 'Login failed. Check connection.');
        btn.disabled = false;
        btn.innerHTML = '<span>Sign In</span>';
    }
}

async function handleSignup() {
    const username = document.getElementById('signupUsername').value.trim();
    const password = document.getElementById('signupPassword').value;
    const displayName = document.getElementById('signupDisplayName').value.trim() || username;
    const phone = document.getElementById('signupPhone').value.trim();
    const errorEl = document.getElementById('signupError');
    const successEl = document.getElementById('signupSuccess');
    const btn = document.getElementById('signupBtn');

    if (!username || !password) {
        showAlert(errorEl, 'Username and password are required');
        return;
    }

    if (username.length < 3) {
        showAlert(errorEl, 'Username must be at least 3 characters');
        return;
    }

    if (password.length < 6) {
        showAlert(errorEl, 'Password must be at least 6 characters');
        return;
    }

    // Android: Hide keyboard
    document.activeElement?.blur();

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';

    try {
        // Check username availability with timeout
        const { data: existingUser } = await Promise.race([
            appState.supabase
                .from('users')
                .select('id')
                .eq('username', username)
                .single(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Request timeout')), 10000)
            )
        ]);

        if (existingUser) {
            throw new Error('Username already taken');
        }

        // Create user
        const { data: user, error } = await appState.supabase
            .from('users')
            .insert({
                username: username,
                password: password,
                display_name: displayName,
                phone: phone,
                role: 'user',
                last_seen: new Date().toISOString()
            })
            .select()
            .single();

        if (error) throw error;

        // Show success message
        showAlert(successEl, 'Account created successfully!');

        // Auto login after delay
        setTimeout(async () => {
            appState.currentUser = user;
            saveSession(user);
            await startApplication();
            showToast('Welcome to QuickChat!', 'success');
        }, 1500);

    } catch (error) {
        console.error('Signup error:', error);
        showAlert(errorEl, error.message || 'Registration failed. Try again.');
        btn.disabled = false;
        btn.innerHTML = '<span>Create Account</span>';
    }
}

// =========================================================================
// APPLICATION CORE - Android Optimized
// =========================================================================
async function startApplication() {
    console.log('Starting application for:', appState.currentUser.username);

    // Hide auth, show app with transition
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appWrapper').style.display = 'flex';
    document.getElementById('appWrapper').style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById('appWrapper').style.opacity = '1';
    }, 50);

    // Initialize UI
    updateUserInterface();
    
    // Load initial data with progress indication
    await loadInitialData();

    // Setup real-time features (optimized for Android)
    setupRealtimeSubscriptions();
    
    // Start polling services (reduced frequency for Android)
    startPollingServices();

    // Hide install banner if shown
    hideInstallBanner();
    
    // Android: Add splash screen behavior
    setTimeout(() => {
        document.getElementById('loader').style.display = 'none';
    }, 500);
}

function updateUserInterface() {
    const user = appState.currentUser;
    if (!user) return;

    // Update header
    const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
    document.getElementById('userAvatar').textContent = firstLetter;
    document.getElementById('userAvatar').style.background = getUserColor(user);
    document.getElementById('userName').textContent = user.display_name || user.username;
    document.getElementById('userStatus').textContent = 'Online';

    // Update profile
    document.getElementById('profileAvatarLarge').textContent = firstLetter;
    document.getElementById('profileAvatarLarge').style.background = getUserColor(user);
    document.getElementById('profileName').textContent = user.display_name || user.username;
    document.getElementById('profileUsername').textContent = '@' + user.username;
}

async function loadInitialData() {
    try {
        // Show loading state
        const chatsList = document.getElementById('chatsList');
        const contactsList = document.getElementById('contactsList');
        
        if (chatsList) {
            chatsList.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <div class="loader-spinner" style="width: 30px; height: 30px; margin: 0 auto 15px;"></div>
                    <p style="color: #666;">Loading chats...</p>
                </div>
            `;
        }
        
        if (contactsList) {
            contactsList.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <div class="loader-spinner" style="width: 30px; height: 30px; margin: 0 auto 15px;"></div>
                    <p style="color: #666;">Loading contacts...</p>
                </div>
            `;
        }

        // Load data in parallel with timeout
        await Promise.all([
            loadAllUsers().catch(err => console.error('Failed to load users:', err)),
            loadUserChats().catch(err => console.error('Failed to load chats:', err)),
            refreshOnlineUsers().catch(err => console.error('Failed to refresh online users:', err))
        ]);
        
        // Update stats
        updateStatistics();

    } catch (error) {
        console.error('Failed to load initial data:', error);
        showToast('Failed to load data', 'error');
    }
}

// =========================================================================
// USER MANAGEMENT
// =========================================================================
async function loadAllUsers() {
    try {
        const { data, error } = await appState.supabase
            .from('users')
            .select('*')
            .neq('id', appState.currentUser.id)
            .order('display_name');

        if (error) throw error;

        appState.users = data || [];
        renderContactsList();

    } catch (error) {
        console.error('Failed to load users:', error);
        throw error;
    }
}

async function refreshOnlineUsers() {
    try {
        const { data, error } = await appState.supabase
            .from('users')
            .select('id, last_seen')
            .neq('id', appState.currentUser.id);

        if (error) throw error;

        appState.onlineUsers.clear();
        const now = new Date();

        if (data) {
            data.forEach(user => {
                const lastSeen = new Date(user.last_seen);
                const minutesDiff = (now - lastSeen) / (1000 * 60);
                
                if (minutesDiff < 5) { // Online within 5 minutes (increased for Android)
                    appState.onlineUsers.add(user.id);
                }
            });
        }

        updateOnlineStatusIndicators();

    } catch (error) {
        console.error('Failed to refresh online users:', error);
    }
}

async function updateUserPresence(isOnline) {
    if (!appState.currentUser) return;

    try {
        await appState.supabase
            .from('users')
            .update({
                last_seen: new Date().toISOString()
            })
            .eq('id', appState.currentUser.id);

    } catch (error) {
        console.error('Failed to update presence:', error);
    }
}

// =========================================================================
// CHAT MANAGEMENT - Android Optimized
// =========================================================================
async function loadUserChats() {
    try {
        const { data: allMessages, error } = await appState.supabase
            .from('messages')
            .select('*')
            .or(`sender_id.eq.${appState.currentUser.id},receiver_id.eq.${appState.currentUser.id}`)
            .order('created_at', { ascending: false })
            .limit(50); // Limit for Android performance

        if (error) throw error;

        // Organize chats by contact
        const chatMap = new Map();

        if (allMessages) {
            allMessages.forEach(msg => {
                const contactId = msg.sender_id === appState.currentUser.id 
                    ? msg.receiver_id 
                    : msg.sender_id;

                if (!chatMap.has(contactId)) {
                    chatMap.set(contactId, {
                        lastMessage: msg,
                        unreadCount: msg.sender_id !== appState.currentUser.id && !msg.read ? 1 : 0,
                        totalMessages: 1
                    });
                } else {
                    const chat = chatMap.get(contactId);
                    if (msg.sender_id !== appState.currentUser.id && !msg.read) {
                        chat.unreadCount++;
                    }
                    chat.totalMessages++;
                }
            });
        }

        renderChatsList(chatMap);

    } catch (error) {
        console.error('Failed to load chats:', error);
        throw error;
    }
}

async function loadChatMessages(contactId) {
    try {
        // Show loading indicator
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div style="text-align: center; padding: 50px;">
                    <div class="loader-spinner" style="width: 30px; height: 30px; margin: 0 auto 15px;"></div>
                    <p style="color: #666;">Loading messages...</p>
                </div>
            `;
        }

        const { data, error } = await appState.supabase
            .from('messages')
            .select('*')
            .or(`and(sender_id.eq.${appState.currentUser.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${appState.currentUser.id})`)
            .order('created_at', { ascending: true })
            .limit(100); // Limit for Android performance

        if (error) throw error;

        appState.messages[contactId] = data || [];
        renderChatMessages();

        // Mark messages as read
        await markMessagesRead(contactId);

    } catch (error) {
        console.error('Failed to load messages:', error);
        throw error;
    }
}

async function sendMessage() {
    if (!appState.isOnline) {
        showToast('No internet connection', 'error');
        return;
    }

    const input = document.getElementById('messageInput');
    const message = input.value.trim();

    if (!message || !appState.activeChat) return;

    // Android: Hide keyboard temporarily
    input.blur();

    const btn = document.getElementById('sendBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';

    try {
        const newMessage = {
            sender_id: appState.currentUser.id,
            receiver_id: appState.activeChat.id,
            message: message,
            read: false,
            created_at: new Date().toISOString()
        };

        // Optimistic UI update
        addMessageToChat(newMessage, true);
        input.value = '';
        adjustTextarea(input);

        // Send to server with timeout
        const { data, error } = await Promise.race([
            appState.supabase
                .from('messages')
                .insert([newMessage])
                .select()
                .single(),
            new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Send timeout')), 10000)
            )
        ]);

        if (error) throw error;

        // Update local state
        if (!appState.messages[appState.activeChat.id]) {
            appState.messages[appState.activeChat.id] = [];
        }
        appState.messages[appState.activeChat.id].push(data);

        // Play sound if enabled
        playNotification();

        // Android: Restore keyboard focus
        setTimeout(() => input.focus(), 100);

    } catch (error) {
        console.error('Failed to send message:', error);
        showToast('Failed to send message', 'error');
        
        // Remove optimistic message
        const messagesContainer = document.getElementById('chatMessages');
        const lastMessage = messagesContainer.lastElementChild;
        if (lastMessage && lastMessage.classList.contains('sent')) {
            lastMessage.remove();
        }
        
        // Android: Restore input
        input.value = message;
        setTimeout(() => input.focus(), 100);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i>';
    }
}

async function markMessagesRead(contactId) {
    try {
        await appState.supabase
            .from('messages')
            .update({ read: true })
            .eq('receiver_id', appState.currentUser.id)
            .eq('sender_id', contactId)
            .eq('read', false)
            .limit(50); // Limit for performance

    } catch (error) {
        console.error('Failed to mark messages as read:', error);
    }
}

// =========================================================================
// REAL-TIME SUBSCRIPTIONS - Android Optimized
// =========================================================================
function setupRealtimeSubscriptions() {
    // Clean up existing subscriptions
    appState.subscriptions.forEach(sub => {
        try {
            appState.supabase.removeChannel(sub);
        } catch (e) {
            console.warn('Failed to remove subscription:', e);
        }
    });
    appState.subscriptions = [];

    // Only setup if online
    if (!appState.isOnline) return;

    try {
        // Subscribe to new messages (simplified for Android)
        const messagesSub = appState.supabase
            .channel('messages-' + appState.currentUser.id)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'messages',
                filter: `receiver_id=eq.${appState.currentUser.id}`
            }, (payload) => {
                handleIncomingMessage(payload.new);
            })
            .subscribe((status) => {
                console.log('Realtime subscription status:', status);
            });

        appState.subscriptions.push(messagesSub);

        // Subscribe to user presence updates
        const presenceSub = appState.supabase
            .channel('presence-updates')
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'users'
            }, async (payload) => {
                if (payload.new.id !== appState.currentUser.id) {
                    await refreshOnlineUsers();
                    updateStatistics();
                }
            })
            .subscribe();

        appState.subscriptions.push(presenceSub);

    } catch (error) {
        console.error('Failed to setup realtime subscriptions:', error);
        // Fall back to polling only
    }
}

function handleIncomingMessage(message) {
    // If message is from active chat
    if (appState.activeChat && appState.activeChat.id === message.sender_id) {
        addMessageToChat(message, false);
        
        // Add to local messages
        if (!appState.messages[message.sender_id]) {
            appState.messages[message.sender_id] = [];
        }
        appState.messages[message.sender_id].push(message);
        
        // Mark as read
        markMessagesRead(message.sender_id);
        
        // Play notification
        playNotification();
    } else {
        // Show notification
        showMessageNotification(message);
        playNotification();
    }
    
    // Refresh chats list
    loadUserChats();
}

// =========================================================================
// POLLING SERVICES - Android Optimized (Reduced Frequency)
// =========================================================================
function startPollingServices() {
    // Clear existing intervals
    if (appState.pollingInterval) clearInterval(appState.pollingInterval);
    if (appState.connectionCheckInterval) clearInterval(appState.connectionCheckInterval);

    // Poll for updates every 10 seconds (increased for Android battery)
    appState.pollingInterval = setInterval(async () => {
        if (appState.currentUser && appState.isOnline) {
            try {
                await checkForNewMessages();
                await refreshOnlineUsers();
                await updateUserPresence(true);
                updateStatistics();
            } catch (error) {
                console.warn('Polling error:', error);
            }
        }
    }, 10000);

    // Check connection every 30 seconds
    appState.connectionCheckInterval = setInterval(async () => {
        const connected = await verifyConnection();
        if (!connected && appState.isOnline) {
            showToast('Connection lost. Reconnecting...', 'error');
            appState.isOnline = false;
        } else if (connected && !appState.isOnline) {
            appState.isOnline = true;
            showToast('Back online', 'success');
        }
    }, 30000);
}

async function checkForNewMessages() {
    if (!appState.isOnline) return;
    
    try {
        const { data: newMessages, error } = await appState.supabase
            .from('messages')
            .select('*')
            .eq('receiver_id', appState.currentUser.id)
            .eq('read', false)
            .order('created_at', { ascending: true })
            .limit(20); // Limit for performance

        if (error) throw error;

        if (newMessages && newMessages.length > 0) {
            const grouped = {};
            newMessages.forEach(msg => {
                if (!grouped[msg.sender_id]) {
                    grouped[msg.sender_id] = [];
                }
                grouped[msg.sender_id].push(msg);
            });

            for (const senderId in grouped) {
                const messages = grouped[senderId];
                
                if (appState.activeChat && appState.activeChat.id === senderId) {
                    messages.forEach(msg => {
                        if (!appState.messages[senderId] || 
                            !appState.messages[senderId].find(m => m.id === msg.id)) {
                            addMessageToChat(msg, false);
                            if (!appState.messages[senderId]) {
                                appState.messages[senderId] = [];
                            }
                            appState.messages[senderId].push(msg);
                        }
                    });
                    
                    await markMessagesRead(senderId);
                } else {
                    showMessageNotification(messages[0]);
                }
            }
            
            await loadUserChats();
        }

    } catch (error) {
        console.error('Failed to check for new messages:', error);
    }
}

// =========================================================================
// UI RENDERING - Android Optimized
// =========================================================================
function renderContactsList() {
    const container = document.getElementById('contactsList');
    if (!container) return;

    if (appState.users.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <i class="fas fa-user-plus" style="font-size: 40px; margin-bottom: 15px; color: #ddd;"></i>
                <p>No contacts available</p>
                <p style="font-size: 13px; margin-top: 8px;">Other users will appear here</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    appState.users.forEach(user => {
        const isOnline = appState.onlineUsers.has(user.id);
        const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
        
        const div = document.createElement('div');
        div.className = 'contact-item';
        div.onclick = () => startChat(user);
        
        div.innerHTML = `
            <div class="contact-avatar" style="background: ${getUserColor(user)}">
                ${firstLetter}
            </div>
            <div class="contact-info">
                <div class="contact-name">${escapeHtml(user.display_name || user.username)}</div>
                <div class="contact-status">
                    <span class="status-text">${escapeHtml(user.role || 'User')}</span>
                    ${isOnline ? '<span class="online-dot"></span>' : ''}
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

function renderChatsList(chatMap) {
    const container = document.getElementById('chatsList');
    if (!container) return;

    if (chatMap.size === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 50px; color: #666;">
                <i class="fas fa-comments" style="font-size: 40px; margin-bottom: 15px; color: #ddd;"></i>
                <p>No conversations yet</p>
                <p style="font-size: 13px; margin-top: 8px;">Start chatting with contacts</p>
            </div>
        `;
        return;
    }

    container.innerHTML = '';
    
    Array.from(chatMap.entries()).forEach(([contactId, chat]) => {
        const user = appState.users.find(u => u.id === contactId);
        if (!user) return;

        const isOnline = appState.onlineUsers.has(contactId);
        const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
        const lastMsg = chat.lastMessage;
        const time = formatTime(lastMsg.created_at);
        const preview = lastMsg.message.length > 30 
            ? lastMsg.message.substring(0, 30) + '...' 
            : lastMsg.message;
        const isFromMe = lastMsg.sender_id === appState.currentUser.id;
        
        const div = document.createElement('div');
        div.className = `chat-card ${chat.unreadCount > 0 ? 'unread' : ''}`;
        div.onclick = () => startChat(user);
        
        div.innerHTML = `
            <div class="chat-avatar" style="background: ${getUserColor(user)}">
                ${firstLetter}
            </div>
            <div class="chat-details">
                <div class="chat-header">
                    <div class="chat-name">${escapeHtml(user.display_name || user.username)}</div>
                    <div class="chat-time">${time}</div>
                </div>
                <div class="chat-preview">
                    <div class="chat-message">${isFromMe ? 'You: ' : ''}${escapeHtml(preview)}</div>
                    ${chat.unreadCount > 0 ? 
                        `<div class="chat-badge">${chat.unreadCount}</div>` : ''}
                </div>
            </div>
        `;
        
        container.appendChild(div);
    });
}

function renderChatMessages() {
    const container = document.getElementById('chatMessages');
    if (!container || !appState.activeChat || !appState.messages[appState.activeChat.id]) {
        return;
    }

    container.innerHTML = '';
    
    let currentDate = '';
    const messages = appState.messages[appState.activeChat.id];
    
    // Group messages by date for better performance
    const messagesByDate = {};
    messages.forEach(msg => {
        const date = formatDate(msg.created_at);
        if (!messagesByDate[date]) {
            messagesByDate[date] = [];
        }
        messagesByDate[date].push(msg);
    });
    
    // Render grouped messages
    Object.keys(messagesByDate).forEach(date => {
        const dateDiv = document.createElement('div');
        dateDiv.style.textAlign = 'center';
        dateDiv.style.margin = '15px 0';
        dateDiv.style.color = '#999';
        dateDiv.style.fontSize = '12px';
        dateDiv.style.fontWeight = '500';
        dateDiv.textContent = date;
        container.appendChild(dateDiv);
        
        messagesByDate[date].forEach(msg => {
            addMessageToChat(msg, false);
        });
    });

    // Scroll to bottom with smooth animation
    setTimeout(() => {
        container.scrollTo({
            top: container.scrollHeight,
            behavior: 'smooth'
        });
    }, 100);
}

function addMessageToChat(message, isOptimistic) {
    const container = document.getElementById('chatMessages');
    if (!container) return;

    // Remove placeholder if exists
    const placeholder = container.querySelector('div[style*="text-align: center"]');
    if (placeholder && container.children.length > 1) {
        placeholder.remove();
    }

    const isSent = message.sender_id === appState.currentUser.id;
    const time = formatTime(message.created_at);
    
    const groupDiv = document.createElement('div');
    groupDiv.className = `message-group ${isSent ? 'sent' : 'received'}`;
    if (isOptimistic) {
        groupDiv.style.opacity = '0.7';
    }
    
    groupDiv.innerHTML = `
        <div class="message">
            ${escapeHtml(message.message)}
            <div class="message-time">${time}</div>
        </div>
    `;
    
    // Use requestAnimationFrame for smoother rendering
    requestAnimationFrame(() => {
        container.appendChild(groupDiv);
        
        // Scroll to bottom
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    });
}

function startChat(user) {
    // Android: Hide keyboard if open
    document.activeElement?.blur();
    
    appState.activeChat = user;
    
    // Update UI
    const firstLetter = (user.display_name || user.username).charAt(0).toUpperCase();
    document.getElementById('chatUserAvatar').textContent = firstLetter;
    document.getElementById('chatUserAvatar').style.background = getUserColor(user);
    document.getElementById('chatUserName').textContent = user.display_name || user.username;
    
    const isOnline = appState.onlineUsers.has(user.id);
    document.getElementById('chatUserStatus').textContent = isOnline ? 'Online' : 'Offline';
    document.querySelector('.status-dot').style.display = isOnline ? 'block' : 'none';
    
    // Enable message input
    document.getElementById('messageInput').disabled = false;
    document.getElementById('sendBtn').disabled = false;
    
    // Load messages
    loadChatMessages(user.id);
    
    // Switch to chat page with transition
    showPage('chatPage');
    
    // Android: Focus message input after delay
    setTimeout(() => {
        const messageInput = document.getElementById('messageInput');
        if (messageInput) {
            messageInput.focus();
        }
    }, 300);
}

function updateStatistics() {
    const chatCount = Object.keys(appState.messages).length;
    const contactCount = appState.users.length;
    const onlineCount = appState.onlineUsers.size;
    
    document.getElementById('chatsCount').textContent = chatCount;
    document.getElementById('contactsCount').textContent = contactCount;
    document.getElementById('onlineCount').textContent = onlineCount;
}

function updateOnlineStatusIndicators() {
    // Update status indicators throughout the app
    // This can be expanded to update specific elements as needed
}

// =========================================================================
// UTILITIES - Android Optimized
// =========================================================================
function getUserColor(user) {
    if (!user || !user.username) return '#6a11cb';
    
    const colors = [
        '#6a11cb', '#2575fc', '#ff6b6b', '#4ecdc4',
        '#ffe66d', '#1a936f', '#ff9a76', '#8a4fff',
        '#00bbf9', '#f15bb5'
    ];
    
    // Simple hash function for consistent colors
    let hash = 0;
    for (let i = 0; i < user.username.length; i++) {
        hash = user.username.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
}

function formatTime(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '--:--';
    }
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'long' });
        
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
        return '';
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function adjustTextarea(textarea) {
    // Reset height
    textarea.style.height = 'auto';
    
    // Calculate new height (max 100px)
    const newHeight = Math.min(textarea.scrollHeight, 100);
    textarea.style.height = newHeight + 'px';
    
    // Adjust chat messages padding for Android keyboard
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        const basePadding = 100;
        const additionalPadding = newHeight;
        chatMessages.style.paddingBottom = (basePadding + additionalPadding) + 'px';
        
        // Scroll to bottom when typing
        setTimeout(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 50);
    }
}

function checkSendKey(event) {
    // Android: Send on Enter (without Shift)
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
    
    // Android: Adjust textarea on input
    if (event.key !== 'Enter' || event.shiftKey) {
        setTimeout(() => adjustTextarea(event.target), 0);
    }
}

function playNotification() {
    try {
        const soundEnabled = localStorage.getItem('notificationSound') !== 'off';
        if (soundEnabled) {
            const audio = document.getElementById('notificationAudio');
            if (audio) {
                // Reset and play
                audio.currentTime = 0;
                audio.play().catch(e => {
                    console.warn('Failed to play notification sound:', e);
                });
            }
        }
    } catch (error) {
        console.error('Failed to play notification:', error);
    }
}

function showMessageNotification(message) {
    const sender = appState.users.find(u => u.id === message.sender_id);
    if (sender) {
        const preview = message.message.length > 35 
            ? message.message.substring(0, 35) + '...' 
            : message.message;
        showToast(`New message from ${sender.display_name || sender.username}: ${preview}`, 'info');
    }
}

function showAlert(element, message) {
    if (!element) return;
    element.textContent = message;
    element.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    // Remove existing toasts if too many
    while (container.children.length > 3) {
        container.removeChild(container.firstChild);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${escapeHtml(message)}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 4 seconds with fade out
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

function hideLoader() {
    const loader = document.getElementById('loader');
    if (loader) {
        loader.style.opacity = '0';
        setTimeout(() => {
            loader.style.display = 'none';
        }, 300);
    }
}

function showError(message) {
    showToast(message, 'error');
}

// =========================================================================
// NAVIGATION - Android Optimized
// =========================================================================
function showPage(pageId) {
    // Hide all pages with transition
    document.querySelectorAll('.page').forEach(page => {
        if (page.classList.contains('active')) {
            page.style.opacity = '0';
            setTimeout(() => {
                page.classList.remove('active');
                page.style.opacity = '1';
            }, 50);
        } else {
            page.classList.remove('active');
        }
    });
    
    // Show selected page
    const page = document.getElementById(pageId);
    if (page) {
        page.classList.add('active');
        page.style.opacity = '0';
        setTimeout(() => {
            page.style.opacity = '1';
        }, 50);
    }
    
    // Update nav buttons
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('active');
    });
    
    if (pageId === 'chatsPage') {
        document.querySelectorAll('.nav-item')[0]?.classList.add('active');
        // Android: Hide keyboard when switching to chats
        document.activeElement?.blur();
    } else if (pageId === 'contactsPage') {
        document.querySelectorAll('.nav-item')[1]?.classList.add('active');
    } else if (pageId === 'profilePage') {
        document.querySelectorAll('.nav-item')[2]?.classList.add('active');
    }
    
    // Reset search
    if (pageId !== 'chatsPage') {
        const search = document.getElementById('chatSearch');
        if (search) {
            search.value = '';
            // Trigger search update
            const event = new Event('input');
            search.dispatchEvent(event);
        }
    }
}

function goBackToChats() {
    showPage('chatsPage');
    appState.activeChat = null;
    
    // Reset message input
    const messageInput = document.getElementById('messageInput');
    if (messageInput) {
        messageInput.disabled = true;
        messageInput.value = '';
        adjustTextarea(messageInput);
    }
    
    const sendBtn = document.getElementById('sendBtn');
    if (sendBtn) {
        sendBtn.disabled = true;
    }
    
    // Android: Hide keyboard
    document.activeElement?.blur();
}

function toggleDarkMode() {
    const body = document.body;
    const isDark = body.classList.contains('dark-mode');
    
    if (isDark) {
        body.classList.remove('dark-mode');
        localStorage.setItem('theme', 'light');
    } else {
        body.classList.add('dark-mode');
        localStorage.setItem('theme', 'dark');
    }
    
    // Update settings dropdown
    const themeSelect = document.getElementById('themeSelect');
    if (themeSelect) {
        themeSelect.value = isDark ? 'light' : 'dark';
    }
    
    showToast(`${isDark ? 'Light' : 'Dark'} mode activated`, 'info');
}

// =========================================================================
// MODAL FUNCTIONS - Android Optimized
// =========================================================================
function showEditProfile() {
    if (!appState.currentUser) return;
    
    document.getElementById('editDisplayName').value = appState.currentUser.display_name || '';
    document.getElementById('editPhone').value = appState.currentUser.phone || '';
    
    showModal('editProfileModal');
}

function showSettings() {
    showModal('settingsModal');
}

function showHelp() {
    showModal('helpModal');
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        // Android: Prevent background scrolling
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        // Android: Restore scrolling
        document.body.style.overflow = '';
    }
}

async function updateProfile() {
    const displayName = document.getElementById('editDisplayName').value.trim();
    const phone = document.getElementById('editPhone').value.trim();
    
    if (!displayName) {
        showToast('Display name is required', 'error');
        return;
    }
    
    // Android: Hide keyboard
    document.activeElement?.blur();
    
    try {
        const { error } = await appState.supabase
            .from('users')
            .update({
                display_name: displayName,
                phone: phone
            })
            .eq('id', appState.currentUser.id);
        
        if (error) throw error;
        
        // Update local state
        appState.currentUser.display_name = displayName;
        appState.currentUser.phone = phone;
        saveSession(appState.currentUser);
        
        // Update UI
        updateUserInterface();
        await loadAllUsers();
        await loadUserChats();
        
        hideModal('editProfileModal');
        showToast('Profile updated successfully', 'success');
        
    } catch (error) {
        console.error('Failed to update profile:', error);
        showToast('Update failed. Please try again.', 'error');
    }
}

function saveSettings() {
    const sound = document.getElementById('notificationSound').value;
    const theme = document.getElementById('themeSelect').value;
    
    const settings = {
        sound: sound,
        theme: theme
    };
    
    localStorage.setItem('quickchat_settings', JSON.stringify(settings));
    localStorage.setItem('notificationSound', sound);
    
    // Apply theme
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    
    localStorage.setItem('theme', theme);
    
    hideModal('settingsModal');
    showToast('Settings saved', 'success');
}

function loadUserSettings() {
    try {
        // Load from localStorage
        const savedSettings = localStorage.getItem('quickchat_settings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            const soundSelect = document.getElementById('notificationSound');
            const themeSelect = document.getElementById('themeSelect');
            
            if (soundSelect) soundSelect.value = settings.sound || 'on';
            if (themeSelect) themeSelect.value = settings.theme || 'light';
        }
        
        // Load theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (savedTheme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.body.classList.add('dark-mode');
        }
        
        // Load notification sound setting
        const notificationSound = localStorage.getItem('notificationSound');
        const soundSelect = document.getElementById('notificationSound');
        if (soundSelect && notificationSound) {
            soundSelect.value = notificationSound;
        }
    } catch (error) {
        console.error('Failed to load settings:', error);
    }
}

// =========================================================================
// PWA FUNCTIONALITY - Android Optimized
// =========================================================================
function setupPWA() {
    // Check if app is running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        window.navigator.standalone === true;
    
    if (!isStandalone && !localStorage.getItem('installBannerHidden')) {
        // Show install banner after delay
        setTimeout(() => {
            const banner = document.getElementById('installBanner');
            if (banner) {
                banner.style.display = 'block';
                // Auto-hide after 10 seconds
                setTimeout(hideInstallBanner, 10000);
            }
        }, 5000);
    }
    
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        appState.deferredPrompt = e;
        
        // Show install button
        const banner = document.getElementById('installBanner');
        if (banner) {
            banner.style.display = 'block';
        }
    });
    
    // Generate manifest dynamically
    generateManifest();
    
    // Register service worker for offline support
    registerServiceWorker();
}

function generateManifest() {
    const manifest = {
        "name": "QuickChat Messenger",
        "short_name": "QuickChat",
        "description": "Real-time messaging application",
        "start_url": ".",
        "display": "standalone",
        "background_color": "#6a11cb",
        "theme_color": "#6a11cb",
        "orientation": "portrait",
        "icons": [
            {
                "src": "https://img.icons8.com/color/96/000000/chat.png",
                "sizes": "96x96",
                "type": "image/png",
                "purpose": "any maskable"
            },
            {
                "src": "https://img.icons8.com/color/144/000000/chat.png",
                "sizes": "144x144",
                "type": "image/png"
            },
            {
                "src": "https://img.icons8.com/color/192/000000/chat.png",
                "sizes": "192x192",
                "type": "image/png"
            },
            {
                "src": "https://img.icons8.com/color/512/000000/chat.png",
                "sizes": "512x512",
                "type": "image/png"
            }
        ]
    };
    
    // Create link to manifest
    const link = document.createElement('link');
    link.rel = 'manifest';
    link.href = 'data:application/manifest+json,' + encodeURIComponent(JSON.stringify(manifest));
    document.head.appendChild(link);
}

function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js').then(registration => {
                console.log('ServiceWorker registered:', registration.scope);
            }).catch(error => {
                console.log('ServiceWorker registration failed:', error);
            });
        });
    }
}

function installApp() {
    if (appState.deferredPrompt) {
        appState.deferredPrompt.prompt();
        appState.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the install prompt');
                showToast('Installing QuickChat...', 'success');
            }
            appState.deferredPrompt = null;
            hideInstallBanner();
        });
    } else {
        showToast('Installation not available', 'error');
    }
}

function hideInstallBanner() {
    const banner = document.getElementById('installBanner');
    if (banner) {
        banner.style.display = 'none';
    }
    localStorage.setItem('installBannerHidden', 'true');
}

// =========================================================================
// CALL FUNCTIONS (PLACEHOLDER)
// =========================================================================
function startCall() {
    if (!appState.activeChat) {
        showToast('Select a contact to call', 'error');
        return;
    }
    
    showToast(`Calling ${appState.activeChat.display_name || appState.activeChat.username}...`, 'info');
    // WebRTC implementation would go here
}

function showNotifications() {
    showToast('No new notifications', 'info');
}

// =========================================================================
// LOGOUT FUNCTIONS - Android Optimized
// =========================================================================
function confirmLogout() {
    showModal('logoutModal');
}

async function performLogout() {
    try {
        // Show loading
        const logoutBtn = document.querySelector('#logoutModal .btn[onclick="performLogout()"]');
        const originalText = logoutBtn.innerHTML;
        logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
        logoutBtn.disabled = true;

        // Update user presence
        if (appState.currentUser) {
            try {
                await appState.supabase
                    .from('users')
                    .update({
                        last_seen: new Date().toISOString()
                    })
                    .eq('id', appState.currentUser.id);
            } catch (error) {
                console.warn('Failed to update last seen status:', error);
            }
        }

        // Stop polling intervals
        if (appState.pollingInterval) {
            clearInterval(appState.pollingInterval);
            appState.pollingInterval = null;
        }
        
        if (appState.connectionCheckInterval) {
            clearInterval(appState.connectionCheckInterval);
            appState.connectionCheckInterval = null;
        }

        // Remove realtime subscriptions
        appState.subscriptions.forEach(sub => {
            try {
                appState.supabase.removeChannel(sub);
            } catch (error) {
                console.warn('Failed to remove subscription:', error);
            }
        });
        appState.subscriptions = [];

        // Reset application state
        appState.currentUser = null;
        appState.activeChat = null;
        appState.users = [];
        appState.messages = {};
        appState.onlineUsers.clear();
        appState.isInitialized = false;

        // Clear session storage
        clearSession();

        // Hide modal
        hideModal('logoutModal');

        // Show success message
        showToast('Logged out successfully', 'success');

        // Show auth screen after a short delay
        setTimeout(() => {
            showAuthScreen();
            
            // Reset form
            showAuthForm('login');
            document.getElementById('loginUsername').value = '';
            document.getElementById('loginPassword').value = '';
        }, 500);

    } catch (error) {
        console.error('Logout error:', error);
        showToast('Logout failed. Please try again.', 'error');
        
        // Reset button state
        const logoutBtn = document.querySelector('#logoutModal .btn[onclick="performLogout()"]');
        if (logoutBtn) {
            logoutBtn.innerHTML = originalText;
            logoutBtn.disabled = false;
        }
    }
}

// =========================================================================
// INITIALIZATION COMPLETE
// =========================================================================
console.log('✅ QuickChat Messenger Android version ready');

// Handle Android app state changes
document.addEventListener('pause', function() {
    console.log('App paused');
    if (appState.currentUser) {
        updateUserPresence(false);
    }
}, false);

document.addEventListener('resume', function() {
    console.log('App resumed');
    if (appState.currentUser) {
        updateUserPresence(true);
        // Refresh data
        setTimeout(() => {
            refreshOnlineUsers();
            loadUserChats();
        }, 1000);
    }
}, false);