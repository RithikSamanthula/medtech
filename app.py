from fastapi import FastAPI, UploadFile, File, Form
from transformers import pipeline
from PIL import Image
import io

app = FastAPI()
pipe = pipeline("image-to-text", model="Salesforce/blip2-opt-2.7b")  # Or use another vision model

@app.post("/analyze-image/")
async def analyze_image(file: UploadFile = File(...), prompt: str = Form("Describe this image.")):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes))
    result = pipe(image)
    return {"result": result} 