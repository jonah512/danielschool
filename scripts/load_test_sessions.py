#!/usr/bin/env python3
"""
Multi-threaded Session Load Testing Script
Copyright (c) 2025 Milal Daniel Korean School.

This script creates 100 threads to test session management under load.
"""

import requests
import time
import json
import argparse
import sys
import threading
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import random
import queue

class ThreadedSessionClient:
    def __init__(self, base_url, thread_id):
        self.base_url = base_url.rstrip('/')
        self.thread_id = thread_id
        self.email = "hyugrae.cho@gmail.com"
        self.session_key = None
        self.session_active = False
        self.results = {
            'thread_id': thread_id,
            'start_time': None,
            'end_time': None,
            'operations': [],
            'errors': [],
            'success': False
        }
        
    def log(self, message):
        timestamp = datetime.now().strftime("%H:%M:%S.%f")[:-3]
        print(f"[{timestamp}] Thread-{self.thread_id:03d}: {message}")
        
    def start_session(self):
        """Start a new session"""
        try:
            url = f"{self.base_url}/StartSession"
            params = {"email": self.email}
            
            response = requests.post(url, params=params, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                # Extract session key from response
                if isinstance(data, dict):
                    self.session_key = data.get('session_key') or data.get('key') or str(data.get('position', ''))
                    if not self.session_key and 'data' in data:
                        self.session_key = data['data'].get('session_key') or data['data'].get('key')
                
                self.session_active = True
                self.results['operations'].append(('start_session', 'success', response.status_code))
                self.log(f"Session started - Key: {self.session_key}")
                return True
            else:
                self.results['errors'].append(f"Start session failed: {response.status_code}")
                self.log(f"Failed to start session: {response.status_code}")
                return False
                
        except Exception as e:
            self.results['errors'].append(f"Start session error: {str(e)}")
            self.log(f"Error starting session: {e}")
            return False
    
    def check_session(self):
        """Check current session status"""
        if not self.session_key:
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
                self.results['operations'].append(('check_session', 'success', position))
                self.log(f"Session valid - Position: {position}")
                return True
            elif response.status_code == 401:
                self.results['errors'].append("Session invalid or expired")
                self.log("Session invalid or expired")
                self.session_active = False
                return False
            else:
                self.results['errors'].append(f"Check session failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.results['errors'].append(f"Check session error: {str(e)}")
            self.log(f"Error checking session: {e}")
            return False
    
    def end_session(self):
        """End the current session"""
        if not self.session_key:
            return True
            
        try:
            url = f"{self.base_url}/EndSession"
            params = {
                "email": self.email,
                "session_key": self.session_key
            }
            
            response = requests.post(url, params=params, timeout=10)
            
            if response.status_code == 200:
                self.results['operations'].append(('end_session', 'success', response.status_code))
                self.log("Session ended successfully")
                self.session_active = False
                self.session_key = None
                return True
            else:
                self.results['errors'].append(f"End session failed: {response.status_code}")
                return False
                
        except Exception as e:
            self.results['errors'].append(f"End session error: {str(e)}")
            self.log(f"Error ending session: {e}")
            return False
    
    def run_load_test(self, duration=60, check_interval=3):
        """Run load test for specified duration"""
        self.results['start_time'] = datetime.now()
        
        try:
            if not self.start_session():
                self.results['success'] = False
                return self.results
            
            start_time = time.time()
            check_count = 0
            
            while (time.time() - start_time) < duration and self.session_active:
                time.sleep(check_interval)
                
                if self.check_session():
                    check_count += 1
                else:
                    break
                    
                # Add some randomness to avoid synchronized requests
                time.sleep(random.uniform(0.1, 0.5))
            
            self.log(f"Completed {check_count} session checks")
            self.results['success'] = True
            
        except Exception as e:
            self.results['errors'].append(f"Load test error: {str(e)}")
            self.log(f"Load test error: {e}")
            
        finally:
            if self.session_active:
                self.end_session()
            self.results['end_time'] = datetime.now()
            
        return self.results

def run_single_thread(thread_id, base_url, duration, check_interval):
    """Function to run in each thread"""
    client = ThreadedSessionClient(base_url, thread_id)
    return client.run_load_test(duration, check_interval)

def print_summary(results_list):
    """Print summary of all thread results"""
    total_threads = len(results_list)
    successful_threads = sum(1 for r in results_list if r['success'])
    total_errors = sum(len(r['errors']) for r in results_list)
    total_operations = sum(len(r['operations']) for r in results_list)
    
    print("\n" + "="*80)
    print("LOAD TEST SUMMARY")
    print("="*80)
    print(f"Total Threads: {total_threads}")
    print(f"Successful Threads: {successful_threads}")
    print(f"Failed Threads: {total_threads - successful_threads}")
    print(f"Total Operations: {total_operations}")
    print(f"Total Errors: {total_errors}")
    print(f"Success Rate: {(successful_threads/total_threads)*100:.1f}%")
    
    if total_errors > 0:
        print("\nERRORS BREAKDOWN:")
        error_counts = {}
        for result in results_list:
            for error in result['errors']:
                error_counts[error] = error_counts.get(error, 0) + 1
        
        for error, count in sorted(error_counts.items(), key=lambda x: x[1], reverse=True):
            print(f"  {count}x: {error}")

def main():
    parser = argparse.ArgumentParser(description="Multi-threaded Session Load Test")
    parser.add_argument("--url", default="http://localhost:8000", 
                       help="Base URL of the API server (default: http://localhost:8000)")
    parser.add_argument("--threads", type=int, default=100,
                       help="Number of threads to create (default: 100)")
    parser.add_argument("--duration", type=int, default=60,
                       help="Duration of load test in seconds (default: 60)")
    parser.add_argument("--interval", type=int, default=3,
                       help="Check interval in seconds (default: 3)")
    parser.add_argument("--max-workers", type=int, default=20,
                       help="Maximum concurrent workers (default: 20)")
    
    args = parser.parse_args()
    
    print(f"Starting load test with {args.threads} threads")
    print(f"Target: {args.url}")
    print(f"Duration: {args.duration} seconds")
    print(f"Check interval: {args.interval} seconds")
    print(f"Max concurrent workers: {args.max_workers}")
    print("-" * 80)
    
    start_time = datetime.now()
    results = []
    
    # Use ThreadPoolExecutor to manage thread pool
    with ThreadPoolExecutor(max_workers=args.max_workers) as executor:
        # Submit all tasks
        future_to_thread = {
            executor.submit(run_single_thread, i, args.url, args.duration, args.interval): i 
            for i in range(1, args.threads + 1)
        }
        
        # Collect results as they complete
        for future in as_completed(future_to_thread):
            thread_id = future_to_thread[future]
            try:
                result = future.result()
                results.append(result)
                
                if result['success']:
                    status = "✓ SUCCESS"
                else:
                    status = f"✗ FAILED ({len(result['errors'])} errors)"
                    
                print(f"Thread-{thread_id:03d} completed: {status}")
                
            except Exception as e:
                print(f"Thread-{thread_id:03d} exception: {e}")
                results.append({
                    'thread_id': thread_id,
                    'success': False,
                    'errors': [str(e)],
                    'operations': []
                })
    
    end_time = datetime.now()
    total_time = (end_time - start_time).total_seconds()
    
    print_summary(results)
    print(f"\nTotal execution time: {total_time:.2f} seconds")
    
    # Return appropriate exit code
    successful_threads = sum(1 for r in results if r['success'])
    if successful_threads == args.threads:
        print("\n🎉 All threads completed successfully!")
        sys.exit(0)
    elif successful_threads > 0:
        print(f"\n⚠️  {successful_threads}/{args.threads} threads completed successfully")
        sys.exit(1)
    else:
        print("\n❌ All threads failed!")
        sys.exit(2)

if __name__ == "__main__":
    main()