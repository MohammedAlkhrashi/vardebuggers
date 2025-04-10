# Project structure and setup:


## frontend/ and match-dashboard/ contain the user interface logic. 

Setting up this will require ```nodejs```: ```npm```

## backend/
This contains the code used for performing for computing the model outputs, splitting and processing the videos, and evaluating and gathering the data.

To set up, you will need to install the following dependencies: 

```
pip install --upgrade pip
pip install transformers
pip install torch torchvision
pip install av
pip install opencv-python
pip install pprint tqdm
pip install flash-attn --no-build-isolation
pip install ultralytics
```

To acquire the testing the data, please follow the instructions from SoccerNet to request access (will need to sign an NDA)
Instructions: https://www.soccer-net.org/data

To compute the model predictions run:

```
python vlm_inference.py
```

This will output a directory ```model_outputs``` containing the results per match.
