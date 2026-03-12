from fastapi import Request, HTTPException
from fastapi.routing import APIRoute
from app.utils.keycloak import verify_token


class AuthMiddleware(APIRoute):
    def get_route_handler(self):
        original_handler = super().get_route_handler()

        async def custom_handler(request: Request):
            protected_paths = ["/protected", "/admin"]

            if any(path in request.url.path for path in protected_paths):
                authorization = request.headers.get("Authorization")

                if not authorization or not authorization.startswith("Bearer "):
                    raise HTTPException(
                        status_code=401,
                        detail="Token missing or invalid"
                    )

                token = authorization.split(" ")[1]

                try:
                    await verify_token(token)
                except Exception:
                    raise HTTPException(
                        status_code=401,
                        detail="Invalid or expired token"
                    )

            return await original_handler(request)

        return custom_handler