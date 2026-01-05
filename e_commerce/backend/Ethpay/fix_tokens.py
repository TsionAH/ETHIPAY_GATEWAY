# Save this as fix_tokens.py in your backend directory
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'your_project.settings')
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.authtoken.models import Token

User = get_user_model()

# Find users with duplicate tokens
users_with_tokens = set(Token.objects.values_list('user_id', flat=True))
all_users = set(User.objects.values_list('id', flat=True))

print(f"Users with tokens: {len(users_with_tokens)}")
print(f"Total users: {len(all_users)}")

# Delete duplicate tokens for each user
for user in User.objects.all():
    tokens = Token.objects.filter(user=user)
    if tokens.count() > 1:
        print(f"User {user.username} has {tokens.count()} tokens")
        # Keep first token, delete others
        tokens_to_delete = tokens[1:]
        tokens_to_delete.delete()
        print(f"Deleted {tokens_to_delete.count()} duplicate tokens")

print("Fix completed!")