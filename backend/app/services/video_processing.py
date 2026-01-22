import subprocess
import json
from app.services.media_service import generate_presigned_download_url

def extract_video_frame(
        source_key: str,
        target_path: str,
        timestamp: float = 1.0,
):

    '''Extracts a frame from the video at the specified timestamp and saves it to target_path.'''

    url = generate_presigned_download_url(source_key)

    cmd = [
        "ffmpeg",
        "-ss", str(timestamp),
        "-i", url,
        "-frames:v", "1",
        "-q:v", "2",
        "-y",
        target_path,
    ]

    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=60,
        check=True,
    )

    if result.returncode != 0:
        raise RuntimeError(f"ffmpeg error: {result.stderr.decode()}")

def get_video_metadata(source_key: str) -> dict:
    """Extracts metadata (duration, width, height) from video using ffprobe."""
    url = generate_presigned_download_url(source_key)
    
    cmd = [
        "ffprobe",
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height,duration",
        "-of", "json",
        url
    ]
    
    result = subprocess.run(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        timeout=30,
        check=True
    )
    
    data = json.loads(result.stdout)
    stream = data.get("streams", [{}])[0]
    
    return {
        "width": int(stream.get("width", 0)),
        "height": int(stream.get("height", 0)),
        "duration": float(stream.get("duration", 0.0))
    }
