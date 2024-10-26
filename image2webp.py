import os
from PIL import Image

def convert_png_to_webp(folder_path, lossless=True, quality=100):
    for filename in os.listdir(folder_path):
        if filename.endswith(".png") or filename.endswith(".jpg"):
            png_path = os.path.join(folder_path, filename)
            webp_path = os.path.splitext(png_path)[0] + ".webp"
            
            with Image.open(png_path) as img:
                img.save(webp_path, "webp", lossless=lossless, quality=quality, method=6) # Method 6 is the slowest but produces the best quality
            print(f"Converted {png_path} to {webp_path}")

            os.remove(png_path)

if __name__ == "__main__":
    folder_path = "./assets/"
    convert_png_to_webp(folder_path, False, 100)