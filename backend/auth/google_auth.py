from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from authlib.integrations.starlette_client import OAuth
import os
from dotenv import load_dotenv
from fastapi.responses import JSONResponse

router = APIRouter()
load_dotenv()

oauth = OAuth()
oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={"scope": "openid email profile"},
)

@router.get("/login")
async def login(request: Request):
    redirect_uri = request.url_for("auth_callback")
    return await oauth.google.authorize_redirect(request, redirect_uri)

@router.get("/callback", name="auth_callback")
async def auth_callback(request: Request):
    token = await oauth.google.authorize_access_token(request)
    user_info = token.get("userinfo")
    request.session["user"] = dict(user_info)

    return JSONResponse({
        "name": user_info["given_name"],
        "email": user_info["email"]
    })

@router.get("/logout")
async def logout(request: Request):
    request.session.pop("user", None)
    return RedirectResponse(url="/")
