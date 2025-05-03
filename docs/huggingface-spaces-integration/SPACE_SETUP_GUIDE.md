# Hugging Face Spaces Setup Guide

This guide provides step-by-step instructions for setting up the three Hugging Face Spaces required for our triple LLM implementation.

## Prerequisites

- Hugging Face account with Pro subscription (for private Spaces)
- Python knowledge for Space implementation
- Access to our model training pipeline
- Hugging Face CLI installed locally (`pip install huggingface_hub`)

## Overview

We'll be creating three Spaces:

1. **Base Model Space**: General-purpose LLM endpoint for non-company-specific queries
2. **Company Model Space**: LLM fine-tuned with company-specific data
3. **Abstraction Model Space**: LLM trained on abstracted business patterns

Each Space will be configured with a Gradio interface that exposes an API endpoint for our application to call.

## Step 1: Base Model Space Setup

### 1.1 Create the Space

1. Log in to your Hugging Face account
2. Navigate to your profile and click on "New Space"
3. Fill in the following details:
   - Owner: Your organization
   - Space name: `company-base-llm` (or your preferred name)
   - License: Apache 2.0
   - SDK: Gradio
   - Space hardware: CPU (basic) or GPU (if needed for your model size)
   - Visibility: Private

### 1.2 Create the Space Files

Create a file named `app.py` with the following content:

```python
import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer

# Load models once at startup
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-3-8B")
model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3-8B", 
    device_map="auto",
    load_in_8bit=True
)

def generate_response(prompt, max_length=1024, temperature=0.7):
    inputs = tokenizer(prompt, return_tensors="pt").to(model.device)
    
    # Generate response
    outputs = model.generate(
        inputs.input_ids,
        max_length=max_length,
        temperature=temperature,
        top_p=0.95,
        do_sample=True
    )
    
    # Decode and return response
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.replace(prompt, "").strip()

# API endpoint
def api_generate(prompt, params=None):
    if params is None:
        params = {}
    
    max_length = params.get("max_length", 1024)
    temperature = params.get("temperature", 0.7)
    
    response = generate_response(prompt, max_length, temperature)
    return {"generated_text": response}

# Create Gradio interface with both UI and API
with gr.Blocks() as demo:
    gr.Markdown("# Base LLM API")
    with gr.Row():
        with gr.Column():
            prompt = gr.Textbox(label="Prompt")
            max_length = gr.Slider(minimum=64, maximum=4096, value=1024, label="Max Length")
            temperature = gr.Slider(minimum=0.1, maximum=1.0, value=0.7, label="Temperature")
            submit_btn = gr.Button("Generate")
        with gr.Column():
            output = gr.Textbox(label="Response")
    
    submit_btn.click(
        generate_response,
        inputs=[prompt, max_length, temperature],
        outputs=output
    )

# Mount API endpoint
demo.queue()
demo.launch()
```

Create a `requirements.txt` file:

```
gradio>=3.50.2
torch>=2.0.0
transformers>=4.30.0
accelerate>=0.20.0
bitsandbytes>=0.39.0
```

### 1.3 Configure the Space

1. Create a file named `.gitattributes` with the following content:
   ```
   *.pt filter=lfs diff=lfs merge=lfs -text
   *.bin filter=lfs diff=lfs merge=lfs -text
   ```

2. Create a `README.md` file with a description of your Space:
   ```markdown
   # Base LLM API

   This Space provides an API endpoint for generating text using a base LLM.

   ## API Usage

   Send POST requests to `/api/generate` with the following JSON payload:

   ```json
   {
     "prompt": "Your prompt here",
     "params": {
       "max_length": 1024,
       "temperature": 0.7
     }
   }
   ```

   The response will be a JSON object with a `generated_text` field.
   ```

3. Set the following repository secrets in your Space settings:
   - `HF_TOKEN`: Your Hugging Face API token

## Step 2: Company Model Space Setup

### 2.1 Create the Space

Follow the same steps as for the Base Model Space, but name it `company-specific-llm`.

### 2.2 Create the Space Files

Create an `app.py` file with the following content:

