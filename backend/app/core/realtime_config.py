"""
Real-time Configuration
Configure which endpoints should have no cache for real-time sync
"""

from typing import List

# Endpoints that should NEVER be cached (real-time data)
NO_CACHE_ENDPOINTS: List[str] = [
    # User data
    '/users/me',
    '/auth/me',
    
    # Notifications
    '/notifications',
    '/notifications/count',
    
    # Projects
    '/projects',
    '/projects/',
    
    # Teams
    '/teams',
    '/teams/',
    '/teams/members',
    
    # Organizations
    '/organizations',
    '/organizations/',
    
    # Dashboard & Statistics
    '/dashboard',
    '/statistics',
    '/analytics',
    
    # Invitations
    '/invitations',
    
    # Forms & Submissions
    '/forms',
    '/forms/submissions',
    
    # API Keys
    '/api-keys',
    
    # Subscriptions
    '/subscriptions/me',
]

# Endpoints that can have minimal cache (10 seconds)
MINIMAL_CACHE_ENDPOINTS: List[str] = [
    '/settings',
    '/preferences',
]

# Static endpoints that can be cached longer (1 minute)
STATIC_CACHE_ENDPOINTS: List[str] = [
    '/health',
    '/docs',
    '/openapi.json',
]


def should_cache_endpoint(path: str) -> bool:
    """
    Determine if an endpoint should be cached
    
    Args:
        path: Request path (e.g., '/api/v1/users/me')
    
    Returns:
        bool: True if endpoint can be cached, False otherwise
    """
    # Check if path matches any no-cache pattern
    for pattern in NO_CACHE_ENDPOINTS:
        if pattern in path:
            return False
    
    # Allow caching for other endpoints
    return True


def get_cache_max_age(path: str) -> int:
    """
    Get cache max-age in seconds for an endpoint
    
    Args:
        path: Request path
    
    Returns:
        int: Cache max-age in seconds
    """
    # No cache for real-time endpoints
    for pattern in NO_CACHE_ENDPOINTS:
        if pattern in path:
            return 0
    
    # Minimal cache (10 seconds)
    for pattern in MINIMAL_CACHE_ENDPOINTS:
        if pattern in path:
            return 10
    
    # Static cache (1 minute)
    for pattern in STATIC_CACHE_ENDPOINTS:
        if pattern in path:
            return 60
    
    # Default: very minimal cache (5 seconds)
    return 5


# WebSocket event types for real-time sync
WEBSOCKET_EVENTS = {
    # Projects
    'PROJECT_CREATED': 'project_created',
    'PROJECT_UPDATED': 'project_updated',
    'PROJECT_DELETED': 'project_deleted',
    
    # Users
    'USER_CREATED': 'user_created',
    'USER_UPDATED': 'user_updated',
    'USER_DELETED': 'user_deleted',
    
    # Teams
    'TEAM_CREATED': 'team_created',
    'TEAM_UPDATED': 'team_updated',
    'TEAM_DELETED': 'team_deleted',
    'TEAM_MEMBER_ADDED': 'team_member_added',
    'TEAM_MEMBER_REMOVED': 'team_member_removed',
    
    # Notifications
    'NOTIFICATION_CREATED': 'notification_created',
    'NOTIFICATION_READ': 'notification_read',
    'NOTIFICATION_DELETED': 'notification_deleted',
    
    # Organizations
    'ORGANIZATION_UPDATED': 'organization_updated',
    
    # Invitations
    'INVITATION_CREATED': 'invitation_created',
    'INVITATION_ACCEPTED': 'invitation_accepted',
    'INVITATION_CANCELLED': 'invitation_cancelled',
    
    # Forms
    'FORM_CREATED': 'form_created',
    'FORM_UPDATED': 'form_updated',
    'FORM_DELETED': 'form_deleted',
    'FORM_SUBMISSION': 'form_submission',
    
    # Subscriptions
    'SUBSCRIPTION_CREATED': 'subscription_created',
    'SUBSCRIPTION_UPDATED': 'subscription_updated',
    'SUBSCRIPTION_CANCELLED': 'subscription_cancelled',
    
    # API Keys
    'API_KEY_CREATED': 'api_key_created',
    'API_KEY_DELETED': 'api_key_deleted',
    
    # Generic
    'DATA_UPDATED': 'data_updated',
}
