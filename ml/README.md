# blog-ml Python environment

This project uses the Conda environment `blog-ml` (Python 3.12) stored outside
the repository at `D:\Miniconda3\envs\blog-ml`.

Activate it from PowerShell:

```powershell
conda activate blog-ml
cd F:\blog
```

Install or reproduce the core ML dependencies:

```powershell
python -m pip install -r F:\blog\ml\requirements.txt
```

Verify the PyTorch/CUDA setup:

```powershell
python -c "import torch, transformers; print('torch='+torch.__version__); print('transformers='+transformers.__version__); print('cuda_available='+str(torch.cuda.is_available())); print('device='+ (torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'CPU'))"
```
