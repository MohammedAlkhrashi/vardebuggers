import os
import subprocess

# Set the root directory
root_dir = "./"  # or use an absolute path if running from another location

# Loop through all subdirectories and files
for subdir, dirs, files in os.walk(root_dir):
    for file in files:
        if file.endswith(".mp4"):
            full_path = os.path.join(subdir, file)
            temp_path = os.path.join(subdir, "temp_" + file)

            # Construct ffmpeg command
            command = [
                "ffmpeg",
                "-y",  # Overwrite output file if it exists
                "-i", full_path,
                "-pix_fmt", "yuv420p",
                "-crf", "18",
                temp_path
            ]

            print(f"Processing {full_path}...")
            subprocess.run(command, check=True)

            # Replace original file with processed file
            os.replace(temp_path, full_path)

print("All files processed.")

