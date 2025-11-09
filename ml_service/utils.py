"""
Utility functions for model preprocessing and inference.
"""
from pathlib import Path
import torch
from torchvision import models, transforms
from torch import nn
from PIL import Image


def load_trained_model(checkpoint_path: Path, device=None):
    """Load a trained model from checkpoint."""
    if device is None:
        device = torch.device('cuda' if torch.cuda.is_available() else 'mps' if torch.backends.mps.is_available() else 'cpu')
    
    state = torch.load(checkpoint_path, map_location=device)
    classes = state.get('classes', ['authentic', 'counterfeit'])
    num_classes = len(classes)

    model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)
    in_features = model.fc.in_features
    model.fc = nn.Linear(in_features, num_classes)
    model.load_state_dict(state['model_state'])
    model.eval()
    model.to(device)

    return model, classes, device


def get_preprocessing_transforms():
    """Get preprocessing transforms matching training."""
    return transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])


def preprocess_image(img: Image.Image, transforms_fn):
    """Preprocess PIL image for model inference."""
    return transforms_fn(img).unsqueeze(0)

