# ================================
#  TensorFlow CPU Environment Setup Script
#  for C:\KCUProject\MLProgram
#  Author: ChatGPT (KCU Project)
# ================================

Write-Host "🚀 Starting environment setup for CubeDetector..."

# ---- Step 1. Allow PowerShell scripts ----
try {
    Set-ExecutionPolicy -Scope CurrentUser RemoteSigned -Force
    Write-Host "✅ Execution policy set to RemoteSigned."
} catch {
    Write-Host "⚠️  Could not change execution policy (try running PowerShell as Administrator)."
}

# ---- Step 2. Create virtual environment ----
if (!(Test-Path "venv")) {
    Write-Host "📦 Creating Python virtual environment..."
    python -m venv venv
} else {
    Write-Host "✅ Virtual environment already exists."
}

# ---- Step 3. Upgrade pip ----
Write-Host "⬆️ Upgrading pip..."
& "$PWD\venv\Scripts\python.exe" -m pip install --upgrade pip setuptools wheel

# ---- Step 4. Fix numpy version ----
Write-Host "🔧 Installing compatible numpy (1.26.x)..."
& "$PWD\venv\Scripts\pip.exe" install "numpy<2.0.0,>=1.23.5" --force-reinstall

# ---- Step 5. Install TensorFlow CPU + dependencies ----
Write-Host "🧠 Installing TensorFlow CPU, OpenCV, and Matplotlib..."
& "$PWD\venv\Scripts\pip.exe" install tensorflow-cpu==2.17.0 opencv-python matplotlib

# ---- Step 6. Verify TensorFlow ----
Write-Host "🔍 Verifying TensorFlow installation..."
& "$PWD\venv\Scripts\python.exe" -c "import tensorflow as tf; print('\n✅ TensorFlow version:', tf.__version__); print('🧩 Devices:', tf.config.list_physical_devices('CPU'))"

Write-Host "`n🎉 Environment setup complete!"
Write-Host "To activate your virtual environment next time, run:"
Write-Host "    venv\Scripts\activate"
Write-Host "Then train your model with:"
Write-Host "    python train_model.py"
