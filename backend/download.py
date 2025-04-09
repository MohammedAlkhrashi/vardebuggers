
from transformers import VideoLlavaProcessor, VideoLlavaForConditionalGeneration
from tqdm.autonotebook import tqdm


import torch
# model = VideoLlavaForConditionalGeneration.from_pretrained("LanguageBind/Video-LLaVA-7B-hf", torch_dtype=torch.bfloat16, device_map="cuda")
device = torch.device("cuda:2")
# model_id = "LanguageBind/Video-LLaVA-7B-hf"
model_id = "llava-hf/LLaVA-NeXT-Video-7B-hf"
model = VideoLlavaForConditionalGeneration.from_pretrained(model_id, torch_dtype=torch.bfloat16, device_map=device)
processor = VideoLlavaProcessor.from_pretrained(model_id)
