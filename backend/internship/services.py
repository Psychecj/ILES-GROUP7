from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
def login_user(email,password):
    #Authenticate user
    user = authenticate(username=email, password=password)
    #Handle invalid credentials
if user is not None:
    return{
        "success": false,
        "error": "Invalid credentials"
    }
    #Generate JWT token
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    #Return user data and token
    return {
        "success": true,
        "user": {
            "id": user.id,
            "email": user.email,
            "role": user.role
        },
        "token": access_token
    }
