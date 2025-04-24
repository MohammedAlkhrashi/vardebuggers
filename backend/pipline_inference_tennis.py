# %%
from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration
from tqdm.autonotebook import tqdm
import numpy as np


import torch
device = torch.device("cuda:3")
model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"

from transformers import LlavaNextVideoProcessor, LlavaNextVideoForConditionalGeneration

model = LlavaNextVideoForConditionalGeneration.from_pretrained(
    model_id, 
    torch_dtype=torch.float16, 
    low_cpu_mem_usage=True, 
).to(device)

processor = LlavaNextVideoProcessor.from_pretrained(model_id)

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

# classification_type = "serve"
# classification_type = "ball hit the net"
# classification_type = "point obtained"
# %%
def predict_clip(clip, classification_type = "serve"):
    task_prompt = f"""
    You are watching a short clip from a tennis match.
    Determine whether the video shows one of the following classification types:
    - serve
    - ball hit the net
    - point obtained
    Respond with only the category name and nothing else.
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
    # if answer not in ["yes", "no"]:
    #     raise ValueError(f"Invalid answer: {answer}")
    return decoded_output , answer

def read_clip_with_av(video_path, step=8):
    container = av.open(video_path)
    # sample uniformly 8 frames from the video
    total_frames = container.streams.video[0].frames
    indices = np.arange(0, total_frames, total_frames / 8).astype(int)
    frames = read_video_pyav(container, indices)
    return frames

from matplotlib import pyplot as plt
def from_clip_frame_show_img(frame):
    plt.imshow(frame)
    plt.show()
# %%
from glob import glob
path = "/home/mk/ActualDev/vardebuggers/backend/tennis_videos/*"
paths = glob(path)
# %%
test_path = paths[0]
print(test_path)
clip = read_clip_with_av(test_path, step=3)
# %%
from_clip_frame_show_img(clip[3])
classification_types = ["serve", "ball hit the net", "rally"]
output_dict = {}
for path in paths:
    clip = read_clip_with_av(path, step=3)
    for classification_type in classification_types:
        output, answer = predict_clip(clip, classification_type=classification_type)
        if classification_type not in output_dict:
            output_dict[classification_type] = {}
        output_dict[classification_type][path] = answer
# %%
import json
with open("output_dict.json", "w") as f:
    json.dump(output_dict, f)
