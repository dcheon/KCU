# backend/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.auth.router_auth import router as auth_router
from backend.visualization.router_visualize import router as visual_router

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

    # 🔥 모든 API에 기본 security 설정 추가 (원하면 특정 API만 추가 가능)
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            # 인증 필요한 API에만 적용할 수도 있음
            # 여기서는 전체 API에 BearerAuth 적용 (권장)
            openapi_schema["paths"][path][method]["security"] = [
                {"BearerAuth": []}
            ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema


app.openapi = custom_openapi
