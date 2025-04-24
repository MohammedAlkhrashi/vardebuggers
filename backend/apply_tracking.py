# %%
from ultralytics import YOLO
import supervision as sv
import numpy as np
import os
from tqdm import tqdm

model_path = "/home/mk/ActualDev/vardebuggers/backend/football-detection-tracking/models/yolov9c.pt"
model = YOLO(model_path)
model.set_classes = ["player", "referee", "ball"]

tracker = sv.ByteTrack()

ellipse_annotator = sv.EllipseAnnotator()

rich_label_annotator = sv.RichLabelAnnotator(
    text_position=sv.Position.BOTTOM_CENTER,
    font_size=10,
    text_color=sv.Color.BLACK,
    # color=sv.Color.,
    border_radius=5,  
)

class TrackAndAnnotate:
    def __init__(self, input_file_path, output_file_path):
        self.input_file_path = input_file_path
        self.output_file_path = output_file_path

    def callback(self, frame: np.ndarray, _: int) -> np.ndarray:
        results = model(frame)[0]
        detections = sv.Detections.from_ultralytics(results)
        detections = tracker.update_with_detections(detections)
        
        annotated_frame = frame.copy()
        
        annotated_frame = ellipse_annotator.annotate(annotated_frame, detections=detections)
        
        labels = [f"{int(tracker_id%20 + 2)}" for tracker_id in detections.tracker_id]
        annotated_frame = rich_label_annotator.annotate(
            annotated_frame, 
            detections=detections, 
            labels=labels
        )
        
        return annotated_frame

    def track_and_anotate(self):
        sv.process_video(
            source_path=self.input_file_path,
            target_path=self.output_file_path,
            callback=self.callback
        )

# %%
output_folder = "/home/mk/ActualDev/vardebuggers/backend/to_copy/split_clips_with_tracking"
input_folder = "/home/mk/ActualDev/vardebuggers/backend/to_copy/split_clips"

from glob import glob
clips = glob(f"{input_folder}/*/*.mp4")
# %%
def get_folder_and_clip_name(clip_path):
    folder = clip_path.split("/")[-2]
    clip_name = clip_path.split("/")[-1]
    return folder, clip_name


def make_folder_if_not_exists(folder_path):
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

for clip in tqdm(sorted(clips)):
    folder, clip_name = get_folder_and_clip_name(clip)
    full_folder_path = f"{output_folder}/{folder}"
    make_folder_if_not_exists(full_folder_path)
    output_path = f"{full_folder_path}/{clip_name}"
    process = TrackAndAnnotate(clip, output_path)
    process.track_and_anotate()
# %%
