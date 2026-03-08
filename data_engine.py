import json
import time
import requests

RAPIDAPI_KEY = "c45dbc1646msh46951e4597c410ep192aa3jsn5e04eb641197"
RAPIDAPI_HOST = "twitter-api45.p.rapidapi.com"

def get_user_info(username):
    """Fetch user details from the RapidAPI endpoint."""
    url = f"https://{RAPIDAPI_HOST}/screenname.php"
    querystring = {"screenname": username}
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
    querystring = {"screenname": username}
    headers = {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": RAPIDAPI_HOST
    }
    
    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        
        # Twitter API wrapper usually returns a list or a dict with "users" or "following"
        data = response.json()
        if isinstance(data, dict):
            # Attempt to extract list of users
            for key in ["users", "following", "data"]:
                if key in data and isinstance(data[key], list):
                    return data[key]
            # fallback: maybe the dict values themselves contain the info we want
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

def parse_user_data(user_data, default_id):
    """Safely extracts id, name, followers count, handle, and bio from arbitrary api response structures."""
    if not user_data or not isinstance(user_data, dict):
        return str(default_id), str(default_id), 0, str(default_id), ""
        
    uid = str(user_data.get("id", user_data.get("user_id", user_data.get("rest_id", default_id))))
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

def main():
    seed_users = ['ylecun', 'AndrewYNg', 'sama', 'karpathy', 'ilyasut', 'demishassabis', 'drfeifei', 'lexfridman']
    
    nodes = []
    links = []
    seen_ids = set()

    print("Starting data extraction BFS...")

    for index, seed in enumerate(seed_users):
        print(f"\n[{index+1}/{len(seed_users)}] Fetching info for seed user: {seed}")
        try:
            user_data = get_user_info(seed)
            time.sleep(3) # Prevent rate limits
            
            if not user_data:
                print(f"Skipping {seed} due to failed info fetch.")
                continue
                
            uid, name, followers, handle, bio = parse_user_data(user_data, seed)
            
            if uid not in seen_ids:
                nodes.append({
                    "id": uid,
                    "name": name,
                    "category": "AI Pioneer",
                    "followers": followers,
                    "handle": handle,
                    "bio": bio
                })
                seen_ids.add(uid)
                
            print(f"[{index+1}/{len(seed_users)}] Fetching following array for seed user: {seed}")
            following_list = get_following(seed)
            time.sleep(3) # Prevent rate limits
            
            if not following_list:
                print(f"Skipping following expansion for {seed}.")
                continue
                
            # Take up to 12 users to build a graph of ~100 nodes
            following_list = following_list[:12]
            print(f"      -> Got {len(following_list)} followed accounts")
            
            for followed_user in following_list:
                if isinstance(followed_user, str):
                    target_uid = target_name = target_handle = followed_user
                    target_followers = 0
                    target_bio = ""
                else:
                    target_uid, target_name, target_followers, target_handle, target_bio = parse_user_data(followed_user, "unknown")
                
                if target_uid not in seen_ids:
                    nodes.append({
                        "id": target_uid,
                        "name": target_name,
                        "category": "Builder",
                        "followers": target_followers,
                        "handle": target_handle,
                        "bio": target_bio
                    })
                    seen_ids.add(target_uid)
                    
                links.append({
                    "source": uid,
                    "target": target_uid
                })
        except Exception as e:
            print(f"Unhandled error processing seed user {seed}: {e}")
            continue
            
    # Serialize results
    graph_data = {
        "nodes": nodes,
        "links": links
    }
    
    output_path = "src/data/ai_data.json"
    print(f"\nWriting {len(nodes)} nodes and {len(links)} links to {output_path}...")
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(graph_data, f, indent=2, ensure_ascii=False)
        print("Data extraction complete!")
    except Exception as e:
        print(f"Failed to write data file: {e}")

if __name__ == "__main__":
    main()