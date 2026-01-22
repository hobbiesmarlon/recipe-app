import json
import subprocess
from io import BytesIO
import requests
from PIL import Image
from app.services.media_service import generate_presigned_download_url

def probe_image(key: str) -> dict:
    url = generate_presigned_download_url(key)

    resp = requests.get(url, timeout = 20)
    resp.raise_for_status()

    with Image.open(BytesIO(resp.content)) as img:
        width, height = img.size
    return {
        "width": width,
        "height": height,
    }

def probe_video(key: str) -> dict:
    url = generate_presigned_download_url(key)

    cmd = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration",
        "-of", "json",
        url,
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True,
        timeout=30,
        check=False,
    )

    if result.returncode != 0:
        raise RuntimeError(result.stderr)

    data = json.loads(result.stdout)
    stream = data["streams"][0]

    return {
        "width": int(stream.get("width")),
        "height": int(stream.get("height")),
        "duration": float(stream.get("duration", 0)),  # seconds
    }
