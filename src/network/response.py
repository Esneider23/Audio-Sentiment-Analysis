"""
The module contains the response functions for the FastAPI application.
"""

from typing import Any, Optional, Dict
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi import Request

# Ruta donde se encuentran las plantillas HTML
templates = Jinja2Templates(directory="src/templates")

def success(
        message: str, data: Optional[Any] = None, status: int = 200
) -> JSONResponse:
    """
    Return a success JSON response.

    :param message: Success message to include in the response.
    :param data: Optional data to include in the response, defaults to None.
    :param status: Status code to include in the response, defaults to 200.
    :return: A JSONResponse with the response body and HTTP status code.
    """
    response: Dict[str, Any] = {
        "status": "success",
        "message": message,
        "data": data
    }
    return JSONResponse(content=response, status_code=status)


def error(message: str, status: int) -> JSONResponse:
    """
    Return an error JSON response.

    :param message: Error message to include in the response.
    :param status: Status code to include in the response.
    :return: A JSONResponse with the response body and HTTP status code.
    """
    response: Dict[str, Any] = {
        "status": "error",
        "message": message,
        "data": None
    }
    return JSONResponse(content=response, status_code=status)


def html(request: Request, template: str, **arg: Any) -> HTMLResponse:
    """
    Return an HTML response rendered from a template.

    :param request: The request object.
    :param template: Template to render.
    :param arg: Arguments to pass to the template.
    :return: Rendered HTML content.
    """
    return templates.TemplateResponse(template, {"request": request, **arg})
