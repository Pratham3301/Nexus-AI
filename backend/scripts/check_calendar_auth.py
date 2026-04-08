"""
Run this script to check if demo_user has Google Calendar credentials saved.
Usage: python scripts/check_calendar_auth.py
"""
import asyncio, os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from dotenv import load_dotenv
load_dotenv()
from db.singleton import get_db

async def main():
    db = get_db()
    user_id = "demo_user"
    print(f"\nChecking Firestore for user: {user_id}")
    
    doc = await db.db.collection('users').document(user_id).get()
    if not doc.exists:
        print("❌ NO USER DOCUMENT FOUND for demo_user in Firestore.")
        print("   → You must complete the OAuth login first!")
        print("   → Visit: http://localhost:8000/api/auth/google/login?user_id=demo_user")
    else:
        data = doc.to_dict()
        creds = data.get('google_calendar_creds')
        if not creds:
            print("❌ User exists but NO google_calendar_creds found.")
            print("   → OAuth was not completed for demo_user.")
            print("   → Visit: http://localhost:8000/api/auth/google/login?user_id=demo_user")
        else:
            print("✅ Google Calendar credentials FOUND for demo_user!")
            print(f"   Token exists: {'token' in creds}")
            print(f"   Refresh token: {'refresh_token' in creds}")
            print(f"   Scopes: {creds.get('scopes')}")
            
            # Test if we can actually connect
            from google.oauth2.credentials import Credentials
            from googleapiclient.discovery import build
            try:
                c = Credentials(
                    token=creds['token'],
                    refresh_token=creds['refresh_token'],
                    token_uri=creds['token_uri'],
                    client_id=creds['client_id'],
                    client_secret=creds['client_secret'],
                    scopes=creds['scopes']
                )
                service = build('calendar', 'v3', credentials=c)
                result = service.calendarList().list().execute()
                calendars = result.get('items', [])
                print(f"\n✅ Google Calendar API connected! Found {len(calendars)} calendars:")
                for cal in calendars:
                    print(f"   - {cal['summary']} ({cal['id']})")
            except Exception as e:
                print(f"\n❌ Could not connect to Google Calendar: {e}")

asyncio.run(main())
