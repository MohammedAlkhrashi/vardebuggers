# %%
# Load model directly
# from transformers import AutoProcessor, AutoModelForPreTraining

# processor = AutoProcessor.from_pretrained("LanguageBind/Video-LLaVA-7B-hf")
# model = AutoModelForPreTraining.from_pretrained("LanguageBind/Video-LLaVA-7B-hf")
# %%

# from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration
# from tqdm.autonotebook import tqdm


# import torch
# # model = VideoLlavaForConditionalGeneration.from_pretrained("LanguageBind/Video-LLaVA-7B-hf", torch_dtype=torch.bfloat16, device_map="cuda")
# device = torch.device("cuda:1")
# # model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"
# model_id = "LanguageBind/Video-LLaVA-7B-hf"
# model = VideoLlavaForConditionalGeneration.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map=device)
# processor = VideoLlavaProcessor.from_pretrained(model_id)

# %%
# import av
# import numpy as np
# from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration

# def read_video_pyav(container, indices):
#     frames = []
#     container.seek(0)
#     start_index = indices[0]
#     end_index = indices[-1]
#     for i, frame in enumerate(container.decode(video=0)):
#         if i > end_index:
#             break
#         if i >= start_index and i in indices:
#             frames.append(frame)
#     return np.stack([x.to_ndarray(format="rgb24") for x in frames])
# %%
# prompt = "USER: <video>You are a helpful AI assistant, you will be presented with a short clip of a shot by a football player\
# , describe whether the shot is on target or not. Answer with a single word, 'on' or 'off' ASSISTANT:"
# prompt = "USER: <video> You are a football analysit, tell me what which player passed to which players (using their numbers). ASSISTANT:"
# prompt = "USER: <video> Are there any passes taking any place, and if there are, who passed to whom? Please only focus on this task. \
#     Pay attention to the numbers of the players under the players\
#     The nubmers were generated in advance by a different model\
#     ASSISTANT:"

# prompt = f"""
# USER: <video>
# You are an expert football analyst. 
# Your task is to analyze the video and classify each clip into one of the following categories:
# - Pass
# - Shot
# - Tackle
# - Header
# - Corner
# - Free kick
# - Other

# The output should be in the following format:
# category:player_number:success/fail
# if other, just output None

# Example: (input video of a successful pass by player 1)
# Output: Pass:7:success

# Example: (unrelated clip)
# ASSISTANT:
# """
# video_path = "YOUR-LOCAL-VIDEO-PATH"
# video_path = "./2-5leicesterArsenal.mp4"  
# video_path = "./leicesterArsenal_clip.mp4"
# video_path = "./2025-04-09_01-22-34.mp4"
# container = av.open(video_path)

# # sample uniformly 8 frames from the video
# total_frames = container.streams.video[0].frames
# indices = np.arange(0, total_frames, total_frames / 8).astype(int)
# clip = read_video_pyav(container, indices)


# # moving prompt to GPU
# inputs = processor(text=prompt, videos=clip, return_tensors="pt")
# inputs = {k: v.to(device) for k, v in inputs.items()}

# # Generate
# generate_ids = model.generate(**inputs, max_new_tokens=100)
# from pprint import pprint
# pprint(processor.batch_decode(generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0])
# # >>> 'USER:  Why is this video funny? ASSISTANT: The video is funny because the baby is sitting on the bed and reading a book, which is an unusual and amusing sight.'

# %%
# load model

from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration
from tqdm.autonotebook import tqdm
import numpy as np


import torch
# model = VideoLlavaForConditionalGeneration.from_pretrained("LanguageBind/Video-LLaVA-7B-hf", torch_dtype=torch.bfloat16, device_map="cuda")
# CUDA_VISIBLE_DEVICES=0 python explore.py
device = torch.device("cuda:0")
# model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"
# model_id = "LanguageBind/Video-LLaVA-7B-hf"
# model = VideoLlavaForConditionalGeneration.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map=device)
# processor = VideoLlavaProcessor.from_pretrained(model_id)

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
    # First cut the first 10 minutes, then split into 5 second clips
    # save the clips to the current directory
    # return the paths to the clips
    import subprocess
    import os
    import glob

    # Create a temporary directory for the clips
    temp_dir = f"split_clips/{match_id}"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Create a temporary file for the 10-minute clip
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
    
    
    # Return the paths to the clips
    clip_paths = sorted(glob.glob(f"{temp_dir}/clip_*.mp4"))
    return clip_paths

# match_path = "2-5leicesterArsenal.mp4"
# paths = split_video_using_ffmpeg(match_path, "2-5leicesterArsenal", first_n_minutes=5)
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

# def predict_clip(clip):
#     prompt = f"""
#     USER:
#     You are an expert football analyst. 
#     Your task is to analyze the video and classify each clip into one of the following categories:
#     - Pass
#     - Shot
#     - Tackle
#     - Header
#     - Corner
#     - Free kick
#     - Other

#     The output should be in the following format:
#     category:player_number:success/fail
#     if other, just output None

#     Example: (input video of a successful pass by player 1)
#     Output: Pass:7:success

#     Example: (unrelated clip)

#     Input: <video>
#     ASSISTANT:
#     Output:
#     """
#     inputs = processor(text=prompt, videos=clip, return_tensors="pt")
#     inputs = {k: v.to(device) for k, v in inputs.items()}
#     generate_ids = model.generate(**inputs, max_new_tokens=100)
#     output =  processor.batch_decode(generate_ids, skip_special_tokens=True, clean_up_tokenization_spaces=False)[0]
#     print(f"beforeoutput: {output}")
#     output = output.split("ASSISTANT:")[1].strip()
#     print(f"output: {output}")
#     if output == "None":
#         return None
#     else:
#         category, player_number, success_fail = output.split(":")
#         return category, player_number, success_fail

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

# %%
# test_path = paths[57]
# print(test_path)
# clip = read_clip_with_av(test_path, step=3)
# from_clip_frame_show_img(clip[1])
# output, answer = predict_clip(clip, classification_type="pass")
# pprint(output)
# pprint(answer)
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
# %%
import json
import glob
def create_player_actions_json(match_id="2-5leicesterArsenal", action_types=["pass", "shot"]):
    """
    Read all text files in the model_output directory and create a JSON structure
    that organizes actions by player, action type, and success/fail status.
    
    Format:
    {
        "player_1": {
            "pass": {"success": [mp4_paths], "fail": [mp4_paths]},
            "dribble": {"success": [mp4_paths], "fail": [mp4_paths]},
            ...
        },
        ...
    }
    """
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
# match_path = "2-5leicesterArsenal.mp4"
# paths = split_video_using_ffmpeg(match_path, "2-5leicesterArsenal", first_n_minutes=5)
# match_id = "2-5leicesterArsenal"
# print(f"match_path: {match_path}, match_id: {match_id}")
# for type in types:
#     predict_and_save(paths, match_id, type, rm=True)
# %%
player_actions = create_player_actions_json(match_id="2-5leicesterArsenal", action_types=types)
# exit()
# %%
match_path = "burnley0-1arsenal-2015-04-11.mp4"
match_id = "burnley0-1arsenal-2015-04-11"
print(f"match_path: {match_path}, match_id: {match_id}")
paths = split_video_using_ffmpeg(match_path, match_id, first_n_minutes=5)
for type in types:
    predict_and_save(paths, match_id, type, rm=True)
# %%
player_actions = create_player_actions_json(match_id="burnley0-1arsenal-2015-04-11", action_types=types)
# %%