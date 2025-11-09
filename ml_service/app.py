from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import io
import torch
from torchvision import models, transforms
from torch import nn
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent))


class Prediction(BaseModel):
    label: str
    confidence: float
    probabilities: dict


def load_model(checkpoint_path: Path):
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

    tfms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ])

    return model, classes, device, tfms


# Try multiple paths for the model checkpoint
CHECKPOINT = Path(__file__).parent / 'model' / 'best_cls_resnet18.pt'
if not CHECKPOINT.exists():
    CHECKPOINT = Path(__file__).resolve().parents[1] / 'checkpoints' / 'best_cls_resnet18.pt'
if not CHECKPOINT.exists():
    CHECKPOINT = Path.cwd() / 'checkpoints' / 'best_cls_resnet18.pt'
if not CHECKPOINT.exists():
    CHECKPOINT = Path.cwd() / 'model' / 'best_cls_resnet18.pt'

model, classes, device, in_tfms = load_model(CHECKPOINT)
id_to_label = {i: c for i, c in enumerate(classes)}

app = FastAPI(title='Counterfeit Medicine ML API')
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health():
    return {'ok': True, 'classes': classes, 'checkpoint': str(CHECKPOINT)}


@app.post('/classify', response_model=Prediction)
async def classify(file: UploadFile = File(...)):
    try:
        data = await file.read()
        img = Image.open(io.BytesIO(data)).convert('RGB')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid image: {e}')

    with torch.no_grad():
        x = in_tfms(img).unsqueeze(0).to(device)
        logits = model(x)
        probs = torch.softmax(logits, dim=1)[0]
        conf, pred_idx = torch.max(probs, dim=0)
        label = id_to_label[int(pred_idx.item())]
        conf_val = float(conf.item())
        prob_map = {id_to_label[i]: float(probs[i].item()) for i in range(len(classes))}

    return Prediction(label=label, confidence=conf_val, probabilities=prob_map)


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host='0.0.0.0', port=8000)

