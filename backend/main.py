from typing import Union

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi import UploadFile, Request
import os

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# To run the server, use the command:
# fastapi dev main.py

@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.post("/uploadfile/")
async def create_upload_file(file_uploads: list[UploadFile], request: Request):
    """
    Handles file uploads.
    Returns a list of successfully uploaded filenames.
    """

    filenames = []
    for file_upload in file_uploads:
        data = await file_upload.read()
        save_to = os.path.join(UPLOAD_FOLDER, file_upload.filename)
        with open(save_to, 'wb') as f:
            f.write(data)
        filenames.append(file_upload.filename)

    return {"filenames": filenames}