

import subprocess
import os
import glob

# Original file (use the MKV directly)
original_file = "arsenal_chelsea_2016_01_24.mkv"
segment_time = 5
match_id = "test"
temp_dir = f"split_clips/{match_id}"
os.makedirs(temp_dir, exist_ok=True)

# Step 1: Segment the MKV directly into .ts files with clean audio/video
split_command = [
    "ffmpeg",
    "-i", original_file,
    "-c:v", "libx264",
    "-preset", "fast",
    "-force_key_frames", f"expr:gte(t,n_forced*{segment_time})",
    "-c:a", "aac",  # clean re-encode of audio
    "-f", "segment",
    "-segment_time", f"{segment_time}",
    "-reset_timestamps", "1",
    f"{temp_dir}/clip_%03d.ts"
]
print("Splitting original MKV into clean .ts segments...")
subprocess.run(split_command, check=True)

# Step 2: Convert to mp4 with full re-encode
ts_files = sorted(glob.glob(f"{temp_dir}/*.ts"))
print("Re-encoding .ts segments to .mp4...")
for ts_file in ts_files:
    mp4_file = ts_file.replace(".ts", ".mp4")
    convert_command = [
        "ffmpeg",
        "-i", ts_file,
        "-c:v", "libx264",
        "-preset", "fast",
        "-c:a", "aac",
        "-movflags", "faststart",
        mp4_file
    ]
    result = subprocess.run(convert_command)
    if result.returncode == 0:
        os.remove(ts_file)
    else:
        print(f"❌ Conversion failed for {ts_file}")

print("✅ Done! Clean .mp4 segments saved in:", temp_dir)