```python
import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
import json
import os

# Environment variable for versioning
MODEL_VERSION = os.environ.get("MODEL_VERSION", "v1")
MODEL_PATH = f"./models/company-specific-{MODEL_VERSION}"

# Load fine-tuned model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    device_map="auto",
    load_in_8bit=True
)

def generate_response(prompt, max_length=1024, temperature=0.7, context=None):
    # Format prompt with company context if provided
    if context:
        try:
            context_data = json.loads(context)
            formatted_prompt = f"""Company Context:
            Company Name: {context_data.get('company_name', 'Unknown')}
            Industry: {context_data.get('industry', 'Unknown')}
            
            User Query: {prompt}
            """
        except:
            formatted_prompt = prompt
    else:
        formatted_prompt = prompt
    
    # Tokenize and generate
    inputs = tokenizer(formatted_prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        inputs.input_ids,
        max_length=max_length,
        temperature=temperature,
        top_p=0.92,
        do_sample=True
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.replace(formatted_prompt, "").strip()

# API endpoint
def api_generate(prompt, params=None):
    if params is None:
        params = {}
    
    max_length = params.get("max_length", 1024)
    temperature = params.get("temperature", 0.7)
    context = params.get("context", None)
    
    response = generate_response(prompt, max_length, temperature, context)
    return {"generated_text": response}

# Create Gradio interface with both UI and API
with gr.Blocks() as demo:
    gr.Markdown(f"# Company-Specific LLM API (Version: {MODEL_VERSION})")
    with gr.Row():
        with gr.Column():
            prompt = gr.Textbox(label="Prompt")
            context = gr.Textbox(label="Company Context (JSON)")
            max_length = gr.Slider(minimum=64, maximum=4096, value=1024, label="Max Length")
            temperature = gr.Slider(minimum=0.1, maximum=1.0, value=0.7, label="Temperature")
            submit_btn = gr.Button("Generate")
        with gr.Column():
            output = gr.Textbox(label="Response")
    
    submit_btn.click(
        generate_response,
        inputs=[prompt, max_length, temperature, context],
        outputs=output
    )

# Mount API endpoint
demo.queue()
demo.launch()
```

Create a similar `requirements.txt` file as for the Base Model Space.

### 2.3 Set Up the Model Directory

1. Create a `models` directory in your Space repository
2. Add a placeholder fine-tuned model that will be replaced by your actual fine-tuned model:
   ```
   models/
   └── company-specific-v1/
       ├── config.json
       ├── tokenizer.json
       ├── tokenizer_config.json
       └── pytorch_model.bin
   ```

## Step 3: Abstraction Model Space Setup

### 3.1 Create the Space

Follow the same steps as for the previous Spaces, but name it `company-abstraction-llm`.

### 3.2 Create the Space Files

Create an `app.py` file with the following content:

```python
import gradio as gr
from transformers import AutoModelForCausalLM, AutoTokenizer
import json
import os

# Environment variable for versioning
MODEL_VERSION = os.environ.get("MODEL_VERSION", "v1")
MODEL_PATH = f"./models/abstraction-{MODEL_VERSION}"

# Load fine-tuned model and tokenizer
tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
model = AutoModelForCausalLM.from_pretrained(
    MODEL_PATH,
    device_map="auto",
    load_in_8bit=True
)

def generate_response(prompt, max_length=1024, temperature=0.7, abstraction_context=None):
    # Format prompt with abstraction context if provided
    if abstraction_context:
        try:
            context_data = json.loads(abstraction_context)
            formatted_prompt = f"""Abstraction Context:
            Industry: {context_data.get('industry', 'Unknown')}
            Business Pattern: {context_data.get('pattern', 'Unknown')}
            Pattern Strength: {context_data.get('strength', 'medium')}
            
            User Query: {prompt}
            """
        except:
            formatted_prompt = prompt
    else:
        formatted_prompt = prompt
    
    # Tokenize and generate
    inputs = tokenizer(formatted_prompt, return_tensors="pt").to(model.device)
    
    outputs = model.generate(
        inputs.input_ids,
        max_length=max_length,
        temperature=temperature,
        top_p=0.92,
        do_sample=True
    )
    
    response = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return response.replace(formatted_prompt, "").strip()

# API endpoint
def api_generate(prompt, params=None):
    if params is None:
        params = {}
    
    max_length = params.get("max_length", 1024)
    temperature = params.get("temperature", 0.7)
    abstraction_context = params.get("abstraction_context", None)
    
    response = generate_response(prompt, max_length, temperature, abstraction_context)
    return {"generated_text": response}

# Create Gradio interface with both UI and API
with gr.Blocks() as demo:
    gr.Markdown(f"# Abstraction Model API (Version: {MODEL_VERSION})")
    with gr.Row():
        with gr.Column():
            prompt = gr.Textbox(label="Prompt")
            abstraction_context = gr.Textbox(label="Abstraction Context (JSON)")
            max_length = gr.Slider(minimum=64, maximum=4096, value=1024, label="Max Length")
            temperature = gr.Slider(minimum=0.1, maximum=1.0, value=0.7, label="Temperature")
            submit_btn = gr.Button("Generate")
        with gr.Column():
            output = gr.Textbox(label="Response")
    
    submit_btn.click(
        generate_response,
        inputs=[prompt, max_length, temperature, abstraction_context],
        outputs=output
    )

# Mount API endpoint
demo.queue()
demo.launch()
```

