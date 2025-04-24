from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration
from tqdm.autonotebook import tqdm
import numpy as np


import torch
device = torch.device("cuda:0")

model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"

from transformers import LlavaNextVideoProcessor, LlavaNextVideoForConditionalGeneration

model = LlavaNextVideoForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True, 
).to(device)

processor = LlavaNextVideoProcessor.from_pretrained(model_id)


# %%
def split_video_using_ffmpeg(video_path, match_id, first_n_minutes=10):
    import subprocess
    import os
    import glob

    temp_dir = f"split_clips/{match_id}"
    os.makedirs(temp_dir, exist_ok=True)
    
    ten_min_clip = f"{temp_dir}/first_{first_n_minutes}_minutes.mp4"
    if os.path.exists(ten_min_clip):
        print(f"File {ten_min_clip} already exists, skipping")
    else:
        # Step 1: Cut the first 10 minutes
        cut_command = [
        "ffmpeg",
        "-i", video_path,
        "-t", f"{first_n_minutes*60}",       # 10 minutes = 600 seconds
        "-c:v", "libx264", # Re-encode with h.264
        "-c:a", "aac",     # Re-encode audio with AAC
        "-preset", "fast", # Balance between speed and quality
        ten_min_clip
        ]
        subprocess.run(cut_command)
    
    # Step 2: Split the 10-minute clip into 5-second segments
    segment_time = 3
    split_command = [
        "ffmpeg",
        "-i", ten_min_clip,
        "-c:v", "libx264",           # Re-encode with h.264
        "-preset", "fast",           # Balance between speed and quality
        "-force_key_frames", f"expr:gte(t,n_forced*{segment_time})", # Force keyframe every 5 seconds
        "-c:a", "aac",               # Re-encode audio with AAC
        "-f", "segment",             # Use segment format
        "-segment_time", f"{segment_time}",        # 5-second segments
        "-segment_format", "mp4",    # MP4 format for segments
        "-reset_timestamps", "1",    # Reset timestamps for each segment
        f"{temp_dir}/clip_%03d.mp4"
    ]
    subprocess.run(split_command)
    
    clip_paths = sorted(glob.glob(f"{temp_dir}/clip_*.mp4"))
    return clip_paths

# %%
from pprint import pprint
import av

def read_video_pyav(container, indices):
    frames = []
    container.seek(0)
    start_index = indices[0]
    end_index = indices[-1]
    for i, frame in enumerate(container.decode(video=0)):
        if i > end_index:
            break
        if i >= start_index and i in indices:
            frames.append(frame)
    return np.stack([x.to_ndarray(format="rgb24") for x in frames])

def predict_clip(clip, classification_type = "pass"):
    task_prompt = f"""
You are watching a short clip from a football match.
Your task is to determine whether the player made a successful {classification_type}.

Respond with only one word:
- success: if the player attempted a {classification_type} and it achieved its intended effect
- fail: if the player attempted a {classification_type} but it was clearly unsuccessful or ineffective
- not a {classification_type}: if no {classification_type} was attempted in the clip
"""
        
    conversation = [
        {

            "role": "user",
            "content": [
                {"type": "text", "text": task_prompt},
                {"type": "video"},
                ],
        },
    ]



    prompt = processor.apply_chat_template(conversation, add_generation_prompt=True)
    inputs_video = processor(text=prompt, videos=clip, padding=True, return_tensors="pt").to(model.device)
    output = model.generate(**inputs_video, max_new_tokens=100, do_sample=False)
    decoded_output = processor.decode(output[0][2:], skip_special_tokens=True)
    print(f"decoded_output: {decoded_output}") 
    answer = decoded_output.split("ASSISTANT:")[1].strip()
    answer = answer.strip().lower()
    if answer not in ["success", "fail", f"not a {classification_type}"]:
        raise ValueError(f"Invalid answer: {answer}")
    return decoded_output , answer

def read_clip_with_av(video_path, step=2):
    container = av.open(video_path)
    # sample uniformly 8 frames from the video
    total_frames = container.streams.video[0].frames
    print(f"step: {step}")
    indices = np.arange(0, total_frames, step).astype(int)
    frames = read_video_pyav(container, indices)
    return frames

from matplotlib import pyplot as plt
def from_clip_frame_show_img(frame):
    plt.imshow(frame)
    plt.show()
# %%
from tqdm import tqdm
import os
import shutil
from collections import defaultdict
def predict_and_save(paths, match_id, classification_type, rm=False):
    classification_folder = f"model_output/{match_id}/{classification_type}"
    if os.path.exists(classification_folder) and rm:
        shutil.rmtree(classification_folder)
    os.makedirs(classification_folder, exist_ok=True)
    for path in tqdm(paths):
        text_path_to_save = f"{classification_folder}/{path.split('/')[-1].replace('.mp4', '.txt')}"
        if os.path.exists(text_path_to_save):
            continue
        else:
            clip = read_clip_with_av(path, step=3)
            output, answer = predict_clip(clip, classification_type=classification_type)
            with open(text_path_to_save, "w") as f:
                f.write(f"{answer}\n")
# %%
import json
import glob
def create_player_actions_json(match_id="2-5leicesterArsenal", action_types=["pass", "shot"]):
    base_dir = f"model_output/{match_id}"
    
    # Initialize nested defaultdict structure
    players_data = defaultdict(lambda: {
        action: {"success": [], "fail": []} for action in action_types
    })
    
    # For each action type, read all output files
    for action_type in action_types:
        action_dir = f"{base_dir}/{action_type}"
        if not os.path.exists(action_dir):
            print(f"No data for {action_type}, skipping")
            continue
            
        # Get all text files
        txt_files = glob.glob(f"{action_dir}/*.txt")
        
        for txt_file in txt_files:
            # Read the result (success/fail)
            with open(txt_file, "r") as f:
                result = f.read().strip()
            
            # Skip if the result is "not a {action_type}"
            if result == f"not a {action_type}":
                continue
                
            # Get corresponding mp4 path from original clips
            clip_name = os.path.basename(txt_file).replace(".txt", ".mp4")
            mp4_path = f"split_clips/{match_id}/{clip_name}"
            
            player_id = "1"
            
            # Add to the appropriate list
            if result == "success":
                players_data[player_id][action_type]["success"].append(mp4_path)
            elif result == "fail":
                players_data[player_id][action_type]["fail"].append(mp4_path)
    
    # Convert defaultdict to regular dict for JSON serialization
    players_dict = {
        player: {
            action: {
                status: paths
                for status, paths in statuses.items()
            }
            for action, statuses in actions.items()
        }
        for player, actions in players_data.items()
    }
    
    # Save to a JSON file
    output_path = f"model_output/{match_id}/player_actions.json"
    with open(output_path, "w") as f:
        json.dump(players_dict, f, indent=2)
    
    print(f"Player actions JSON saved to {output_path}")
    return players_dict

# Run the function to create the JSON file
types = ["pass", "shot", "tackle", "header", "dribble"]
# %%
player_actions = create_player_actions_json(match_id="2-5leicesterArsenal", action_types=types)
match_path = "burnley0-1arsenal-2015-04-11.mp4"
match_id = "burnley0-1arsenal-2015-04-11"
print(f"match_path: {match_path}, match_id: {match_id}")
paths = split_video_using_ffmpeg(match_path, match_id, first_n_minutes=5)
for type in types:
    predict_and_save(paths, match_id, type, rm=True)
player_actions = create_player_actions_json(match_id="burnley0-1arsenal-2015-04-11", action_types=types)
# %%