from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
import json
import asyncio
from models.database import get_db
from models.user import User
from models.skill import Skill
from models.domain import Domain
from models.chat_session import ChatSession
from models.chat_message import ChatMessage
from routes.auth_fastapi import get_current_user, RegisterRequest
from services.admin_service import AdminService
from services.auth_service import AuthService
from services.chatbot_service import ChatbotService
from routes.admin_domains import create_domain
from ai.intent_classifier import IntentClassifier
from ai.llm.llm_router import llm_router
from fastapi.responses import StreamingResponse

router = APIRouter(prefix="/chat", tags=["Admin Chat"])

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[int] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[int]
    action_taken: bool = False

def require_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    return current_user

# Admin Tools JSON schemas (OpenAI format)
ADMIN_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_user",
            "description": "Create a new user account",
            "parameters": {
                "type": "object",
                "properties": {
                    "email": {"type": "string", "description": "User email"},
                    "role": {"type": "string", "enum": ["user", "admin"], "description": "User role", "default": "user"}
                },
                "required": ["email"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_users",
            "description": "List users with pagination",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "default": 10, "description": "Number of users to return"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_skill",
            "description": "Create a new skill",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Skill name"},
                    "description": {"type": "string", "description": "Skill description"}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_skills",
            "description": "List skills",
            "parameters": {
                "type": "object",
                "properties": {
                    "limit": {"type": "integer", "default": 10}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "list_domains",
            "description": "List domains",
            "parameters": {}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_domain",
            "description": "Create new career domain (admin only)",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type": "string", "description": "Domain name"}
                },
                "required": ["name"]
            }
        }
    }
]

def execute_tool(tool_call: Dict, db: Session, admin_id: int) -> str:
    name = tool_call['function']['name']
    args_data = tool_call['function'].get('arguments', '')
    
    if isinstance(args_data, dict):
        args = args_data
    else:
        try:
            args = json.loads(args_data) if args_data else {}
        except json.JSONDecodeError:
            args = {}
    
    if name == "create_user":
        email = args.get('email')
        if not email:
            return "❌ Email required for create_user"
        role = args.get('role', 'user')
        try:
            user_data = RegisterRequest(email=email, name=args.get('name', 'Admin Created'), password='TempPass123!', role=role)
            user_result = AuthService.register_user(db, **user_data.dict())
            db.commit()
            return f"✅ Created user '{email}' ID: {user_result.get('user_id', user_result.get('id', 'N/A'))}"
        except Exception as e:
            db.rollback()
            return f"❌ Create user failed: {str(e)}"
    
    elif name == "list_users":
        users = AdminService.get_users(db, limit=args.get('limit', 10))
        reply = f"Users ({users['total']} total):\n"
        for u in users['users']:
            reply += f"• {u['email']} ({u['role']})\n"
        return reply
    
    elif name == "create_skill":
        try:
            if not args.get('name'):
                return "❌ Skill name required"
            result = AdminService.create_skill(db, admin_id, args.get('name'), args.get('description'))
            db.commit()
            skill = result['skill']
            return f"✅ Created skill ID: {skill['id']} '{skill['name']}'"
        except Exception as e:
            db.rollback()
            return f"❌ Create skill failed: {str(e)}"
    
    elif name == "list_skills":
        skills = db.query(Skill).limit(args.get('limit', 10)).all()
        reply = "Skills:\n"
        for s in skills:
            reply += f"• ID:{s.id} {s.name}\n"
        return reply
    
    elif name == "list_domains":
        domains = db.query(Domain).all()
        reply = "Domains:\n"
        for d in domains:
            reply += f"• ID:{d.id} {d.name}\n"
        return reply
    
    elif name == "create_domain":
        name = args.get('name')
        if not name:
            return "❌ Domain name required"
        try:
            result = create_domain({"name": name}, db, admin_id)
            db.commit()
            return f"✅ Created domain '{name}' ID: {result['domain']['id']}"
        except Exception as e:
            db.rollback()
            return f"❌ Create domain failed: {str(e)}"
    
    return "Unknown tool"

@router.post("/", response_model=ChatResponse)
def admin_chat(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    # Load history if session_id
    if request.session_id:
        try:
            history = ChatbotService.get_messages(db, current_user.id, request.session_id)
            messages = [{"role": m["role"], "content": m["content"]} for m in history]
        except ValueError:
            messages = []
    else:
        messages = []

    # Append user message
    messages.append({"role": "user", "content": request.message})

    # Process with session persistence
    chatbot_result = ChatbotService.process_query(db, current_user.id, request.message, request.session_id)
    
    # LLM tools for admin actions
    tool_result = llm_router.call_tools(messages[-10:], ADMIN_TOOLS)
    reply = chatbot_result["message"]
    
    if tool_result.get('tool_call'):
        try:
            tool_reply = execute_tool(tool_result['tool_call'], db, current_user.id)
            reply = tool_reply
            db.commit()
        except Exception as e:
            db.rollback()
            reply += f"\n⚠️ Tool failed: {str(e)}"

    return ChatResponse(
        reply=reply,
        session_id=chatbot_result["session_id"],
        action_taken=bool(tool_result.get('tool_call'))
    )

@router.post("/stream")
async def admin_chat_stream(request: ChatRequest, db: Session = Depends(get_db), current_user: User = Depends(require_admin)):
    async def event_generator():
        try:
            # Load history
            if request.session_id:
                try:
                    history = ChatbotService.get_messages(db, current_user.id, request.session_id)
                    messages = [{"role": m["role"], "content": m["content"]} for m in history]
                except ValueError:
                    messages = []
            else:
                messages = []
            messages.append({"role": "user", "content": request.message})

            # Persist first
            result = ChatbotService.process_query(db, current_user.id, request.message, request.session_id)
            yield f"data: {json.dumps({'session_id': result['session_id']})}\n\n"

            # Tool call first if needed
            tool_result = llm_router.call_tools(messages[-5:], ADMIN_TOOLS)
            if tool_result.get('tool_call'):
                tool_reply = execute_tool(tool_result['tool_call'], db, current_user.id)
                yield f"data: {json.dumps({'content': tool_reply})}\n\n"
            else:
                response = tool_result['llm_response']['content']
                # Simulate streaming by words
                for chunk in response.split(' '):
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                    await asyncio.sleep(0.05)
            
            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
