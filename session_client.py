#!/usr/bin/env python3
"""
Session Management Client Script
Copyright (c) 2025 Milal Daniel Korean School.

This script starts a session and then periodically checks the session status.
"""

import requests
import time
import json
import argparse
import sys
from datetime import datetime

class SessionClient:
    def __init__(self, base_url, email):
        self.base_url = base_url.rstrip('/')
        self.email = email
        self.session_key = None
        self.session_active = False
        
    def start_session(self):
        """Start a new session"""
        try:
            url = f"{self.base_url}/StartSession"
            params = {"email": self.email}
            
            print(f"[{datetime.now()}] Starting session for {self.email}...")
            response = requests.post(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                print(f"[{datetime.now()}] Session started successfully!")
                print(f"Response: {json.dumps(data, indent=2)}")
                
                # Extract session key from response (adjust based on actual API response)
                if isinstance(data, dict):
                    self.session_key = data.get('session_key') or data.get('key') or str(data.get('position', ''))
                    if not self.session_key and 'data' in data:
                        self.session_key = data['data'].get('session_key') or data['data'].get('key')
                
                self.session_active = True
                return True
            else:
                print(f"[{datetime.now()}] Failed to start session: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"[{datetime.now()}] Error starting session: {e}")
            return False
    
    def check_session(self):
        """Check current session status"""
        if not self.session_key:
            print(f"[{datetime.now()}] No session key available for checking")
            return False
            
        try:
            url = f"{self.base_url}/CheckSession"
            params = {
                "email": self.email,
                "session_key": self.session_key
            }
            
            response = requests.post(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                position = data.get('position', 'Unknown')
                print(f"[{datetime.now()}] Session valid - Position: {position}")
                return True
            elif response.status_code == 401:
                print(f"[{datetime.now()}] Session invalid or expired")
                self.session_active = False
                return False
            else:
                print(f"[{datetime.now()}] Check session failed: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"[{datetime.now()}] Error checking session: {e}")
            return False
    
    def end_session(self):
        """End the current session"""
        if not self.session_key:
            print(f"[{datetime.now()}] No active session to end")
            return True
            
        try:
            url = f"{self.base_url}/EndSession"
            params = {
                "email": self.email,
                "session_key": self.session_key
            }
            
            print(f"[{datetime.now()}] Ending session...")
            response = requests.post(url, params=params, timeout=10)
            
            if response.status_code == 200:
                print(f"[{datetime.now()}] Session ended successfully")
                self.session_active = False
                self.session_key = None
                return True
            else:
                print(f"[{datetime.now()}] Failed to end session: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
        except requests.RequestException as e:
            print(f"[{datetime.now()}] Error ending session: {e}")
            return False
    
    def run_periodic_check(self, check_interval=30, max_duration=3600):
        """Run periodic session checks"""
        if not self.start_session():
            print("Failed to start session. Exiting.")
            return False
        
        start_time = time.time()
        print(f"[{datetime.now()}] Starting periodic session checks every {check_interval} seconds")
        print(f"[{datetime.now()}] Max duration: {max_duration} seconds")
        print("Press Ctrl+C to stop...")
        
        try:
            while self.session_active and (time.time() - start_time) < max_duration:
                time.sleep(check_interval)
                
                if not self.check_session():
                    print(f"[{datetime.now()}] Session check failed. Stopping periodic checks.")
                    break
                    
        except KeyboardInterrupt:
            print(f"\n[{datetime.now()}] Interrupted by user")
        
        finally:
            if self.session_active:
                self.end_session()
        
        total_time = time.time() - start_time
        print(f"[{datetime.now()}] Session monitoring completed. Total time: {total_time:.2f} seconds")
        return True

def main():
    parser = argparse.ArgumentParser(description="Session Management Client")
    parser.add_argument("--url", default="http://localhost:8000", 
                       help="Base URL of the API server (default: http://localhost:8000)")
    parser.add_argument("--email", required=True,
                       help="Email address for the session")
    parser.add_argument("--interval", type=int, default=30,
                       help="Check interval in seconds (default: 30)")
    parser.add_argument("--duration", type=int, default=3600,
                       help="Maximum duration in seconds (default: 3600)")
    parser.add_argument("--action", choices=['start', 'check', 'monitor'], default='monitor',
                       help="Action to perform (default: monitor)")
    
    args = parser.parse_args()
    
    client = SessionClient(args.url, args.email)
    
    if args.action == 'start':
        success = client.start_session()
        if success:
            print(f"Session key: {client.session_key}")
        sys.exit(0 if success else 1)
    
    elif args.action == 'check':
        if not client.start_session():
            print("Failed to start session for checking")
            sys.exit(1)
        success = client.check_session()
        client.end_session()
        sys.exit(0 if success else 1)
    
    elif args.action == 'monitor':
        success = client.run_periodic_check(args.interval, args.duration)
        sys.exit(0 if success else 1)

if __name__ == "__main__":
    main()