# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi

# Routers
from backend.auth.router_auth import router as auth_router
from backend.visualization.router_visualize import router as visual_router
from backend.router_ranking import router as ranking_router
from backend.router_matchmaking import router as matchmaking_router


app = FastAPI(
    title="KCU Shape Classification API",
    version="1.0.0",
    description="로그인 + 도형 분석 + 랭킹 + 대결 API 서버",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],     # FE 개발 시 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Static Files
# --------------------------------------------------
app.mount("/static", StaticFiles(directory="static"), name="static")


# --------------------------------------------------
# Routers 등록 (딱 1번씩!)
# --------------------------------------------------
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(visual_router, prefix="/visualize", tags=["Visualization"])
app.include_router(ranking_router, prefix="/ranking", tags=["Ranking"])
app.include_router(matchmaking_router, prefix="/match", tags=["Matchmaking"])


# --------------------------------------------------
# Swagger - Bearer Token 입력칸 추가
# --------------------------------------------------
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes,
    )

    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]

    app.openapi_schema = openapi_schema
    return openapi_schema


app.openapi = custom_openapi
