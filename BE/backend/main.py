# backend/main.py 

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.auth.router_auth import router as auth_router
from backend.visualization.router_visualize import router as visual_router
from backend.router_ranking import router as ranking_router   # ⭐ 랭킹 라우터 추가

from backend.router_ranking import router as ranking_router
from backend.router_matchmaking import router as matchmaking_router  # ⭐ 추가

# Swagger customizing import
from fastapi.openapi.utils import get_openapi


app = FastAPI(
    title="KCU Shape Classification API",
    version="1.0.0",
    description="로그인 + 도형 분석 API 서버",
)

# -----------------------
# CORS : React 연동
# -----------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # 개발 단계에서는 전체 허용
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------
# Static file mount
# -----------------------
app.mount("/static", StaticFiles(directory="static"), name="static")

# -----------------------
# Router 등록
# -----------------------
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(visual_router, tags=["Visualization"])
app.include_router(ranking_router, prefix="/ranking", tags=["Ranking"])  # ⭐ 랭킹 엔드포인트
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(visual_router, prefix="/visualize", tags=["Visualization"])  # or no prefix?
app.include_router(ranking_router, prefix="/ranking", tags=["Ranking"])
app.include_router(matchmaking_router, prefix="/match", tags=["Matchmaking"])   # ⭐ 추가

# =============================================================
#            ⭐ Swagger UI에 Bearer Token 입력칸 추가 ⭐
# =============================================================

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        routes=app.routes
    )

    # 🔥 BearerAuth 스키마 추가
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    # 🔥 모든 API에 기본 security 설정 추가
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [
                {"BearerAuth": []}
            ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
