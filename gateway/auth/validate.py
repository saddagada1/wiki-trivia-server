import os, requests

def user(request):
    if not "Authorization" in request.headers:
        return None, ("missing token", 401)
    
    token = request.headers["Authorization"]

    response = requests.get(
        f"http://{os.environ.get("AUTH_SERVICE_ADDRESS")}/me",
        headers={"Authorization": token}
    )

    if not response.status_code == 200:
        return None, (response.json(), response.status_code)
    
    return response.json(), None