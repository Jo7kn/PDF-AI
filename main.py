import os

from openai import OpenAI

api_key = "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"
if not api_key:
  raise RuntimeError("NVIDIA_API_KEY environment variable is required")

client = OpenAI(
  base_url = "https://integrate.api.nvidia.com/v1",
  api_key = api_key
)



completion = client.chat.completions.create(
  model="nvidia/nemotron-3-nano-omni-30b-a3b-reasoning",
  messages=[{"role":"user","content":""}],
  temperature=0.6,
  top_p=0.95,
  max_tokens=65536,
  extra_body={"chat_template_kwargs":{"enable_thinking":True},"reasoning_budget":16384},
  stream=False
)

reasoning = getattr(completion.choices[0].message, "reasoning_content", None)
if reasoning:
  print(reasoning)
print(completion.choices[0].message.content)