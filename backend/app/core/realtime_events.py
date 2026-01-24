"""
Real-time Events Utility
Helper functions to emit WebSocket events from any endpoint
"""

from typing import Optional, Dict, Any
from app.api.v1.endpoints.websocket import manager
from app.core.realtime_config import WEBSOCKET_EVENTS
from app.core.logging import logger


async def emit_event(
    event_type: str,
    data: Dict[str, Any],
    user_id: Optional[str] = None,
    exclude_user_id: Optional[str] = None,
    room_id: Optional[str] = None
) -> None:
    """
    Emit a WebSocket event to connected clients
    
    Args:
        event_type: Type of event (use WEBSOCKET_EVENTS constants)
        data: Event data to send
        user_id: Send to specific user only
        exclude_user_id: Exclude this user from broadcast
        room_id: Send to specific room only
    
    Example:
        await emit_event(
            WEBSOCKET_EVENTS['PROJECT_CREATED'],
            {'id': project.id, 'name': project.name},
            exclude_user_id=str(current_user.id)
        )
    """
    try:
        message = {
            "type": event_type,
            "data": data,
            "timestamp": None  # Will be added by frontend
        }
        
        if room_id:
            # Send to specific room
            await manager.send_to_room(message, room_id)
            logger.debug(f"Event {event_type} sent to room {room_id}")
            
        elif user_id:
            # Send to specific user
            await manager.send_personal_message(message, user_id)
            logger.debug(f"Event {event_type} sent to user {user_id}")
            
        else:
            # Broadcast to all users
            await manager.broadcast(message, exclude_user_id=exclude_user_id)
            logger.debug(f"Event {event_type} broadcasted", {
                "exclude_user": exclude_user_id
            })
            
    except Exception as e:
        logger.error(f"Failed to emit WebSocket event: {event_type}", e, {
            "event_type": event_type,
            "user_id": user_id,
            "room_id": room_id
        })


# Convenient helper functions for common events

async def emit_project_created(project_id: int, project_data: Dict[str, Any], exclude_user_id: Optional[str] = None):
    """Emit project created event"""
    await emit_event(
        WEBSOCKET_EVENTS['PROJECT_CREATED'],
        {"id": project_id, **project_data},
        exclude_user_id=exclude_user_id
    )


async def emit_project_updated(project_id: int, project_data: Dict[str, Any], exclude_user_id: Optional[str] = None):
    """Emit project updated event"""
    await emit_event(
        WEBSOCKET_EVENTS['PROJECT_UPDATED'],
        {"id": project_id, **project_data},
        exclude_user_id=exclude_user_id
    )


async def emit_project_deleted(project_id: int, exclude_user_id: Optional[str] = None):
    """Emit project deleted event"""
    await emit_event(
        WEBSOCKET_EVENTS['PROJECT_DELETED'],
        {"id": project_id},
        exclude_user_id=exclude_user_id
    )


async def emit_user_updated(user_id: int, user_data: Dict[str, Any]):
    """Emit user updated event to specific user"""
    await emit_event(
        WEBSOCKET_EVENTS['USER_UPDATED'],
        {"id": user_id, **user_data},
        user_id=str(user_id)
    )


async def emit_notification_created(notification_id: int, user_id: int, notification_data: Dict[str, Any]):
    """Emit notification created event to specific user"""
    await emit_event(
        WEBSOCKET_EVENTS['NOTIFICATION_CREATED'],
        {"id": notification_id, **notification_data},
        user_id=str(user_id)
    )


async def emit_team_member_added(team_id: int, user_id: int, member_data: Dict[str, Any]):
    """Emit team member added event"""
    await emit_event(
        WEBSOCKET_EVENTS['TEAM_MEMBER_ADDED'],
        {"team_id": team_id, "user_id": user_id, **member_data},
        room_id=f"team:{team_id}"
    )


async def emit_form_submission(form_id: int, submission_data: Dict[str, Any]):
    """Emit form submission event"""
    await emit_event(
        WEBSOCKET_EVENTS['FORM_SUBMISSION'],
        {"form_id": form_id, **submission_data}
    )


async def emit_data_updated(resource_type: str, resource_id: int):
    """Generic data updated event"""
    await emit_event(
        WEBSOCKET_EVENTS['DATA_UPDATED'],
        {"resource_type": resource_type, "resource_id": resource_id}
    )
