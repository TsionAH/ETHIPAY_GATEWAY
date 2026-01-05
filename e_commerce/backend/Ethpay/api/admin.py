from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser


class CustomUserAdmin(UserAdmin):
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username',
                'password1',
                'password2',
                'email',
                'city',
                'state',
                'address',
                'phone',
            ),
        }),
    )


admin.site.register(CustomUser, CustomUserAdmin)
