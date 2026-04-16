import os
from openai import OpenAI
from pydantic import BaseModel, Field
from typing import List, Optional, Any
from app.schema.models import QuizOutput, QuizQuestion
from app.config import settings
from openai import AsyncOpenAI
from typing import List

client = AsyncOpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=settings.GROQ_API_KEY
)

async def call_llm(prompt:str):
    try:
        response = await client.chat.completions.create(
            # CRUCIAL: Use the LiteLLM format: 'gemini/gemini-2.5-pro'
            model="openai/gpt-oss-120b", 
            messages=[
                {"role": "user", "content": prompt}
            ],
            # Use the OpenAI parameter to request JSON output
            response_format={"type": "json_object"}, 
            temperature=0.4,
        )

        json_string = response.choices[0].message.content

        import json
        quiz_data = json.loads(json_string)
        wrapped_data = {"quiz": quiz_data}
        return QuizOutput.model_validate(wrapped_data)

    except Exception as e:
        print(f"Error calling LiteLLM/Gemini: {e}")
        raise e


async def stream_chat(messages: List[dict], context: str, retrieved_docs: str | None):
    system_instruction = {
        "role": "system", 
        "content": "You are a helpful AI assistant. Answer the user's question based on the provided context and retrieved documents."
    }
    
    conversation_history = [msg.copy() for msg in messages]

    if conversation_history and conversation_history[-1]['role'] == 'user':
        last_user_msg = conversation_history[-1]
        original_question = last_user_msg['content']
        
        # Start constructing the augmented prompt
        augmented_content = ""

        # 1. Add Manual Context
        if context:
            augmented_content += (
                f"Here is the context/notes you must use:\n"
                f"---------------------\n"
                f"{context}\n"
                f"---------------------\n\n"
            )

        # 2. Add Retrieved Documents (New Logic)
        if retrieved_docs:
            augmented_content += (
                f"Here is background information/retrieved documents:\n"
                f"---------------------\n"
                f"{retrieved_docs}\n"
                f"---------------------\n\n"
            )

        # 3. Add the User Question
        augmented_content += f"User Question: {original_question}"

        # Update the message content
        last_user_msg['content'] = augmented_content

    else:
        # Fallback: If for some reason there is no user message, add one.
        # We combine context and docs here too just in case.
        combined_context = f"{context}\n\n{retrieved_docs or ''}"
        conversation_history.append({
            "role": "user", 
            "content": f"Context:\n{combined_context}\n\nPlease analyze this."
        })

    # 4. Combine System + Modified User History
    full_history = [system_instruction] + conversation_history

    try:
        # Ensure 'client' is initialized before this function in your code
        stream = await client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=full_history,
            temperature=0.7,
            stream=True 
        )

        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    except Exception as e:
        print(f"Error in chat stream: {e}")
        yield f"Error: {str(e)}"