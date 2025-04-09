
import subprocess
import os
import glob

# Input video file
ten_min_clip = "arsenal_chelsea_2016_01_24.mp4"
segment_time = 5  # in seconds

# Output folder
match_id = "test"
temp_dir = f"split_clips/{match_id}"
os.makedirs(temp_dir, exist_ok=True)

# Step 1: Split into .ts segments (MPEG-TS format)
split_command = [
    "ffmpeg",
    "-i", ten_min_clip,
    "-c:v", "libx264",
    "-preset", "fast",
    "-force_key_frames", f"expr:gte(t,n_forced*{segment_time})",
    "-c:a", "aac",
    "-f", "segment",
    "-segment_time", f"{segment_time}",
    "-reset_timestamps", "1",
    f"{temp_dir}/clip_%03d.ts"
]

print("Splitting into .ts segments...")
subprocess.run(split_command, check=True)

# Step 2: Convert each .ts segment to .mp4
ts_files = sorted(glob.glob(f"{temp_dir}/*.ts"))

print("Converting .ts segments to .mp4...")
for ts_file in ts_files:
    mp4_file = ts_file.replace(".ts", ".mp4")
    convert_command = [
        "ffmpeg",
        "-i", ts_file,
        "-c", "copy",
        "-movflags", "faststart",
        mp4_file
    ]
    subprocess.run(convert_command, check=True)
    os.remove(ts_file)  # Remove .ts after successful conversion

print("Done. MP4 clips saved in:", temp_dir)