Set up the model directory in the same way as for the Company Model Space.

## Step 4: Model Deployment

### 4.1 Deploy Initial Models

For the initial setup, you can start with the base model (Llama-3-8B) for all three Spaces while you work on fine-tuning the specialized models. This ensures you have a working system from the beginning.

### 4.2 Fine-tuning Process

1. Use our model training pipeline to fine-tune the base model on:
   - Company-specific data for the Company Model
   - Abstracted business patterns for the Abstraction Model

2. Push the fine-tuned models to Hugging Face Model Hub:
   ```bash
   huggingface-cli login
   python -c "from huggingface_hub import push_to_hub; push_to_hub('path/to/your/model', 'your-org/model-name')"
   ```

3. Update the Space to use the fine-tuned model:
   - Edit the `app.py` file to point to your fine-tuned model
   - Or create a GitHub Actions workflow to automate this process

### 4.3 Automating Deployment

Create a GitHub Actions workflow to automate deployment. Create a file named `.github/workflows/deploy.yml` in your Space repository:

```yaml
name: Deploy model to Space

on:
  workflow_dispatch:
    inputs:
      model_id:
        description: 'Model ID to deploy'
        required: true
      model_version:
        description: 'Model version'
        required: true
        default: 'v1'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          python -m pip install --upgrade pip
          pip install huggingface_hub
      
      - name: Download model
        env:
          HF_TOKEN: ${{ secrets.HF_TOKEN }}
        run: |
          python -c "from huggingface_hub import snapshot_download; snapshot_download('${{ github.event.inputs.model_id }}', local_dir='models/${{ github.event.inputs.model_version }}')"
      
      - name: Update model version in app.py
        run: |
          echo "MODEL_VERSION=${{ github.event.inputs.model_version }}" > .env
      
      - name: Push changes
        uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: Update model to ${{ github.event.inputs.model_id }} version ${{ github.event.inputs.model_version }}
```

## Step 5: Testing the Spaces

### 5.1 Manual Testing

1. Access each Space's UI in your browser
2. Test with different prompts and parameters
3. Verify the responses meet your expectations

### 5.2 API Testing

Test the API using curl or another API client:

```bash
curl -X POST \
  https://huggingface.co/spaces/your-org/company-base-llm/api/generate \
  -H 'Authorization: Bearer YOUR_HF_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "What are the key considerations for a startup in the tech industry?",
    "params": {
      "max_length": 1024,
      "temperature": 0.7
    }
  }'
```

### 5.3 Integration Testing

Update your application's environment variables to point to your Spaces and test the integration:

```
VITE_HF_BASE_SPACE=your-org/company-base-llm
VITE_HF_COMPANY_SPACE=your-org/company-specific-llm
VITE_HF_ABSTRACTION_SPACE=your-org/company-abstraction-llm
```

## Troubleshooting

### Common Issues

1. **Space startup failures**: Check the Space logs for errors
2. **Model loading issues**: Ensure your model files are correctly uploaded and accessible
3. **Out of memory errors**: Adjust your model's loading parameters (e.g., load_in_8bit=True)
4. **API authentication issues**: Verify your HF_TOKEN is correctly set and has the necessary permissions
5. **Slow response times**: Consider upgrading your Space's hardware or optimizing your model loading

### Debugging Tools

- Space logs: Available in the "Logs" tab of your Space
- Environment variables: Set `DEBUG=1` to enable additional logging
- Space metrics: Monitor CPU, GPU, and memory usage in the "Metrics" tab

## Next Steps

Once your Spaces are set up and working correctly, you can:

1. Set up monitoring alerts for Space outages or performance issues
2. Implement automated testing with GitHub Actions
3. Create a CI/CD pipeline for model deployment
4. Implement a more sophisticated model versioning system
5. Explore model distillation techniques to improve performance
