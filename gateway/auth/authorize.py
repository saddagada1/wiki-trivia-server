import os, requests, json

def login(request):
    credentials = request.data
    if not credentials:
        return None, ('no credentials', 401)
    
    credentials = json.loads(credentials)
    
    response = requests.post(
        f"http://{os.environ.get("AUTH_SERVICE_ADDRESS")}/login", json=credentials
    )

    if not response.status_code == 200:
        return None, (response.json(), response.status_code)
    
    return response.json(), None
    
def signup(request):
    credentials = request.data
    if not credentials:
        return None, ('no credentials', 401)
    
    credentials = json.loads(credentials)
    
    response = requests.post(
        f"http://{os.environ.get("AUTH_SERVICE_ADDRESS")}/signup", json=credentials
    )

    if not response.status_code == 200:
        return None, (response.json(), response.status_code)
    
    return response.json(), None