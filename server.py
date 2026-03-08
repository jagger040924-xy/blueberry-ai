import json
import time
import requests
import os
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

RAPIDAPI_KEY = "c45dbc1646msh46951e4597c410ep192aa3jsn5e04eb641197"
RAPIDAPI_HOST = "twitter-api45.p.rapidapi.com"

# Utility function from data_engine.py
def parse_user_data(user_data, default_id):
    """Safely extracts id, name, followers count, handle, and bio from arbitrary api response structures."""
    if not user_data or not isinstance(user_data, dict):
        return str(default_id), str(default_id), 0, str(default_id), ""
        
    uid = str(user_data.get("id", user_data.get("user_id", user_data.get("rest_id", default_id))))
    # Check screen_name to default ID, and get name safely.
    name = user_data.get("name", str(default_id))
    
    # Try multiple keys for handle/screen_name
    handle = user_data.get("screen_name", user_data.get("handle", str(default_id)))
    if handle and not handle.startswith('@') and handle != str(default_id):
        handle = '@' + handle
        
    # Try multiple keys for description/bio
    bio = user_data.get("description", user_data.get("bio", ""))
    
    followers = 0
    for key in ["sub_count", "followers_count", "followers", "normal_followers_count"]:
        if key in user_data and isinstance(user_data[key], (int, float)):
            followers = int(user_data[key])
            break
            
    return uid, name, followers, handle, bio

def get_user_info(username):
    """Fetch user details from the RapidAPI endpoint."""
    url = f"https://{RAPIDAPI_HOST}/screenname.php"
    # Remove @ if present
    clean_username = username.lstrip('@')
    querystring = {"screenname": clean_username}
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"[Error] Failed to get user info for {username}: {e}")
        return None

def get_following(username):
    """Fetch the following list for a user."""
    url = f"https://{RAPIDAPI_HOST}/following.php"
    # Remove @ if present
    clean_username = username.lstrip('@')
    querystring = {"screenname": clean_username}
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        
        data = response.json()
        if isinstance(data, dict):
            # Attempt to extract list of users
            for key in ["users", "following", "data"]:
                if key in data and isinstance(data[key], list):
                    return data[key]
            # fallback
            for v in data.values():
                if isinstance(v, list):
                    return v
            return []
        elif isinstance(data, list):
            return data
        return []
    except Exception as e:
        print(f"[Error] Failed to get following for {username}: {e}")
        return []

@app.route('/api/graph/init', methods=['GET'])
def get_initial_graph():
    """Reads and returns the local ai_data.json."""
    data_path = os.path.join(os.path.dirname(__file__), 'src', 'data', 'ai_data.json')
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return jsonify({
                "success": True,
                "data": data
            }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/graph/expand/<string:handle>', methods=['GET'])
def expand_graph(handle):
    """Fetches up to 5 followers of the given handle to dynamically expand the graph."""
    print(f"Received request to expand graph for: {handle}")
    
    # 1. Fetch info for the selected node to get their correct internal ID 
    user_data = get_user_info(handle)
    time.sleep(1) # Be nice to RapidAPI limits
    
    if not user_data:
        return jsonify({"success": False, "error": f"Failed to fetch data for handle {handle}"}), 500
        
    source_uid, _, _, _, _ = parse_user_data(user_data, handle)
    
    # 2. Extract following
    following_list = get_following(handle)
    
    if not following_list:
        return jsonify({"success": True, "data": {"nodes": [], "links": []}}), 200
        
    # Cap to 5 to avoid making graph a ball of yarn, exactly as originally architected
    following_list = following_list[:5]
    
    new_nodes = []
    new_links = []
    
    for followed_user in following_list:
        if isinstance(followed_user, str):
            target_uid = target_name = target_handle = followed_user
            target_followers = 0
            target_bio = ""
        else:
            target_uid, target_name, target_followers, target_handle, target_bio = parse_user_data(followed_user, "unknown")
            
        new_nodes.append({
            "id": target_uid,
            "name": target_name,
            "category": "Builder",  # Generalizing dynamic fetch as Builders or researchers in the ecosystem
            "followers": target_followers,
            "handle": target_handle,
            "bio": target_bio
        })
        
        new_links.append({
            "source": source_uid,
            "target": target_uid
        })
        
    return jsonify({
        "success": True,
        "data": {
            "nodes": new_nodes,
            "links": new_links
        }
    }), 200


if __name__ == '__main__':
    print("Starting Flask API Server on port 5000...")
    app.run(port=5000, debug=True)
