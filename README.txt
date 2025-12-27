=============================================
QUICKCHAT MESSENGER - DEPLOYMENT INSTRUCTIONS
=============================================

FOR WEBINTOAPP.COM DEPLOYMENT:

1. Create a new project on www.webintoapp.com
2. Choose "Website to App" option
3. Set the following configurations:

APP INFORMATION:
- App Name: QuickChat Messenger
- Package Name: com.quickchat.messenger
- Version: 2.0.0

WEBSITE SETTINGS:
- Website URL: (Leave blank - we'll use local files)
- Loading Method: Load local files
- Main Page URL: index.html

PERMISSIONS (Enable these):
- Internet Access: REQUIRED
- Storage: REQUIRED
- Vibration: Optional (for notifications)
- Microphone: Optional (for future call features)
- Camera: Optional (for future photo features)

ANDROID SETTINGS:
- Target SDK: 33 (Android 13)
- Minimum SDK: 21 (Android 5.0)
- Orientation: Portrait
- Status Bar: Translucent
- Navigation Bar: Enabled

ICONS & SPLASH SCREEN:
- Use the icon from: https://img.icons8.com/color/96/000000/chat.png
- Splash Screen Background: #6a11cb
- Splash Screen Text Color: White

ADVANCED SETTINGS:
- Enable "Allow Mixed Content"
- Enable "Hardware Acceleration"
- Enable "Keep Screen On"
- WebView: Use System WebView
- JavaScript: Enabled
- Local Storage: Enabled
- Database: Enabled

4. UPLOAD FILES:
Create a ZIP file containing:
- index.html
- manifest.json
- sw.js
- README.txt

Upload this ZIP file to webintoapp.com

5. BUILD AND DOWNLOAD:
- Click "Build App"
- Wait for build to complete
- Download the APK file
- Test on Android device

SUPABASE SETUP REQUIRED:

This app requires a Supabase backend. You need to:

1. Create a free account at supabase.com
2. Create a new project
3. Run these SQL commands in the SQL editor:

-- Create users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'user',
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Users can insert themselves" ON users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update themselves" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for messages
CREATE POLICY "Users can view their messages" ON messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (sender_id = auth.uid());

4. Update the Supabase credentials in index.html:
- Find lines with SUPABASE_URL and SUPABASE_KEY
- Replace with your Supabase project URL and anon key

TROUBLESHOOTING:

1. If app doesn't connect:
   - Check Supabase URL and key
   - Verify internet connection
   - Check browser console for errors

2. If PWA installation doesn't work:
   - Ensure manifest.json is properly linked
   - Check service worker registration

3. For Android-specific issues:
   - Enable USB debugging on device
   - Check Android WebView version

CONTACT:
For support: support@quickchat.com

VERSION: 2.0.0
BUILD DATE: 2024
=============================================