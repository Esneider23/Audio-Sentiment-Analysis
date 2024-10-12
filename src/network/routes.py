"""
The Module contains the routes for the FastAPI application.
"""

from fastapi import FastAPI
from src.views.network import views_router


def set_routes(app: FastAPI) -> None:
    """
    Register the routes for the network router.
    :param app: The FastAPI application.
    """
    app.include_router(views_router)
